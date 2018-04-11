module.exports = function (router) {
  router.get('/:address', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let condition = { address: req.params.address }
    let count = await app.model.Balance.count(condition)
    let balances = []
    if (count > 0) {
      balances = await app.model.Balance.findAll({ condition, limit, offset })
      let currencyMap = new Map
      for (let b of balances) {
        currencyMap.set(b.currency, 1)
      }
      let assetNameList = Array.from(currencyMap.keys())
      let assets = await app.model.Asset.findAll({
        condition: {
          name: { $in: Array.from(currencyMap.keys()) }
        }
      })
      for (let a of assets) {
        currencyMap.set(a.name, a)
      }
      for (let b of balances) {
        b.asset = currencyMap.get(b.currency)
      }
    }
    return { count: count, balances: balances }
  })

  router.get('/:address/:currency', async function (req) {
    let condition = {
      address: req.params.address,
      currency: req.params.currency
    }
    let balance = await app.model.Balance.findOne({ condition })
    if (!balance) return 'No balance'
    balance.asset = await app.model.Asset.findOne({ condition: { name: balance.currency } })
    return { balance: balance }
  })
}