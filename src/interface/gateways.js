module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const count = await app.sdb.count('Gateway')
    let gateways = []
    if (count > 0) {
      gateways = await app.sdb.findAll('Gateway', { limit, offset })
      for (const gw of gateways) {
        gw.validatorNumber = await app.sdb.count('GatewayMember', { gateway: gw.name, elected: 1 })
      }
    }
    return { count, gateways }
  })
  router.get('/:name/validators', async (req) => {
    const validators = await app.sdb.findAll('GatewayMember', { condition: { gateway: req.params.name } })
    if (validators.length > 0) {
      const addressList = validators.map(v => v.address)
      const accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addressList } } })
      const accountMap = new Map()
      for (const a of accounts) {
        accountMap.set(a.address, a)
      }
      for (const v of validators) {
        v.name = accountMap.get(v.address).name
      }
    }
    return { count: validators.length, validators }
  })
  router.get('/currencies', async () => {
    const currencies = await app.sdb.findAll('GatewayCurrency', {})
    const filtered = []
    for (const c of currencies) {
      const gateway = await app.sdb.findOne('Gateway', { condition: { name: c.gateway } })
      if (gateway && gateway.activated) filtered.push(c)
    }
    return { count: filtered.length, currencies: filtered }
  })

  router.get('/:name/currencies', async (req) => {
    const currencies = await app.sdb.findAll('GatewayCurrency', { condition: { gateway: req.params.name } })
    return { count: currencies.length, currencies }
  })

  router.get('/:name/accounts/:address', async (req) => {
    const condition = {
      gateway: req.params.name,
      address: req.params.address,
    }
    const account = await app.sdb.findOne('GatewayAccount', { condition })
    const gw = await app.sdb.findOne('Gateway', { condition: { name: req.params.name } })
    if (account.version !== gw.version) return 'Account version is not consistent with gateway version'
    if (!account) return 'Gateway account not found'
    return { account }
  })

  router.get('/accounts/:address', async (req) => {
    const condition = {
      address: req.params.address,
    }
    const accounts = await app.sdb.findAll('GatewayAccount', { condition })
    return { count: accounts.length, accounts }
  })

  router.get('/deposits/:address/:currency', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const gc = await app.sdb.findAll('GatewayCurrency', { condition: { symbol: req.params.currency }, limit: 1 })
    if (!gc) return 'Gateway currency not found'
    const ga = await app.sdb.findOne('GatewayAccount', { condition: { gateway: gc[0].gateway, address: req.params.address } })
    if (!ga) return 'Gateway account not found'
    const condition = {
      currency: req.params.currency,
      address: ga.outAddress,
    }
    const count = await app.sdb.count('GatewayDeposit', condition)
    let deposits = []
    if (count > 0) {
      deposits = await app.sdb.findAll('GatewayDeposit', { condition, limit, offset })
      const currencyList = deposits.map(d => d.currency)
      const currencyMap = new Map()
      const gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
        condition: {
          symbol: { $in: currencyList },
        },
      })
      for (const a of gatewayAssets) {
        currencyMap.set(a.symbol, a)
      }
      for (const d of deposits) {
        d.asset = currencyMap.get(d.currency)
      }
    }
    return { count, deposits }
  })

  router.get('/withdrawals/:address/:currency', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const gc = await app.sdb.findAll('GatewayCurrency', { condition: { symbol: req.params.currency }, limit: 1 })
    if (!gc) return 'Gateway currency not found'
    const condition = {
      currency: req.params.currency,
      senderId: req.params.address,
    }
    const count = await app.sdb.count('GatewayWithdrawal', condition)
    let withdrawals = []
    if (count > 0) {
      withdrawals = await app.sdb.findAll('GatewayWithdrawal', { condition, limit, offset })
      const currencyList = withdrawals.map(w => w.currency)
      const currencyMap = new Map()
      const gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
        condition: {
          symbol: { $in: currencyList },
        },
      })
      for (const a of gatewayAssets) {
        currencyMap.set(a.symbol, a)
      }
      for (const w of withdrawals) {
        w.asset = currencyMap.get(w.currency)
      }
    }
    return { count, withdrawals }
  })

  router.get('/allmembers', async (req) => {
    const gatewayName = req.query.name
    const members = await app.util.gateway.getAllGatewayMember(gatewayName)
    return members
  })

  router.get('/bailHosting', async (req) => {
    // let ratio = 0
    let totalBail = 0
    // let bail = 0
    let hosting = 0
    let symbol = ''
    let precision = 0
    const gatewayName = req.query.name
    // bail = await app.util.gateway.getBailTotalAmount(gatewayName)
    const limit = 1
    const gwCurrency = await app.sdb.findAll('GatewayCurrency', { condition: { gateway: gatewayName }, limit })
    hosting = await app.util.gateway.getAmountByCurrency(gatewayName, gwCurrency[0].symbol)
    totalBail = await app.util.gateway.getAllBailAmount(gatewayName)
    // const threshold = await app.util.gateway.getThreshold(gatewayName)
    // ratio = threshold.ratio
    symbol = gwCurrency[0].symbol
    precision = gwCurrency[0].precision
    return {
      // ratio,
      totalBail,
      // bail,
      hosting,
      symbol,
      precision,
    }
  })
}
