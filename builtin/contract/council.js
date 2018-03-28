async function doRegisterCouncil(params) {
  app.sdb.lock('council@' + name)
  let exists = await app.model.Council.findOne({ condition: { name: params.name } })
  if (exists) return 'Council already exists'

  let members = params.members
  delete params.members
  app.sdb.create('Council', {
    tid: this.trs.id,
    name: params.name,
    desc: params.desc,
    rewardRatio: params.rewardRatio,
    updateInterval: params.updateInterval,
    lastUpdateHeight: this.block.height,
    actived: 0,
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
  if (params.field === 'rewardRatio') {
    app.sdb.update('Council', { rewardRatio: params.to }, { name: params.name })
  } else if (params.field === 'updateInterval') {
    app.sdb.update('Council', { updateInterval: params.to }, { name: params.name })
  } else if (params.field === 'member') {
    app.sdb.update('CouncilMember', { member: params.to }, { name: params.name, member: params.from })
  }
}

async function doRevoteCouncil(params) {
  app.sdb.lock('council@' + name)
  let council = await app.model.Council.findOne({ condition: { name: params.name } })
  if (!council) return 'Council not found'

  app.sdb.update('Council', { revoked: 1 }, { name: council.name })
}

module.exports = {
  propose: async function (topic, content) {
    app.sdb.create('CouncilPropose', {
      tid: this.trs.id,
      topic: topic,
      content: JSON.stringify(content),
      activated: 0
    })
  },

  vote: async function (pid) {
    app.sdb.create('CouncilVote', {
      tid: this.trs.id,
      pid: pid,
      voter: this.trs.senderId
    })
  },

  activate: async function (pid) {
    let proposal = await app.model.CouncilProposal.findOne({ condition: { tid: pid } })
    if (!proposal) return 'Proposal not found'

    if (proposal.activated) return 'Already activated'

    let votes = await app.model.CouncilVote.findAll({ condition: { pid: pid } })
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
      await doRegisterCouncil(content)
    } else if (topic === 'council_update') {
      await doUpdateCouncil(content)
    } else if (topic === 'council_revote') {
      await doRevoteCouncil(content)
    } else {
      unknownTopic = true
    }
    if (unknownTopic) {
      return 'Unknown propose topic'
    } else {
      app.sdb.update('CouncilPropose', { activated: true }, { tid: pid })
    }
  }
}