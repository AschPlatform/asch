module.exports = {
  register: async function (symbol, desc, maximum, precision) {
    if (!this.sender.name) return 'Account have not a name'

    let fullName = this.sender.name + '.' + symbol
    app.sdb.lock('uia.register@' + fullName)

    let exists = await app.model.Asset.exists({ name: fullName })
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
    
    app.sdb.update('Asset', {quantity: quantity}, {name: fullName})
    app.balances.increase(this.trs.senderId, fullName, amount)
  },
}