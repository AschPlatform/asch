
module.exports = {
  openAccount: async function (gateway) {
    let exists = await app.model.GatewayAccount.exists({ address: this.trs.senderId })
    if (exists) return 'Account already opened'
    let validators = await app.model.GatewayMember.findAll({ condition: { gateway: gateway, elected: 1 } })
    if (!validators || !validators.length) return 'Gateway validators not found'

    let gw = await app.model.Gateway.findOne({ condition: { name: gateway } })
    if (!gw) return 'Gateway not found'
    let outPublicKeys = validators.map(function (v) { return v.outPublicKey })
    let unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
    outPublicKeys.push('02' + this.trs.senderPublicKey)
    let account = app.createMultisigAddress(gateway, unlockNumber, outPublicKeys)
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
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + this.trs.senderId)
    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (!sender.name) return 'Account have not a name'
    if (sender.role) return 'Account already have a role'
    if (!await app.model.Gateway.exists({name: gateway})) return 'Gateway not found'
    let exists = await app.model.GatewayMember.exists({ address: senderId })
    if (exists) return 'Account already is a gateway member'
    app.sdb.update('Account', { role: app.AccountRole.GATEWAY_VALIDATOR }, { address: senderId })
    app.sdb.create('GatewayMember', {
      address: this.trs.senderId,
      gateway: gateway,
      outPublicKey: publicKey,
      desc: desc,
      elected: 0
    })
  },

  deposit: async function (gateway, address, currency, amount, oid) {
    if (! await app.model.GatewayCurrency.exists({ symbol: currency })) return 'Currency not supported'
    let validator = await app.model.GatewayMember.findOne({
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== gateway) return 'Permission denied'

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

  withdrawal: async function (address, gateway, currency, amount) {
    let balance = app.balances.get(this.trs.senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.decrease(this.trs.senderId, currency, amount)
    let seq = Number(app.autoID.increment('gate_withdrawal_seq'))
    app.sdb.create('GatewayWithdrawal', {
      tid: this.trs.id,
      seq: seq,
      gateway: gateway,
      currency: currency,
      amount: amount,
      senderId: this.trs.senderId,
      recipientId: address,
      processed: 0,
      outTransaction: '',
      oid: ''
    })
  },

  submitWithdrawalTransaction: async function (wid, ot, ots) {
    app.sdb.lock('gateway.submitWithdrawalTransaction@' + this.trs.senderId)
    let withdrawal = await app.model.GatewayWithdrawal.findOne({ condition: { tid: wid } })
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (withdrawal.outTransaction) return 'Out transaction already exist'

    let validator = await app.model.GatewayMember.findOne({
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'

    app.sdb.update('GatewayWithdrawal', { outTransaction: ot }, { tid: wid })
    app.sdb.create('GatewayWithdrawalPrep', {
      wid: wid,
      signer: this.trs.senderId,
      signature: ots
    })
  },

  submitWithdrawalSignature: async function (wid, signature) {
    app.sdb.lock('gateway.submitWithdrawalSignature@' + this.trs.senderId)
    let withdrawal = await app.model.GatewayWithdrawal.findOne({ condition: { tid: wid } })
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (!withdrawal.outTransaction) return 'Out transaction not exist'
    // TODO validate signature

    let validator = await app.model.GatewayMember.findOne({
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'
    
    if (await app.model.GatewayWithdrawalPrep.exists({wid: wid, signer: this.trs.senderId})) {
      return 'Duplicated withdrawal signature'
    }

    app.sdb.create('GatewayWithdrawalPrep', {
      wid: wid,
      signer: this.trs.senderId,
      signature: signature
    })
  },
}