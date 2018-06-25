function defined(obj) {
  return typeof obj !== 'undefined'
}

module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const sort = {}
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(':')
      sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
    }
    let transactions = []
    const condition = {}
    if (defined(req.query.type)) condition.type = Number(req.query.type)
    if (defined(req.query.height)) condition.height = Number(req.query.height)
    if (defined(req.query.senderId)) condition.senderId = req.query.senderId
    if (defined(req.query.message)) condition.message = req.query.message
    const count = await app.sdb.count('Transaction', condition)
    if (count > 0) {
      transactions = await app.sdb.findAll('Transaction', {
        condition, offset, limit, sort,
      })
    }
    return { transactions, count }
  })

  router.get('/:id', async (req) => {
    const trs = await app.sdb.findOne('Transaction', { condition: { id: req.params.id } })
    if (!trs) throw new Error('Transaction no found')
    return { transaction: trs }
  })
}
