async function getAssetMap(assetNames) {
  let assetMap = new Map
  let assetNameList = Array.from(assetNames.keys())
  let uiaNameList = assetNameList.filter((n) => n.indexOf('.') !== -1)
  let gaNameList = assetNameList.filter((n) => n.indexOf('.') === -1)

  if (uiaNameList && uiaNameList.length) {
    let assets = await app.sdb.findAll('Asset', {
      condition: {
        name: { $in: uiaNameList }
      }
    })
    for (let a of assets) {
      assetMap.set(a.name, a)
    }
  }
  if (gaNameList && gaNameList.length) {
    let gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
      condition: {
        symbol: { $in: gaNameList }
      }
    })
    for (let a of gatewayAssets) {
      assetMap.set(a.symbol, a)
    }
  }
  return assetMap
}

async function getTransactionMap(tids) {
  let trsMap = new Map
  let trs = await app.sdb.findAll('Transaction', {
    condition: {
      id: { $in: tids }
    }
  })
  for (let t of trs) {
    trsMap.set(t.id, t)
  }
  return trsMap
}

module.exports = function (router) {
  router.get('/', async (req) => {
    let ownerId = req.query.ownerId
    let currency = req.query.currency
    let condition = {}
    let limit = Number(req.query.limit) || 10
    let offset = Number(req.query.offset) || 0
    if (ownerId) {
      condition.$or = {
        senderId: ownerId,
        recipientId: ownerId
      }
    }
    if (currency) {
      condition.currency = currency
    }
    if (req.query.senderId) {
      condition.senderId = req.query.senderId
    }
    if (req.query.recipientId) {
      condition.recipientId = req.query.recipientId
    }
    let count = await app.sdb.count('Transfer', condition)
    let transfers = []
    if (count > 0) {
      transfers = await app.sdb.findAll('Transfer', {
        condition: condition,
        limit: limit,
        offset: offset,
        sort: { timestamp: -1 }
      })
      let assetNames = new Set
      for (let t of transfers) {
        if (t.currency !== 'XAS') {
          assetNames.add(t.currency)
        }
      }
      let assetMap = await getAssetMap(assetNames)
      let tids = transfers.map((t) => t.tid)
      let trsMap = await getTransactionMap(tids)
      for (let t of transfers) {
        if (t.currency !== 'XAS') {
          t.asset = assetMap.get(t.currency)
        }
        t.transaction = trsMap.get(t.tid)
      }
    }
    return { count, transfers }
  })
}