module.exports = (router) => {
  router.get('/:address', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const condition = { address: req.params.address }
    if (req.query.flag) {
      condition.flag = Number(req.query.flag)
    }
    const count = await app.sdb.count('Balance', condition)
    let balances = []
    if (count > 0) {
      balances = await app.sdb.findAll('Balance', { condition, limit, offset })
      const currencyMap = new Map()
      for (const b of balances) {
        currencyMap.set(b.currency, 1)
      }
      const assetNameList = Array.from(currencyMap.keys())
      const uiaNameList = assetNameList.filter(n => n.indexOf('.') !== -1)
      const gaNameList = assetNameList.filter(n => n.indexOf('.') === -1)

      if (uiaNameList && uiaNameList.length) {
        const assets = await app.sdb.findAll('Asset', {
          condition: {
            name: { $in: uiaNameList },
          },
        })
        for (const a of assets) {
          currencyMap.set(a.name, a)
        }
      }
      if (gaNameList && gaNameList.length) {
        const gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
          condition: {
            symbol: { $in: gaNameList },
          },
        })
        for (const a of gatewayAssets) {
          currencyMap.set(a.symbol, a)
        }
      }

      for (const b of balances) {
        b.asset = currencyMap.get(b.currency)
      }
    }
    return { count, balances }
  })

  router.get('/:address/:currency', async (req) => {
    const currency = req.params.currency
    const condition = {
      address: req.params.address,
      currency,
    }
    const balance = await app.sdb.findOne('Balance', { condition })
    if (!balance) return 'No balance'
    if (currency.indexOf('.') !== -1) {
      balance.asset = await app.sdb.findOne('Asset', { condition: { name: balance.currency } })
    } else {
      balance.asset = await app.sdb.findOne('GatewayCurrency', { condition: { symbol: balance.currency } })
    }

    return { balance }
  })
}
