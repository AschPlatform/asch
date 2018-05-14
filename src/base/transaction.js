var crypto = require('crypto');
var extend = require('util-extend');
var ByteBuffer = require("bytebuffer");
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
var constants = require('../utils/constants.js');
var slots = require('../utils/slots.js');
var addressHelper = require('../utils/address.js')
var feeCalculators = require('../utils/calculate-fee.js')

var genesisblock = null;

// Constructor
function Transaction(scope, cb) {
  this.scope = scope;
  genesisblock = this.scope.genesisblock;
  cb && setImmediate(cb, null, this);
}

// Private methods
var private = {};
private.types = {};

function calc(height) {
  return Math.floor(height / slots.delegates) + (height % slots.delegates > 0 ? 1 : 0);
}

// Public methods
Transaction.prototype.create = function (data) {
  var trs = {
    type: data.type,
    senderPublicKey: data.keypair.publicKey.toString('hex'),
    timestamp: slots.getTime(),
    message: data.message,
    args: data.args,
    fee: data.fee
  };
  trs.senderId = addressHelper.generateBase58CheckAddress(trs.senderPublicKey)
  trs.signatures = [this.sign(data.keypair, trs)];

  if (data.secondKeypair) {
    trs.secondSignature = this.sign(data.secondKeypair, trs);
  }

  trs.id = this.getId(trs);

  return trs;
}

Transaction.prototype.attachAssetType = function (typeId, instance) {
  if (instance && typeof instance.create == 'function' && typeof instance.getBytes == 'function' &&
    typeof instance.calculateFee == 'function' && typeof instance.verify == 'function' &&
    typeof instance.objectNormalize == 'function' && typeof instance.dbRead == 'function' &&
    typeof instance.apply == 'function' && typeof instance.undo == 'function' &&
    typeof instance.applyUnconfirmed == 'function' && typeof instance.undoUnconfirmed == 'function' &&
    typeof instance.ready == 'function' && typeof instance.process == 'function'
  ) {
    private.types[typeId] = instance;
  } else {
    throw Error('Invalid instance interface');
  }
}

Transaction.prototype.sign = function (keypair, trs) {
  var hash = this.getHash(trs);
  return ed.Sign(hash, keypair).toString('hex');
}

Transaction.prototype.multisign = function (keypair, trs) {
  var bytes = this.getBytes(trs, true, true);
  var hash = crypto.createHash('sha256').update(bytes).digest();
  return ed.Sign(hash, keypair).toString('hex');
}

Transaction.prototype.getId = function (trs) {
  return this.getId2(trs);
}

Transaction.prototype.getId2 = function (trs) {
  return this.getHash(trs).toString('hex')
}

Transaction.prototype.getHash = function (trs) {
  return crypto.createHash('sha256').update(this.getBytes(trs)).digest();
}

Transaction.prototype.getBytes = function (trs, skipSignature, skipSecondSignature) {
  var bb = new ByteBuffer(1, true);
  bb.writeInt(trs.type);
  bb.writeInt(trs.timestamp);
  bb.writeLong(trs.fee);
  bb.writeString(trs.senderId)

  if (trs.message) bb.writeString(trs.message);
  if (trs.args) {
    let args
    if (typeof trs.args === 'string') {
      args = trs.args
    } else if (Array.isArray(trs.args)) {
      args = JSON.stringify(trs.args)
    } else {
      throw new Error('Invalid transaction args')
    }
    bb.writeString(args)
  }

  // FIXME
  if (!skipSignature && trs.signatures) {
    for (let signature of trs.signatures) {
      var signatureBuffer = new Buffer(signature, 'hex');
      for (var i = 0; i < signatureBuffer.length; i++) {
        bb.writeByte(signatureBuffer[i]);
      }
    }
  }

  if (!skipSecondSignature && trs.signSignature) {
    var signSignatureBuffer = new Buffer(trs.signSignature, 'hex');
    for (var i = 0; i < signSignatureBuffer.length; i++) {
      bb.writeByte(signSignatureBuffer[i]);
    }
  }

  bb.flip();

  return bb.toBuffer();
}

Transaction.prototype.verifyNormalSignature = function (trs, sender) {
  if (!this.verifySignature(trs, trs.senderPublicKey, trs.signatures[0])) {
    return 'Invalid signature'
  }
  if (sender.secondPublicKey) {
    if (!this.verifySignature(trs, sender.secondPublicKey, trs.secondSignature)) {
      return 'Invalid second signature'
    }
  }
}

Transaction.prototype.verifyMultiSignature = function (trs, sender) {
  let bytes = this.getBytes(trs, true, true)
  for (let ks of trs.signatures) {
    if (ks.length !== 192) return 'Invalid key-signature format'
    let key = ks.substr(0, 64)
    let signature = ks.substr(64, 192)
    if (!this.verifyBytes(bytes, key, signature)) {
      return 'Invalid multi signatures'
    }
  }
}

