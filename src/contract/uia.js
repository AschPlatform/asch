
module.exports = {
  async registerIssuer(name, desc) {
    if (!/^[A-Za-z]{1,16}$/.test(name)) return 'Invalid issuer name'
    if (desc.length > 4096) return 'Invalid issuer description'

    const senderId = this.sender.address
    app.sdb.lock(`uia.registerIssuer@${senderId}`)
    let exists = await app.sdb.exists('Issuer', { name })
    if (exists) return 'Issuer name already exists'

    exists = await app.sdb.exists('Issuer', { issuerId: senderId })
    if (exists) return 'Account is already an issuer'

    app.sdb.create('Issuer', {
      tid: this.trs.id,
      issuerId: senderId,
      name,
      desc,
    })
    return null
  },

  async registerAsset(symbol, desc, maximum, precision) {
    if (!/^[A-Z]{3,6}$/.test(symbol)) return 'Invalid symbol'
    if (desc.length > 4096) return 'Invalid asset description'
    // if (!Number.isInteger(maximum) || maximum <= 0) return 'Maximum should be positive integer'
    if (!Number.isInteger(precision) || precision <= 0) return 'Precision should be positive integer'
    if (precision > 16 || precision < 0) return 'Invalid asset precision'
    app.validate('amount', maximum)

    const issuer = await app.sdb.findOne('Issuer', { condition: { issuerId: this.sender.address } })
    if (!issuer) return 'Account is not an issuer'

    const fullName = `${issuer.name}.${symbol}`
    app.sdb.lock(`uia.registerAsset@${fullName}`)

    exists = await app.sdb.exists('Asset', { name: fullName })
    if (exists) return 'Asset already exists'

    app.sdb.create('Asset', {
      tid: this.trs.id,
      timestamp: this.trs.timestamp,
      name: fullName,
      desc,
      maximum,
      precision,
      quantity: '0',
      issuerId: this.sender.address,
    })
    return null
  },

  async issue(name, amount) {
    if (!/^[A-Za-z]{1,16}.[A-Z]{3,6}$/.test(name)) return 'Invalid currency'
    // if (!Number.isInteger(amount) || amount <= 0) return 'Amount should be positive integer'
    app.validate('amount', amount)
    app.sdb.lock(`uia.issue@${name}`)

    const asset = await app.sdb.load('Asset', name)
    if (!asset) return 'Asset not exists'
    if (asset.issuerId !== this.sender.address) return 'Permission denied'

    const quantity = app.util.bignumber(asset.quantity).plus(amount)
    if (quantity.gt(asset.maximum)) return 'Exceed issue limit'

    asset.quantity = quantity.toString(10)
    app.sdb.update('Asset', { quantity: asset.quantity }, { name })

    app.balances.increase(this.sender.address, name, amount)
    return null
  },

  async transfer(currency, amount, recipient) {
    if (currency.length > 30) return 'Invalid currency'
    if (!recipient || recipient.length > 50) return 'Invalid recipient'
    // if (!/^[A-Za-z]{1,16}.[A-Z]{3,6}$/.test(currency)) return 'Invalid currency'
    // if (!Number.isInteger(amount) || amount <= 0) return 'Amount should be positive integer'
    app.validate('amount', String(amount))
    const senderId = this.sender.address
    const balance = app.balances.get(senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    let recipientAddress
    let recipientName = ''
    if (recipient.length > 30) {
      recipientAddress = recipient
    } else {
      recipientName = recipient
      const recipientAccount = await app.sdb.findOne('Account', { condition: { name: recipient } })
      if (!recipientAccount) return 'Recipient name not exist'
      recipientAddress = recipientAccount.address
    }

    app.balances.transfer(currency, amount, senderId, recipientAddress)
    app.sdb.create('Transfer', {
      tid: this.trs.id,
      height: this.block.height,
      senderId,
      recipientId: recipientAddress,
      recipientName,
      currency,
      amount,
      timestamp: this.trs.timestamp,
    })
    return null
  },
}
