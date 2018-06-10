module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Agent', {})
    let agents = []
    if (count > 0) {
      agents = await app.sdb.findAll('Agent', { limit, offset })
      let nameList = agents.map((a) => a.name)
      agents = await app.sdb.findAll('Account', { condition: { name: { $in: nameList } } })
    }
    return { count: count, agents: agents }
  })
  router.get('/:name/clienteles', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let condition = { agent: req.params.name }
    let count = await app.sdb.count('AgentClientele', condition)
    let clienteles = []
    if (count > 0) {
      clienteles = await app.sdb.findAll('AgentClientele', { condition, limit, offset })
      let addressList = clienteles.map((c) => c.clientele)
      let accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addressList } } })
      let accountMap = new Map
      for (let a of accounts) {
        accountMap.set(a.address, a)
      }
      for (let c of clienteles) {
        c.account = accountMap.get(c.clientele)
      }
    }
    return { count: count, clienteles: clienteles }
  })
}