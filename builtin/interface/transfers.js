async function getAssetMap(assetNames) {
  let assetMap = new Map
  let assetNameList = Array.from(assetNames.keys())
  let uiaNameList = assetNameList.filter((n) => n.indexOf('.') !== -1)
  let gaNameList = assetNameList.filter((n) => n.indexOf('.') === -1)

  if (uiaNameList && uiaNameList.length) {
    let assets = await app.model.Asset.findAll({
      condition: {
        name: { $in: uiaNameList }
      }
    })
    for (let a of assets) {
      assetMap.set(a.name, a)
    }
  }
  if (gaNameList && gaNameList.length) {
    let gatewayAssets = await app.model.GatewayCurrency.findAll({
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

module.exports = function (router) {
  router.get('/', async (req) => {
    let ownerId = req.query.ownerId
    let currency = req.query.currency
    let condition1 = null
    let condition2 = null
    let limit = Number(req.query.limit) || 10
    let offset = Number(req.query.offset) || 0
    if (ownerId && currency) {
      condition1 = [
        { senderId: ownerId },
        { currency: currency }
      ]
      condition2 = [
        { recipientId: ownerId },
        { currency: currency }
      ]
    } else if (ownerId) {
      condition1 = { senderId: ownerId }
      condition2 = { recipientId: ownerId }
    } else if (currency) {
      condition1 = condition2 = { currency: currency }
    } else {
      condition1 = condition2 = null
    }
    let count = 0
    let transfers
    if (condition1 === null || condition1 === condition2) {
      count = await app.model.Transfer.count(condition1)
      transfers = await app.model.Transfer.findAll({
        condition: condition1,
        limit: limit,
        offset: offset,
      })
    } else {
      let count1 = await app.model.Transfer.count(condition1)
      let count2 = await app.model.Transfer.count(condition2)
      let t1 = await app.model.Transfer.findAll({
        condition: condition1,
        limit: limit,
        offset: offset,
        sort: { timestamp: -1 }
      })
      let t2 = await app.model.Transfer.findAll({
        condition: condition2,
        limit: limit,
        offset: offset,
        sort: { timestamp: -1 }
      })
      transfers = t1.concat(t2).sort((l, r) => {
        return r.t_timestamp - l.t_timestamp
      }).slice(0, limit)
      count = count1 + count2
    }
    if (count > 0) {
      let assetNames = new Set
      for (let t of transfers) {
        if (t.currency !== 'XAS') {
          assetNames.add(t.currency)
        }
      }
      let assetMap = await getAssetMap(assetNames)
      for (let t of transfers) {
        if (t.currency !== 'XAS') {
          t.asset = assetMap.get(t.currency)
        }
      }
    }
    return { count, transfers }
  })
}