const bignum = require('bignumber')

module.exports = {
  registerIssuer: async function (name, desc) {
    if (!/^[A-Za-z]{1,16}$/.test(name)) return 'Invalid issuer name'
    if (desc.length > 4096) return 'Invalid issuer description'

    let senderId = this.trs.senderId
    app.sdb.lock('uia.registerIssuer@' + senderId)
    let exists = await app.sdb.exists('Issuer', { name: name })
    if (exists) return 'Issuer name already exists'

    exists = await app.sdb.exists('Issuer', { issuerId: senderId })
    if (exists) return 'Account is already an issuer'

    app.sdb.create('Issuer', {
      tid: this.trs.id,
      issuerId: senderId,
      name: name,
      desc: desc
    })
  },

  registerAsset: async function (symbol, desc, maximum, precision) {
    if (!/^[A-Z]{3,6}$/.test(symbol)) return 'Invalid symbol'
    if (desc.length > 4096) return 'Invalid asset description'
    if (precision > 16 || precision < 0) return 'Invalid asset precision'
    app.validate('amount', maximum)

    let issuer = await app.sdb.findOne('Issuer', { condition: { issuerId: this.trs.senderId } })
    if (!issuer) return 'Account is not an issuer'

    let fullName = issuer.name + '.' + symbol
    app.sdb.lock('uia.registerAsset@' + fullName)

    exists = await app.sdb.exists('Asset', { name: fullName })
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

    let asset = await app.sdb.get('Asset', name)
    if (!asset) return 'Asset not exists'
    if (asset.issuerId !== this.trs.senderId) return 'Permission denied'

    let quantity = bignum(asset.quantity).plus(amount)
    if (quantity.gt(asset.maximum)) return 'Exceed issue limit'

    asset.quantity = quantity.toString(10)
    app.balances.increase(this.trs.senderId, name, amount)
  },

  transfer: async function (currency, amount, recipient) {
    let senderId = this.trs.senderId
    let balance = app.balances.get(senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    let recipientAddress
    let recipientName = ''
    if (app.util.address.isNormalAddress(recipient)) {
      recipientAddress = recipient
    } else {
      recipientName = recipient
      let recipientAccount = await app.sdb.findOne('Account', { condition: { name: recipient } })
      if (!recipientAccount) return 'Recipient name not exist'
      recipientAddress = recipientAccount.address
    }

    app.balances.transfer(currency, amount, senderId, recipientAddress)
    app.sdb.create('Transfer', {
      tid: this.trs.id,
      senderId: senderId,
      recipientId: recipientAddress,
      recipientName: recipientName,
      currency: currency,
      amount: amount,
      timestamp: this.trs.timestamp
    })
  }
}