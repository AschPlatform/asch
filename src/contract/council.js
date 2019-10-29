function isCouncilMember(address) {
  let members = app.sdb.getAll('CouncilMember') || []
  members = members = members.sort((a, b) => b.votes - a.votes).slice(0, 3)
  return members.find(i => i.address === address)
}

module.exports = {

  async register(website) {
    if (!website || typeof website !== 'string' || website.length > 256) return 'Invalid parameters'
    const senderId = this.sender.address
    const sender = this.sender
    if (!sender) return 'Account not found'
    if (!sender.name) return 'Account has not a name'
    if (sender.role) return 'Account already have a role'

    app.sdb.create('CouncilMember', {
      address: senderId,
      name: sender.name,
      tid: this.trs.id,
      publicKey: this.trs.senderPublicKey,
      votes: 0,
      website,
    })
    sender.role = app.AccountRole.COUNCIL_MEMBER
    app.sdb.update('Account', { role: app.AccountRole.COUNCIL_MEMBER }, { address: senderId })

    return null
  },

  async vote(targets) {
    if (!targets || typeof targets !== 'string') return 'Invalid parameters'
    const names = targets.split(',')
    if (names.length > 3) return 'Up to 3 targets'

    const memberNames = new Set()
    for (const member of app.sdb.getAll('CouncilMember')) {
      memberNames.add(member.name)
    }
    for (const name of names) {
      if (!memberNames.has(name)) return 'Target is not council member'
    }

    if (!app.isCurrentBookkeeper(this.sender.address)) return 'Permission denied'

    const { session, status } = modules.council.getCouncilInfo()
    if (status === 1) return 'Invalid session status'

    const voter = this.sender.name
    const exists = await app.sdb.exists('CouncilVote', { voter, session })
    if (exists) return 'Already voted'

    app.sdb.create('CouncilVote', { voter, session, targets })
    for (const name of names) {
      app.sdb.increase('CouncilMember', { votes: 1 }, { name })
    }
  },

  async initiatePayment(recipient, amount, currency, remarks, expirtedAt) {
    if (!isCouncilMember(this.sender.address)) return 'Permission denied'
    if (currency !== 'XAS') return 'UIA token not supported'
    const session = modules.council.getCouncilInfo().session
    app.sdb.create('CouncilTransaction', {
      tid: this.trs.id,
      currency,
      amount,
      remarks,
      recipient,
      timestamp: this.trs.timestamp,
      expirtedAt,
      pending: 1,
      signs: 1,
      session,
    })
  },

  async signPayment(tid) {
    if (!isCouncilMember(this.sender.address)) return 'Permission denied'

    const payment = await app.sdb.load('CouncilTransaction', tid)
    if (!payment) return 'Payment not found'

    if (payment.pending === 0) return 'Payment already finished'

    const height = modules.blocks.getLastBlock().height
    if (!!payment.expiredAt && height >= payment.expiredAt) return 'Payment expired'

    const session = modules.council.getCouncilInfo().session
    if (session !== payment.session) return 'Session expired'

    const amount = Number.parseInt(payment.amount)
    const COUNCIL_ADDRESS = 'GADQ2bozmxjBfYHDQx3uwtpwXmdhafUdkN'
    const councilAccount = await app.sdb.load('Account', COUNCIL_ADDRESS)
    if (!councilAccount) return 'Council account not found'
    if (councilAccount.xas < amount) return 'Insufficient balance'

    const recipientAccount = await app.sdb.load('Account', payment.recipient)
    if (!recipientAccount) return 'Recipient account not found'

    payment.signs += 1
    app.sdb.increase('CouncilTransaction', { signs: 1 }, { tid })
    if (payment.signs >= 2) {
      payment.pending = 0
      app.sdb.update('CouncilTransaction', { pending: 0 }, { tid })
      app.sdb.increase('Account', { xas: amount }, { address: payment.recipient })
      app.sdb.increase('Account', { xas: -1 * amount }, { address: COUNCIL_ADDRESS })
      app.sdb.create('Transfer', {
        tid: this.trs.id,
        height: this.block.height,
        senderId: COUNCIL_ADDRESS,
        recipientId: recipientAccount.address,
        recipientName: recipientAccount.name,
        currency: payment.currency,
        amount: payment.amount,
        timestamp: this.trs.timestamp,
      })
    }
  }
}
