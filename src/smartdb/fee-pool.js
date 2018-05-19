let bignum = require('bignumber')
const MODEL_NAME = 'RoundFee'

class FeePool {
  constructor(sdb) {
    this.sdb = sdb
    this.round = 1
  }

  _getFeePoolId(currency) {
    return `${this.round}_${currency}`
  }

  setRound(round) {
    this.round = round
  }

  add(currency, amount) {
    let feePoolId = this._getFeePoolId(currency);
    let item = this.sdb.getCached(MODEL_NAME, feePoolId )
    if (item) {
      item.amount = bignum(item.amount).plus(amount).toString()
    } else {
      item = this.sdb.create(MODEL_NAME, feePoolId )
      item.amount = amount
    }
  }

  getFees() {
    let items = this.sdb.getAllCached(MODEL_NAME)
    app.logger.debug('fee pool get fees', items, this.round)
    let feeMap = new Map
    for (let item of items) {
      //FIXME: what field?
      let key = item
      let value = item
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