Transaction.prototype.verify = function (context) {
  const trs = context.trs
  const sender = context.sender
  if (slots.getSlotNumber(trs.timestamp) > slots.getSlotNumber()) {
    return "Invalid transaction timestamp"
  }

  if (!trs.type) {
    return "Invalid function"
  }

  let feeCalculator = feeCalculators[trs.type]
  if (!feeCalculator) return 'Fee calculator not found'
  let minFee = 100000000 * feeCalculator(trs)
  if (trs.fee < minFee) return 'Fee not enough'

  let id = this.getId(trs)
  if (trs.id !== id) {
    return 'Invalid transaction id'
  }

  let ADDRESS_TYPE = app.util.address.TYPE
  let addrType = app.util.address.getType(trs.senderId)

  try {
    if (addrType === ADDRESS_TYPE.NORMAL) {
      return this.verifyNormalSignature(trs, sender)
    } else if (addrType === ADDRESS_TYPE.CHAIN) {
      return this.verifyMultiSignature(trs, sender)
    } else if (addrType === ADDRESS_TYPE.MULTISIG) {
      return this.verifyMultiSignature(trs, sender)
    } else if (addrType === ADDRESS_TYPE.NONE) {
      return 'Unknow address type'
    }
  } catch (e) {
    library.logger.error('verify signature excpetion', e)
    return 'Faied to verify signature'
  }
}

Transaction.prototype.verifySignature = function (trs, publicKey, signature) {
  if (!signature) return false;

  try {
    var bytes = this.getBytes(trs, true, true);
    var res = this.verifyBytes(bytes, publicKey, signature);
  } catch (e) {
    throw Error(e.toString());
  }

  return res;
}

Transaction.prototype.verifySecondSignature = function (trs, publicKey, signature) {
  if (!private.types[trs.type]) {
    throw Error('Unknown transaction type ' + trs.type);
  }

  if (!signature) return false;

  try {
    var bytes = this.getBytes(trs, false, true);
    var res = this.verifyBytes(bytes, publicKey, signature);
  } catch (e) {
    throw Error(e.toString());
  }

  return res;
}

Transaction.prototype.verifyBytes = function (bytes, publicKey, signature) {
  try {
    var data2 = new Buffer(bytes.length);

    for (var i = 0; i < data2.length; i++) {
      data2[i] = bytes[i];
    }

    var hash = crypto.createHash('sha256').update(data2).digest();
    var signatureBuffer = new Buffer(signature, 'hex');
    var publicKeyBuffer = new Buffer(publicKey, 'hex');
    var res = ed.Verify(hash, signatureBuffer || ' ', publicKeyBuffer || ' ');
  } catch (e) {
    throw Error(e.toString());
  }

  return res;
}

Transaction.prototype.apply = async function (context) {
  const block = context.block
  const trs = context.trs
  let sender = context.sender
  if (block.height !== 0) {
    if (!sender.xas || sender.xas < trs.fee) throw new Error('Insufficient balance')
    sender.xas -= trs.fee
  }

  let name = app.getContractName(trs.type)
  if (!name) {
    throw new Error('Unsupported transaction type: ' + trs.type)
  }
  let [mod, func] = name.split('.')
  if (!mod || !func) {
    throw new Error('Invalid transaction function')
  }
  let fn = app.contract[mod][func]
  if (!fn) {
    throw new Error('Contract not found')
  }

  let error = await fn.apply(context, trs.args)
  if (error) {
    throw new Error(error)
  }
}

Transaction.prototype.objectNormalize = function (trs) {
  for (var i in trs) {
    if (trs[i] === null || typeof trs[i] === 'undefined') {
      delete trs[i];
    }
  }

  if (trs.args && typeof trs.args === 'string') {
    try {
      trs.args = JSON.parse(trs.args)
      if (!Array.isArray(trs.args)) throw new Error('Transaction args must be json array')
    } catch (e) {
      throw new Error('Failed to parse args: ' + e)
    }
  }

  if (trs.signatures && typeof trs.signatures === 'string') {
    try {
      trs.signatures = JSON.parse(trs.signatures)
    } catch (e) {
      throw new Error('Failed to parse signatures: ' + e)
    }
  }

  var report = this.scope.scheme.validate(trs, {
    type: "object",
    properties: {
      id: { type: "string" },
      height: { type: "integer" },
      type: { type: "integer" },
      timestamp: { type: "integer" },
      // senderPublicKey: { type: "string", format: "publicKey" },
      fee: { type: "integer", minimum: 0, maximum: constants.totalAmount },
      secondSignature: { type: "string", format: "signature" },
      signatures: { type: "array" },
      // args: { type: "array" },
      message: { type: "string", maxLength: 256 }
    },
    required: ['type', 'timestamp', 'senderPublicKey', 'signatures']
  });

  if (!report) {
    library.logger.error('Failed to normalize transaction body: ' + this.scope.scheme.getLastError().details[0].message, trs)
    throw Error(this.scope.scheme.getLastError());
  }

  return trs;
}

module.exports = Transaction