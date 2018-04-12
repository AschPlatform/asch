module.exports = async function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.model.Gateway.count()
    let gateways = []
    if (count > 0) {
      gateways = await app.model.Gateway.findAll({ limit, offset })
    }
    return { count, gateways }
  })
  router.get('/:name/validators', async function (req) {
    let validators = await app.model.GatewayMember.findAll({ condition: { gateway: req.params.name } })
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
      currency: currency,
      address: ga.outAddress
    }
    let count = await app.model.GatewayDeosit.count({ condition })
    let deposits = []
    if (count > 0) {
      deposits = await app.model.GatewayDeposit.findAll({ condition, limit, offset })
    }
    return { count, deposits }
  })

  router.get('/withdrawals/:address/:currency', async function (req) {
    return {
      count: 1,
      withdrawals: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          processed: 1,
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })
}