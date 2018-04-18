
module.exports = {
  openAccount: async function (gateway) {
    let exists = await app.model.GatewayAccount.exists({ address: this.trs.senderId })
    if (exists) return 'Account already opened'
    let validators = await app.model.GatewayMember.findAll({ condition: { gateway: gateway, elected: 1 } })
    if (!validators || !validators.length) return 'Gateway validators not found'

    let gw = await app.model.Gateway.findOne({ condition: { name: gateway } })
    if (!gw) return 'Gateway not found'
    let outPublicKeys = validators.map(function (v) { return v.outPublicKey })
    let account = app.createMultisigAddress(gateway, Math.floor(outPublicKeys.length / 2) + 1, outPublicKeys)
    let seq = Number(app.autoID.increment('gate_account_seq'))
    app.sdb.create('GatewayAccount', {
      address: this.trs.senderId,
      gateway: gateway,
      outAddress: account.address,
      attachment: account.accountExtrsInfo,
      seq: seq,
      version: gw.version,
      createTime: this.trs.timestamp
    })
  },

  registerMember: async function (gateway, publicKey, desc) {
    app.sdb.lock('gateway.registerMember@' + this.trs.senderId)
    let sender = await app.model.Account.findOne({ condition: { address: this.trs.senderId } })
    if (!sender.name) return 'Account have not a name'
    let exists = await app.model.GatewayMember.exists({ address: this.trs.senderId })
    if (exists) return 'Account already is a gateway member'
    app.sdb.create('GatewayMember', {
      address: this.trs.senderId,
      gateway: gateway,
      outPublicKey: publicKey,
      desc: desc,
      elected: 0
    })
  },

  deposit: async function (address, currency, amount, oid) {
    if (! await app.model.GatewayCurrency.exists({ symbol: currency })) return 'Currency not supported'
    let validator = await app.model.GatewayMember.findOne({
      condition: {
        address: this.trs.senderId,
      }
    })
    // FIXME get gateway from currency
    if (!validator || !validator.elected || validator.gateway !== currency) return 'Permission denied'

    let depositKey = 'gateway.deposit@' + [this.trs.senderId, currency, oid].join(':')
    app.sdb.lock(depositKey)


    let gatewayAccount = await app.model.GatewayAccount.findOne({ condition: { outAddress: address } })
    if (!gatewayAccount) return 'Gateway account not exist'

    let gw = await app.model.Gateway.findOne({ condition: { name: gatewayAccount.gateway } })
    if (!gw) return 'Gateway not found'
    if (gatewayAccount.version !== gw.version) return 'Gateway account version expired'

    if (await app.model.GatewayDepositSigner.exists({ key: depositKey })) return 'Already submitted'
    app.sdb.create('GatewayDepositSigner', { key: depositKey })

    let cond = { currency: currency, oid: oid }
    let deposit = app.sdb.get('GatewayDeposit', cond)
    if (!deposit) {
      deposit = app.sdb.create('GatewayDeposit', {
        tid: this.trs.id,
        currency: currency,
        amount: amount,
        address: address,
        oid: oid,
        confirmations: 1,
        processed: 0
      })
    } else {
      let confirmedDeposit = await app.model.GatewayDeposit.findOne({ condition: cond })
      if (!confirmedDeposit) return 'Gateway deposit not found'
      if (amount !== confirmedDeposit.amount || address !== confirmedDeposit.address) {
        return 'Invalid deposit params'
      }
      app.sdb.increment('GatewayDeposit', { confirmations: 1 }, cond)
      let count = await app.model.GatewayMember.count({ gateway: currency, elected: 1 })
      if (deposit.confirmations > count / 2 && !deposit.processed) {
        app.sdb.update('GatewayDeposit', { processed: 1 }, cond)
        app.balances.increase(gatewayAccount.address, currency, amount)
      }
    }

  },

  withdrawal: async function (address, currency, amount) {
    let balance = app.balances.get(this.trs.senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.decrease(this.trs.senderId, currency, amount)
    app.sdb.create('GatewayWithdrawal', {
      tid: this.trs.id,
      currency: currency,
      amount: amount,
      address: address,
      processed: 0,
      oid: ''
    })
  },

  confirmWithdrawal: async function (tid, oid, signatures) {
    let withdrawal = await app.model.GatewayWithdrawal.findOne({ condition: { tid: tid } })
    if (!withdrawal) return 'Gateway withdrawal not exists'

    if (withdrawal.processed) return 'Gateway withdrawal already processed'

    let validators = await app.model.GatewayMember.findAll({ condition: { gateway: withdrawal.currency, elected: 1 } })
    if (!validators) return 'Gateway validators not found'

    let validatorPublicKeys = validators.map(function (v) { return v.inPublicKey })

    let buffer = new ByteBuffer(1, true)
    buffer.writeString('gateway.withdrawal')
    buffer.writeString(withdrawal.address)
    buffer.writeString(withdrawal.currency)
    buffer.writeString(withdrawal.amount)
    buffer.writeString(oid)
    buffer.flip()

    app.checkMultiSignature(buffer.toBuffer(), validatorPublicKeys, signatures, validators.length / 2)

    app.sdb.update('GatewayWithdrawal', { processed: 1 }, { tid: tid })
    app.sdb.update('GatewayWithdrawal', { oid: oid }, { tid: tid })
  },
}