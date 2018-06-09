var crypto = require('crypto');
var ByteBuffer = require("bytebuffer");
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
var BlockStatus = require("../utils/block-status.js");
var constants = require('../utils/constants.js');

var genesisblock = null;
// Private methods
var private = {};
private.getAddressByPublicKey = function (publicKey) {
  var publicKeyHash = crypto.createHash('sha256').update(publicKey, 'hex').digest();
  var temp = new Buffer(8);
  for (var i = 0; i < 8; i++) {
    temp[i] = publicKeyHash[7 - i];
  }

  var address = bignum.fromBuffer(temp).toString();
  return address;
}
// Constructor
function Block(scope, cb) {
  this.scope = scope;
  genesisblock = this.scope.genesisblock;
  private.blockStatus = new BlockStatus();
  cb && setImmediate(cb, null, this);
}

// Public methods

Block.prototype.sortTransactions = function (data) {
  return data.transactions.sort(function compare(a, b) {
    if (a.type != b.type) {
      if (a.type == 1) {
        return 1;
      }
      if (b.type == 1) {
        return -1;
      }
      return a.type - b.type;
    }
    if (a.amount != b.amount) {
      return a.amount - b.amount;
    }
    return a.id.localeCompare(b.id);
  });
}
Block.prototype.create = function (data) {
  var transactions = this.sortTransactions(data);

  var nextHeight = (data.previousBlock) ? data.previousBlock.height + 1 : 1;

  var reward = private.blockStatus.calcReward(nextHeight),
    totalFee = 0, totalAmount = 0, size = 0;

  var blockTransactions = [];
  var payloadHash = crypto.createHash('sha256');

  for (var i = 0; i < transactions.length; i++) {
    var transaction = transactions[i];
    var bytes = this.scope.transaction.getBytes(transaction);

    if (size + bytes.length > constants.maxPayloadLength) {
      break;
    }

    size += bytes.length;

    totalFee += transaction.fee;
    totalAmount += transaction.amount;

    blockTransactions.push(transaction);
    payloadHash.update(bytes);
  }

  var block = {
    version: 0,
    totalAmount: totalAmount,
    totalFee: totalFee,
    reward: reward,
    payloadHash: payloadHash.digest().toString('hex'),
    timestamp: data.timestamp,
    numberOfTransactions: blockTransactions.length,
    payloadLength: size,
    previousBlock: data.previousBlock.id,
    generatorPublicKey: data.keypair.publicKey.toString('hex'),
    transactions: blockTransactions
  };

  try {
    block.blockSignature = this.sign(block, data.keypair);

    block = this.objectNormalize(block);
  } catch (e) {
    throw Error(e.toString());
  }

  return block;
}

Block.prototype.sign = function (block, keypair) {
  var hash = this.getHash(block);

  return ed.Sign(hash, keypair).toString('hex');
}

Block.prototype.getBytes = function (block, skipSignature) {
  var size = 4 + 4 + 8 + 4 + 8 + 8 + 8 + 4 + 32 + 32 + 64;

  var bb = new ByteBuffer(size, true);
  bb.writeInt(block.version);
  bb.writeInt(block.timestamp);
  bb.writeLong(block.height);
  bb.writeInt(block.count);
  bb.writeLong(block.fees);
  bb.writeString(block.delegate)

  if (block.previousBlock) {
    bb.writeString(block.previousBlock)
  } else {
    bb.writeString('0')
  }

  var payloadHashBuffer = new Buffer(block.payloadHash, 'hex');
  for (var i = 0; i < payloadHashBuffer.length; i++) {
    bb.writeByte(payloadHashBuffer[i]);
  }


  if (!skipSignature && block.signature) {
    var signatureBuffer = new Buffer(block.signature, 'hex');
    for (var i = 0; i < signatureBuffer.length; i++) {
      bb.writeByte(signatureBuffer[i]);
    }
  }

  bb.flip();
  var b = bb.toBuffer();

  return b;
}

Block.prototype.getBytes_ = function (block) {
  var size = 4 + 4 + 64 + 4 + 8 + 8 + 8 + 4 + 32 + 32 + 64;

  try {
    var bb = new ByteBuffer(size, true);
    bb.writeInt(block.version);
    bb.writeInt(block.timestamp);

    if (global.featureSwitch.enableLongId) {
      if (block.previousBlock) {
        bb.writeString(block.previousBlock)
      } else {
        bb.writeString('0')
      }
    } else {
      if (block.previousBlock) {
        var pb = bignum(block.previousBlock).toBuffer({ size: '8' });

        for (var i = 0; i < 8; i++) {
          bb.writeByte(pb[i]);
        }
      } else {
        for (var i = 0; i < 8; i++) {
          bb.writeByte(0);
        }
      }
    }

    bb.writeInt(block.numberOfTransactions);
    bb.writeLong(block.totalAmount);
    bb.writeLong(block.totalFee);
    bb.writeLong(block.reward);

    bb.writeInt(block.payloadLength);

    var payloadHashBuffer = new Buffer(block.payloadHash, 'hex');
    for (var i = 0; i < payloadHashBuffer.length; i++) {
      bb.writeByte(payloadHashBuffer[i]);
    }

    var generatorPublicKeyBuffer = new Buffer(block.generatorPublicKey, 'hex');
    for (var i = 0; i < generatorPublicKeyBuffer.length; i++) {
      bb.writeByte(generatorPublicKeyBuffer[i]);
    }

    if (block.blockSignature) {
      var blockSignatureBuffer = new Buffer(block.blockSignature, 'hex');
      for (var i = 0; i < blockSignatureBuffer.length; i++) {
        bb.writeByte(blockSignatureBuffer[i]);
      }
    }

    bb.flip();
    var b = bb.toBuffer();
  } catch (e) {
    throw Error("Failed to getBytes: " + e.toString());
  }

  return b;
}

