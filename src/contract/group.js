function requireGroupAddress(address) {
  if (!app.util.address.isGroupAddress(address)) {
    throw new Error('Address must be group type')
  }
}

function requireNormalAddress(address) {
  if (!app.util.address.isNormalAddress(address)) {
    throw new Error('Address must be normal type')
  }
}

module.exports = {
  async vote(targetId) {
    const senderId = this.sender.address
    app.sdb.lock(`group.vote@${senderId}`)
    const requestTrs = await app.sdb.load('Transaction', targetId)
    if (!requestTrs) return 'Request transaction not found'
    if (!app.util.transactionMode.isRequestMode(requestTrs.mode)) return 'Invalid transaction mode'

    const requestTrsState = await app.sdb.load('TransactionStatu', { tid: targetId })
    if (requestTrsState.executed) return 'Transaction already executed'

    const groupAccount = await app.sdb.load('Account', requestTrs.senderId)
    if (!groupAccount) return 'Group account not found'
    const isMember = await app.sdb.exists('GroupMember', { name: groupAccount.name, member: senderId })
    if (!isMember) return 'Sender account is not group member'
    const isVoted = await app.sdb.exists('GroupVote', { targetId, voter: senderId })
    if (isVoted) return 'Already voted'
    app.sdb.create('GroupVote', {
      tid: this.trs.id,
      targetId,
      voter: senderId,
    })
    return null
  },
  async activate(targetId) {
    app.sdb.lock(`group.activate@${targetId}`)
    const senderId = this.sender.address
    const requestTrs = await app.sdb.findOne('Transaction', { condition: { id: targetId } })
    if (!requestTrs) return 'Request transaction not found'

    // if (requestTrs.mode !== app.TransactionMode.REQUEST) return 'Invalid transaction mode'
    if (!app.util.transactionMode.isRequestMode(requestTrs.mode)) return 'Invalid transaction mode'

    const requestTrsState = await app.sdb.load('TransactionStatu', { tid: targetId })
    if (requestTrsState.executed) return 'Transaction already executed'

    const account = await app.sdb.load('Account', requestTrs.senderId)
    if (!account) return 'Group account not found'

    const members = await app.sdb.findAll('GroupMember', { condition: { name: account.name } })
    const memberMap = new Map()
    for (const m of members) {
      memberMap.set(m.member, m)
    }
    if (!memberMap.has(senderId)) return 'Sender account is not group member'

    const votes = await app.sdb.findAll('GroupVote', { condition: { targetId } })
    let totalWeight = 0
    for (const v of votes) {
      const m = memberMap.get(v.voter)
      if (m) {
        totalWeight += m.weight
      }
    }
    const group = await app.sdb.load('Group', account.name)
    if (totalWeight < group.m) return 'Vote weight not enough'

    const context = {
      sender: account,
      requestor: null,
      trs: requestTrs,
      block: this.block,
    }
    const error = await app.executeContract(context)
    return error
  },
  async addMember(address, weight, m) {
    if (!app.util.address.isNormalAddress(address)) {
      return 'Invalid address'
    }
    if (!Number.isInteger(weight) || weight <= 0) return 'Weight should be positive integer'
    if (!Number.isInteger(m) || m <= 0) return 'M should be positive integer'

    requireGroupAddress(this.sender.address)
    requireNormalAddress(address)
    app.sdb.lock(`group.member@${address}`)
    app.sdb.lock(`group.member@${this.sender.name}`)
    if (await app.sdb.exists('GroupMember', { member: address, name: this.sender.name })) {
      throw new Error('Already is group member')
    }
    if (m) {
      const group = await app.sdb.load('Group', this.sender.name)
      if (!group) return 'Group not found'
      group.m = m
      app.sdb.update('Group', { m }, { name: this.sender.name })
    }
    app.sdb.create('GroupMember', {
      name: this.sender.name,
      member: address,
      weight,
    })
    return null
  },
  async removeMember(address, m) {
    if (!app.util.address.isNormalAddress(address)) {
      return 'Invalid address'
    }
    if (!Number.isInteger(m) || m <= 0) return 'M should be positive integer'

    requireGroupAddress(this.sender.address)
    app.sdb.lock(`group.member@${address}`)
    app.sdb.lock(`group.member@${this.sender.name}`)
    const memberItem = await app.sdb.load('GroupMember', { member: address, name: this.sender.name })
    if (!memberItem) return 'Not a group member'
    if (m) {
      const group = await app.sdb.load('Group', { name: this.sender.name })
      if (!group) return 'Group not found'
      group.m = m
      app.sdb.update('Group', { m }, { name: this.sender.name })
    }
    app.sdb.del('GroupMember', { member: address, name: this.sender.name })
    return null
  }
}
