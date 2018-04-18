module.exports = function (router) {
  router.get('/:address', async function (req) {
    let address = req.params.address
    let account = await app.model.Account.findOne({
      condition: {
        address: req.params.address
      }
    })

    let lastBlock = modules.blocks.getLastBlock()
    var ret = {
      account: account,
      unconfirmedAccount: app.sdb.get('Account', {address: address}),
      latestBlock: {
        height: lastBlock.height,
        timestamp: lastBlock.timestamp
      },
      version: modules.peer.getVersion()
    }
    return ret
  })
}