const VALID_TOPICS = [
  'gateway_register',
  'gateway_init',
  'gateway_update_member',
  'gateway_revoke',
  'update_net_energy_per_xas',
  'update_net_energy_per_pledged_xas',
  'update_gasprice',
  'update_free_net_limit',
]

async function doGatewayRegister(params, context) {
  const name = params.name
  app.sdb.lock(`gateway@${name}`)
  const exists = await app.sdb.exists('Gateway', { name })
  if (exists) throw new Error('Gateway already exists')

  app.sdb.create('Gateway', {
    name,
    desc: params.desc,
    updateInterval: params.updateInterval,
    minimumMembers: params.minimumMembers,
    lastUpdateHeight: context.block.height,
    revoked: 0,
    version: 1,
    activated: 0,
    createTime: context.trs.timestamp,
  })
  app.sdb.create('GatewayCurrency', {
    gateway: name,
    symbol: params.currency.symbol,
    precision: params.currency.precision,
    desc: params.currency.desc,
    revoked: 0,
  })
}

async function doGatewayInit(params, context) {
  app.sdb.lock(`gateway@${params.gateway}`)
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: params.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (gateway.revoked) throw new Error('Gateway already revoked')
  for (const m of params.members) {
    if (!app.util.address.isNormalAddress(m)) throw new Error(`${m} is not valid address`)
    const addr = app.util.address.generateLockedAddress(m)
    const account = await app.sdb.findOne('Account', { condition: { address: addr } })
    if (!account) throw new Error(`No bail was found for gateway member ${m}`)
    if (account && account.xas < app.util.constants.initialDeposit) {
      throw new Error(`Bail is not enough for gateway member ${m}`)
    }
    app.sdb.update('GatewayMember', { elected: 1, timestamp: context.trs.timestamp }, { address: m })
  }
  app.sdb.update('Gateway', { activated: 1 }, { name: params.gateway })
}

async function doGatewayUpdateMember(params, context) {
  app.sdb.lock(`gateway@${params.gateway}`)
  const gateway = await app.sdb.load('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')
  if (gateway.revoked !== 0) throw new Error('Gateway should not be revoked')

  if (context.block.height - gateway.lastUpdateHeight < gateway.updateInterval) {
    throw new Error('Time not arrived')
  }

  const addr = app.util.address.generateLockedAddress(params.to)
  const account = await app.sdb.findOne('Account', { condition: { address: addr } })
  if (!account) throw new Error(`No bail was found for new gateway member ${params.to}`)
  if (account.xas < app.util.constants.initialDeposit) {
    throw new Error(`New member's bail is not enough for gateway member ${params.to}`)
  }

  app.sdb.increase('Gateway', { version: 1 }, { name: params.gateway })
  app.sdb.update('Gateway', { lastUpdateHeight: context.block.height }, { name: params.gateway })
  app.sdb.update('GatewayMember', { elected: 0, timestamp: context.trs.timestamp }, { address: params.from })
  app.sdb.update('GatewayMember', { elected: 1, timestamp: context.trs.timestamp }, { address: params.to })
}

async function doGatewayRevoke(params) {
  app.sdb.lock(`gateway@${params.gateway}`)
  const gateway = await app.sdb.load('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')

  gateway.revoked = 1
  app.sdb.update('Gateway', { revoked: 1 }, { name: params.gateway })
  const gwCurrency = await app.sdb.findAll('GatewayCurrency', { condition: { gateway: params.gateway } })
  if (gwCurrency.length > 0) {
    for (let i = 0; i < gwCurrency.length; i++) {
      app.sdb.update('GatewayCurrency', { revoked: 1 }, { gateway: params.gateway, symbol: gwCurrency[i].symbol })
    }
  }

  const members = await app.util.gateway.getAllGatewayMember(params.gateway)
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    const addr = app.util.address.generateLockedAddress(member.address)
    const exists = await app.sdb.load('Account', { address: addr })
    if (exists) {
      app.sdb.increase('Account', { xas: member.bail }, { address: member.address })
      app.sdb.increase('Account', { xas: -member.bail }, { address: addr })
    }
  }
}

async function doUpdateNetEnergyPerXAS(params) {
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  const totalPledge = totalPledges[0]
  totalPledge.netPerXAS = params.netPerXAS
  totalPledge.energyPerXAS = params.energyPerXAS
  app.sdb.update('AccountTotalPledge', totalPledge, { tid: totalPledge.tid })
}

async function doUpdateNetEnergyPerPledgedXAS(params) {
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  const totalPledge = totalPledges[0]
  totalPledge.netPerPledgedXAS = params.netPerPledgedXAS
  totalPledge.energyPerPledgedXAS = params.energyPerPledgedXAS
  app.sdb.update('AccountTotalPledge', totalPledge, { tid: totalPledge.tid })
}

