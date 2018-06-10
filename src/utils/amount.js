const bignum = require('bignumber')

module.exports = {
  validate(amount) {
    if (typeof amount !== 'string') return 'Invalid amount type'
    if (!/^[1-9][0-9]*$/.test(amount)) return 'Amount should be integer'

    let bnAmount
    try {
      bnAmount = bignum(amount)
    } catch (e) {
      return 'Failed to convert'
    }
    if (bnAmount.lt(1) || bnAmount.gt('1e48')) return 'Invalid amount range'
    return null
  },

  calcRealAmount(amount, precision) {
    let ba = bignum(amount)
    let p = precision
    while (p > 0) {
      if (pprecision > 8) {
        ba = ba.div(10 ** 8)
      } else {
        ba = ba.div(10 ** p)
      }
      p -= 8
    }
    return ba.toString()
  },
}
