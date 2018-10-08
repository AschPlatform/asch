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
    const gc = await app.sdb.findOne('GatewayCurrency', { condition: { symbol: req.params.currency } })
    if (!gc) return 'Gateway currency not found'
    const ga = await app.sdb.findOne('GatewayAccount', { condition: { gateway: gc.gateway, address: req.params.address } })
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
    const gc = await app.sdb.findOne('GatewayCurrency', { condition: { symbol: req.params.currency } })
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

  router.get('/threshold', async (req) => {
    const gatewayName = req.params.name
    const memberAddr = req.params.address
    // return value is { ratio, needSupply }
    const result = await app.util.gateway.getThreshold(gatewayName, memberAddr)
    return result
  })

  router.get('/maximumBailWithdrawl', async (req) => {
    const gatewayName = req.params.name
    const memberAddr = req.params.address
    const result = await app.util.gateway.getMaximumBailWithdrawl(gatewayName, memberAddr)
    return result
  })

  router.get('/allmembers', async (req) => {
    const gatewayName = req.params.name
    const members = await app.util.gateway.getAllGatewayMember(gatewayName)
    return members
  })

  router.get('/bailHosting', async (req) => {
    const gatewayName = req.params.name
    const bail = await app.util.gateway.getBailTotalAmount(gatewayName)
    const gwCurrency = await app.sdb.findOne('GatewayCurrency', { condition: { gateway: gatewayName } })
    const hosting = await app.util.gateway.getAmountByCurrency(gwCurrency.symbol)
    return { bail, hosting }
  })

  router.get('/realClaim', async (req) => {
    let realClaim = 0
    let lockedBail = 0
    const gatewayName = req.params.name
    const address = req.params.address
    const gateway = await app.sdb.load('Gateway', gatewayName)
    if (!gateway) return 'Gateway not found'
    if (gateway.revoked === 1) return 'No claim proposal was activated'
    const gwCurrency = await app.sdb.findOne('GatewayCurrency', { condition: { gateway: gatewayName } })
    const members = await app.util.gateway.getElectedGatewayMember(gatewayName)
    const userAmount = app.balances.get(address, gwCurrency.symbol)
    const totalAmount = gwCurrency.quantity
    const ratio = userAmount / totalAmount
    if (gateway.revoked === 2) {
      for (let i = 0; i < members.length; i++) {
        const lockedAddr = app.util.address.generateLockedAddress(members[i].address)
        const memberLockedAccount = await app.sdb.load('Account', lockedAddr)
        const needClaim = Math.floor(ratio * memberLockedAccount.xas)
        if (needClaim === 0) continue
        realClaim += needClaim
        lockedBail += memberLockedAccount.xas
      }
    }
    return {
      realClaim,
      lockedBail,
      userAmount,
      totalAmount,
    }
  })

  router.get('/bailStatus', async (req) => {
    const gatewayName = req.params.name
    const address = req.params.address
    const withdrawl = await app.util.gateway.getMaximumBailWithdrawl(gatewayName, address)
    const threshold = await app.util.gateway.getThreshold(gatewayName, address)
    const ratio = threshold.ratio
    const currentBail = threshold.currentBail
    const needSupply = threshold.needSupply
    return {
      ratio,
      currentBail,
      needSupply,
      withdrawl,
    }
  })
}
