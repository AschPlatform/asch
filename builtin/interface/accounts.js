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
      if (unconfirmedAccount) {
        unconfirmedAccount = {
          address: unconfirmedAccount.address,
          name: unconfirmedAccount.name,
          xas: unconfirmedAccount.xas,
          publicKey: unconfirmedAccount.publicKey,
          secondPublicKey: unconfirmedAccount.secondPublicKey,
          isLocked: unconfirmedAccount.isLocked,
          isAgent: unconfirmedAccount.isAgent,
          isDelegate: unconfirmedAccount.isDelegate,
          role: unconfirmedAccount.role,
          lockHeight: unconfirmedAccount.lockHeight,
          agent: unconfirmedAccount.agent,
          weight: unconfirmedAccount.weight,
          agentWeight: unconfirmedAccount.agentWeight
        }
      }
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