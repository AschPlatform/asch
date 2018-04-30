module.exports = function (router) {
  router.get('/:address', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let condition = { address: req.params.address }
    if (req.query.flag) {
      condition.flag = Number(req.query.flag)
    }
    let count = await app.model.Balance.count(condition)
    let balances = []
    if (count > 0) {
      balances = await app.model.Balance.findAll({ condition, limit, offset })
      let currencyMap = new Map
      for (let b of balances) {
        currencyMap.set(b.currency, 1)
      }
      let assetNameList = Array.from(currencyMap.keys())
      let uiaNameList = assetNameList.filter((n) => n.indexOf('.') !== -1)
      let gaNameList = assetNameList.filter((n) => n.indexOf('.') === -1)

      if (uiaNameList && uiaNameList.length) {
        let assets = await app.model.Asset.findAll({
          condition: {
            name: { $in: uiaNameList }
          }
        })
        for (let a of assets) {
          currencyMap.set(a.name, a)
        }
      }
      if (gaNameList && gaNameList.length) {
        let gatewayAssets = await app.model.GatewayCurrency.findAll({
          condition: {
            symbol: { $in: gaNameList }
          }
        })
        for (let a of gatewayAssets) {
          currencyMap.set(a.symbol, a)
        }
      }

      for (let b of balances) {
        b.asset = currencyMap.get(b.currency)
        // FIXME feerate
        if (b.asset.symbol === 'BTC') {
          b.asset.fee = '10000'
        }
      }
    }
    return { count: count, balances: balances }
  })

  router.get('/:address/:currency', async function (req) {
    let currency = req.params.currency
    let condition = {
      address: req.params.address,
      currency: currency
    }
    let balance = await app.model.Balance.findOne({ condition })
    if (!balance) return 'No balance'
    if (currency.indexOf('.') !== -1) {
      balance.asset = await app.model.Asset.findOne({ condition: { name: balance.currency } })
    } else {
      balance.asset = await app.model.GatewayCurrency.findOne({ condition: { symbol: balance.currency } })
    }
    
    return { balance: balance }
  })
}