module.exports = function (router) {
  router.get('/:address', async function (req) {
    let address = req.params.address
    let account = await app.model.Account.findOne({
      condition: {
        address: req.params.address
      }
    })

    var ret = {
      account: account,
      unconfirmedAccount: app.sdb.get('Account', {address: address}),
    }
    return ret
  })
}