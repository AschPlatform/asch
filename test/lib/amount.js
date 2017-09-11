var node = require("./../variables.js")
var amount = require('../../src/utils/amount.js')

describe('amount', function () {
  it('normal test', function (done) {
    node.expect(amount.validate(2)).to.equal('Invalid amount type')
    node.expect(amount.validate('abc')).to.equal('Amount should be integer')
    node.expect(amount.validate('NaN')).to.equal('Amount should be integer')
    node.expect(amount.validate('1.1')).to.equal('Amount should be integer')
    node.expect(amount.validate('-2')).to.equal('Amount should be integer')
    node.expect(amount.validate('9999999999999999999999999999999999999999999999999')).to.equal('Invalid amount range')
    node.expect(amount.validate('10000000000000000000000000000000000000000000000000')).to.equal('Invalid amount range')

    node.expect(amount.validate('2') === null).to.be.true
    node.expect(amount.validate('1000') === null).to.be.true
    done()
  })
})