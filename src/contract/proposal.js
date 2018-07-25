const VALID_TOPICS = [
  'gateway_register',
  'gateway_init',
  'gateway_update_member',
  'gateway_revoke',
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

async function doGatewayInit(params) {
  for (const m of params.members) {
    // TODO: ....check m is address
    app.sdb.update('GatewayMember', { elected : 1 }, { address: m })
  }
  app.sdb.update('Gateway', { activated : 1 }, { name: params.gateway })
}

async function doGatewayUpdateMember(params) {
  app.sdb.lock(`gateway@${params.gateway}`)
  const gateway = await app.sdb.load('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')

  if (this.block.height - gateway.lastUpdateHeight < gateway.updateInterval) {
    throw new Error('Time not arrived')
  }

  app.sdb.increase('Gateway', { version : 1}, { name: params.gateway })
  app.sdb.update('GatewayMember', { elected : 0 }, { address: params.from})
  app.sdb.update('GatewayMember', { elected : 1 }, { address: params.to})
}

async function doGatewayRevoke(params) {
  app.sdb.lock(`gateway@${params.gateway}`)
  const gateway = await app.sdb.load('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')

  gateway.revoked = 1
  app.sdb.update('Gateway', { revoked : 1 }, { name: params.gateway })
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

  if (content.members.length < gateway.minimumMembers) throw new Error('Invalid gateway member number')
  for (const m of content.members) {
    const validator = await app.sdb.findOne('GatewayMember', { condition: { address: m } })
    if (!validator) throw new Error('Unknow gateway validator address')
    if (validator.gateway !== gateway.name) throw new Error('Invalid validator')
    if (validator.elected) throw new Error('Validator already elected')
  }
}

async function validateGatewayUpdateMember(content/* , context */) {
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')

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
}

async function validateGatewayContent(content/* , context */) {
  const gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (!gateway.revoke) throw new Error('Gateway is already revoked')
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
    if (validVoteCount <= ((101 * 2) / 3)) return 'Vote not enough'

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
    } else {
      unknownTopic = true
    }
    if (unknownTopic) {
      return 'Unknown propose topic'
    }
    proposal.activated = 1
    app.sdb.update('Proposal', { activated : 1 }, { tid: pid })
    
    return null
  },
}
