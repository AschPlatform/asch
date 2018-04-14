module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let condition
    if (req.query.type === 'expired') {
      condition = {
        endHeight: {
          $lte: modules.blocks.getLastBlock().height
        },
        activated: 0
      }
    } else if (req.query.type === 'activated') {
      condition = {
        activated: 1
      }
    } else if (req.query.type === 'ongoing') {
      condition = {
        endHeight: {
          $gt: modules.blocks.getLastBlock().height
        },
        activated: 0
      }
    } else if (req.query.type === 'all') {
      condition = {}
    } else {
      condition = {}
    }
    let count = await app.model.Proposal.count(condition)
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