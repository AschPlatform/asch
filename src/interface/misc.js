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

async function getBlocksForgedBy(req) {
  const { name } = req.query
  if (!name) throw new Error('Name not provided')
  return {
    count: 89,
    blocks: [{
      version: 0,
      payloadHash: '275d2b8f2c9cae345d535e76a0922d5ccca6668ab8d007135f0aa8a780b52896',
      timestamp: 0,
      delegate: 'dcb28a3789c748b62aac1dfff81178d203aabdfd0516c547d5ce6c986d26b4fa',
      height: 0,
      count: 203,
      fees: 0,
      reward: 0,
      signature: '67254c9b69224e8d2269ca28af5e434fbfee47e6fd4b819e9c053b00af04da3664e17ec337a9b60fc5fc91f66b93743cd926d79c00fa367e55136cfb2933b007',
      id: '148da01c074085898c36c8fc65f78379741f2d7a9f60692a989a1c154d65f5e3',
    }],
  }
}

module.exports = (router) => {
  router.get('/marketInfo', getMarketInfo)
  router.get('/search', search)
  router.get('/blocksForgedBy', getBlocksForgedBy)
}
