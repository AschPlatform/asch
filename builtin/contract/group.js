module.exports = {
  async vote(targetId) {
    app.sdb.create('GroupVote', {
      tid: this.trs.id,
      targetId,
      voter: this.sender.address,
    })
  },
  async activate(targetId) {
    const requestTrs = await app.sdb.findOne('Transaction', { condition: { id: targetId } })
    if (!requestTrs) return 'Request transaction not found'
    requestTrs.args = JSON.parse(requestTrs.args)

    const account = await app.sdb.get('Account', requestTrs.accountId)
    if (!account) return 'Group account not found'
    const context = {
      sender: account,
      requestor: null,
      trs: requestTrs,
      block: this.block,
    }
    const error = await app.executeContract(context)
    return error
  },
  async addMember(address, weight) {
    app.sdb.create('GroupMember', {
      group: this.sender.name,
      member: address,
      weight,
    })
  },
  async removeMember(address) {
    app.sdb.del('GroupMember', {
      group: this.sender.name,
      member: address,
    })
  },
  async replaceMember(from, to, weight) {
    const groupMember = await app.sdb.getBy('GroupMember', { member: from })
    if (!groupMember) return 'Group member not found'
    groupMember.member = to
    if (groupMember.weight !== weight) {
      groupMember.weight = weight
    }
    return null
  },
}
