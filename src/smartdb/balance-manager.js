let bignum = require('bignumber')

class BalanceManager {
  constructor(sdb) {
    this.sdb = sdb
  }

  get(address, currency) {
    let item = this.sdb.get('Balance', {
      address: address,
      currency: currency
    })
    let balance = item ? item.balance : '0'
    return bignum(balance)
  }

  increase(address, currency, amount) {
    if (bignum(amount).eq(0)) return
    let cond = {
      address: address,
      currency: currency
    }
    let item = this.sdb.get('Balance', cond)
    if (item !== null) {
      let balance = bignum(item.balance).plus(amount)
      this.sdb.update('Balance', { balance: balance.toString() }, cond)
    } else {
      cond.balance = amount
      this.sdb.create('Balance', cond)
    }
  }

  decrease(address, currency, amount) {
    this.increase(address, currency, '-' + amount)
  }
  
  transfer(currency, amount, from, to) {
    this.decrease(from, currency, amount)
    this.increase(to, currency, amount)
  }
}

module.exports = BalanceManager