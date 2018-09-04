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
  const query = req.query
  const name = query.name
  if (!name) throw new Error('Name not provided')
  const limit = query.limit ? Number(query.limit) : 20
  const reverse = query.reverse ? Number(query.reverse) : 0
  const count = await app.sdb.count('BlockIndex', { producerName: name })
  let blockIndex = await app.sdb.findAll('BlockIndex', {
    condition: {
      producerName: name,
    },
    limit,
    sort: {
      blockHeight: reverse ? -1 : 1,
    },
  })
  if (!blockIndex) {
    blockIndex = []
  }
  const blocks = []
  for (const index of blockIndex) {
    const block = await app.sdb.getBlockByHeight(index.blockHeight)
    blocks.push(block)
  }
  return { count, blocks }
}

module.exports = (router) => {
  router.get('/marketInfo', getMarketInfo)
  router.get('/search', search)
  router.get('/blocksForgedBy', getBlocksForgedBy)
}
