async function getAssetMap(assetNames) {
  const assetMap = new Map()
  const assetNameList = Array.from(assetNames.keys())
  const uiaNameList = assetNameList.filter(n => n.indexOf('.') !== -1)
  const gaNameList = assetNameList.filter(n => n.indexOf('.') === -1)

  if (uiaNameList && uiaNameList.length) {
    const assets = await app.sdb.findAll('Asset', {
      condition: {
        name: { $in: uiaNameList },
      },
    })
    for (const a of assets) {
      assetMap.set(a.name, a)
    }
  }
  if (gaNameList && gaNameList.length) {
    const gatewayAssets = await app.sdb.findAll('GatewayCurrency', {
      condition: {
        symbol: { $in: gaNameList },
      },
    })
    for (const a of gatewayAssets) {
      assetMap.set(a.symbol, a)
    }
  }
  return assetMap
}

async function getTransactionMap(tids) {
  const trsMap = new Map()
  const trs = await app.sdb.findAll('Transaction', {
    condition: {
      id: { $in: tids },
    },
  })
  for (const t of trs) {
    trsMap.set(t.id, t)
  }
  return trsMap
}

module.exports = (router) => {
  router.get('/', async (req) => {
    const ownerId = req.query.ownerId
    const currency = req.query.currency
    const condition = {}
    const limit = Number(req.query.limit) || 10
    const offset = Number(req.query.offset) || 0
    if (ownerId) {
      condition.$or = {
        senderId: ownerId,
        recipientId: ownerId,
      }
    }
    if (currency) {
      condition.currency = currency
    }
    if (req.query.senderId) {
      condition.senderId = req.query.senderId
    }
    if (req.query.recipientId) {
      condition.recipientId = req.query.recipientId
    }
    const count = await app.sdb.count('Transfer', condition)
    let transfers = []
    if (count > 0) {
      transfers = await app.sdb.findAll('Transfer', {
        condition,
        limit,
        offset,
        sort: { timestamp: -1 },
      })
      const assetNames = new Set()
      for (const t of transfers) {
        if (t.currency !== 'XAS') {
          assetNames.add(t.currency)
        }
      }
      const assetMap = await getAssetMap(assetNames)
      const tids = transfers.map(t => t.tid)
      const trsMap = await getTransactionMap(tids)
      for (const t of transfers) {
        if (t.currency !== 'XAS') {
          t.asset = assetMap.get(t.currency)
        }
        t.transaction = trsMap.get(t.tid)
      }
    }
    for (const t of transfers) {
      if (t.amount) {
        const pos = t.amount.indexOf('.')
        if (pos !== -1) {
          t.amount = t.amount.slice(0, pos)
        }
      }
      const netconsumption = await app.sdb.findOne('Netenergyconsumption', { condition: { tid: t.tid } })
      if (netconsumption) {
        if (netconsumption.isFeeDeduct === 1) {
          t.feeType = 'XAS'
          t.fee = netconsumption.fee
        } else if (netconsumption.netUsed > 0) {
          t.feeType = 'NET'
          t.netUsed = netconsumption.netUsed
        } else if (netconsumption.energyUsed > 0) {
          t.feeType = 'ENERGY'
          t.energyUsed = netconsumption.energyUsed
        }
      } else {
        t.feeType = 'XAS'
      }
    }
    return { count, transfers }
  })
}
