function defined(obj) {
  return typeof obj !== 'undefined'
}

module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let sort = {}
    if (req.query.orderBy) {
      let orderBy = req.query.orderBy.split(':')
      sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
    }
    let transactions = []
    let condition = {}
    if (defined(req.query.type)) condition.type = Number(req.query.type)
    if (defined(req.query.height)) condition.height= Number(req.query.height)
    if (defined(req.query.senderId)) condition.senderId = req.query.senderId
    if (defined(req.query.message)) condition.message = req.query.message
    let count = await app.model.Transaction.count(condition)
    if (count > 0) {
      transactions = await app.model.Transaction.findAll({ condition, offset, limit, sort })
    }
    return { transactions, count }
  })

  router.get('/:id', async function (req) {
    let trs = await app.model.Transaction.findOne({ condition: { id: req.params.id } })
    if (!trs) throw new Error('Transaction no found')
    return { transaction: trs }
  })
}