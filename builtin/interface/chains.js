const promisify = require('util').promisify
const AschCore = require('asch-smartdb').AschCore

module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Chain', {})
    let chains = await app.sdb.findAll('Chain', { limit, offset })
    return { count, chains }
  })

  router.get('/installed', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20

    let installedIds = await promisify(modules.chains.getInstalledIds).call()
    if (installedIds.length === 0) return { count: 0, chains : [] }

    let condition = { tid : { $in : installedIds } }
    let count = await app.sdb.count('Chain',  condition )
    let chains = await app.sdb.findAll('Chain', { condition, limit, offset })
    return { count, chains }
  })

  router.get('/:name', async function (req) {
    let chain = await app.sdb.findOne('Chain', {
      condition: {
        name: req.params.name
      }
    })
    if (!chain) throw new Error('Not found')
    return { chain }
  })
}