module.exports = function (router) {
  router.get('/', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Chain', {})
    let chains = await app.sdb.findAll('Chain', { limit: req.limit, offset: req.offset })
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