async function doUpdateGasprice(params) {
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  const totalPledge = totalPledges[0]
  totalPledge.gasprice = params.gasprice
  app.sdb.update('AccountTotalPledge', totalPledge, { tid: totalPledge.tid })
}

async function doUpdateFreeNetLimit(params) {
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  const totalPledge = totalPledges[0]
  totalPledge.freeNetLimit = params.freeNetLimit
  app.sdb.update('AccountTotalPledge', totalPledge, { tid: totalPledge.tid })
}

async function validateGatewayRegister(content/* , context */) {
  if (!content.name || !/^[A-Za-z0-9]{3,16}$/.test(content.name)) {
    throw new Error('Invalid gateway name')
  }
  if (!content.desc || content.desc.length === 0 || content.desc.length > 4096) {
    throw new Error('Invalid gateway description')
  }
  if (!Number.isInteger(content.minimumMembers) || content.minimumMembers < 3
      || content.minimumMembers > 33) {
    throw new Error('Invalid gateway member limit')
  }
  if (!Number.isInteger(content.updateInterval) || content.updateInterval < 8640) {
    throw new Error('Invalid gateway update interval')
  }
  const { symbol, desc, precision } = content.currency
  if (!/^[A-Z]{3,6}$/.test(symbol)) throw new Error('Invalid default currency symbol')
  if (!desc || desc.length === 0 || desc.length > 4096) {
    throw new Error('Invalid default currency description')
  }
  if (!Number.isInteger(precision) || precision < 0 || precision > 16) {
    throw new Error('Invalid default currency precision')
  }
}

async function validateGatewayInit(content/* , context */) {
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (gateway.revoked) throw new Error('Gateway already revoked')

  if (content.members.length < gateway.minimumMembers) throw new Error('Invalid gateway member number')
  if (content.members.length % 2 === 0) throw new Error('Number of gateway members sould be odd')
  for (const m of content.members) {
    const validator = await app.sdb.findOne('GatewayMember', { condition: { address: m } })
    if (!validator) throw new Error('Unknow gateway validator address')
    if (validator.gateway !== gateway.name) throw new Error('Invalid validator')
    if (validator.elected) throw new Error('Validator already elected')
    const addr = app.util.address.generateLockedAddress(m)
    const account = await app.sdb.findOne('Account', { condition: { address: addr } })
    if (!account) throw new Error(`No bail was found for gateway member ${m}`)
    if (account && account.xas < app.util.constants.initialDeposit) {
      throw new Error(`Bail is not enough for gateway member ${m}`)
    }
  }
}

async function validateGatewayUpdateMember(content/* , context */) {
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (gateway.revoked !== 0) throw new Error('Gateway should not be revoked')

  const fromValidator = await app.sdb.findOne('GatewayMember', {
    condition: {
      address: content.from,
    },
  })
  if (!fromValidator || !fromValidator.elected || fromValidator.gateway !== gateway.name) {
    throw new Error('Invalid from validator')
  }

  const toValidator = await app.sdb.findOne('GatewayMember', {
    condition: {
      address: content.to,
    },
  })
  if (!toValidator || toValidator.elected || toValidator.gateway !== gateway.name) {
    throw new Error('Invalid to validator')
  }

  const addr = app.util.address.generateLockedAddress(content.to)
  const account = await app.sdb.findOne('Account', { condition: { address: addr } })
  if (!account) throw new Error(`No bail was found for new gateway member ${content.to}`)
  if (account.xas < app.util.constants.initialDeposit) {
    throw new Error(`New member's bail is not enough for gateway member ${content.to}`)
  }
}

async function validateGatewayContent(content/* , context */) {
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (gateway.revoked) throw new Error('Gateway is already revoked')
}

async function validateNetEnergyPerXAS(content/* , context */) {
  app.validate('amount', String(content.netPerXAS))
  app.validate('amount', String(content.energyPerXAS))
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  if (totalPledges.length === 0) throw new Error('Total pledge is not set')
  if (content.netPerXAS < 0) throw new Error('Net per XAS should be positive number')
  if (content.energyPerXAS < 0) throw new Error('Energy per XAS should be positive number')
}

async function validateNetEnergyPerPledgedXAS(content/* , context */) {
  app.validate('amount', String(content.netPerPledgedXAS))
  app.validate('amount', String(content.energyPerPledgedXAS))
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  if (totalPledges.length === 0) throw new Error('Total pledge is not set')
  if (content.netPerPledgedXAS < 0) throw new Error('Net per pledged XAS should be positive number')
  if (content.energyPerPledgedXAS < 0) throw new Error('Energy per pledged XAS should be positive number')
}

