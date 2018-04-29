module.exports = function (router) {
  router.get('/:address', async function (req) {
    let condition = {}
    if (req.params.address.length <= 20) {
      condition.name = req.params.address
    } else {
      condition.address = req.params.address
    }

    let account = await app.model.Account.findOne({ condition })

    let lastBlock = modules.blocks.getLastBlock()
    var ret = {
      account: account,
      unconfirmedAccount: app.sdb.get('Account', { address: account.address }),
      latestBlock: {
        height: lastBlock.height,
        timestamp: lastBlock.timestamp
      },
      version: modules.peer.getVersion()
    }
    return ret
  })
}