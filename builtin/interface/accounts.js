module.exports = function (router) {
  router.get('/:address', async function (req) {
    let address = req.params.address
    let account = await app.model.Account.findOne({
      condition: {
        address: req.params.address
      }
    })
    if (!account) throw new Error('Accout not found')

    let latestBlock = modules.blocks.getLastBlock();
    var ret = {
      account: account,
      unconfirmedAccount: app.sdb.get('Account', {address: address}),
      latestBlock: {
        height: latestBlock.height,
        timestamp: latestBlock.timestamp
      },
      version: modules.peer.getVersion()
    }
    return ret
  })
}