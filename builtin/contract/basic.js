async function doCancelVote(account) {
  let voteList = await app.sdb.findAll('Vote', { condition: { address: account.address } })
  if (voteList && voteList.length > 0 && account.weight > 0) {
    for (let voteItem of voteList) {
      let delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
      delegate.votes -= account.weight
    }
  }
}

async function doCancelAgent(sender, agentAccount) {
  let clientele = await app.sdb.getBy('AgentClientele', { agent: sender.agent, clientele: sender.address })
  let cancelWeight = sender.weight
  agentAccount.agentWeight -= cancelWeight
  sender.agent = ''
  app.sdb.del('AgentClientele', clientele)

  let voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
  if (voteList && voteList.length > 0 && cancelWeight > 0) {
    for (let voteItem of voteList) {
      let delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
      delegate.votes -= cancelWeight
    }
  }
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
  transfer: async function (amount, recipient) {
    async function getRecipientAccount(nameOrAddress) {
      if (app.util.address.isNormalAddress(nameOrAddress)) {
        // address 
        let recipientAccount = await app.sdb.get('Account', nameOrAddress)
        // FIXME recipient public key
        return {
          recipientAccount: recipientAccount || app.sdb.create('Account', {
            address: nameOrAddress,
            xas: amount,
            name: ''
          }), err: null
        }
      }
      // account name
      let recipientAccount = await app.sdb.getBy('Account', { name: recipient })
      return { recipientAccount, err: recipientAccount ? null : 'Recipient name not exist' }
    }

    // FIXME validate recipient is valid address
    if (!recipient) return 'Invalid recipient'
    app.validate('amount', String(amount))

    // FIXME validate permission
    // FIXME validate currency
    // FIXME validate amount

    let senderId = this.trs.senderId
    amount = Number(amount)
    let sender = await app.sdb.get('Account', senderId)
    if ((!sender || !sender.xas || sender.xas < amount) && this.block.height > 0) return 'Insufficient balance'

    let { recipientAccount, err } = await getRecipientAccount(recipient)
    if (err) return err

    // TODO: check it
    if (sender) sender.xas -= amount
    recipientAccount.xas += amount

    app.sdb.create('Transfer', {
      tid: this.trs.id,
      senderId: senderId,
      recipientId: recipientAccount.address,
      recipientName: recipientAccount.name,
      currency: 'XAS',
      amount: amount,
      timestamp: this.trs.timestamp
    })
  },

  setName: async function (name) {
    let reg = /^[a-z0-9_]{2,20}$/
    if (!reg.test(name)) return 'Invalid name'

    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)

    if (this.block.height === 0) {
      app.sdb.create('Account', {
        address: senderId,
        xas: 0,
        name: name
      })
    } else {
      let exists = await app.sdb.exists('Account', { name: name })
      if (exists) return 'Name already registered'

      let account = await app.sdb.get('Account', senderId)
      if (account && !!account.name) return 'Name already set'

      account.name = name
    }
  },

  setPassword: async function (publicKey) {
    // FIXME validate publicKey
    let senderId = this.trs.senderId
    app.sdb.lock('basic.setPassword@' + senderId)
    let account = await app.sdb.get('Account', senderId)
    account.secondPublicKey = publicKey
  },

  lock: async function (height, amount) {
    height = Number(height)
    amount = Number(amount)
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)

    const MIN_LOCK_HEIGHT = 8640 * 30
    let sender = await app.sdb.get('Account', senderId)
    if (sender.isAgent) return 'Agent account cannot lock'
    if (sender.xas - 100000000 < amount) return 'Insufficient balance'
    if (sender.isLocked) {
      if (height !== 0 && height < (Math.max(this.block.height, sender.lockHeight) + MIN_LOCK_HEIGHT)) {
        return 'Invalid lock height'
      }
      if (height === 0 && amount === 0) {
        return 'Invalid height or amount'
      }
    } else {
      if (height < this.block.height + MIN_LOCK_HEIGHT) {
        return 'Invalid lock height'
      }
      if (amount === 0) {
        return 'Invalid amount'
      }
    }

    if (!sender.isLocked) {
      sender.isLocked = 1
    }
    if (height !== 0) {
      sender.lockHeight = height
    }
    if (amount !== 0) {
      sender.xas -= amount
      if (sender.agent) {
        let agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
        if (!agentAccount) return 'Agent account not found'
        agentAccount.agentWeight += amount

        let voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
        if (voteList && voteList.length > 0) {
          for (let voteItem of voteList) {
            let delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
            delegate.votes += amount
          }
        }
      } else {
        sender.weight += amount
        let voteList = await app.sdb.findAll('Vote', { condition: { address: senderId } })
        if (voteList && voteList.length > 0) {
          for (let voteItem of voteList) {
            let delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
            delegate.votes += amount
          }
        }
      }
    }
  },

  unlock: async function () {
    // 如果未設置代理，查詢該賬戶所投受託人，減去權重

    // 如果已經設置代理，查詢代理人所投受託人，減去代理權重
    // 自動取消代理
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)
    let sender = await app.sdb.get('Account', senderId)
    if (!sender) return 'Account not found'
    if (!sender.isLocked) return 'Account is not locked'
    if (this.block.height <= sender.lockHeight) return 'Account cannot unlock'

    if (!sender.agent) {
      await doCancelVote(sender)
    } else {
      let agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
      if (!agentAccount) return 'Agent account not found'

      await doCancelAgent(sender, agentAccount)
    }
    sender.isLocked = 0
    sender.lockHeight = 0
    sender.xas += sender.weight
    sender.weight = 0
  },

  setMultisignature: async function () {

  },

  registerAgent: async function () {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)
    let account = await app.sdb.findOne('Account', senderId)
    if (account.role) return 'Agent already have a role'
    if (!account.name) return 'Agent must have a name'
    if (account.isLocked) return 'Locked account cannot be agent'

    let voteExist = await app.sdb.exists('Vote', { address: senderId })
    if (voteExist) return 'Account already voted'

    account.role = app.AccountRole.AGENT
    account.isAgent = 1
    app.sdb.create('Agent', { name: account.name })
  },

  setAgent: async function (agent) {
    // agent不能將票權委託給其他agent
    // 有投票記錄的無法設置agent
    // 將自身權重增加到agent的weight，給agent所投人增加權重
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)
    let sender = await app.sdb.get('Account', senderId)
    if (sender.isAgent) return 'Agent cannot set agent'
    if (sender.agent) return 'Agent already set'
    if (!sender.isLocked) return 'Account is not locked'

    let agentAccount = await app.sdb.getBy('Account', { name: agent })
    if (!agentAccount) return 'Agent account not found'
    if (!agentAccount.isAgent) return 'Not an agent'

    let voteExist = await app.sdb.exists('Vote', { address: senderId })
    if (voteExist) return 'Account already voted'

    sender.agent = agent
    agentAccount.agentWeight += sender.weight

    let agentVoteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
    if (agentVoteList && agentVoteList.length > 0 && sender.weight > 0) {
      for (let voteItem of agentVoteList) {
        let delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
        delegate.votes += sender.weight
      }
    }
    app.sdb.create('AgentClientele', {
      agent: agent,
      clientele: senderId,
      tid: this.trs.id
    })
  },

  cancelAgent: async function () {
    // 減去agent的weight
    // 獲得agent所投的受託人列表，減去相應權重
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)
    let sender = await app.sdb.get('Account', senderId)
    if (!sender.agent) return 'Agent is not set'

    let agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
    if (!agentAccount) return 'Agent account not found'

    await doCancelAgent(sender, agentAccount)
  },

  registerDelegate: async function () {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.registerDelegate@' + senderId)
    let sender
    if (this.block.height > 0) {
      sender = await app.sdb.get('Account', senderId)
      if (!sender) return 'Account not found'
      if (!sender.name) return 'Account has not a name'
      if (sender.role) return 'Account already have a role'
    } else {
      sender = await app.sdb.get('Account', senderId)
    }
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
    sender.isDelegate = 1
    sender.role = app.AccountRole.DELEGATE
  },

  vote: async function (delegates) {
    let senderId = this.trs.senderId
    app.sdb.lock('basic.account@' + senderId)

    let sender = await app.sdb.findOne('Account', senderId)
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    let currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
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
      let exists = await app.sdb.exists('Delegate', { name: name })
      if (!exists) return 'Voted delegate not exists: ' + name
    }

    for (let name of delegates) {
      let delegate = await app.sdb.getBy('Delegate', { name: name })
      delegate.votes += (sender.weight + sender.agentWeight)
      app.sdb.create('Vote', {
        address: senderId,
        delegate: name
      })
    }
  },

  unvote: async function (delegates) {
    let senderId = this.trs.senderId
    app.sdb.lock('account@' + senderId)

    let sender = await app.sdb.get('Account', senderId)
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    let currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
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
      let exists = await app.sdb.exists('Delegate', { name: name })
      if (!exists) return 'Voted delegate not exists: ' + name
    }

    for (let name of delegates) {
      let delegate = await app.sdb.getBy('Delegate', { name: name })
      delegate.votes -= (sender.weight + sender.agentWeight)
      let voteItem = await app.sdb.getBy('Vote', { address: senderId, delegate: name })
      app.sdb.del('Vote', voteItem)
    }
  },
}