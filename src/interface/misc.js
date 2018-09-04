async function getMarketInfo(/* req */) {
  const marketInfo = {
    priceUsdt: '0.4118',
    priceBtc: '0.00006413',
    totalSupply: '114855331',
  }
  return { marketInfo }
}

async function search(req) {
  const id = req.query.query
  if (!id) {
    throw new Error('Search query not provided')
  }
  const t = await app.sdb.findOne('Transaction', { condition: { id } })
  if (t) {
    return {
      searchResults: [
        {
          type: 'transaction',
          data: t,
        },
      ],
    }
  }
  const b = await app.sdb.getBlockById(id)
  if (b) {
    return {
      searchResults: [
        {
          type: 'block',
          data: b,
        },
      ],
    }
  }
  throw new Error('No result')
}

module.exports = (router) => {
  router.get('/marketInfo', getMarketInfo)
  router.get('/search', search)
}
