const VALID_TOPICS = [
  'gateway_register',
  'gateway_init',
  'gateway_update_member',
  'gateway_revoke'
]

async function doGatewayRegister(params, context) {
  let name = params.name
  app.sdb.lock('gateway@' + name)
  let exists = await app.sdb.exists('Gateway', { name: name })
  if (exists) throw new Error('Gateway already exists')

  app.sdb.create('Gateway', {
    name: name,
    desc: params.desc,
    updateInterval: params.updateInterval,
    minimumMembers: params.minimumMembers,
    lastUpdateHeight: context.block.height,
    revoked: 0,
    version: 1,
    activated: 0,
    createTime: context.trs.timestamp
  })
  app.sdb.create('GatewayCurrency', {
    gateway: name,
    symbol: params.currency.symbol,
    precision: params.currency.precision,
    desc: params.currency.desc,
    revoked: 0
  })
}

async function doGatewayInit(params) {
  for (let m of params.members) {
    let dbItem = await app.sdb.get('GatewayMember', m)
    dbItem.elected = 1
  }
  let gateway = await app.sdb.get('Gateway', params.gateway)
  gateway.activated = 1
}

async function doGatewayUpdateMember(params) {
  app.sdb.lock('gateway@' + params.gateway)
  let gateway = await app.sdb.get('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')

  if (this.block.height - gateway.lastUpdateHeight < gateway.updateInterval) {
    throw new Error('Time not arrived')
  }
  gateway.version += 1
  let fromValidator = await app.sdb.get('GatewayMember', params.from)
  fromValidator.elected = 0

  let toValidator = await app.sdb.get('GatewayMember', params.to)
  toValidator.elected = 1
}

async function doGatewayRevoke(params) {
  app.sdb.lock('gateway@' + params.gateway)
  let gateway = await app.sdb.get('Gateway', params.gateway)
  if (!gateway) throw new Error('Gateway not found')

  gateway.revoked = 1
}

async function validateGatewayRegister(content, context) {
  if (!content.name || !/^[A-Za-z0-9]{3,16}$/.test(content.name)) {
    throw new Error('Invalid gateway name')
  }
  if (!content.desc || content.desc.length === 0 || content.desc.length > 4096) {
    throw new Error('Invalid gateway description')
  }
  if (!Number.isInteger(content.minimumMembers) || content.minimumMembers < 3 || content.minimumMembers > 33) {
    throw new Error('Invalid gateway member limit')
  }
  if (!Number.isInteger(content.updateInterval) || content.updateInterval < 8640) {
    throw new Error('Invalid gateway update interval')
  }
  let { symbol, desc, precision } = content.currency
  if (!/^[A-Z]{3,6}$/.test(symbol)) throw new Error('Invalid default currency symbol')
  if (!desc || desc.length === 0 || desc.length > 4096) {
    throw new Error('Invalid default currency description')
  }
  if (!Number.isInteger(precision) || precision < 0 || precision > 16) {
    throw new Error("Invalid default currency precision")
  }
}

async function validateGatewayInit(content, context) {
  let gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')

  if (content.members.length < gateway.minimumMembers) throw new Error('Invalid gateway member number')
  for (let m of content.members) {
    let validator = await app.sdb.findOne('GatewayMember', { condition: { address: m } })
    if (!validator) throw new Error("Unknow gateway validator address")
    if (validator.gateway !== gateway.name) throw new Error('Invalid validator')
    if (validator.elected) throw new Error('Validator already elected')
  }
}

async function validateGatewayUpdateMember(content, context) {
  let gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')

  let fromValidator = await app.sdb.findOne('GatewayMember', {
    condition: {
      address: content.from
    }
  })
  if (!fromValidator || !fromValidator.elected || fromValidator.gateway !== gateway.name) {
    throw new Error('Invalid from validator')
  }

  let toValidator = await app.sdb.findOne('GatewayMember', {
    condition: {
      address: content.to
    }
  })
  if (!toValidator || toValidator.elected || toValidator.gateway !== gateway.name) {
    throw new Error('Invalid to validator')
  }
}

async function validateGatewayContent(content, context) {
  let gateway = await app.sdb.findOne('Gateway', { condition: { name: content.gateway } })
  if (!gateway) throw new Error('Gateway not found')
  if (!gateway.revoke) throw new Error('Gateway is already revoked')
}

module.exports = {
  propose: async function (title, desc, topic, content, endHeight) {
    if (!/^[A-Za-z0-9_\-+!@$% ]{10,100}$/.test(title)) return 'Invalid proposal title'
    if (desc.length > 4096) return 'Invalid proposal description'
    if (VALID_TOPICS.indexOf(topic) === -1) return 'Invalid proposal topic'
    if (!Number.isInteger(endHeight) || endHeight < this.block.height + 8640) return 'Invalid proposal finish date'

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
      title: title,
      desc: desc,
      topic: topic,
      content: JSON.stringify(content),
      activated: 0,
      height: this.block.height,
      endHeight: endHeight,
      senderId: this.trs.senderId
    })
  },

  vote: async function (pid) {
    if (!app.isCurrentBookkeeper(this.trs.senderId)) return 'Permission denied'
    let proposal = await app.sdb.findOne('Proposal', { condition: { tid: pid } })
    if (!proposal) return 'Proposal not found'
    if (this.block.height - proposal.height > 8640 * 30) return 'Proposal expired'
    let exists = await app.sdb.exists('ProposalVote', { voter: this.trs.senderId, pid: pid })
    if (exists) return 'Already voted'
    app.sdb.create('ProposalVote', {
      tid: this.trs.id,
      pid: pid,
      voter: this.trs.senderId
    })
  },

  activate: async function (pid) {
    let proposal = await app.sdb.get('Proposal', pid)
    if (!proposal) return 'Proposal not found'

    if (proposal.activated) return 'Already activated'

    let votes = await app.sdb.findAll('ProposalVote', { condition: { pid: pid } })
    let validVoteCount = 0
    for (let v of votes) {
      if (app.isCurrentBookkeeper(v.voter)) {
        validVoteCount++
      }
    }
    if (validVoteCount <= (101 * 2 / 3)) return 'Vote not enough'

    let topic = proposal.topic
    let content = JSON.parse(proposal.content)

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
    } else {
      proposal.activated = 1
    }
  }
}