module.exports = async function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Gateway')
    let gateways = []
    if (count > 0) {
      gateways = await app.sdb.findAll('Gateway', { limit, offset })
      for (let gw of gateways) {
        gw.validatorNumber = await app.sdb.count('GatewayMember', { gateway: gw.name, elected: 1 })
      }
    }
    return { count, gateways }
  })
  router.get('/:name/validators', async function (req) {
    let validators = await app.sdb.findAll('GatewayMember', { condition: { gateway: req.params.name } })
    if (validators.length > 0) {
      let addressList = validators.map((v) => v.address)
      let accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addressList } } })
      let accountMap = new Map
      for (let a of accounts) {
        accountMap.set(a.address, a)
      }
      for (let v of validators) {
        v.name = accountMap.get(v.address).name
      }
    }
    return { count: validators.length, validators }
  })
  router.get('/currencies', async function (req) {
    let currencies = await app.sdb.findAll('GatewayCurrency', {})
    let filtered = []
    for (let c of currencies) {
      let gateway = await app.sdb.findOne('Gateway', { condition: { name: c.gateway } })
      if (gateway && gateway.activated) filtered.push(c)
    }
    return { count: filtered.length, currencies: filtered }
  })

  router.get('/:name/currencies', async function (req) {
    let currencies = await app.sdb.findAll('GatewayCurrency', { condition: { gateway: req.params.name } })
    return { count: currencies.length, currencies }
  })

  router.get('/:name/accounts/:address', async function (req) {
    let condition = {
      gateway: req.params.name,
      address: req.params.address
    }
    let account = await app.sdb.findOne('GatewayAccount', { condition })
    if (!account) return 'Gateway account not found'
    return { account: account }
  })

  router.get('/accounts/:address', async function (req) {
    let condition = {
      address: req.params.address
    }
    let accounts = await app.sdb.findAll('GatewayAccount', { condition })
    return { count: accounts.length, accounts }
  })

  router.get('/deposits/:address/:currency', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let gc = await app.sdb.findOne('GatewayCurrency', { condition: { symbol: req.params.currency } })
    if (!gc) return 'Gateway currency not found'
    let ga = await app.sdb.findOne('GatewayAccount', { condition: { gateway: gc.gateway, address: req.params.address } })
    if (!ga) return 'Gateway account not found'
    let condition = {
      currency: req.params.currency,
      address: ga.outAddress
    }
    let count = await app.sdb.count('GatewayDeposit', condition)
    let deposits = []
    if (count > 0) {
      deposits = await app.sdb.findAll('GatewayDeposit', { condition, limit, offset })
      let currencyList = deposits.map((d) => d.currency)
      let currencyMap = new Map()
      let gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
        condition: {
          symbol: { $in: currencyList }
        }
      })
      for (let a of gatewayAssets) {
        currencyMap.set(a.symbol, a)
      }
      for (let d of deposits) {
        d.asset = currencyMap.get(d.currency)
      }
    }
    return { count, deposits }
  })

  router.get('/withdrawals/:address/:currency', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let gc = await app.sdb.findOne('GatewayCurrency', { condition: { symbol: req.params.currency } })
    if (!gc) return 'Gateway currency not found'
    let condition = {
      currency: req.params.currency,
      senderId: req.params.address
    }
    let count = await app.sdb.count('GatewayWithdrawal', condition)
    let withdrawals = []
    if (count > 0) {
      withdrawals = await app.sdb.findAll('GatewayWithdrawal', { condition, limit, offset })
      let currencyList = withdrawals.map((w) => w.currency)
      let currencyMap = new Map()
      let gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
        condition: {
          symbol: { $in: currencyList }
        }
      })
      for (let a of gatewayAssets) {
        currencyMap.set(a.symbol, a)
      }
      for (let w of withdrawals) {
        w.asset = currencyMap.get(w.currency)
      }
    }
    return { count, withdrawals }
  })
}