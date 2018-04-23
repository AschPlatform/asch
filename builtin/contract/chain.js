module.exports = {
  register: async function (name, desc, link, icon, delegates, unlockNumber) {
    let exists = await app.model.Chain.exists({ name: name })
    if (exists) return 'Chain name already registered'

    exists = await app.model.Chain.exists({ link: link })
    if (exists) return 'Chain link already registered'

    app.sdb.create('Chain', {
      tid: this.trs.id,
      name,
      desc,
      link,
      icon,
      unlockNumber
    })
    for (let d of delegates) {
      app.sdb.create('ChainDelegate', {
        chain: name,
        delegate: d
      })
    }
  },

  replaceDelegate: async function (chain, from, to) {
    app.sdb.update('ChainDelegate', { delegate: to }, { delegate: from, chain: chain })
  },

  addDelegate: async function (chain, key) {
    app.sdb.create('ChainDelegate', { chain: chain, delegate: key })
    app.sdb.increment('Chain', { unlockNumber: 1 }, { name: chain })
  },

  removeDelegate: async function (chain, key) {
    app.sdb.del('ChainDelegate', { chain: chain, delegate: key })
    app.sdb.increment('Chain', { unlockNumber: -1 }, { name: chain })
  },

  deposit: async function (chainName, currency, amount) {
    let chain = await app.model.Chain.findOne({ condition: { name: chainName } })
    if (!chain) return 'Chain not found'

    let senderId = this.trs.senderId
    if (currency !== 'XAS') {
      let balance = app.balances.get(senderId, currency)
      if (balance.lt(amount)) return 'Insufficient balance'

      app.balances.transfer(currency, amount, senderId, chain.tid)
    } else {
      amount = Number(amount)
      let sender = app.sdb.get('Account', { address: senderId })
      if (!sender || !sender.xas || sender.xas < amount) return 'Insufficient balance'

      app.sdb.increment('Account', { xas: -1 * amount }, { address: senderId })
      app.balances.increase(chain.tid, currency, amount)
    }
    app.sdb.create('Deposit', {
      tid: this.trs.id,
      senderId: this.trs.senderId,
      chain: chainName,
      currency,
      amount,
      seq: Number(app.autoID.increment('deposit_seq'))
    })
  },

  withdrawal: async function (chainName, recipient, currency, amount, oid, seq) {
    let chain = await app.model.Chain.findOne({ condition: { name: chainName } })
    if (!chain) return 'Chain not found'

    let exists = await app.model.Withdrawal.exists({ chain: chainName, oid: oid })
    if (exists) return 'Chain withdrawal already processed'

    let validators = await app.model.ChainDelegate.findAll({ condition: { chain: chainName } })
    if (!validators || !validators.length) return 'Chain delegates not found'

    //let validatorPublicKeys = validators.map((v) => v.delegate)
    //app.checkMultiSignature(buffer.toBuffer(), validatorPublicKeys, signatures, chain.unlockNumber)

    let balance = app.balances.get(chain.tid, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.decrease(chain.tid, currency, amount)
    if (currency !== 'XAS') {
      app.balances.transfer(currency, amount, chain.tid, recipient)
    } else {
      amount = Number(amount)
      let account = app.sdb.get('Account', { address: recipient })
      if (!account) {
        app.sdb.create('Account', {
          address: recipient,
          xas: amount
        })
      } else {
        app.sdb.increment('Account', { xas: amount }, { address: recipient })
      }
    }
    app.sdb.create('Withdrawal', {
      tid: this.trs.id,
      chain: chain.name,
      currency,
      amount,
      recipientId: recipient,
      oid,
      seq
    })
  }
}