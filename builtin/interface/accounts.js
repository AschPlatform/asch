module.exports = function (router) {
  router.get('/:address', async function (req) {
    let condition = {}
    if (req.params.address.length <= 20) {
      condition.name = req.params.address
    } else {
      condition.address = req.params.address
    }

    let account = await app.sdb.findOne('Account', { condition })
    let unconfirmedAccount = null
    if (account) {
      unconfirmedAccount = await app.sdb.get('Account', account.address)
    } else {
      unconfirmedAccount = null
    }

    let lastBlock = modules.blocks.getLastBlock()
    var ret = {
      account: account,
      unconfirmedAccount: unconfirmedAccount,
      latestBlock: {
        height: lastBlock.height,
        timestamp: lastBlock.timestamp
      },
      version: modules.peer.getVersion()
    }
    return ret
  })
}