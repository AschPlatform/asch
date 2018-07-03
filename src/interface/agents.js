module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const count = await app.sdb.count('Agent', {})
    let agents = []
    if (count > 0) {
      agents = await app.sdb.findAll('Agent', { limit, offset })
      const nameList = agents.map(a => a.name)
      agents = await app.sdb.findAll('Account', { condition: { name: { $in: nameList } } })
    }
    return { count, agents }
  })
  router.get('/:name/clienteles', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const condition = { agent: req.params.name }
    const count = await app.sdb.count('AgentClientele', condition)
    let clienteles = []
    if (count > 0) {
      clienteles = await app.sdb.findAll('AgentClientele', { condition, limit, offset })
      const addressList = clienteles.map(c => c.clientele)
      const accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addressList } } })
      const accountMap = new Map()
      for (const a of accounts) {
        accountMap.set(a.address, a)
      }
      for (const c of clienteles) {
        c.account = accountMap.get(c.clientele)
      }
    }
    return { count, clienteles }
  })
}
