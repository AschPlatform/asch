module.exports = function (router) {
  router.get('/issuers', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Issuer')
    let issuers = []
    if (count > 0) {
      issuers = await app.sdb.findAll('Issuer', { limit, offset })
    }
    return { count: count, issuers: issuers }
  })

  router.get('/issuers/:address', async function (req) {
    let issuer = await app.sdb.findOne('Issuer', { condition: { issuerId: req.params.address } })
    if (!issuer) return 'Issuer not found'
    return { issuer: issuer }
  })

  router.get('/assets', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let count = await app.sdb.count('Asset')
    let assets = []
    if (count > 0) {
      assets = await app.sdb.findAll('Asset', { limit, offset })
    }
    return { count: count, assets: assets }
  })

  router.get('/issuers/:address/assets', async function (req) {
    let offset = req.query.offset ? Number(req.query.offset) : 0
    let limit = req.query.limit ? Number(req.query.limit) : 20
    let issuerId = req.params.address
    let condition = { issuerId: issuerId }
    let count = await app.sdb.count('Asset', condition)
    let assets = []
    if (count > 0) {
      assets = await app.sdb.findAll('Asset', { condition, limit, offset })
    }
    return { count: count, assets: assets }
  })

  router.get('/assets/:name', async function (req) {
    let asset = await app.sdb.findOne('Asset', { condition: { name: req.params.name } })
    if (!asset) return 'Asset not found'
    return { asset: asset }
  })
}