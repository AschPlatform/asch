var DEBUG = require('debug')('storage')
var node = require('./../variables.js')

function createStorage(content, secret) {
  return node.asch.storage.createStorage(content, secret)
}

describe('Test storage', () => {
  it('JS lib should be ok', function () {
    node.expect(function () { createStorage(undefined, 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage(null, 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage([], 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage({}, 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage(123, 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage('z', 'secret') }).to.throw(Error, /Content must be hex format/)
    node.expect(function () { createStorage('aGVsbG93b3JsZA==', 'secret') }).to.throw(Error, /Invalid content format/)
  })

  it('Normal storage test', async function () {
    var account1 = node.genNormalAccount()
    await node.giveMoneyAndWaitAsync([account1.address])
    // content must be hex format
    var res = await node.submitTransactionAsync(node.asch.storage.createStorage('1234abcd', account1.password))
    DEBUG('submit storage response', res.body)
  })
})
