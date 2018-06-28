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
    senderId: data.senderId,
    senderPublicKey: data.keypair.publicKey.toString('hex'),
    timestamp: slots.getTime(),
    message: data.message,
    args: data.args,
    fee: data.fee
  };
  const signerId = addressHelper.generateNormalAddress(trs.senderPublicKey)
  if (trs.senderId) {
    trs.requestorId = signerId
  } else {
    trs.senderId = signerId
  }
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
  if (trs.requestorId) {
    bb.writeString(trs.requestorId)
  }

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

Transaction.prototype.verifyNormalSignature = function (trs, requestor, bytes) {
  if (!this.verifyBytes(bytes, trs.senderPublicKey, trs.signatures[0])) {
    return 'Invalid signature'
  }
  if (requestor.secondPublicKey) {
    if (!this.verifyBytes(bytes, requestor.secondPublicKey, trs.secondSignature)) {
      return 'Invalid second signature'
    }
  }
}

Transaction.prototype.verifyGroupSignature = async function(trs, sender, bytes) {
  let group = await app.sdb.findOne('Group', { name: sender.name })
  if (!group) return 'Group not found'
  let groupMembers = await app.sdb.findAll('GroupMember', { name: sender.name })
  if (!groupMembers) return 'Group members not found'
  let memberMap = new Map()
  for (const item of groupMembers) {
    memberMap.set(item.member, item)
  }
  let totalWeight = 0
  for (let ks of trs.signatures) {
    let k = ks.substr(0, 64)
    let address = addressHelper.generateNormalAddress(k)
    if (!memberMap.has(address)) return 'Invalid member address'
    totalWeight += memberMap.get(address).weight
  }
  if (totalWeight < group.m) return 'Signature weight not enough'

  for (let ks of trs.signatures) {
    if (ks.length !== 192) return 'Invalid key-signature format'
    let key = ks.substr(0, 64)
    let signature = ks.substr(64, 192)
    if (!this.verifyBytes(bytes, key, signature)) {
      return 'Invalid multi signatures'
    }
  }
}

Transaction.prototype.verifyChainSignature = async function (trs, sender, bytes) {
  let chain = await app.sdb.findOne('Chain', { condition: { address: sender.senderId } })
  if (!chain) return 'Chain not found'
  let validators = await app.sdb.findAll('ChainDelegate', { condition: { address: sender.senderId } })
  if (!validators || !validators.length) return 'Chain delegates not found'

  let validatorPublicKeySet = new Set
  for (let v of validators) {
    validatorPublicKeySet.add(v.delegate)
  }
  let validSignatureNumber = 0
  for (let s of trs.signatures) {
    let k = s.substr(0, 64)
    if (validatorPublicKeySet.has(k)) {
      validSignatureNumber++
    }
  }
  if (validSignatureNumber < chain.unlockNumber) return 'Signature not enough'

  for (let ks of trs.signatures) {
    if (ks.length !== 192) return 'Invalid key-signature format'
    let key = ks.substr(0, 64)
    let signature = ks.substr(64, 192)
    if (!this.verifyBytes(bytes, key, signature)) {
      return 'Invalid multi signatures'
    }
  }
}

Transaction.prototype.verify = async function (context) {
  const { trs, sender, requestor } = context
  if (slots.getSlotNumber(trs.timestamp) > slots.getSlotNumber()) {
    return "Invalid transaction timestamp"
  }

  if (!trs.type) {
    return "Invalid function"
  }

  if (sender === requestor || !requestor) {
    let feeCalculator = feeCalculators[trs.type]
    if (!feeCalculator) return 'Fee calculator not found'
    let minFee = 100000000 * feeCalculator(trs)
    if (trs.fee < minFee) return 'Fee not enough'
  }

  let id = this.getId(trs)
  if (trs.id !== id) {
    return 'Invalid transaction id'
  }

  try {
    let bytes = this.getBytes(trs, true, true)
    if (trs.senderPublicKey) {
      let error = this.verifyNormalSignature(trs, requestor, bytes)
      if (error) return error
    }
    if (!trs.senderPublicKey && trs.signatures && trs.signatures.length > 1) {
      let ADDRESS_TYPE = app.util.address.TYPE
      let addrType = app.util.address.getType(trs.senderId)
      if (addrType === ADDRESS_TYPE.CHAIN) {
        let error = await this.verifyChainSignature(trs, sender, bytes)
        if (error) return error
      } else if (addrType === ADDRESS_TYPE.GROUP) {
        let error = await this.verifyGroupSignature(trs, sender, bytes)
        if (error) return error
      } else {
        return 'Invalid account type'
      }
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
  const { block, trs, sender, requestor } = context
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

  if (block.height !== 0) {
    if (requestor && sender && requestor !== sender) {
      const requestorFee = 20000000
      if (requestor.xas < requestorFee) throw new Error('Insufficient requestor balance')
      requestor.xas -= requestorFee
      trs.executed = 0
      return
    } else if (sender) {
      if (sender.xas < trs.fee) throw new Error('Insufficient requestor balance')
      sender.xas -= trs.fee
    } else {
      throw new Error('Unexpected sender account')
    }
  }

  trs.executed = 1
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

  // FIXME
  var report = this.scope.scheme.validate(trs, {
    type: "object",
    properties: {
      id: { type: "string" },
      height: { type: "integer" },
      type: { type: "integer" },
      timestamp: { type: "integer" },
      senderId: { type: "string" },
      fee: { type: "integer", minimum: 0, maximum: constants.totalAmount },
      secondSignature: { type: "string", format: "signature" },
      signatures: { type: "array" },
      // args: { type: "array" },
      message: { type: "string", maxLength: 256 }
    },
    required: ['type', 'timestamp', 'senderId', 'signatures']
  });

  if (!report) {
    library.logger.error('Failed to normalize transaction body: ' + this.scope.scheme.getLastError().details[0].message, trs)
    throw Error(this.scope.scheme.getLastError());
  }

  return trs;
}

module.exports = Transaction
