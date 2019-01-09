
module.exports = {
  async openAccount(gateway) {
    if (!gateway) return 'Invalid gateway name'

    app.sdb.lock(`gateway.openAccount@${this.sender.address}`)
    const exists = await app.sdb.exists('GatewayAccount', { gateway, address: this.sender.address })
    if (exists) return 'Account already opened'
    const validators = await app.sdb.findAll('GatewayMember', { condition: { gateway, elected: 1 } })
    if (!validators || !validators.length) return 'Gateway validators not found'

    const gw = await app.sdb.findOne('Gateway', { condition: { name: gateway } })
    if (!gw) return 'Gateway not found'
    if (!gw.activated) return 'Gateway not activated'
    if (gw.revoked) return 'Gateway already revoked'
    const outPublicKeys = validators.map(v => v.outPublicKey)
    const unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
    outPublicKeys.push(`02${this.trs.senderPublicKey}`)
    const account = app.gateway.createMultisigAddress(gateway, unlockNumber, outPublicKeys)
    const seq = Number(app.autoID.increment('gate_account_seq'))
    app.sdb.create('GatewayAccount', {
      address: this.sender.address,
      gateway,
      outAddress: account.address,
      attachment: account.accountExtrsInfo,
      seq,
      version: gw.version,
      createTime: this.trs.timestamp,
    })
    return null
  },

  async registerMember(gateway, publicKey, desc) {
    if (!gateway) return 'Invalid gateway name'

    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${this.sender.address}`)
    const sender = this.sender
    if (!sender.name) return 'Account have not a name'
    if (sender.role) return 'Account already have a role'
    if (!await app.sdb.exists('Gateway', { name: gateway })) return 'Gateway not found'
    const exists = await app.sdb.exists('GatewayMember', { address: senderId })
    if (exists) return 'Account already is a gateway member'

    const gw = await app.sdb.findOne('Gateway', { condition: { name: gateway } })
    if (gw.revoked) return 'Gateway already revoked, cannot register member'
    sender.role = app.AccountRole.GATEWAY_VALIDATOR
    app.sdb.update('Account', { role: app.AccountRole.GATEWAY_VALIDATOR }, { address: this.sender.address })
    app.sdb.create('GatewayMember', {
      address: this.sender.address,
      gateway,
      outPublicKey: publicKey,
      desc,
      elected: 0,
    })
    return null
  },

  async deposit(gateway, address, currency, amount, oid) {
    if (!gateway) return 'Invalid gateway name'
    if (!currency) return 'Invalid currency'
    app.validate('amount', amount)

    if (!await app.sdb.exists('GatewayCurrency', { symbol: currency })) return 'Currency not supported'

    const validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.sender.address,
      },
    })
    if (!validator || !validator.elected || validator.gateway !== gateway) return 'Permission denied'

    // const depositKey = 'gateway.deposit@' + [currency, oid].join(':')
    // console.log('------------------lock', depositKey, app.sdb.blockSession.holdLocks.keys())
    // app.sdb.lock(depositKey)
    const signerKey = `gateway.deposit@${[this.sender.address, currency, oid].join(':')}`
    app.sdb.lock(signerKey)

    const gatewayAccount = await app.sdb.findOne('GatewayAccount', { condition: { outAddress: address } })
    if (!gatewayAccount) return 'Gateway account not exist'

    const gw = await app.sdb.findOne('Gateway', { condition: { name: gatewayAccount.gateway } })
    if (!gw) return 'Gateway not found'
    if (gw.revoked) return 'Gateway already revoked'
    // if (gatewayAccount.version !== gw.version) return 'Gateway account version expired'

    if (await app.sdb.exists('GatewayDepositSigner', { key: signerKey })) return 'Already submitted'
    app.sdb.create('GatewayDepositSigner', { key: signerKey })

    const dipositKey = { oid }
    let deposit = await app.sdb.load('GatewayDeposit', dipositKey)
    if (!deposit) {
      deposit = app.sdb.create('GatewayDeposit', {
        tid: this.trs.id,
        timestamp: this.trs.timestamp,
        gateway,
        currency,
        amount,
        address,
        oid,
        confirmations: 1,
        processed: 0,
      })
    } else {
      deposit.confirmations += 1
      const count = await app.sdb.count('GatewayMember', { gateway, elected: 1 })
      if (deposit.confirmations > count / 2 && !deposit.processed) {
        deposit.processed = 1
        app.balances.increase(gatewayAccount.address, currency, amount)
        const gwCurrency = await app.sdb.load('GatewayCurrency', { gateway, symbol: currency })
        if (!gwCurrency) return 'No gateway currency found'
        const quantity = app.util.bignumber(gwCurrency.quantity).plus(amount).toString(10)
        app.sdb.update('GatewayCurrency', { quantity }, { gateway, symbol: currency })
        // app.sdb.increase('GatewayCurrency', { quantity: amount }, { gateway, symbol: currency })
      }
      app.sdb.update('GatewayDeposit', deposit, dipositKey)
    }
    return null
  },

  async withdrawal(address, gateway, currency, amount, fee) {
    if (!gateway) return 'Invalid gateway name'
    if (!currency) return 'Invalid currency'
    app.validate('amount', fee)
    app.validate('amount', amount)
    const gw = await app.sdb.findOne('Gateway', { condition: { name: gateway } })
    if (!gw) return 'Gateway not found'
    if (gw.revoked) return 'Gateway already revoked'

    const balance = app.balances.get(this.sender.address, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    const outAmount = app.util.bignumber(amount).sub(fee)
    if (outAmount.lte(0)) return 'Invalid amount'

    if (!app.gateway.isValidAddress(gateway, address)) return 'Invalid withdrawal address'

    app.balances.decrease(this.sender.address, currency, amount)

    const gwCurrency = await app.sdb.load('GatewayCurrency', { gateway, symbol: currency })
    if (!gwCurrency) return 'No gateway currency found'
    const quantity = app.util.bignumber(gwCurrency.quantity).minus(amount).toString(10)
    app.sdb.update('GatewayCurrency', { quantity }, { gateway, symbol: currency })
    const seq = Number(app.autoID.increment('gate_withdrawal_seq'))

    app.sdb.create('GatewayWithdrawal', {
      tid: this.trs.id,
      timestamp: this.trs.timestamp,
      seq,
      gateway,
      currency,
      amount: outAmount.toString(),
      senderId: this.sender.address,
      recipientId: address,
      fee,
      signs: 0,
      ready: 0,
      outTransaction: '',
      oid: '',
    })
    return null
  },

  async submitWithdrawalTransaction(wid, ot, ots) {
    app.sdb.lock(`gateway.gatewayWithdrawalSignature@${wid}`)
    const withdrawal = await app.sdb.load('GatewayWithdrawal', wid)
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (withdrawal.outTransaction) return 'Out transaction already exist'

    const validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.sender.address,
      },
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'

    app.sdb.update('GatewayWithdrawal', { outTransaction: ot, signs: withdrawal.signs + 1 }, { tid: wid })
    app.sdb.create('GatewayWithdrawalPrep', {
      wid,
      signer: this.sender.address,
      signature: ots,
    })
    return null
  },

  async submitWithdrawalSignature(wid, signature) {
    app.sdb.lock(`gateway.gatewayWithdrawalSignature@${[this.sender.address, wid].join(':')}`)
    const withdrawal = await app.sdb.load('GatewayWithdrawal', wid)
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (!withdrawal.outTransaction) return 'Out transaction not exist'
    // TODO validate signature

    const validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.sender.address,
      },
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'

    if (await app.sdb.exists('GatewayWithdrawalPrep', { wid, signer: this.sender.address })) {
      return 'Duplicated withdrawal signature'
    }

    const validatorCount = await app.sdb.count('GatewayMember', {
      gateway: withdrawal.gateway,
      elected: 1,
    })

    app.sdb.increase('GatewayWithdrawal', { signs: 1 }, { tid: wid })
    if (withdrawal.signs > validatorCount / 2) {
      app.sdb.update('GatewayWithdrawal', { ready: 1 }, { tid: wid })
    }
    app.sdb.create('GatewayWithdrawalPrep', {
      wid,
      signer: this.sender.address,
      signature,
    })
    return null
  },

  async submitOutTransactionId(wid, oid) {
    // FIXME validate oid
    if (!oid) return 'Invalid out transaciton id'
    app.sdb.lock(`gateway.submitOutTransactionId@${wid}`)
    const withdrawal = await app.sdb.load('GatewayWithdrawal', wid)
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (!withdrawal.outTransaction) return 'Out transaction not exist'
    if (withdrawal.oid) return 'Out transaction id already submitted'

    const validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.sender.address,
      },
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'
    withdrawal.oid = oid
    app.sdb.update('GatewayWithdrawal', { oid }, { tid: wid })
    return null
  },

  async depositBail(gatewayName, amount) {
    app.validate('amount', String(amount))
    amount = app.util.bignumber(String(amount))
    const senderId = this.sender.address
    const addr = app.util.address.generateLockedAddress(senderId)
    const lockAccount = app.sdb.createOrLoad('Account', { xas: 0, address: addr, name: null }).entity
    if (amount.plus(lockAccount.xas).lt(app.util.constants.initialDeposit)) return `Deposit amount should be greater than ${app.util.constants.initialDeposit - lockAccount.xas}`
    const m = await app.util.gateway.getGatewayMember(gatewayName, senderId)
    if (!m) return 'Please register as a gateway member before deposit bail'
    if (amount.gt(String(this.sender.xas))) return 'Insufficient balance'

    app.sdb.increase('Account', { xas: -amount.toNumber() }, { address: senderId })
    app.sdb.increase('Account', { xas: amount.toNumber() }, { address: addr })
    return null
  },

  async withdrawalBail(gatewayName, amount) {
    app.validate('amount', String(amount))
    amount = app.util.bignumber(String(amount))
    const senderId = this.sender.address
    const gw = await app.sdb.findOne('Gateway', { condition: { name: gatewayName } })
    if (!gw) return 'Gateway not found'
    const m = await app.util.gateway.getGatewayMember(gatewayName, senderId)
    if (!m) return 'Not a gateway member'
    const addr = app.util.address.generateLockedAddress(senderId)
    const lockAccount = await app.sdb.load('Account', addr)
    if (!lockAccount) return 'No bail was found'
    if (m.elected === 0 && amount.gt(String(lockAccount.xas))) return 'Withdrawl amount exceeds balance'
    if (m.elected === 0) {
      app.sdb.increase('Account', { xas: amount.toNumber() }, { address: senderId })
      app.sdb.increase('Account', { xas: -amount.toNumber() }, { address: addr })
      return null
    }

    return null
  },

}
