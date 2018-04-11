const bignum = require('bignumber')

module.exports = {
  registerIssuer: async function (name, desc) {
    // validate(desc, {maxLength: 4096})
    app.sdb.lock('uia.registerIssuer@' + this.trs.senderId)
    let exists = await app.model.Issuer.exists({ name: name })
    if (exists) return 'Account is already an issuer'

    app.sdb.create('Issuer', {
      tid: this.trs.id,
      issuerId: this.trs.senderId,
      name: name,
      desc: desc
    })
  },

  registerAsset: async function (symbol, desc, maximum, precision) {
    let issuer = await app.model.Issuer.findOne({ condition: { issuerId: this.trs.senderId } })
    if (!issuer) return 'Account is not an issuer'

    let fullName = issuer.name + '.' + symbol
    app.sdb.lock('uia.registerAsset@' + fullName)

    exists = await app.model.Asset.exists({ name: fullName })
    if (exists) return 'Asset already exists'

    app.sdb.create('Asset', {
      tid: this.trs.id,
      name: fullName,
      desc: desc,
      maximum: maximum,
      precision: precision,
      quantity: '0',
      issuerId: this.trs.senderId
    })
  },

  issue: async function (name, amount) {
    app.sdb.lock('uia.issue@' + name)

    let asset = await app.model.Asset.findOne({ condition: { name: name } })
    if (!asset) return 'Asset not exists'
    if (asset.issuerId !== this.trs.senderId ) return 'Permission denied'

    let quantity = bignum(asset.quantity).plus(amount)
    if (quantity.gt(asset.maximum)) return 'Exceed issue limit'

    app.sdb.update('Asset', { quantity: quantity.toString() }, { name: name })
    app.balances.increase(this.trs.senderId, name, amount)
  },

  transfer: async function (currency, amount, recipientId) {
    let senderId = this.trs.senderId
    let balance = app.balances.get(senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.transfer(currency, amount, senderId, recipientId)
    app.sdb.create('Transfer', {
      tid: this.trs.id,
      senderId: senderId,
      recipientId: recipientId,
      currency: currency,
      amount: amount
    })
  }
}