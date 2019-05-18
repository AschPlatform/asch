const promisify = require('util').promisify

async function getMarketInfo(/* req */) {
  const marketInfo = {
    priceUsdt: global.marketInfo.priceUsdt,
    priceBtc: global.marketInfo.priceBtc,
    totalSupply: modules.blocks.getSupply(),
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
  const offset = query.offset ? Number(query.offset) : 0
  const reverse = query.reverse ? Number(query.reverse) : 0
  const count = await app.sdb.count('BlockIndex', { producerName: name })
  let blockIndex = await app.sdb.findAll('BlockIndex', {
    condition: {
      producerName: name,
    },
    offset,
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

async function getLastForgingBlock(name) {
  const blocks = await app.sdb.findAll('BlockIndex', {
    condition: {
      producerName: name,
    },
    offset: 0,
    limit: 1,
    sort: {
      blockHeight: -1
    },
  })
  if (!blocks || blocks.length === 0) {
    return null
  }
  const height = blocks[0].blockHeight
  const block = await app.sdb.getBlockByHeight(height)
  return block
}

async function getDelegateExtraInfo(d) {
  d.profile = app.sdb.get('DelegateProfile', { name: d.name }) || null
  d.lastForgingBlock = await getLastForgingBlock(d.name)
  const lastForgingTime = d.lastForgingBlock ? d.lastForgingBlock.timestamp : 0
  const currentTime = app.util.slots.getTime()
  const superNodeCount = app.util.slots.delegates
  const interval = app.util.slots.interval
  const twoRoundInterval = superNodeCount * 2 * interval
  d.online = (currentTime - lastForgingTime <= twoRoundInterval) ? 1 : 0

  delete d.vote
  delete d.missedblocks
  delete d.producedblocks
}

async function getDelegatesWithProfile(req) {
  const query = req.query
  const limit = query.limit ? Number(query.limit) : 21
  const offset = query.offset ? Number(query.offset) : 0
  const allDelegatesRanked = await promisify(modules.delegates.getDelegates)({})
  const delegates = allDelegatesRanked.slice(offset, offset + limit)
  for (const d of delegates) {
    await getDelegateExtraInfo(d)
  }
  return { totalCount: allDelegatesRanked.length, delegates }
}

async function getDelegateDetail(req) {
  const name = req.params.name
  const allDelegatesRanked = await promisify(modules.delegates.getDelegates)({})
  const delegate = allDelegatesRanked.find(d => d.name === name)
  if (!delegate) throw new Error('Delegate not found')
  await getDelegateExtraInfo(delegate)
  return { delegate }
}

async function getVotingSummary() {
  const totalSuperNodes = app.util.slots.delegates
  const allDelegates = app.sdb.getAll('Delegate')
  let totalVotes = 0
  for (const d of allDelegates) {
    totalVotes += d.votes
  }
  const votedAccounts = await app.sdb.count('Vote')
  return {
    votingSummary: {
      totalSuperNodes,
      totalDelegates: allDelegates.length,
      totalVotes,
      votedAccounts,
    }
  }
}

module.exports = (router) => {
  router.get('/marketInfo', getMarketInfo)
  router.get('/search', search)
  router.get('/blocksForgedBy', getBlocksForgedBy)
  router.get('/delegatesWithProfile', getDelegatesWithProfile)
  router.get('/delegateDetail/:name', getDelegateDetail)
  router.get('/votingSummary', getVotingSummary)
}
