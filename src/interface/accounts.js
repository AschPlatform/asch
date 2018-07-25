module.exports = (router) => {
  router.get('/:address', async (req) => {
    const condition = {}
    if (req.params.address.length <= 20) {
      condition.name = req.params.address
    } else {
      condition.address = req.params.address
    }

    const account = await app.sdb.findOne('Account', { condition })
    let unconfirmedAccount = null
    if (account) {
      unconfirmedAccount = await app.sdb.load('Account', account.address)
    } else {
      unconfirmedAccount = null
    }

    const lastBlock = modules.blocks.getLastBlock()
    const ret = {
      account,
      unconfirmedAccount,
      latestBlock: {
        height: lastBlock.height,
        timestamp: lastBlock.timestamp,
      },
      version: modules.peer.getVersion(),
    }
    return ret
  })
}
