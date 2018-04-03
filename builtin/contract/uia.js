module.exports = {
  registerIssuer: async function (desc) {
    // validate(desc, {maxLength: 4096})
    if (!this.sender.name) return 'Account have not a name'
    app.sdb.lock('uia.registerIssuer@' + senderId)
    let exists = await app.model.Issuer.exists({ name: this.sender.name })
    if (exists) return 'Account is already an issuer'

    app.sdb.create('Issuer', {
      tid: this.trs.id,
      issuerId: this.trs.senderId,
      name: this.sender.name,
      desc: desc
    })
  },

  registerAsset: async function (symbol, desc, maximum, precision) {
    if (!this.sender.name) return 'Account have not a name'

    let exists = await app.model.Issuer.exists({ name: this.sender.name })
    if (!exists) return 'Account is not an issuer'

    let fullName = this.sender.name + '.' + symbol
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

  issue: async function (symbol, amount) {
    let fullName = this.sender.name + '.' + symbol
    app.sdb.lock('uia.issue@' + fullName)

    let asset = await app.model.Asset.findOne({ condition: { name: fullName } })
    if (!asset) return 'Asset not exists'

    let quantity = bignum(asset.quantity).plus(amount)
    if (quantity.gt(asset.maximum)) return 'Exceed issue limit'

    app.sdb.update('Asset', { quantity: quantity }, { name: fullName })
    app.balances.increase(this.trs.senderId, fullName, amount)
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