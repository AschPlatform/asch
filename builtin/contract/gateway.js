const GATEWAY_COUNCIL_NAME = 'gateway'

module.exports = {
  deposit: async function (address, currency, amount, oid, signatures) {
    // FIXME validate sender permission
    app.sdb.lock('gateway.submitDeposit@' + currency + '.' + oid)
    let exists = await app.model.GatewayDeposit.exists({
      condition: {
        currency: currency,
        oid: oid
      }
    })
    if (exists) return 'Gateway deposit oid Already exists'

    let validators = await app.model.CouncilMember.findAll({ condition: { name: GATE_WAY_COUNCIL_NAME } })
    if (!validators) return 'Gateway validators not found'

    let validatorPublicKeys = validators.map(function (v) { return v.publicKey })

    let buffer = new ByteBuffer(1, true)
    buffer.writeString('gateway.deposit')
    buffer.writeString(address)
    buffer.writeString(currency)
    buffer.writeString(amount)
    buffer.writeString(oid)
    buffer.flip()

    app.checkMultiSignature(buffer.toBuffer(), validatorPublicKeys, signatures, validators.length / 2)

    app.balances.increase(deposit.address, deposit.currency, deposit.amount)
    app.sdb.create('GatewayDeposit', {
      tid: this.trs.id,
      currency: currency,
      amount: amount,
      address: address,
      oid: oid,
    })
  },

  withdrawal: async function (address, currency, amount) {
    let balance = app.balances.get(address, currency)
    if (balance.lt(amount)) return 'Insufficient balance'

    app.balances.decrease(address, currency, amount)
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

    let validators = await app.model.CouncilMember.findAll({ condition: { name: GATE_WAY_COUNCIL_NAME } })
    if (!validators) return 'Gateway validators not found'

    let validatorPublicKeys = validators.map(function (v) { return v.publicKey })

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