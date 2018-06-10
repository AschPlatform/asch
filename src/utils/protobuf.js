const fs = require('fs')
const protocolBuffers = require('protocol-buffers')
const extend = require('extend')

class Protobuf {
  constructor(schema) {
    this.schema = schema
  }
  encodeBlock(block) {
    const obj = extend(true, {}, block)
    obj.payloadHash = Buffer.from(obj.payloadHash, 'hex')
    obj.generatorPublicKey = Buffer.from(obj.generatorPublicKey, 'hex')
    if (obj.blockSignature) {
      obj.blockSignature = Buffer.from(obj.blockSignature, 'hex')
    }
    for (let i = 0; i < obj.transactions.length; ++i) {
      // this.transactionStringToBytes(obj.transactions[i])
    }
    return this.schema.Block.encode(obj)
  }

  decodeBlock(data) {
    const obj = this.schema.Block.decode(data)
    obj.payloadHash = obj.payloadHash.toString('hex')
    obj.generatorPublicKey = obj.generatorPublicKey.toString('hex')
    if (obj.blockSignature) {
      obj.blockSignature = obj.blockSignature.toString('hex')
    }
    for (let i = 0; i < obj.transactions.length; ++i) {
      // this.transactionBytesToString(obj.transactions[i])
    }
    return obj
  }

  encodeBlockPropose(propose) {
    const obj = extend(true, {}, propose)
    obj.generatorPublicKey = Buffer.from(obj.generatorPublicKey, 'hex')
    obj.hash = Buffer.from(obj.hash, 'hex')
    obj.signature = Buffer.from(obj.signature, 'hex')
    return this.schema.BlockPropose.encode(obj)
  }

  decodeBlockPropose(data) {
    const obj = this.schema.BlockPropose.decode(data)
    obj.generatorPublicKey = obj.generatorPublicKey.toString('hex')
    obj.hash = obj.hash.toString('hex')
    obj.signature = obj.signature.toString('hex')
    return obj
  }

  encodeBlockVotes(obj) {
    for (let i = 0; i < obj.signatures.length; ++i) {
      const signature = obj.signatures[i]
      signature.key = Buffer.from(signature.key, 'hex')
      signature.sig = Buffer.from(signature.sig, 'hex')
    }
    return this.schema.BlockVotes.encode(obj)
  }

  decodeBlockVotes(data) {
    const obj = this.schema.BlockVotes.decode(data)
    for (let i = 0; i < obj.signatures.length; ++i) {
      const signature = obj.signatures[i]
      signature.key = signature.key.toString('hex')
      signature.sig = signature.sig.toString('hex')
    }
    return obj
  }

  encodeTransaction(trs) {
    const obj = extend(true, {}, trs)
    // this.transactionStringToBytes(obj)
    return this.schema.Transaction.encode(obj)
  }

  decodeTransaction(data) {
    const obj = this.schema.Transaction.decode(data)
    // this.transactionBytesToString(obj)
    return obj
  }
}

module.exports = (schemaFile, cb) => {
  fs.readFile(schemaFile, 'utf8', (err, data) => {
    if (err) {
      return cb(`Failed to read proto file: ${err}`)
    }
    const schema = protocolBuffers(data)
    return cb(null, new Protobuf(schema))
  })
}
