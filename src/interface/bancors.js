async function getBancors(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  let sortBancor = {}
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy.split(':')
    sortBancor[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
  } else {
    sortBancor = { timestamp: -1 }
  }
  const bancors = await app.sdb.findAll('Bancor', { limit, offset, sortBancor })
  // Latest bid price
  await bancors.forEach(async (element, index, array) => {
    const sort = { timestamp: -1 }
    const record = await app.sdb.findOne('BancorExchange', { condition: { address: element.owner }, sort })
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
    owner: req.params.owner,
    source: req.params.source,
    target: req.params.target,
  }
  const transactions = await app.sdb.findAll('BancorExchange', {
    condition, limit, offset, sort,
  })
  return transactions
}

async function getTransactionsByUser(req) {
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
  }
  const transactions = await app.sdb.findAll('BancorExchange', {
    condition, limit, offset, sort,
  })
  return transactions
}

async function getCurrencies(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const result = []
  result.push({ assetName: 'XAS', precision: 8 })
  assets = await app.sdb.findAll('Asset', { limit, offset })
  assets.forEach((element) => {
    result.push(
      {
        assetName: element.name,
        precision: element.precision,
        maxSupply: element.maximum,
      },
    )
  })

  gwCurrencies = await app.sdb.findAll('GatewayCurrency', { limit, offset })
  gwCurrencies.forEach((element) => {
    result.push(
      {
        assetName: element.symbol,
        precision: element.precision,
        maxSupply: element.quantity,
      },
    )
  })
  return result
}

module.exports = (router) => {
  router.get('/', getBancors)
  router.get('/transactions/:address/:owner/:source/:target', getTransactionsByBancor)
  router.get('/transactions/:address', getTransactionsByUser)
  router.get('/currencies', getCurrencies)
}
