module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let expired = req.query.expired ? Number(req.query.expired) : 0
    let activated = req.query.activated ? Number(req.query.activated) : 0
    let condition = { expired: expired, activated: activated }
    let count = await app.model.Proposal.count({ condition })
    let proposals = []
    if (count > 0) {
      proposals = await app.model.Proposal.findAll({ condition, limit, offset })
    }
    return { count: count, proposals: proposals }
  })

  router.get('/:pid', async function (req) {
    let proposal = await app.model.Proposal.findOne({ condition: { tid: req.params.pid } })
    if (!proposal) return 'Proposal not found'
    return { proposal: proposal }
  })

  router.get('/:pid/votes', async function (req) {
    let votes = await app.model.ProposalVote.findAll({ condition: { pid: req.params.pid } })
    let totalCount = votes.length
    let validCount = votes.filter((v) => app.isCurrentBookkeeper(v.voter)).length
    return { totalCount, validCount, votes }
  })
}