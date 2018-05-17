const bignum = require('bignumber')

module.exports = {
  openAccount: async function (gateway) {
    app.sdb.lock('gateway.openAccount@' + this.trs.senderId)
    let exists = await app.sdb.exists('GatewayAccount', { address: this.trs.senderId })
    if (exists) return 'Account already opened'
    let validators = await app.sdb.findAll('GatewayMember', { condition: { gateway: gateway, elected: 1 } })
    if (!validators || !validators.length) return 'Gateway validators not found'

    let gw = await app.sdb.findOne('Gateway', { condition: { name: gateway } })
    if (!gw) return 'Gateway not found'
    if (!gw.activated) return 'Gateway not activated'
    if (gw.revoked) return 'Gateway already revoked'
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
    let sender = this.sender
    if (!sender.name) return 'Account have not a name'
    if (sender.role) return 'Account already have a role'
    if (!await app.sdb.exists('Gateway', { name: gateway })) return 'Gateway not found'
    let exists = await app.sdb.exists('GatewayMember', { address: senderId })
    if (exists) return 'Account already is a gateway member'

    sender.role = app.AccountRole.GATEWAY_VALIDATOR
    app.sdb.create('GatewayMember', {
      address: this.trs.senderId,
      gateway: gateway,
      outPublicKey: publicKey,
      desc: desc,
      elected: 0
    })
  },

  deposit: async function (gateway, address, currency, amount, oid) {
    if (! await app.sdb.exists('GatewayCurrency', { symbol: currency })) return 'Currency not supported'

    let validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== gateway) return 'Permission denied'

    const depositKey = 'gateway.deposit@' + [currency, oid].join(':')
    // console.log('------------------lock', depositKey, app.sdb.blockSession.holdLocks.keys())
    app.sdb.lock(depositKey)
    const signerKey = 'gateway.deposit@' + [this.trs.senderId, currency, oid].join(':')
    app.sdb.lock(signerKey)

    let gatewayAccount = await app.sdb.findOne('GatewayAccount', { condition: { outAddress: address } })
    if (!gatewayAccount) return 'Gateway account not exist'

    let gw = await app.sdb.findOne('Gateway', { condition: { name: gatewayAccount.gateway } })
    if (!gw) return 'Gateway not found'
    if (gw.revoked) return 'Gateway already revoked'
    // if (gatewayAccount.version !== gw.version) return 'Gateway account version expired'

    if (await app.sdb.exists('GatewayDepositSigner', { key: signerKey })) return 'Already submitted'
    app.sdb.create('GatewayDepositSigner', { key: signerKey })

    let cond = { currency: currency, oid: oid }
    let deposit = await app.sdb.getBy('GatewayDeposit', cond)
    if (!deposit) {
      deposit = app.sdb.create('GatewayDeposit', {
        tid: this.trs.id,
        timestamp: this.trs.timestamp,
        gateway: gateway,
        currency: currency,
        amount: amount,
        address: address,
        oid: oid,
        confirmations: 1,
        processed: 0
      })
    } else {
      deposit.confirmations += 1
      let count = await app.sdb.count('GatewayMember', { gateway: gateway, elected: 1 })
      if (deposit.confirmations > count / 2 && !deposit.processed) {
        deposit.processed = 1
        app.balances.increase(gatewayAccount.address, currency, amount)
      }
    }
  },

  withdrawal: async function (address, gateway, currency, amount) {
    const FEE = '10000' // FIXME
    let balance = app.balances.get(this.trs.senderId, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    let outAmount = bignum(amount).sub(FEE)
    if (outAmount.lte(0)) return 'Invalid amount'

    app.balances.decrease(this.trs.senderId, currency, amount)
    let seq = Number(app.autoID.increment('gate_withdrawal_seq'))

    app.sdb.create('GatewayWithdrawal', {
      tid: this.trs.id,
      timestamp: this.trs.timestamp,
      seq: seq,
      gateway: gateway,
      currency: currency,
      amount: outAmount.toString(),
      senderId: this.trs.senderId,
      recipientId: address,
      fee: FEE,
      signs: 0,
      ready: 0,
      outTransaction: '',
      oid: ''
    })
  },

  submitWithdrawalTransaction: async function (wid, ot, ots) {
    app.sdb.lock('gateway.submitWithdrawalTransaction@' + this.trs.senderId)
    let withdrawal = await app.sdb.get('GatewayWithdrawal', wid)
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (withdrawal.outTransaction) return 'Out transaction already exist'

    let validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'

    withdrawal.outTransaction = ot
    withdrawal.signs += 1
    app.sdb.create('GatewayWithdrawalPrep', {
      wid: wid,
      signer: this.trs.senderId,
      signature: ots
    })
  },

  submitWithdrawalSignature: async function (wid, signature) {
    app.sdb.lock('gateway.submitWithdrawalSignature@' + this.trs.senderId)
    let withdrawal = await app.sdb.get('GatewayWithdrawal', wid)
    if (!withdrawal) return 'Gateway withdrawal not exist'
    if (!withdrawal.outTransaction) return 'Out transaction not exist'
    // TODO validate signature

    let validator = await app.sdb.findOne('GatewayMember', {
      condition: {
        address: this.trs.senderId,
      }
    })
    if (!validator || !validator.elected || validator.gateway !== withdrawal.gateway) return 'Permission denied'

    if (await app.sdb.exists('GatewayWithdrawalPrep', { wid: wid, signer: this.trs.senderId })) {
      return 'Duplicated withdrawal signature'
    }

    let validatorCount = await app.sdb.count('GatewayMember', {
      gateway: withdrawal.gateway,
      elected: 1
    })

    withdrawal.signs += 1
    if (withdrawal.signs > validatorCount / 2) {
      withdrawal.ready = 1
    }

    app.sdb.create('GatewayWithdrawalPrep', {
      wid: wid,
      signer: this.trs.senderId,
      signature: signature
    })
  },
}