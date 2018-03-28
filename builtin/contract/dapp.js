function updateXAS(recipient, amount) {
  amount = Number(amount)
}

module.exports = {
  register: async function (name, desc, tags, link, icon, category, delegates, unlockNumber) {
    let exists = await app.model.DApp.exists({ name: name })
    if (exists) return 'DApp name already registered'

    exists = await app.model.DApp.exists({ link: link })
    if (exists) return 'DApp link already registered'

    app.sdb.create('DApp', {
      tid: this.trs.id,
      name,
      desc,
      tags,
      link,
      icon,
      category,
      unlockNumber
    })
    for (let d of delegates) {
      app.sdb.create('DAppDelegate', {
        dappId: this.trs.id,
        delegate: d
      })
    }
  },

  replaceDelegate: async function (dappId, from, to) {
    app.sdb.update('DAppDelegate', { delegate: to }, { delegate: from })
  },

  addDelegate: async function (dappId, key, unlockNumber) {
    app.sdb.create('DAppDelegate', { dappId: dappId, delegate: key })
    app.sdb.update('DApp', { unlockNumber: unlockNumber }, { tid: dappId })
  },

  removeDelegate: async function (dappId, key, unlockNumber) {
    app.sdb.del('DAppDelegate', { dappId: dappId, delegate: key })
    app.sdb.update('DApp', { unlockNumber: unlockNumber }, { tid: dappId })
  },

  deposit: async function (dappId, currency, amount) {
    let exists = await app.model.DApp.exists({ dappId: dappId })
    if (!exists) return 'DApp not found'

    let senderId = this.trs.senderId
    if (currency !== 'XAS') {
      let balance = app.balances.get(senderId, currency)
      if (balance.lt(amount)) return 'Insufficient balance'

      app.balances.transfer(currency, amount, senderId, dappId)
    } else {
      amount = Number(amount)
      let sender = app.sdb.get('Account', { address: senderId })
      if (!sender || !sender.xas || sender.xas < amount) return 'Insufficient balance'

      app.sdb.increment('Account', { xas: -1 * amount }, { address: senderId })
      app.balances.increment(dappId, currency, amount)
    }
    app.sdb.create('DAppDeposit', {
      dappId,
      currency,
      amount
    })
  },

  withdrawal: async function (dappId, recipient, amount, wid, signatures) {
    let dapp = await app.model.DApp.findOne({ condition: { dappId: dappId } })
    if (!dapp) return 'DApp not found'

    let exists = await app.model.DAppWithdrawal.exists({ dappId: dappId, wid: wid })
    if (exists) return 'DApp withdrawal already processed'

    let buffer = new ByteBuffer(1, true)
    buffer.writeString('dapp.withdrawal')
    buffer.writeString(dappId)
    buffer.writeString(recipient)
    buffer.writeString(amount)
    buffer.writeString(wid)
    buffer.flip()

    let validators = await app.model.DAppDelegate.findAll({ condition: { dappId } })
    if (!validators || !validators.length) return 'DApp delegates not found'

    let validatorPublicKeys = validators.map((v) => v.delegate)
    app.checkMultiSignature(buffer.toBuffer(), validatorPublicKeys, signatures, dapp.unlockNumber)

    let balance = app.balances.get(dappId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.decrease(dappId, currency, amount)
    if (currency !== 'XAS') {
      app.balances.transfer(currency, amount, dappId, recipient)
    } else {
      if (app.isAddress(recipient)) {
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
      } else if (app.isName(recipient)) {
        amount = Number(amount)
        let account = app.sdb.get('Account', { name: recipient })
        if (!account) return 'Recipient has not a name'
        app.sdb.increment('Account', { xas: amount }, { address: account.address })
      } else if (app.isDAppId(recipient)) {
        app.balances.increase(recipient, currency, amount)
      } else {
        return 'Invalid recipient'
      }
    }
    app.sdb.create('DAppWithdrawal', {
      dappId,
      currency,
      amount,
      recipient,
      wid
    })
  }
}