var node = require("./../variables.js")
var BalanceManager = require('../../src/utils/balance-manager.js')

describe('balance cache manager', function () {
  it('normal test', function (done) {
    var balances = new BalanceManager
    balances.setNativeBalance('1', 10)
    balances.setNativeBalance('2', '1000')
    node.expect(balances.getNativeBalance('1')).to.equal('10')
    node.expect(balances.getNativeBalance('2')).to.equal('1000')
    balances.addNativeBalance('1', '10')
    balances.addNativeBalance('2', 1000)
    node.expect(balances.getNativeBalance('1')).to.equal('20')
    node.expect(balances.getNativeBalance('2')).to.equal('2000')
    balances.rollback()
    node.expect(balances.getNativeBalance('1')).to.not.exist
    node.expect(balances.getNativeBalance('2')).to.not.exist

    balances.addAssetBalance('3', 'qingfeng.GOLD', 300)
    node.expect(balances.getAssetBalance('3', 'qingfeng.GOLD')).to.equal('300')
    balances.addAssetBalance('3', 'qingfeng.BTC', '3000')
    node.expect(balances.getAssetBalance('3', 'qingfeng.BTC')).to.equal('3000')
    balances.commit()
    balances.rollback()
    node.expect(balances.getAssetBalance('3', 'qingfeng.GOLD')).to.equal('300')
    node.expect(balances.getAssetBalance('3', 'qingfeng.BTC')).to.equal('3000')

    done()
  })
})