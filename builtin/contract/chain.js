module.exports = {
  async register(name, desc, link, icon, delegates, unlockNumber) {
    const tid = this.trs.id
    const chainAddress = app.util.address.generateChainAddress(tid)

    let exists = await app.sdb.exists('Chain', { name })
    if (exists) return 'Chain name already registered'

    exists = await app.sdb.exists('Chain', { link })
    if (exists) return 'Chain link already registered'

    app.sdb.create('Account', { address: chainAddress, xas: 0, name: '' })
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

  async replaceDelegate(chain, from, to) {
    // app.sdb.update('ChainDelegate', { delegate: to }, { delegate: from, chain: chain })
  },

  async addDelegate(chain, key) {
    // app.sdb.create('ChainDelegate', { chain: chain, delegate: key })
    // app.sdb.increment('Chain', { unlockNumber: 1 }, { name: chain })
  },

  async removeDelegate(chain, key) {
    // app.sdb.del('ChainDelegate', { chain: chain, delegate: key })
    // app.sdb.increment('Chain', { unlockNumber: -1 }, { name: chain })
  },

  async deposit(chainName, currency, amount) {
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

      const chainAccount = await app.sdb.get('Account', chain.address)
      chainAccount.xas += amount
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
      const account = await app.sdb.get('Account', recipient)
      if (!account) {
        app.sdb.create('Account', {
          address: recipient,
          xas: amount,
          name: '',
        })
      } else {
        account.xas += amount
      }
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
