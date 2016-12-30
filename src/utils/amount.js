var bignum = require('bignumber')

module.exports = {
  validate: function (amount) {
    if (typeof amount != 'string') return 'Invalid amount type'
    if (amount.indexOf('.') != -1) return 'Amount should be integer'

    var bnAmount
    try {
      bnAmount = bignum(amount)
    } catch (e) {
      return 'Amount should be number'
    }
    if (bnAmount.lt(1) || bnAmount.gt('1e48')) return 'Invalid amount range'
    return null
  }
}