async function validateGasprice(content/* , context */) {
  app.validate('amount', String(content.gasprice))
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  if (totalPledges.length === 0) throw new Error('Total pledge is not set')
  if (content.gasprice < 0) throw new Error('Gas price should be positive number')
}

async function validateFreeNetLimit(content/* , context */) {
  app.validate('amount', String(content.freeNetLimit))
  const totalPledges = await app.sdb.findAll('AccountTotalPledge', { })
  if (totalPledges.length === 0) throw new Error('Total pledge is not set')
  if (content.freeNetLimit < 0) throw new Error('Free net limit per day should be positive number')
}

module.exports = {
  async propose(title, desc, topic, content, endHeight) {
    if (!/^[A-Za-z0-9_\-+!@$% ]{10,100}$/.test(title)) return 'Invalid proposal title'
    if (desc.length > 4096) return 'Invalid proposal description'
    if (VALID_TOPICS.indexOf(topic) === -1) return 'Invalid proposal topic'
    if (!Number.isInteger(endHeight) || endHeight < 0) return 'EndHeight should be positive integer'
    if (endHeight < this.block.height + 8640) return 'Invalid proposal finish date'

    if (topic === 'gateway_register') {
      await validateGatewayRegister(content, this)
    } else if (topic === 'gateway_init') {
      await validateGatewayInit(content, this)
    } else if (topic === 'gateway_update_member') {
      await validateGatewayUpdateMember(content, this)
    } else if (topic === 'gateway_revoke') {
      await validateGatewayContent(content, this)
    } else if (topic === 'update_net_energy_per_xas') {
      await validateNetEnergyPerXAS(content, this)
    } else if (topic === 'update_net_energy_per_pledged_xas') {
      await validateNetEnergyPerPledgedXAS(content, this)
    } else if (topic === 'update_gasprice') {
      await validateGasprice(content, this)
    } else if (topic === 'update_free_net_limit') {
      await validateFreeNetLimit(content, this)
    }

    app.sdb.create('Proposal', {
      tid: this.trs.id,
      timestamp: this.trs.timestamp,
      title,
      desc,
      topic,
      content: JSON.stringify(content),
      activated: 0,
      height: this.block.height,
      endHeight,
      senderId: this.sender.address,
    })
    return null
  },

  async vote(pid) {
    if (!app.isCurrentBookkeeper(this.sender.address)) return 'Permission denied'
    const proposal = await app.sdb.findOne('Proposal', { condition: { tid: pid } })
    if (!proposal) return 'Proposal not found'
    if (this.block.height - proposal.height > 8640 * 30) return 'Proposal expired'
    const exists = await app.sdb.exists('ProposalVote', { voter: this.sender.address, pid })
    if (exists) return 'Already voted'
    app.sdb.create('ProposalVote', {
      tid: this.trs.id,
      pid,
      voter: this.sender.address,
    })
    return null
  },

  async activate(pid) {
    const proposal = await app.sdb.load('Proposal', pid)
    if (!proposal) return 'Proposal not found'

    if (proposal.activated) return 'Already activated'

    const votes = await app.sdb.findAll('ProposalVote', { condition: { pid } })
    let validVoteCount = 0
    for (const v of votes) {
      if (app.isCurrentBookkeeper(v.voter)) {
        validVoteCount++
      }
    }
    if (validVoteCount <= ((app.util.slots.delegates * 2) / 3)) return 'Vote not enough'

    const topic = proposal.topic
    // fixme make content as Json type ??
    const content = JSON.parse(proposal.content)

    let unknownTopic = false
    if (topic === 'gateway_register') {
      await doGatewayRegister(content, this)
    } else if (topic === 'gateway_init') {
      await doGatewayInit(content, this)
    } else if (topic === 'gateway_update_member') {
      await doGatewayUpdateMember(content, this)
    } else if (topic === 'gateway_revoke') {
      await doGatewayRevoke(content, this)
    } else if (topic === 'update_net_energy_per_xas') {
      await doUpdateNetEnergyPerXAS(content, this)
    } else if (topic === 'update_net_energy_per_pledged_xas') {
      await doUpdateNetEnergyPerPledgedXAS(content, this)
    } else if (topic === 'update_gasprice') {
      await doUpdateGasprice(content, this)
    } else if (topic === 'update_free_net_limit') {
      await doUpdateFreeNetLimit(content, this)
    } else {
      unknownTopic = true
    }
    if (unknownTopic) {
      return 'Unknown propose topic'
    }
    proposal.activated = 1
    app.sdb.update('Proposal', { activated: 1 }, { tid: pid })

    return null
  },
}
