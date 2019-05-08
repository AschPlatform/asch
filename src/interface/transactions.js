function defined(obj) {
  return typeof obj !== 'undefined'
}

async function handleTransaction(trs) {
  const netconsumption = await app.sdb.findOne('Netenergyconsumption', { condition: { tid: trs.id } })
  if (netconsumption) {
    if (netconsumption.isFeeDeduct === 1) {
      trs.feeType = 'XAS'
      trs.fee = netconsumption.fee
    } else if (netconsumption.netUsed > 0) {
      trs.feeType = 'NET'
      trs.netUsed = netconsumption.netUsed
    } else if (netconsumption.energyUsed > 0) {
      trs.feeType = 'ENERGY'
      trs.energyUsed = netconsumption.energyUsed
    }
    trs.address = netconsumption.address
  } else {
    trs.feeType = 'XAS'
  }
}

module.exports = (router) => {
  router.get('/', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const sort = {}
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(':')
      sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
    }
    let transactions = []
    const condition = {}
    if (defined(req.query.type)) condition.type = Number(req.query.type)
    if (defined(req.query.height)) condition.height = Number(req.query.height)
    if (defined(req.query.senderId)) condition.senderId = req.query.senderId
    if (defined(req.query.message)) condition.message = req.query.message
    const count = await app.sdb.count('Transaction', condition)
    if (count > 0) {
      transactions = await app.sdb.findAll('Transaction', {
        condition, offset, limit, sort,
      })
    }
    for (const trs of transactions) {
      await handleTransaction(trs)
    }
    return { transactions, count }
  })

  router.get('/:id', async (req) => {
    const trs = await app.sdb.findOne('Transaction', { condition: { id: req.params.id } })
    if (!trs) throw new Error('Transaction no found')
    await handleTransaction(trs)
    return { transaction: trs }
  })
}
