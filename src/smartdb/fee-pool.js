let bignum = require('bignumber')
const MODEL_NAME = 'RoundFee'

class FeePool {
  constructor(sdb) {
    this.sdb = sdb
    this.round = 1
  }

  setRound(round) {
    this.round = round
  }

  add(currency, amount) {
    let cond = {
      round: this.round,
      currency: currency
    }
    let item = this.sdb.get(MODEL_NAME, cond)
    if (item) {
      let newAmount = bignum(item.amount).plus(amount).toString()
      this.sdb.update(MODEL_NAME, { amount: newAmount }, cond)
    } else {
      cond.amount = amount
      this.sdb.create(MODEL_NAME, cond)
    }
  }

  getFees() {
    let entries = this.sdb.entries(MODEL_NAME)
    app.logger.debug('fee pool get fees', entries, this.round)
    let feeMap = new Map
    for (let [key, value] of entries) {
      let [rk, ck] = key.split(',')
      let round = Number(rk.split(':')[1])
      let currency = ck.split(':')[1]
      // app.logger.debug('===========', rk, ck, round, currency, this.round, round === this.round)
      if (round === this.round) {
        feeMap.set(currency, value.amount)
      }
    }
    return feeMap
  }
}

module.exports = FeePool