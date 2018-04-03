async function doCancelVote(account) {
  let voteList = await app.model.Vote.findAll({ condition: { address: account.address } })
  if (voteList && voteList.length > 0 && account.weight > 0) {
    for (let voteItem of voteList) {
      app.sdb.increment('Delegate', { votes: -1 * account.weight }, { name: voteItem.delegate })
    }
  }
}

async function doCancelAgent(account) {
  app.sdb.increment('Account', { weight: -1 * account.weight }, { address: account.agent })
  app.sdb.update('Account', { agent: '' }, { address: account.address })
  doCancelVote(account)
}

function isUniq(arr) {
  let s = new Set
  for (let i of arr) {
    if (s.has(i)) {
      return false
    }
    s.add(i)
  }
  return true
}

module.exports = {
  transfer: async function (amount, recipientId) {
    // FIXME validate recipient is valid address
    if (!recipientId) return 'Invalid recipient'
    // app.validate('amount', amount)

    // FIXME validate permission
    // FIXME validate currency
    // FIXME validate amount

    let senderId = this.trs.senderId
    amount = Number(amount)
    let sender = app.sdb.get('Account', { address: senderId })
    if ((!sender || !sender.xas || sender.xas < amount) && this.block.height > 0) return 'Insufficient balance'

    app.sdb.increment('Account', { xas: -1 * amount }, { address: senderId })
    let recipient = app.sdb.get('Account', { address: recipientId })
    if (!recipient) {
      app.sdb.create('Account', {
        address: recipientId,
        xas: amount
      })
    } else {
      app.sdb.increment('Account', { xas: amount }, { address: recipientId })
    }
    app.sdb.create('Transfer', {
      tid: this.trs.id,
      senderId: senderId,
      recipientId: recipientId,
      currency: 'XAS',
      amount: amount
    })
  },

  setName: async function (name) {
    if (!name || name.length > 20) return 'Invalid name'

    app.sdb.lock('basic.setName@' + this.trs.senderId)

    if (this.block.height === 0) {
      app.sdb.create('Account', {
        address: this.trs.senderId,
        xas: 0,
        name: name
      })
    } else {
      let exists = await app.model.Account.exists({ name: name })
      if (exists) return 'Name already registered'

      let condition = { address: this.trs.senderId }
      let account = await app.model.Account.findOne({ condition: condition })
      if (account && !!account.name) return 'Name already set'

      app.sdb.update('Account', { name: name }, { address: this.trs.senderId })
    }
  },

  setPassword: async function (publicKey) {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.setPassword@' + senderId)
    app.sdb.update('Account', { secondPublicKey: publicKey }, { address: senderId })
  },

  lock: async function (height, amount) {
    height = Number(height)
    amount = Number(amount)
    let senderId = this.trs.senderId
    app.sdb.lock('basic.lock@' + senderId)

    const MIN_LOCK_HEIGHT = 8640 * 30
    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (sender.xas - 100000000 < amount) return 'Insufficient balance'
    if (sender.isLocked) {
      if (height !== 0 && height < (Math.max(this.block.height, sender.lockHeight) + MIN_LOCK_HEIGHT)) {
        return 'Invalid lock height'
      }
    } else {
      if (height < this.block.height + MIN_LOCK_HEIGHT) {
        return 'Invalid lock height'
      }
    }

    if (!sender.isLocked) {
      app.sdb.update('Account', { isLocked: 1 }, { address: senderId })
    }
    if (height !== 0) {
      app.sdb.update('Account', { lockHeight: height }, { address: senderId })
    }
    if (amount !== 0) {
      app.sdb.update('Account', { weight: amount }, { address: senderId })
      app.sdb.increment('Account', { xas: -1 * amount }, { address: senderId })
    }

    let voteList = await app.model.Vote.findAll({ condition: { address: senderId } })
    if (voteList && voteList.length > 0 && amount > 0) {
      for (let voteItem of voteList) {
        app.sdb.increment('Delegate', { votes: amount }, { name: voteItem.delegate })
      }
    }
  },

  unlock: async function () {
    // 如果未設置代理，查詢該賬戶所投受託人，減去權重

    // 如果已經設置代理，查詢代理人所投受託人，減去代理權重
    // 自動取消代理
    let senderId = this.trs.senderId
    app.sdb.lock('basic.unlock@' + senderId)
    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (!sender) return 'Account not found'
    if (!sender.isLocked) return 'Account is not locked'
    if (this.block.height <= sender.lockHeight) return 'Account cannot unlock'

    if (sender.agent) {
      await doCancelAgent(sender)
    } else {
      await doCancelVote(sender)
    }
    app.sdb.update('Account', { isLocked: 0 }, { address: senderId })
    app.sdb.update('Account', { lockHeight: 0 }, { address: senderId })
    app.sdb.increment('Account', { xas: account.weight }, { address: senderId })
    app.sdb.update('Account', { weight: 0 }, { address: senderId })
  },

  setMultisignature: async function () {

  },

  registerAgent: async function () {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.registerAgent@' + senderId)
    let account = await app.model.Account.findOne({ condition: { address: senderId } })
    if (account.isAgent) return 'Agent already registered'

    let voteExist = await app.model.Vote.exists({ address: senderId })
    if (voteExist) return 'Account already voted'

    let isDelegate = await app.model.Delegate.exists({ address: senderId })
    if (isDelegate) return 'Delegate cannot be agent'

    app.sdb.update('Account', { isAgent: 1 }, { address: senderId })
  },

  setAgent: async function (agent) {
    // agent不能將票權委託給其他agent
    // 有投票記錄的無法設置agent
    // 將自身權重增加到agent的weight，給agent所投人增加權重
    let senderId = this.trs.senderId
    app.sdb.lock('basic.setAgent@' + senderId)
    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (sender.isAgent) return 'Agent cannot set agent'
    if (sender.agent) return 'Agent already set'
    if (!sender.isLocked) return 'Account is not locked'

    let agentExists = await app.model.Account.exists({ address: agent })
    if (!agentExists) return 'Agent account not found'

    let voteExist = await app.model.Vote.exists({ address: senderId })
    if (voteExist) return 'Account already voted'

    app.sdb.update('Account', { agent: agent }, { address: senderId })
    app.sdb.increment('Account', { weight: sender.weight }, { address: agent })

    let agentVoteList = await app.model.Vote.findAll({ condition: { address: senderId } })
    if (agentVoteList && agentVoteList.length > 0 && sender.weight > 0) {
      for (let voteItem of agentVoteList) {
        app.sdb.increment('Delegate', { votes: sender.weight }, { name: voteItem.delegate })
      }
    }
  },

  cancelAgent: async function () {
    // 減去agent的weight
    // 獲得agent所投的受託人列表，減去相應權重
    let senderId = this.trs.senderId
    app.sdb.lock('basic.cancelAgent@' + senderId)
    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (!sender.agent) return 'Agent is not set'

    await doCancelAgent(sender)
  },

  registerDelegate: async function () {
    let senderId = this.trs.senderId
    app.sdb.lock('account@' + senderId)
    let sender = app.sdb.get('Account', { address: senderId })
    if (!sender || !sender.name) return 'Account has not a name'
    if (sender.isAgent) return 'Agent cannot be delegate'
    app.sdb.create('Delegate', {
      address: senderId,
      name: sender.name,
      tid: this.trs.id,
      publicKey: this.trs.senderPublicKey,
      votes: 0,
      producedBlocks: 0,
      missedBlocks: 0,
      fees: 0,
      rewards: 0
    })
  },

  vote: async function (delegates) {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)

    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    let currentVotes = await app.model.Vote.findAll({ condition: { address: senderId } })
    if (currentVotes) {
      let currentVotedDelegates = new Set
      for (let v of currentVotes) {
        currentVotedDelegates.add(v.delegate)
      }
      for (let name of delegates) {
        if (currentVotedDelegates.has(name)) {
          return 'Delegate already voted: ' + name
        }
      }
    }

    for (let name of delegates) {
      if (!app.sdb.get('Delegate', { name: name })) return 'Voted delegate not exists: ' + name
    }

    for (let name of delegates) {
      app.sdb.increment('Delegate', { votes: sender.weight }, { name: name })
      app.sdb.create('Vote', {
        address: senderId,
        delegate: name
      })
    }
  },

  unvote: async function (delegates) {
    let senderId = this.trs.senderId
    app.sdb.lock('account@' + senderId)

    let sender = await app.model.Account.findOne({ condition: { address: senderId } })
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    let currentVotes = await app.model.Vote.findAll({ condition: { address: senderId } })
    if (currentVotes) {
      let currentVotedDelegates = new Set
      for (let v of currentVotes) {
        currentVotedDelegates.add(v.delegate)
      }
      for (let name of delegates) {
        if (!currentVotedDelegates.has(name)) {
          return 'Delegate not voted yet: ' + name
        }
      }
    }

    for (let name of delegates) {
      if (!app.sdb.get('Delegate', { name: name })) return 'Voted delegate not exists: ' + name
    }

    for (let name of delegates) {
      app.sdb.increment('Delegate', { votes: -sender.weight }, { name: name })
      app.sdb.del('Vote', { address: senderId, delegate: name })
    }
  },
}