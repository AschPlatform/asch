const promisify = require('util').promisify

module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const count = await app.sdb.count('Chain', {})
    const chains = await app.sdb.findAll('Chain', { limit, offset })
    return { count, chains }
  })

  router.get('/installed', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const installedIds = await promisify(modules.chains.getInstalledIds).call()
    if (installedIds.length === 0) return { count: 0, chains: [] }

    const condition = { name: { $in: installedIds } }
    const count = await app.sdb.count('Chain', condition)
    const chains = await app.sdb.findAll('Chain', { condition, limit, offset })
    return { count, chains }
  })

  router.get('/:name', async (req) => {
    const chain = await app.sdb.findOne('Chain', {
      condition: {
        name: req.params.name,
      },
    })
    if (!chain) throw new Error('Not found')
    return { chain }
  })
}
