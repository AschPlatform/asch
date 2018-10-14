async function getMarkets(req) {
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
  // await Promise.all(bancors.map(async (bancor) => {
  //   const sort = { timestamp: -1 }
  //   const condition1 = {
  //     owner: bancor.owner,
  //     source: bancor.money,
  //     target: bancor.stock,
  //   }
  //   const condition2 = {
  //     owner: bancor.owner,
  //     source: bancor.stock,
  //     target: bancor.money,
  //   }
  //   const record1 = await app.sdb.findAll('BancorExchange', { condition1, sort, limit: 1 })
  //   const record2 = await app.sdb.findAll('BancorExchange', { condition2, sort, limit: 1 })
  //   let record
  //   if (record1.length > 0 && record2.length > 0) {
  //     if (record1[0].timestamp > record2[0].timestamp) {
  //       record = record1[0]
  //     } else {
  //       record = record2[0]
  //     }
  //   } else if (record1.length > 0) {
  //     record = record1[0]
  //   } else if (record2.length > 0) {
  //     record = record2[0]
  //   }
  //   if (record) {
  //     bancor.latestBid = record.ratio
  //   } else {
  //     bancor.latestBid = 0
  //   }
  // }))
  for (let i = 0; i < bancors.length; i++) {
    const sort = { timestamp: -1 }
    const condition1 = {
      owner: bancors[i].owner,
      source: bancors[i].money,
      target: bancors[i].stock,
    }
    const condition2 = {
      owner: bancors[i].owner,
      source: bancors[i].stock,
      target: bancors[i].money,
    }
    const record1 = await app.sdb.findAll('BancorExchange', { condition1, sort, limit: 1 })
    const record2 = await app.sdb.findAll('BancorExchange', { condition2, sort, limit: 1 })
    let record
    if (record1.length > 0 && record2.length > 0) {
      if (record1[0].timestamp > record2[0].timestamp) {
        record = record1[0]
      } else {
        record = record2[0]
      }
    } else if (record1.length > 0) {
      record = record1[0]
    } else if (record2.length > 0) {
      record = record2[0]
    }
    if (record) {
      bancors[i].latestBid = record.price
    } else {
      bancors[i].latestBid = 0
    }
  }

  return { bancors }
}

async function getTradesByMarket(req) {
  const bancors = await app.sdb.findAll('Bancor', { condition: { id: req.params.id }, limit: 1 })
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

  const trades1 = await app.sdb.findAll('BancorExchange', {
    condition1, limit, offset, sort,
  })
  const trades2 = await app.sdb.findAll('BancorExchange', {
    condition2, limit, offset, sort,
  })
  const trades = trades1.concat(trades2)
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
  router.get('/', getMarkets)
  router.get('/trades/:id', getTradesByMarket)
  router.get('/trades', getTradesByUser)
  router.get('/currencies', getCurrencies)
}
