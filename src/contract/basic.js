async function doCancelVote(account) {
  const voteList = await app.sdb.findAll('Vote', { condition: { address: account.address } })
  if (voteList && voteList.length > 0 && account.weight > 0) {
    for (const voteItem of voteList) {
      app.sdb.increase('Delegate', { votes: -account.weight }, { name: voteItem.delegate })
    }
  }
}

async function doCancelAgent(sender, agentAccount) {
  const agentClienteleKey = { clientele: sender.address }
  const cancelWeight = sender.weight
  agentAccount.agentWeight -= cancelWeight
  app.sdb.increase('Account', { agentWeight: -cancelWeight }, { address: agentAccount.address })

  sender.agent = ''
  app.sdb.update('Account', { agent: '' }, { address: sender.address })
  app.sdb.del('AgentClientele', agentClienteleKey)

  const voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
  if (voteList && voteList.length > 0 && cancelWeight > 0) {
    for (const voteItem of voteList) {
      app.sdb.increase('Delegate', { votes: -cancelWeight }, { name: voteItem.delegate })
    }
  }
}

module.exports = {
  async transfer(amount, recipient) {
    if (!recipient) return 'Invalid recipient'
    app.validate('amount', String(amount))

    amount = Number(amount)
    const sender = this.sender
    const senderId = sender.address
    if (this.block.height > 0 && sender.xas < amount) return 'Insufficient balance'

    let recipientAccount
    // Validate recipient is valid address
    if (recipient && (app.util.address.isNormalAddress(recipient)
      || app.util.address.isGroupAddress(recipient))) {
      recipientAccount = await app.sdb.load('Account', recipient)
      if (recipientAccount) {
        if (recipientAccount.address === senderId) return 'Sender and recipient is identical'
        app.sdb.increase('Account', { xas: amount }, { address: recipientAccount.address })
      } else {
        recipientAccount = app.sdb.create('Account', {
          address: recipient,
          xas: amount,
          name: null,
        })
      }
    } else {
      recipientAccount = await app.sdb.load('Account', { name: recipient })
      if (!recipientAccount) return 'Recipient name not exist'
      if (recipientAccount.address === senderId) return 'Sender and recipient is identical'
      app.sdb.increase('Account', { xas: amount }, { address: recipientAccount.address })
    }
    app.sdb.increase('Account', { xas: -amount }, { address: sender.address })

    app.sdb.create('Transfer', {
      tid: this.trs.id,
      height: this.block.height,
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
    app.validate('name', name)

    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)

    const exists = await app.sdb.load('Account', { name })
    if (exists) return 'Name already registered'
    if (this.sender.name) return 'Name already set'
    this.sender.name = name
    app.sdb.update('Account', { name }, { address: this.sender.address })

    return null
  },

  async setPassword(publicKey) {
    app.validate('publickey', publicKey)

    if (!app.util.address.isNormalAddress(this.sender.address)) {
      return 'Invalid account type'
    }
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    if (this.sender.secondPublicKey) return 'Password already set'
    this.sender.secondPublicKey = publicKey
    app.sdb.update('Account', { secondPublicKey: publicKey }, { address: this.sender.address })
    return null
  },

  async lock(height, amount) {
    if (!Number.isInteger(height) || height <= 0) return 'Height should be positive integer'

    height = Number(height)
    amount = Number(amount)
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)

    const MIN_LOCK_HEIGHT = 8640 * 30
    const sender = this.sender
    if (sender.isAgent) return 'Agent account cannot lock'
    if (sender.xas - 100000000 < amount) return 'Insufficient balance'
    if (sender.isLocked) {
      if (height !== 0
        && height < (Math.max(this.block.height, sender.lockHeight) + MIN_LOCK_HEIGHT)) {
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
      sender.weight += amount
      app.sdb.update('Account', sender, { address: sender.address })

      if (sender.agent) {
        const agentAccount = await app.sdb.load('Account', { name: sender.agent })
        if (!agentAccount) return 'Agent account not found'
        app.sdb.increase('Account', { agentWeight: amount }, { address: agentAccount.address })

        const voteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
        if (voteList && voteList.length > 0) {
          for (const voteItem of voteList) {
            app.sdb.increase('Delegate', { votes: amount }, { name: voteItem.delegate })
          }
        }
      } else {
        const voteList = await app.sdb.findAll('Vote', { condition: { address: senderId } })
        if (voteList && voteList.length > 0) {
          for (const voteItem of voteList) {
            app.sdb.increase('Delegate', { votes: amount }, { name: voteItem.delegate })
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
      const agentAccount = await app.sdb.load('Account', { name: sender.agent })
      if (!agentAccount) return 'Agent account not found'

      await doCancelAgent(sender, agentAccount)
    }
    sender.isLocked = 0
    sender.lockHeight = 0
    sender.xas += sender.weight
    sender.weight = 0
    app.sdb.update('Account', sender, { address: senderId })

    return null
  },

  async registerGroup(name, members, min, max, m, updateInterval) {
    app.validate('name', name)
    // rule: min, max, m, updateInterval should be integer
    // rule：min >=3, min < max, updateInterval > 1
    if (!Number.isInteger(min) || min <= 0) return 'Min should be positive integer'
    if (!Number.isInteger(max) || max <= 0) return 'Max should be positive integer'
    if (!Number.isInteger(m) || m <= 0) return 'M should be positive integer'
    if (!Number.isInteger(updateInterval) || updateInterval <= 0) return 'UpdateInterval should be positive integer'

    if (min < 3) return 'Min should be greater than 3'
    if (min >= max) return 'Max should be greater than min'
    if (updateInterval < 1) return 'UpdateInterval should be greater than 1'

    for (const member of members) {
      // member.weight should be integer
      // member.address should have valid address format
      app.validate('name', member.name)
      if (!Number.isInteger(member.weight) || member.weight <= 0) return 'Member weight should be positive integer'
      if (!app.util.address.isNormalAddress(member.address)) {
        return 'Invalid member address'
      }
    }

    if (await app.sdb.load('Account', { name })) return 'Name already registered'
    const address = app.util.address.generateGroupAddress(name)
    const account = await app.sdb.load('Account', address)
    if (!account) {
      app.sdb.create('Account', {
        address,
        name,
        xas: 0,
      })
    }
    app.sdb.create('Group', {
      name,
      address,
      tid: this.trs.id,
      min,
      max,
      m,
      updateInterval,
      createTime: this.trs.timestamp,
    })
    for (const member of members) {
      app.sdb.create('GroupMember', {
        name,
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
    app.sdb.update('Account', sender, { address: senderId })
    return null
  },

  async setAgent(agent) {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)
    const sender = this.sender
    if (sender.isAgent) return 'Agent cannot set agent'
    if (sender.agent) return 'Agent already set'
    if (!sender.isLocked) return 'Account is not locked'

    app.validate('name', agent)

    const agentAccount = await app.sdb.load('Account', { name: agent })
    if (!agentAccount) return 'Agent account not found'
    if (!agentAccount.isAgent) return 'Not an agent'

    const voteExist = await app.sdb.exists('Vote', { address: senderId })
    if (voteExist) return 'Account already voted'

    sender.agent = agent
    app.sdb.update('Account', { agent: sender.agent }, { address: senderId })
    app.sdb.increase('Account', { agentWeight: sender.weight }, { address: agentAccount.address })

    const agentVoteList = await app.sdb.findAll('Vote', { condition: { address: agentAccount.address } })
    if (agentVoteList && agentVoteList.length > 0 && sender.weight > 0) {
      for (const voteItem of agentVoteList) {
        app.sdb.increase('Delegate', { votes: sender.weight }, { name: voteItem.delegate })
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

    const agentAccount = await app.sdb.load('Account', { name: sender.agent })
    if (!agentAccount) return 'Agent account not found'

    await doCancelAgent(sender, agentAccount)
    return null
  },

  async registerDelegate() {
    const senderId = this.sender.address
    if (this.block.height > 0) app.sdb.lock(`basic.account@${senderId}`)
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
    app.sdb.update('Account', { isDelegate: 1, role: app.AccountRole.DELEGATE }, { address: senderId })

    return null
  },

  async vote(delegate) {
    const senderId = this.sender.address
    app.sdb.lock(`basic.account@${senderId}`)

    const sender = this.sender
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'
    if (!delegate) return 'Invalid delegate'

    const currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
    if (currentVotes && currentVotes.length > 0) {
      const cancelVotes = -1 * (sender.weight + sender.agentWeight)
      const cancelDelegate = currentVotes[0].delegate
      if (cancelDelegate === delegate) return 'You have voted this delegate'
      app.sdb.increase('Delegate', { votes: cancelVotes }, { name: cancelDelegate })
      app.sdb.del('Vote', { address: senderId, delegate: cancelDelegate })
    }

    const exists = await app.sdb.exists('Delegate', { name: delegate })
    if (!exists) return `Voted delegate not exists: ${delegate}`

    const votes = (sender.weight + sender.agentWeight)
    app.sdb.increase('Delegate', { votes }, { name: delegate })
    app.sdb.create('Vote', { address: senderId, delegate })
    return null
  },

  async unvote(delegate) {
    const senderId = this.sender.address
    app.sdb.lock(`account@${senderId}`)

    const sender = this.sender
    if (!sender.isAgent && !sender.isLocked) return 'Account is not locked'
    if (sender.agent) return 'Account already set agent'

    const currentVotes = await app.sdb.findAll('Vote', { condition: { address: senderId } })
    if (!currentVotes || !currentVotes.length || currentVotes[0].delegate !== delegate) {
      return 'The delegate has not been voted by your account'
    }

    const exists = await app.sdb.exists('Delegate', { name: delegate })
    if (!exists) return `Voted delegate not exists: ${delegate}`

    const votes = -(sender.weight + sender.agentWeight)
    app.sdb.increase('Delegate', { votes }, { name: delegate })
    app.sdb.del('Vote', { address: senderId, delegate })
    return null
  },

  async pledge(netAmount, energyAmount) {
    if (!Number.isInteger(netAmount) || !Number.isInteger(energyAmount)) return 'Amount should be integer'
    if (netAmount < 0 || energyAmount < 0) return 'Amount should be positive number'
    const sender = this.sender
    const totalAmount = netAmount + energyAmount
    if (sender.xas < totalAmount) return 'Insufficient balance in Accounts'
    sender.xas -= totalAmount
    app.sdb.update('Account', sender, { address: sender.address })
    let pledgeAccount = await app.sdb.load('AccountPledge', sender.address)
    if (!pledgeAccount) {
      const currentDay = Number.parseInt(this.block.height / app.util.constants.blocksPerDay, 10)
      app.sdb.create('AccountPledge', {
        address: sender.address,
        lastFreeNetUpdateDay: currentDay,
        lastNetUpdateDay: currentDay,
        lastEnergyUpdateDay: currentDay,
        heightOffset: this.block.height % app.util.constants.blocksPerDay,
      })
      pledgeAccount = await app.sdb.load('AccountPledge', sender.address)
    }

    const totalPledges = await app.sdb.loadMany('AccountTotalPledge', {})
    let totalPledge
    if (totalPledges.length === 0) {
      app.sdb.create('AccountTotalPledge', {
        tid: this.trs.id,
        netPerXAS: app.util.constants.netPerXAS,
        energyPerXAS: app.util.constants.energyPerXAS,
        netPerPledgedXAS: app.util.constants.netPerPledgedXAS,
        energyPerPledgedXAS: app.util.constants.energyPerPledgedXAS,
        freeNetLimit: app.util.constants.freeNetLimitPerDay,
        gasPrice: app.util.constants.energyPerGas,
      })
      totalPledge = await app.sdb.load('AccountTotalPledge', this.trs.id)
    } else {
      totalPledge = totalPledges[0]
    }
    if (netAmount > 0) {
      pledgeAccount.pledgeAmountForNet += netAmount
      totalPledge.totalPledgeForNet += netAmount
      pledgeAccount.netLockHeight = this.block.height
    }
    if (energyAmount > 0) {
      pledgeAccount.pledgeAmountForEnergy += energyAmount
      totalPledge.totalPledgeForEnergy += energyAmount
      pledgeAccount.energyLockHeight = this.block.height
    }
    app.sdb.update('AccountPledge', pledgeAccount, { address: sender.address })
    app.sdb.update('AccountTotalPledge', totalPledge, { tid: totalPledge.tid })

    return null
  },

  async unpledge(netAmount, energyAmount) {
    if (!Number.isInteger(netAmount) || !Number.isInteger(energyAmount)) return 'Amount should be integer'
    if (netAmount < 0 || energyAmount < 0) return 'Amount should be positive number'
    const sender = this.sender
    const pledgeAccount = await app.sdb.load('AccountPledge', sender.address)
    if (!pledgeAccount) return `No pledge for account ${sender.address}`
    const totalPledges = await app.sdb.loadMany('AccountTotalPledge', {})
    if (totalPledges.length === 0) return 'Total pledge is not set'
    if (totalPledges[0].totalPledgeForNet < netAmount || totalPledges[0].totalPledgeForEnergy < energyAmount) return 'Insufficient balance in AccountTotalPledges'
    const totalAmount = netAmount + energyAmount
    sender.xas += totalAmount
    app.sdb.update('Account', sender, { address: sender.address })
    if (netAmount > 0) {
      if (pledgeAccount.netLockHeight > (this.block.height - app.util.constants.pledageDays * app.util.constants.blocksPerDay)) return 'Pledge duration should be greater than 3 day'
      if (pledgeAccount.pledgeAmountForNet < netAmount) return 'Insufficient balance in AccountPledges'
      pledgeAccount.pledgeAmountForNet -= netAmount
      totalPledges[0].totalPledgeForNet -= netAmount
    }
    if (energyAmount > 0) {
      if (pledgeAccount.energyLockHeight > (this.block.height - app.util.constants.pledageDays * app.util.constants.blocksPerDay)) return 'Pledge duration should be greater than 3 day'
      if (pledgeAccount.pledgeAmountForEnergy < energyAmount) return 'Insufficient balance in AccountPledges'
      pledgeAccount.pledgeAmountForEnergy -= energyAmount
      totalPledges[0].totalPledgeForEnergy -= energyAmount
    }
    app.sdb.update('AccountPledge', pledgeAccount, { address: sender.address })
    app.sdb.update('AccountTotalPledge', totalPledges[0], { tid: totalPledges[0].tid })

    return null
  },
}
