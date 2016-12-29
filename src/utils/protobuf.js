var fs = require('fs');
var protocolBuffers = require('protocol-buffers');
var extend = require('extend');
var TransactionTypes = require('./transaction-types.js');

function Protobuf(schema) {
  this.schema = schema;
}

Protobuf.prototype.encodeBlock = function (block) {
  var obj = extend(true, {}, block);
  obj.payloadHash = new Buffer(obj.payloadHash, 'hex');
  obj.generatorPublicKey = new Buffer(obj.generatorPublicKey, 'hex');
  if (obj.blockSignature) {
    obj.blockSignature = new Buffer(obj.blockSignature, 'hex');
  }
  for (var i = 0; i < obj.transactions.length; ++i) {
    this.transactionStringToBytes(obj.transactions[i]);
  }
  return this.schema.Block.encode(obj);
}

Protobuf.prototype.decodeBlock = function (data) {
  var obj = this.schema.Block.decode(data);
  obj.payloadHash = obj.payloadHash.toString('hex');
  obj.generatorPublicKey = obj.generatorPublicKey.toString('hex');
  if (obj.blockSignature) {
    obj.blockSignature = obj.blockSignature.toString('hex');
  }
  for (var i = 0; i < obj.transactions.length; ++i) {
    this.transactionBytesToString(obj.transactions[i]);
  }
  return obj;
}

Protobuf.prototype.encodeBlockPropose = function (propose) {
  var obj = extend(true, {}, propose);
  obj.generatorPublicKey = new Buffer(obj.generatorPublicKey, 'hex');
  obj.hash = new Buffer(obj.hash, 'hex');
  obj.signature = new Buffer(obj.signature, 'hex');
  return this.schema.BlockPropose.encode(obj);
}

Protobuf.prototype.decodeBlockPropose = function (data) {
  var obj= this.schema.BlockPropose.decode(data);
  obj.generatorPublicKey = obj.generatorPublicKey.toString('hex');
  obj.hash = obj.hash.toString('hex');
  obj.signature = obj.signature.toString('hex');
  return obj;
}

Protobuf.prototype.encodeBlockVotes = function (obj) {
  for (var i = 0; i < obj.signatures.length; ++i) {
    var signature = obj.signatures[i];
    signature.key = new Buffer(signature.key, 'hex');
    signature.sig = new Buffer(signature.sig, 'hex');
  }
  return this.schema.BlockVotes.encode(obj);
}

Protobuf.prototype.decodeBlockVotes = function (data) {
  var obj= this.schema.BlockVotes.decode(data);
  for (var i = 0; i < obj.signatures.length; ++i) {
    var signature = obj.signatures[i];
    signature.key = signature.key.toString('hex');
    signature.sig = signature.sig.toString('hex');
  }
  return obj;
}

Protobuf.prototype.encodeTransaction = function (trs) {
  var obj = extend(true, {}, trs);
  this.transactionStringToBytes(obj);
  return this.schema.Transaction.encode(obj);
}

Protobuf.prototype.decodeTransaction = function (data) {
  var obj = this.schema.Transaction.decode(data);
  this.transactionBytesToString(obj);
  return obj;
}

Protobuf.prototype.transactionStringToBytes = function (obj) {
  obj.senderPublicKey = new Buffer(obj.senderPublicKey, 'hex');
  obj.signature = new Buffer(obj.signature, 'hex');
  if (obj.requesterPublicKey) {
    obj.requesterPublicKey = new Buffer(obj.requesterPublicKey, 'hex');
  }
  if (obj.signSignature) {
    obj.signSignature = new Buffer(obj.signSignature, 'hex');
  }
  switch (obj.type) {
    case TransactionTypes.SEND:
      break;
    case TransactionTypes.SIGNATURE:
      if (obj.asset.signature) {
        obj.asset.signature.publicKey = new Buffer(obj.asset.signature.publicKey, 'hex');
      }
      break;
    case TransactionTypes.DELEGATE:
      if (obj.asset.delegate) {
        obj.asset.delegate.publicKey = new Buffer(obj.asset.delegate.publicKey, 'hex');
      }
      break;
    case TransactionTypes.VOTE:
      break;
    case TransactionTypes.MULTI:
      break;
    case TransactionTypes.DAPP:
      break;
    case TransactionTypes.IN_TRANSFER:
      break;
    case TransactionTypes.OUT_TRANSFER:
      break;
    case TransactionTypes.STORAGE:
      if (obj.asset.storage) {
        obj.asset.storage.content = new Buffer(obj.asset.storage.content, 'hex');
      }
      break;
    case TransactionTypes.UIA_ISSUER:
      break;
    case TransactionTypes.UIA_ASSET:
      break;
    case TransactionTypes.UIA_FLAGS:
      break;
    case TransactionTypes.UIA_ACL:
      break;
    case TransactionTypes.UIA_ISSUE:
      break;
    case TransactionTypes.UIA_TRANSFER:
      break;
    default:
      break;
  }
}

Protobuf.prototype.transactionBytesToString = function (obj) {
  obj.senderPublicKey = obj.senderPublicKey.toString('hex');
  obj.signature = obj.signature.toString('hex');
  if (obj.requesterPublicKey) {
    obj.requesterPublicKey = obj.requesterPublicKey.toString('hex');
  }
  if (obj.signSignature) {
    obj.signSignature = obj.signSignature.toString('hex');
  }
  switch (obj.type) {
    case TransactionTypes.SEND:
      break;
    case TransactionTypes.SIGNATURE:
      if (obj.asset.signature) {
        obj.asset.signature.publicKey = obj.asset.signature.publicKey.toString('hex');
      }
      break;
    case TransactionTypes.DELEGATE:
      if (obj.asset.delegate) {
        obj.asset.delegate.publicKey = obj.asset.delegate.publicKey.toString('hex');
      }
      break;
    case TransactionTypes.VOTE:
      break;
    case TransactionTypes.MULTI:
      break;
    case TransactionTypes.DAPP:
      break;
    case TransactionTypes.IN_TRANSFER:
      break;
    case TransactionTypes.OUT_TRANSFER:
      break;
    case TransactionTypes.STORAGE:
      if (obj.asset.storage) {
        obj.asset.storage.content = obj.asset.storage.content.toString('hex');
      }
      break;
    case TransactionTypes.UIA_ISSUER:
      break;
    case TransactionTypes.UIA_ASSET:
      break;
    case TransactionTypes.UIA_FLAGS:
      break;
    case TransactionTypes.UIA_ACL:
      break;
    case TransactionTypes.UIA_ISSUE:
      break;
    case TransactionTypes.UIA_TRANSFER:
      break;
    default:
      break;
  }
}

module.exports = function (schemaFile, cb) {
  fs.readFile(schemaFile, 'utf8', function (err, data) {
    if (err) {
      return cb('Failed to read proto file: ' + err);
    }
    var schema = protocolBuffers(data);
    cb(null, new Protobuf(schema));
  });
}