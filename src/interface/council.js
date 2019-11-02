

module.exports = (router) => {
  router.get('/info', async (req) => {

    const councilInfo = modules.council.getCouncilInfo()
    return { councilInfo }
  })

  router.get('/members', async (req) => {
    let members = app.sdb.getAll('CouncilMember') || []
    members = members.sort((a, b) => b.votes - a.votes)
    return {
      count: members.length,
      members,
    }
  })

  router.get('/payments', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const sort = {}
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(':')
      sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
    }
    let payments = []
    const condition = {}
    if (Number(req.query.pending) === 1) {
      condition.pending = Number(req.query.pending)
    }
    const count = await app.sdb.count('CouncilTransaction', condition)
    if (count > 0) {
      payments = await app.sdb.findAll('CouncilTransaction', {
        condition, offset, limit, sort,
      })
    }
    return { count, payments }
  })

  router.get('/pendingPayment/:tid', async (req) => {
    const payment = await app.sdb.findOne('CouncilTransaction', { condition: { id: req.params.id } })
    if (!payment) throw new Error('Payment no found')
    return { payment }
  })
}
