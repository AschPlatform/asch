const isArray = require('util').isArray

module.exports = {
  async register(name, desc, link, icon, delegates, unlockNumber) {
    if (!name || name.length > 32) return 'Invalid chain name'
    if (!/^[A-Za-z0-9-_.@]{1,32}$/.test(name)) return 'Invalid chain name'
    if (!desc || desc.length > 160) return 'Invalid description'
    if (!delegates || !isArray(delegates)) return 'Invalid delegates'
    if (!Number.isInteger(unlockNumber) || unlockNumber <= 0) return 'Unlock number should be positive integer'
    if (unlockNumber < 3) return 'Unlock number should be greater than 3'

    const tid = this.trs.id
    const chainAddress = app.util.address.generateChainAddress(tid)

    let exists = await app.sdb.exists('Chain', { name })
    if (exists) return 'Chain name already registered'

    exists = await app.sdb.exists('Chain', { link })
    if (exists) return 'Chain link already registered'

    app.sdb.create('Account', { address: chainAddress, xas: 0, name: null })
    app.sdb.create('Chain', {
      tid,
      address: chainAddress,
      name,
      desc,
      link,
      icon,
      unlockNumber,
    })
    for (const d of delegates) {
      app.sdb.create('ChainDelegate', {
        chain: name,
        delegate: d,
      })
    }
    return null
  },

  async replaceDelegate(/* chain, from, to */) {
    return 'unsupported feature'
  },

  async addDelegate(/* chain, key */) {
    return 'unsupported feature'
  },

  async removeDelegate(/* chain, key */) {
    return 'unsupported feature'
  },

  async deposit(chainName, currency, amount) {
    if (!chainName) return 'Invalid chain name'
    if (!currency) return 'Invalid currency'
    // if (!Number.isInteger(amount) || amount <= 0) return 'Amount should be positive integer'
    app.validate('amount', String(amount))

    const chain = await app.sdb.findOne('Chain', { condition: { name: chainName } })
    if (!chain) return 'Chain not found'

    const senderId = this.sender.address
    if (currency !== 'XAS') {
      const balance = app.balances.get(senderId, currency)
      if (balance.lt(amount)) return 'Insufficient balance'

      app.balances.transfer(currency, amount, senderId, chain.address)
    } else {
      amount = Number(amount)
      const sender = this.sender
      if (sender.xas < amount) return 'Insufficient balance'
      sender.xas -= amount

      let exists = await app.sdb.exists('Account', { address: chain.address })
      if (!exists) { app.sdb.create('Account', { address: chain.address, xas: 0, name: null }) }

      const chainAccount = await app.sdb.load('Account', chain.address)
      chainAccount.xas += amount
      app.sdb.update('Account', { xas: sender.xas }, { address: sender.address })
      app.sdb.update('Account', { xas: chainAccount.xas }, { address: chainAccount.address })
    }
    app.sdb.create('Deposit', {
      tid: this.trs.id,
      senderId: this.sender.address,
      chain: chainName,
      currency,
      amount,
      seq: Number(app.autoID.increment('deposit_seq')),
    })
    return null
  },

  async withdrawal(chainName, recipient, currency, amount, oid, seq) {
    if (!recipient) return 'Invalid recipient'
    if (!chainName) return 'Invalid chain name'
    if (!currency) return 'Invalid currency'
    app.validate('amount', String(amount))

    const chain = await app.sdb.findOne('Chain', { condition: { name: chainName } })
    if (!chain) return 'Chain not found'

    const exists = await app.sdb.exists('Withdrawal', { chain: chainName, oid })
    if (exists) return 'Chain withdrawal already processed'

    if (currency !== 'XAS') {
      const balance = app.balances.get(chain.address, currency)
      if (balance.lt(amount)) return 'Insufficient balance'
      app.balances.transfer(currency, amount, chain.address, recipient)
    } else {
      amount = Number(amount)
      const sender = this.sender
      if (sender.xas < amount) return 'Insufficient balance'
      sender.xas -= amount
      const account = await app.sdb.load('Account', recipient)
      if (!account) {
        app.sdb.create('Account', {
          address: recipient,
          xas: amount,
          name: null,
        })
      } else {
        account.xas += amount
      }
      app.sdb.update('Account', { xas: sender.xas }, { address: sender.address })
      app.sdb.update('Account', { xas: account.xas }, { address: account.address })
    }
    app.sdb.create('Withdrawal', {
      tid: this.trs.id,
      chain: chain.name,
      currency,
      amount,
      recipientId: recipient,
      oid,
      seq,
    })
    return null
  },
}
