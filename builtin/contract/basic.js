const crypto = require('crypto')

async function doCancelVote(account) {
  const voteList = await app.sdb.findAll('Vote', { condition: { address: account.address } })
  if (voteList && voteList.length > 0 && account.weight > 0) {
    for (const voteItem of voteList) {
      const delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
      delegate.votes -= account.weight
    }
  }
}

async function doCancelAgent(sender, agentAccount) {
  const clientele = await app.sdb.getBy('AgentClientele', { agent: sender.agent, clientele: sender.address })
  const cancelWeight = sender.weight
  agentAccount.agentWeight -= cancelWeight
  sender.agent = ''
  app.sdb.del('AgentClientele', clientele)

  const voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
  if (voteList && voteList.length > 0 && cancelWeight > 0) {
    for (const voteItem of voteList) {
      const delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
      delegate.votes -= cancelWeight
    }
  }
}

function isUniq(arr) {
  const s = new Set()
  for (const i of arr) {
    if (s.has(i)) {
      return false
    }
    s.add(i)
  }
  return true
}

module.exports = {
  async transfer(amount, recipient) {
    // FIXME validate recipient is valid address
    if (!recipient) return 'Invalid recipient'
    app.validate('amount', String(amount))

    // FIXME validate permission
    // FIXME validate currency
    // FIXME validate amount

    amount = Number(amount)

    const sender = this.sender
    const senderId = sender.address
    if (this.block.height > 0 && sender.xas < amount) return 'Insufficient balance'
    sender.xas -= amount

    let recipientAccount
    if (app.util.address.isNormalAddress(recipient)) {
      recipientAccount = await app.sdb.get('Account', recipient)
      if (recipientAccount) {
        recipientAccount.xas += amount
      } else {
        recipientAccount = app.sdb.create('Account', {
          address: recipient,
          xas: amount,
          name: '',
        })
      }
    } else {
      recipientAccount = await app.sdb.getBy('Account', { name: recipient })
      if (!recipientAccount) return 'Recipient name not exist'
      recipientAccount.xas += amount
    }
    app.sdb.create('Transfer', {
      tid: this.trs.id,
      senderId,
      recipientId: recipientAccount.address,
      recipientName: recipientAccount.name,
      currency: 'XAS',
      amount: String(amount),
      timestamp: this.trs.timestamp,
    })
    return null
  },

  async setName(name) {
    const reg = /^[a-z0-9_]{2,20}$/
    if (!reg.test(name)) return 'Invalid name'

    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    app.sdb.lock(`basic.setName@${name}`)

    const exists = await app.sdb.exists('Account', { name })
    if (exists) return 'Name already registered'
    if (this.sender.name) return 'Name already set'
    this.sender.name = name
    return null
  },

  async setPassword(publicKey) {
    // FIXME validate publicKey
    if (!app.util.address.isNormalAddress(this.sender.address)) {
      return 'Invalid account type'
    }
    const senderId = this.sender.address
    app.sdb.lock(`basic.setPassword@${senderId}`)
    if (this.sender.secondPublicKey) return 'Password already set'
    this.sender.secondPublicKey = publicKey
    return null
  },

  async lock(height, amount) {
    height = Number(height)
    amount = Number(amount)
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)

    const MIN_LOCK_HEIGHT = 8640 * 30
    const sender = this.sender
    if (sender.isAgent) return 'Agent account cannot lock'
    if (sender.xas - 100000000 < amount) return 'Insufficient balance'
    if (sender.isLocked) {
      if (height !== 0 &&
        height < (Math.max(this.block.height, sender.lockHeight) + MIN_LOCK_HEIGHT)) {
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
        const agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
        if (!agentAccount) return 'Agent account not found'
        agentAccount.agentWeight += amount

        const voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
        if (voteList && voteList.length > 0) {
          for (const voteItem of voteList) {
            const delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
            delegate.votes += amount
          }
        }
      } else {
        sender.weight += amount
        const voteList = await app.sdb.findAll('Vote', { condition: { address: senderId } })
        if (voteList && voteList.length > 0) {
          for (const voteItem of voteList) {
            const delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
            delegate.votes += amount
          }
        }
      }
    }
    return null
  },

  async unlock() {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    const sender = this.sender
    if (!sender) return 'Account not found'
    if (!sender.isLocked) return 'Account is not locked'
    if (this.block.height <= sender.lockHeight) return 'Account cannot unlock'

    if (!sender.agent) {
      await doCancelVote(sender)
    } else {
      const agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
      if (!agentAccount) return 'Agent account not found'

      await doCancelAgent(sender, agentAccount)
    }
    sender.isLocked = 0
    sender.lockHeight = 0
    sender.xas += sender.weight
    sender.weight = 0
    return null
  },

  async registerGroup(name, members, min, max, m, updateInterval) {
    // FIXME validate params
    app.sdb.lock(`basic.setName@${name}`)
    if (await app.sdb.exists('Account', { name })) return 'Name already registered'
    const address = app.util.address.generateGroupAddress(name)
    const account = await app.sdb.get('Account', address)
    if (!account) {
      app.sdb.create('Account', {
        address,
        name,
        xas: 0,
      })
    }
    app.sdb.create('Group', {
      name,
      min,
      max,
      m,
      updateInterval,
      createTime: this.trs.timestamp,
    })
    for (const member of members) {
      app.sdb.create('GroupMember', {
        group: name,
        member: member.address,
        weight: member.weight,
      })
    }
    return null
  },

  async registerAgent() {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    const sender = this.sender
    if (sender.role) return 'Agent already have a role'
    if (!sender.name) return 'Agent must have a name'
    if (sender.isLocked) return 'Locked account cannot be agent'

    const voteExist = await app.sdb.exists('Vote', { address: senderId })
    if (voteExist) return 'Account already voted'

    sender.role = app.AccountRole.AGENT
    sender.isAgent = 1
    app.sdb.create('Agent', {
      name: sender.name,
      tid: this.trs.id,
      timestamp: this.trs.timestamp,
    })
    return null
  },

  async setAgent(agent) {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    const sender = this.sender
    if (sender.isAgent) return 'Agent cannot set agent'
    if (sender.agent) return 'Agent already set'
    if (!sender.isLocked) return 'Account is not locked'

    const agentAccount = await app.sdb.getBy('Account', { name: agent })
    if (!agentAccount) return 'Agent account not found'
    if (!agentAccount.isAgent) return 'Not an agent'

    const voteExist = await app.sdb.exists('Vote', { address: senderId })
    if (voteExist) return 'Account already voted'

    sender.agent = agent
    agentAccount.agentWeight += sender.weight

    const agentVoteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
    if (agentVoteList && agentVoteList.length > 0 && sender.weight > 0) {
      for (const voteItem of agentVoteList) {
        const delegate = await app.sdb.getBy('Delegate', { name: voteItem.delegate })
        delegate.votes += sender.weight
      }
    }
    app.sdb.create('AgentClientele', {
      agent,
      clientele: senderId,
      tid: this.trs.id,
    })
    return null
  },

  async cancelAgent() {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    const sender = this.sender
    if (!sender.agent) return 'Agent is not set'

    const agentAccount = await app.sdb.getBy('Account', { name: sender.agent })
    if (!agentAccount) return 'Agent account not found'

    await doCancelAgent(sender, agentAccount)
    return null
  },

  async registerDelegate() {
    const senderId = this.sender.address
    app.sdb.lock(`basic.registerDelegate@${senderId}`)
    const sender = this.sender
    if (!sender) return 'Account not found'
    if (!sender.name) return 'Account has not a name'
    if (sender.role) return 'Account already have a role'

    app.sdb.create('Delegate', {
      address: senderId,
      name: sender.name,
      tid: this.trs.id,
      publicKey: this.trs.senderPublicKey,
      votes: 0,
      producedBlocks: 0,
      missedBlocks: 0,
      fees: 0,
      rewards: 0,
    })
    sender.isDelegate = 1
    sender.role = app.AccountRole.DELEGATE
    return null
  },

  async vote(delegates) {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)

    const sender = this.sender
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    const currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
    if (currentVotes) {
      const currentVotedDelegates = new Set()
      for (const v of currentVotes) {
        currentVotedDelegates.add(v.delegate)
      }
      for (const name of delegates) {
        if (currentVotedDelegates.has(name)) {
          return `Delegate already voted: ${name}`
        }
      }
    }

    for (const name of delegates) {
      const exists = await app.sdb.exists('Delegate', { name })
      if (!exists) return `Voted delegate not exists: ${name}`
    }

    for (const name of delegates) {
      const delegate = await app.sdb.getBy('Delegate', { name })
      delegate.votes += (sender.weight + sender.agentWeight)
      app.sdb.create('Vote', {
        address: senderId,
        delegate: name,
      })
    }
    return null
  },

  async unvote(delegates) {
    const senderId = this.sender.address
    app.sdb.lock(`account@${senderId}`)

    const sender = this.sender
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'

    delegates = delegates.split(',')
    if (!delegates || !delegates.length) return 'Invalid delegates'
    if (!isUniq(delegates)) return 'Duplicated vote item'

    const currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
    if (currentVotes) {
      const currentVotedDelegates = new Set()
      for (const v of currentVotes) {
        currentVotedDelegates.add(v.delegate)
      }
      for (const name of delegates) {
        if (!currentVotedDelegates.has(name)) {
          return `Delegate not voted yet: ${name}`
        }
      }
    }

    for (const name of delegates) {
      const exists = await app.sdb.exists('Delegate', { name })
      if (!exists) return `Voted delegate not exists: ${name}`
    }

    for (const name of delegates) {
      const delegate = await app.sdb.getBy('Delegate', { name })
      delegate.votes -= (sender.weight + sender.agentWeight)
      const voteItem = await app.sdb.getBy('Vote', { address: senderId, delegate: name })
      app.sdb.del('Vote', voteItem)
    }
    return null
  },
}
