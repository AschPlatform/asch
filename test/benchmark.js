let crypto = require('crypto')
let ed = require('../src/utils/ed.js')
let node = require("./variables.js")

describe('signature verify', function () {
  let secret = node.randomPassword()
  let keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret).digest())

  it('normal', function (odne) {
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
  })
})