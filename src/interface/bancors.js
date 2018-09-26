async function getBancors(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const bancors = await app.sdb.findAll('Bancor', { limit, offset })
  // Latest bid price
  bancors.forEach((element, index, array) => {
    const sort = { timestamp: -1 }
    const record = app.sdb.findOne('BancorExchange', { condition: { address: element.owner }, sort })
    if (record) {
      array[index].latestBid = record.ratio
    } else {
      array[index].latestBid = 0
    }
  })
  return { bancors }
}

async function getTransactionsByBancor(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  let sort = {}
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy.split(':')
    sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
  } else {
    sort = { timestamp: -1 }
  }
  const condition = {
    address: req.params.address,
    source: req.params.source,
    target: req.params.target,
  }
  const transactions = await app.sdb.findAll('BancorExchange', {
    condition, limit, offset, sort,
  })
  return transactions
}

module.exports = (router) => {
  router.get('/', getBancors)
  router.get('/transactions/:address/:source/:target', getTransactionsByBancor)
}
