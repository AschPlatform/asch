async function getBancors(req) {
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const bancors = await app.sdb.findAll('Bancor', { limit, offset })
  return { bancors }
}

module.exports = (router) => {
  router.get('/', getBancors)
}
