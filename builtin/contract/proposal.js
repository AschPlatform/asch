async function doRegisterCouncil(params) {
  app.sdb.lock('council@' + name)
  let exists = await app.model.Council.findOne({ condition: { name: params.name } })
  if (exists) return 'Council already exists'

  let members = params.members
  delete params.members
  app.sdb.create('Council', {
    name: params.name,
    desc: params.desc,
    updateInterval: params.updateInterval,
    lastUpdateHeight: this.block.height,
    revoked: 0
  })
  for (let m of members) {
    app.sdb.create('CouncilMember', {
      council: name,
      member: m
    })
  }
}

async function doUpdateCouncil(params) {
  app.sdb.lock('council@' + name)
  let council = await app.model.Council.findOne({ condition: { name: params.name } })
  if (!council) throw new Error('Council not found')

  if (this.block.height - council.lastUpdateHeight < council.updateInterval) {
    throw new Error('Time not arrived')
  }
  if (params.field === 'updateInterval') {
    app.sdb.update('Council', { updateInterval: params.to }, { name: params.name })
  } else if (params.field === 'member') {
    app.sdb.update('CouncilMember', { member: params.to }, { council: params.name, member: params.from })
  }
}

async function doRevoteCouncil(params) {
  app.sdb.lock('council@' + params.name)
  let council = await app.model.Council.findOne({ condition: { name: params.name } })
  if (!council) return 'Council not found'

  app.sdb.update('Council', { revoked: 1 }, { name: council.name })
}

async function doGatewayRegister(params, context) {
  let name = params.name
  app.sdb.lock('gateway@' + name)
  let exists = await app.model.Gateway.exists({ name: name })
  if (exists) return 'Gateway already exists'

  app.sdb.create('Gateway', {
    name: name,
    desc: params.desc,
    updateInterval: params.updateInterval,
    minimumMembers: params.minimumMembers,
    lastUpdateHeight: context.block.height,
    revoked: 0,
    version: 1
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
    app.sdb.update('GatewayMember', { elected: 1 }, { gateway: params.gateway, address: m })
  }
}

async function doGatewayUpdateMember(params) {
  app.sdb.lock('gateway@' + params.gateway)
  let gateway = await app.model.Gateway.findOne({ condition: { name: params.gateway } })
  if (!gateway) throw new Error('Gateway not found')

  if (this.block.height - gateway.lastUpdateHeight < gateway.updateInterval) {
    throw new Error('Time not arrived')
  }
  app.sdb.update('GatewayMember', { elected: 0 }, { gateway: params.gateway, address: params.from })
  app.sdb.update('GatewayMember', { elected: 1 }, { gateway: params.gateway, address: params.to })
  app.sdb.increment('Gateway', { version: 1 }, { name: params.gateway })
}

async function doGatewayRevoke(params) {
  app.sdb.lock('gateway@' + params.gateway)
  let gateway = await app.model.Gateway.findOne({ condition: { name: params.gateway } })
  if (!gateway) return 'Gateway not found'

  app.sdb.update('Gateway', { revoked: 1 }, { name: params.gateway })
}

module.exports = {
  propose: async function (title, desc, topic, content) {
    app.sdb.create('Proposal', {
      tid: this.trs.id,
      title: title,
      desc: desc,
      topic: topic,
      content: JSON.stringify(content),
      activated: 0,
      height: this.block.height
    })
  },

  vote: async function (pid) {
    if (!app.isCurrentBookkeeper(this.trs.senderId)) return 'Permission denied'
    let proposal = await app.model.Proposal.findOne({ condition: { tid: pid } })
    if (!proposal) return 'Proposal not found'
    if (this.block.height - proposal.height > 8640 * 30) return 'Proposal expired'
    let exists = await app.model.ProposalVote.exists({ voter: this.trs.senderId, pid: pid })
    if (exists) return 'Already voted'
    app.sdb.create('ProposalVote', {
      tid: this.trs.id,
      pid: pid,
      voter: this.trs.senderId
    })
  },

  activate: async function (pid) {
    let proposal = await app.model.Proposal.findOne({ condition: { tid: pid } })
    if (!proposal) return 'Proposal not found'

    if (proposal.activated) return 'Already activated'

    let votes = await app.model.ProposalVote.findAll({ condition: { pid: pid } })
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
    if (topic === 'council_register') {
      await doRegisterCouncil(content, this)
    } else if (topic === 'council_update') {
      await doUpdateCouncil(content, this)
    } else if (topic === 'council_revote') {
      await doRevoteCouncil(content, this)
    } else if (topic === 'gateway_register') {
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
      app.sdb.update('Proposal', { activated: 1 }, { tid: pid })
    }
  }
}