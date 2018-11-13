async function getMarkets(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  let sort = {}
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy.split(':')
    sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
  } else {
    sort = { timestamp: -1 }
  }
  let bancors = await app.sdb.findAll('Bancor', { limit, offset, sort })
  for (let i = 0; i < bancors.length; i++) {
    const bancor = await app.util.bancor
      .create(bancors[i].money, bancors[i].stock, bancors[i].owner)
    const result = await bancor.exchangeBySource(bancors[i].money, bancors[i].stock, 1000, false)
    bancors[i].latestBid = result.targetAmount.div(10 ** Number(bancors[i].stockPrecision))
      .div(1000).times(10 ** Number(bancors[i].moneyPrecision)).toString()
  }
  const currency = req.query.currency
  if (currency) {
    bancors = bancors.filter((bancor) => {
      if (bancor.money === currency) {
        return true
      }
      return false
    })
    return { bancors }
  }
  return { bancors }
}

async function getTradesByMarket(req) {
  const bancors = await app.sdb.findAll('Bancor', { condition: { id: Number(req.params.id) }, limit: 1 })
  if (bancors.length === 0) return null
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  let sort = {}
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy.split(':')
    sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
  } else {
    sort = { timestamp: -1 }
  }
  let condition1
  let condition2
  if (req.query.address) {
    condition1 = {
      address: req.query.address,
      owner: bancors[0].owner,
      source: bancors[0].stock,
      target: bancors[0].money,
    }
    condition2 = {
      address: req.query.address,
      owner: bancors[0].owner,
      source: bancors[0].money,
      target: bancors[0].stock,
    }
  } else {
    condition1 = {
      owner: bancors[0].owner,
      source: bancors[0].stock,
      target: bancors[0].money,
    }
    condition2 = {
      owner: bancors[0].owner,
      source: bancors[0].money,
      target: bancors[0].stock,
    }
  }
  const trades = await app.sdb.findAll('BancorExchange', {
    condition: { $or: [condition1, condition2] }, limit, offset, sort,
  })
  const count1 = await app.sdb.count('BancorExchange', condition1)
  const count2 = await app.sdb.count('BancorExchange', condition2)
  const count = count1 + count2
  return { trades, count }
}

async function getTradesByUser(req) {
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
    address: req.query.address,
  }
  const trades = await app.sdb.findAll('BancorExchange', {
    condition, limit, offset, sort,
  })

  const count = await app.sdb.count('BancorExchange', condition)
  return { trades, count }
}

async function getCurrencies(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const result = []
  result.push({ assetName: 'XAS', precision: 8 })
  assets = await app.sdb.findAll('Asset', { limit, offset })
  assets.forEach((element) => {
    result.push({
      assetName: element.name,
      precision: element.precision,
      maxSupply: element.maximum,
    })
  })

  gwCurrencies = await app.sdb.findAll('GatewayCurrency', { limit, offset })
  gwCurrencies.forEach((element) => {
    result.push({
      assetName: element.symbol,
      precision: element.precision,
      maxSupply: element.quantity,
    })
  })
  return result
}

async function getBCHAmount(req) {
  const bancor = await app.util.bancor.create('BCH', 'XAS')
  if (!bancor) return 'Bancor is not ready'
  const result = await bancor.exchangeBySource('XAS', 'BCH', req.query.amount, false)
  return result.targetAmount.toString()
}

module.exports = (router) => {
  router.get('/', getMarkets)
  router.get('/trades/:id', getTradesByMarket)
  router.get('/trades', getTradesByUser)
  router.get('/currencies', getCurrencies)
  router.get('/fee', getBCHAmount)
}