Block.prototype.verifySignature = function (block) {
  var remove = 64;

  try {
    var data = this.getBytes(block);
    var data2 = new Buffer(data.length - remove);

    for (var i = 0; i < data2.length; i++) {
      data2[i] = data[i];
    }
    var hash = crypto.createHash('sha256').update(data2).digest();
    var blockSignatureBuffer = new Buffer(block.signature, 'hex');
    var generatorPublicKeyBuffer = new Buffer(block.delegate, 'hex');
    var res = ed.Verify(hash, blockSignatureBuffer || ' ', generatorPublicKeyBuffer || ' ');
  } catch (e) {
    throw Error(e.toString());
  }

  return res;
}

Block.prototype.dbSave = function (block, cb) {
  try {
    var payloadHash = new Buffer(block.payloadHash, 'hex');
    var generatorPublicKey = new Buffer(block.generatorPublicKey, 'hex');
    var blockSignature = new Buffer(block.blockSignature, 'hex');
  } catch (e) {
    return cb(e.toString())
  }

  this.scope.dbLite.query("INSERT INTO blocks(id, version, timestamp, height, previousBlock,  numberOfTransactions, totalAmount, totalFee, reward, payloadLength, payloadHash, generatorPublicKey, blockSignature) VALUES($id, $version, $timestamp, $height, $previousBlock, $numberOfTransactions, $totalAmount, $totalFee, $reward, $payloadLength,  $payloadHash, $generatorPublicKey, $blockSignature)", {
    id: block.id,
    version: block.version,
    timestamp: block.timestamp,
    height: block.height,
    previousBlock: block.previousBlock || null,
    numberOfTransactions: block.numberOfTransactions,
    totalAmount: block.totalAmount,
    totalFee: block.totalFee,
    reward: block.reward || 0,
    payloadLength: block.payloadLength,
    payloadHash: payloadHash,
    generatorPublicKey: generatorPublicKey,
    blockSignature: blockSignature
  }, cb);
}

Block.prototype.objectNormalize = function (block) {
  for (var i in block) {
    if (block[i] == null || typeof block[i] === 'undefined') {
      delete block[i];
    }
  }

  var report = this.scope.scheme.validate(block, {
    type: "object",
    properties: {
      id: {
        type: "string"
      },
      height: {
        type: "integer"
      },
      signature: {
        type: "string",
        format: "signature"
      },
      delegate: {
        type: "string",
        format: "publicKey"
      },
      payloadHash: {
        type: "string",
        format: "hex"
      },
      payloadLength: {
        type: "integer"
      },
      previousBlock: {
        type: "string"
      },
      timestamp: {
        type: "integer"
      },
      transactions: {
        type: "array",
        uniqueItems: true
      },
      version: {
        type: "integer",
        minimum: 0
      }
    },
    required: ['signature', 'delegate', 'payloadHash', 'timestamp', 'transactions', 'version']
  });

  if (!report) {
    throw Error(this.scope.scheme.getLastError());
  }

  try {
    for (var i = 0; i < block.transactions.length; i++) {
      block.transactions[i] = this.scope.transaction.objectNormalize(block.transactions[i]);
    }
  } catch (e) {
    throw Error(e.toString());
  }

  return block;
}

Block.prototype.getId = function (block) {
  return this.getId2(block)
}

Block.prototype.getId_ = function (block) {
  if (global.featureSwitch.enableLongId) {
    return this.getId2(block)
  }
  var hash = crypto.createHash('sha256').update(this.getBytes(block)).digest();
  var temp = new Buffer(8);
  for (var i = 0; i < 8; i++) {
    temp[i] = hash[7 - i];
  }

  var id = bignum.fromBuffer(temp).toString();
  return id;
}

Block.prototype.getId2 = function (block) {
  var hash = crypto.createHash('sha256').update(this.getBytes(block)).digest()
  return hash.toString('hex')
}

Block.prototype.getHash = function (block) {
  return crypto.createHash('sha256').update(this.getBytes(block)).digest();
}

Block.prototype.calculateFee = function (block) {
  return 10000000;
}

Block.prototype.dbRead = function (raw) {
  if (!raw.b_id) {
    return null
  } else {

    var block = {
      id: raw.b_id,
      version: parseInt(raw.b_version),
      timestamp: parseInt(raw.b_timestamp),
      height: parseInt(raw.b_height),
      previousBlock: raw.b_previousBlock,
      numberOfTransactions: parseInt(raw.b_numberOfTransactions),
      totalAmount: parseInt(raw.b_totalAmount),
      totalFee: parseInt(raw.b_totalFee),
      reward: parseInt(raw.b_reward),
      payloadLength: parseInt(raw.b_payloadLength),
      payloadHash: raw.b_payloadHash,
      generatorPublicKey: raw.b_generatorPublicKey,
      generatorId: private.getAddressByPublicKey(raw.b_generatorPublicKey),
      blockSignature: raw.b_blockSignature,
      confirmations: raw.b_confirmations
    }
    block.totalForged = (block.totalFee + block.reward);
    return block;
  }
}

// Export
module.exports = Block;
