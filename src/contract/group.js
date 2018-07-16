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
    const requestTrs = await app.sdb.get('Transaction', targetId)
    if (!requestTrs) return 'Request transaction not found'
    const groupAccount = await app.sdb.get('Account', requestTrs.senderId)
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
    const senderId = this.sender.address
    const requestTrs = await app.sdb.findOne('Transaction', { condition: { id: targetId } })
    if (!requestTrs) return 'Request transaction not found'
    // TODO normalize in smartdb
    // requestTrs.args = JSON.parse(requestTrs.args)

    const account = await app.sdb.get('Account', requestTrs.senderId)
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
    const group = await app.sdb.get('Group', account.name)
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
    if (!Number.isInteger(weight)) return 'Weight should be integer'
    if (!Number.isInteger(m)) return 'M should be integer'

    requireGroupAddress(this.sender.address)
    requireNormalAddress(address)
    app.sdb.lock(`group.addMember@${address}`)
    if (await app.sdb.exists('GroupMember', { member: address })) {
      throw new Error('Already is group member')
    }
    if (m) {
      const group = await app.sdb.get('Group', this.sender.name)
      if (!group) return 'Group not found'
      group.m = m
    }
    app.sdb.create('GroupMember', {
      group: this.sender.name,
      member: address,
      weight,
    })
    return null
  },
  async removeMember(address, m) {
    if (!app.util.address.isNormalAddress(address)) {
      return 'Invalid address'
    }
    if (!Number.isInteger(m)) return 'M should be integer'

    requireGroupAddress(this.sender.address)
    app.sdb.lock(`group.removeMember@${address}`)
    const memberItem = await app.sdb.getBy('GroupMember', { member: address })
    if (!memberItem) return 'Not a group member'
    if (m) {
      const group = await app.sdb.get('Group', this.sender.name)
      if (!group) return 'Group not found'
      group.m = m
    }
    app.sdb.delete('GroupMember', memberItem)
    return null
  },
  async replaceMember(from, to, weight, m) {
    requireGroupAddress(this.sender.address)
    requireGroupAddress(to)
    const groupMember = await app.sdb.getBy('GroupMember', { member: from })
    if (!groupMember) return 'Group member not found'
    if (groupMember.name !== this.sender.name) return 'Permission denied'
    groupMember.member = to
    if (groupMember.weight !== weight) {
      groupMember.weight = weight
    }
    if (m) {
      const group = await app.sdb.get('Group', this.sender.name)
      if (!group) return 'Group not found'
      group.m = m
    }
    return null
  },
}
