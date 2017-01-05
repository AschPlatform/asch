var bignum = require('bignumber')
var Tmdb = require('./tmdb.js')

class BalanceManager {
  constructor() {
    this.tmdb = new Tmdb
  }

  getNativeBalance(address) {
    return this.tmdb.get([address, 1])
  }

  setNativeBalance(address, balance) {
    if (typeof balance === 'number') balance = String(balance)
    this.tmdb.set([address, 1], bignum(balance).toString())
  }

  addNativeBalance(address, amount) {
    if (typeof amount === 'number') amount = String(amount)
    var keys = [address, 1]
    var balance = this.tmdb.get(keys) || '0'
    this.tmdb.set(keys, bignum(balance).plus(amount).toString())
  }

  getAssetBalance(address, currency) {
    return this.tmdb.get([address, currency])
  }

  setAssetBalance(address, currency, balance) {
    if (typeof balance === 'number') amount = String(balance)
    this.tmdb.set([address, currency], bignum(balance).toString())
  }

  addAssetBalance(address, currency, amount) {
    if (typeof amount === 'number') amount = String(amount)
    var keys = [address, currency]
    var balance = this.tmdb.get(keys) || '0'
    this.tmdb.set(keys, bignum(balance).plus(amount).toString())
  }

  rollback() {
    this.tmdb.rollback()
  }

  commit() {
    this.tmdb.commit()
  }
}

module.exports = BalanceManager