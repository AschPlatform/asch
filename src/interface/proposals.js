module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    let condition
    if (req.query.type === 'expired') {
      condition = {
        endHeight: {
          $lte: modules.blocks.getLastBlock().height,
        },
        activated: 0,
      }
    } else if (req.query.type === 'activated') {
      condition = {
        activated: 1,
      }
    } else if (req.query.type === 'ongoing') {
      condition = {
        endHeight: {
          $gt: modules.blocks.getLastBlock().height,
        },
        activated: 0,
      }
    } else if (req.query.type === 'all') {
      condition = {}
    } else {
      condition = {}
    }
    const count = await app.sdb.count('Proposal', condition)
    let proposals = []
    if (count > 0) {
      proposals = await app.sdb.findAll('Proposal', { condition, limit, offset })
    }
    return { count, proposals }
  })

  router.get('/:pid', async (req) => {
    const proposal = await app.sdb.findOne('Proposal', { condition: { tid: req.params.pid } })
    return { proposal }
  })

  router.get('/:pid/votes', async (req) => {
    const votes = await app.sdb.findAll('ProposalVote', { condition: { pid: req.params.pid } })
    const totalCount = votes.length
    const validCount = votes.filter(v => app.isCurrentBookkeeper(v.voter)).length
    if (totalCount > 0) {
      const voterAddresses = votes.map(v => v.voter)
      const accounts = await app.sdb.findAll('Account', { condition: { address: { $in: voterAddresses } } })
      const accountMap = new Map()
      for (const a of accounts) {
        accountMap.set(a.address, a)
      }
      for (const v of votes) {
        v.account = accountMap.get(v.voter)
      }
    }
    return { totalCount, validCount, votes }
  })
}
