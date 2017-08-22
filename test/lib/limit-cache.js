var node = require("./../variables.js")
var LimitCache = require('../../src/utils/limit-cache')

describe('LimitCache', function () {
  it('normal test', function (done) {
    let lc = new LimitCache({
      limit: 10
    })
    for (let i = 0; i < 10; ++i) {
      lc.set(i, true)
      node.expect(lc.has(i)).to.be.true
    }
    lc.set(10, true)
    node.expect(lc.has(10)).to.be.true
    node.expect(lc.has(0)).to.be.false
    node.expect(lc.has(1)).to.be.true
    lc.set(11, true)
    node.expect(lc.has(1)).to.be.false

    done()
  })
})