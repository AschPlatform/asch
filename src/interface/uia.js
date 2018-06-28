module.exports = (router) => {
  router.get('/issuers', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const count = await app.sdb.count('Issuer')
    let issuers = []
    if (count > 0) {
      issuers = await app.sdb.findAll('Issuer', { limit, offset })
    }
    return { count, issuers }
  })

  router.get('/issuers/:address', async (req) => {
    const issuer = await app.sdb.findOne('Issuer', { condition: { issuerId: req.params.address } })
    if (!issuer) return 'Issuer not found'
    return { issuer }
  })

  router.get('/assets', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const count = await app.sdb.count('Asset')
    let assets = []
    if (count > 0) {
      assets = await app.sdb.findAll('Asset', { limit, offset })
    }
    return { count, assets }
  })

  router.get('/issuers/:address/assets', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const issuerId = req.params.address
    const condition = { issuerId }
    const count = await app.sdb.count('Asset', condition)
    let assets = []
    if (count > 0) {
      assets = await app.sdb.findAll('Asset', { condition, limit, offset })
    }
    return { count, assets }
  })

  router.get('/assets/:name', async (req) => {
    const asset = await app.sdb.findOne('Asset', { condition: { name: req.params.name } })
    if (!asset) return 'Asset not found'
    return { asset }
  })
}
