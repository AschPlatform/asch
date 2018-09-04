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
  router.get('/', async (req) => {
    const query = req.query
    const offset = query.offset ? Number(query.offset) : 0
    const limit = query.limit ? Number(query.limit) : 20
    let minHeight
    let maxHeight
    let needReverse = false
    if (query.orderBy === 'height:desc') {
      needReverse = true
      maxHeight = modules.blocks.getLastBlock().height - offset
      minHeight = (maxHeight - limit) + 1
    } else {
      minHeight = offset
      maxHeight = (offset + limit) - 1
    }
    if (minHeight < 0) minHeight = 0
    if (maxHeight < 0) maxHeight = 0
    const withTransactions = !!query.transactions
    let blocks = await modules.blocks.getBlocks(minHeight, maxHeight, withTransactions)
    const _ = app.util.lodash
    if (needReverse) {
      blocks = _.reverse(blocks)
    }
    const count = app.sdb.blocksCount
    return { count, blocks }
  })

  router.get('/:idOrHeight', async (req) => {
    const idOrHeight = req.params.idOrHeight
    let block
    if (idOrHeight.length === 64) {
      const id = idOrHeight
      block = await app.sdb.getBlockById(id)
    } else {
      const height = Number(idOrHeight)
      if (Number.isInteger(height) && height >= 0) {
        block = await app.sdb.getBlockByHeight(height)
      }
    }
    if (!block) throw new Error('Block not found')
    if (req.query.transactions) {
      const transactions = await app.sdb.findAll('Transaction', {
        condition: {
          height: block.height,
        },
      })
      block.transactions = transactions
    }
    return { block }
  })

  router.get('/forgedBy', getBlocksForgedBy)
}
