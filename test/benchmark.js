let crypto = require('crypto')
let ByteBuffer = require('bytebuffer')
let ed = require('../src/utils/ed.js')
let node = require("./variables.js")


function getBytes(trs) {
  try {
    var bb = new ByteBuffer(1, true)
    bb.writeInt(trs.timestamp)
    bb.writeString(trs.fee)

    var senderPublicKeyBuffer = new Buffer(trs.senderPublicKey, 'hex');
    for (var i = 0; i < senderPublicKeyBuffer.length; i++) {
      bb.writeByte(senderPublicKeyBuffer[i]);
    }
    bb.writeString(trs.func)
    for (let i = 0; i < trs.args.length; ++i) {
      bb.writeString(trs.args[i])
    }

    bb.flip()
  } catch (e) {
    throw Error(e.toString())
  }
  return bb.toBuffer()
}

describe('benchmarks', function () {
  let secret = node.randomPassword()
  let keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret).digest())

  it('sodium verify and sign', function (done) {
    const COUNT = 10000
    const signatures = new Array(COUNT)
    let dataHash = crypto.createHash('sha256').update(node.randomPassword()).digest()
    let label = 'time usage for ' + COUNT + ' signs'
    console.time(label)
    for (let i = 0; i < COUNT; ++i) {
      signatures[i] = ed.Sign(dataHash, keypair)
    }
    console.timeEnd(label)

    let label2 = 'time usage for ' + COUNT + ' verifys'
    console.time(label2)
    for (let i = 0; i < COUNT; ++i) {
      let ok = ed.Verify(dataHash, signatures[i], keypair.publicKey)
    }
    console.timeEnd(label2)

    done()
  })

  it('sha256', function (done) {
    const COUNT = 10000
    let bytes = new Buffer(256)
    let label = 'time usage for ' + COUNT + ' sha256 hashes'
    console.time(label)
    for (let i = 0; i < COUNT; ++i) {
      crypto.createHash('sha256').update(bytes).digest()
    }
    console.timeEnd(label)
    done()
  })

  it('ByteBuffer', function (done) {
    const COUNT = 1000
    let trs = {
      "fee": "0",
      "timestamp": 0,
      "senderPublicKey": "9a5b9e40d9da50731c38b806da63a5186f8809afc0f7058c7da28d443d6e0b35",
      "func": "core.transfer",
      "args": [
        "CNY",
        "100000000000000",
        "A8QCwz5Vs77UGX9YqBg9kJ6AZmsXQBC8vj"
      ],
      "signature": "2bc08b74ad066e93b55bc5f1d8bbaf7e85aed8f67471569616c321f141568b4eabe09cc77176e06e43cb214aa41c0015afc87532f9d6533601b85b52ab47430d",
      "id": "387f53fbce1710155ffd99492682d560e4ba69364bea5e8a7b52c49cf1ddeb95"
    }
    let payloadHash = crypto.createHash('sha256')
    let label = 'time usage for ' + COUNT + ' getBytes'
    console.time(label)
    for (let i = 0; i < COUNT; ++i) {
      payloadHash.update(getBytes(trs))
    }
    console.timeEnd(label)
    done()
  })

  it('json-sql', function (done) {
    let jsonSql = require('json-sql')({ separatedValues: false })
    const COUNT = 5000
    let label = 'time usage for ' + COUNT + ' json-sql build'
    console.time(label)
    for (let i = 0; i < COUNT; ++i) {
      jsonSql.build({
        type: 'insert',
        table: 'test',
        values: {
          "fee": "0",
          "timestamp": 0,
          "senderPublicKey": "9a5b9e40d9da50731c38b806da63a5186f8809afc0f7058c7da28d443d6e0b35",
          "func": "core.transfer",
          "signature": "2bc08b74ad066e93b55bc5f1d8bbaf7e85aed8f67471569616c321f141568b4eabe09cc77176e06e43cb214aa41c0015afc87532f9d6533601b85b52ab47430d",
          "id": "387f53fbce1710155ffd99492682d560e4ba69364bea5e8a7b52c49cf1ddeb95"
        }
      })
    }
    console.timeEnd(label)
    done()
  })
})