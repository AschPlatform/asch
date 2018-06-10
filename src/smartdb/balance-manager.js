const bignum = require('bignumber')

function getCurrencyFlag(currency) {
  if (currency === 'XAS') {
    return 1
  } else if (currency.indexOf('.') !== -1) {
    // UIA
    return 2
  }
  // gateway currency
  return 3
}

class BalanceManager {
  constructor(sdb) {
    this.sdb = sdb
  }

  getBalanceId(address, currency) {
    return this.sdb.getEntityKey('Balance', { address, currency })
  }

  get(address, currency) {
    const item = this.sdb.getCached('Balance', this.getBalanceId(address, currency))
    const balance = item ? item.balance : '0'
    return bignum(balance)
  }

  increase(address, currency, amount) {
    if (bignum(amount).eq(0)) return

    const balanceId = this.getBalanceId(address, currency)
    let item = this.sdb.getCached('Balance', balanceId)
    if (item) {
      item.balance = bignum(item.balance).plus(amount).toString(10)
    } else {
      item = this.sdb.create('Balance', {
        address,
        currency,
        balance: amount,
        flag: getCurrencyFlag(currency),
      })
    }
  }

  decrease(address, currency, amount) {
    this.increase(address, currency, `-${amount}`)
  }

  transfer(currency, amount, from, to) {
    this.decrease(from, currency, amount)
    this.increase(to, currency, amount)
  }
}

module.exports = BalanceManager
