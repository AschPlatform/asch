module.exports = async function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.model.Gateway.count()
    let gateways = []
    if (count > 0) {
      gateways = await app.model.Gateway.findAll({ limit, offset })
      for (let gw of gateways) {
        gw.validatorNumber = await app.model.GatewayMember.count({ gateway: gw.name, elected: 1 })
      }
    }
    return { count, gateways }
  })
  router.get('/:name/validators', async function (req) {
    let validators = await app.model.GatewayMember.findAll({ condition: { gateway: req.params.name } })
    if (validators.length > 0) {
      let addressList = validators.map((v) => v.address)
      let accounts = await app.model.Account.findAll({ condition: { address: { $in: addressList } } })
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
    let currencies = await app.model.GatewayCurrency.findAll({})
    return { count: currencies.length, currencies }
  })

  router.get('/:name/currencies', async function (req) {
    let currencies = await app.model.GatewayCurrency.findAll({ condition: { gateway: req.params.name } })
    return { count: currencies.length, currencies }
  })

  router.get('/:name/accounts/:address', async function (req) {
    let condition = {
      gateway: req.params.name,
      address: req.params.address
    }
    let account = await app.model.GatewayAccount.findOne({ condition })
    if (!account) return 'Gateway account not found'
    return { account: account }
  })

  router.get('/accounts/:address', async function (req) {
    let condition = {
      address: req.params.address
    }
    let accounts = await app.model.GatewayAccount.findAll({ condition })
    return { count: accounts.length, accounts }
  })

  router.get('/deposits/:address/:currency', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let gc = await app.model.GatewayCurrency.findOne({ condition: { symbol: req.params.currency } })
    if (!gc) return 'Gateway currency not found'
    let ga = await app.model.GatewayAccount.findOne({ condition: { gateway: gc.gateway, address: req.params.address } })
    if (!ga) return 'Gateway account not found'
    let condition = {
      currency: req.params.currency,
      address: ga.outAddress
    }
    let count = await app.model.GatewayDeposit.count(condition)
    let deposits = []
    if (count > 0) {
      deposits = await app.model.GatewayDeposit.findAll({ condition, limit, offset })
    }
    return { count, deposits }
  })

  router.get('/withdrawals/:address/:currency', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let gc = await app.model.GatewayCurrency.findOne({ condition: { symbol: req.params.currency } })
    if (!gc) return 'Gateway currency not found'
    let condition = {
      currency: req.params.currency,
      senderId: req.params.address
    }
    let count = await app.model.GatewayWithdrawal.count(condition)
    let withdrawals = []
    if (count > 0) {
      withdrawals = await app.model.GatewayWithdrawal.findAll({ condition, limit, offset })
    }
    return { count, withdrawals }
  })
}