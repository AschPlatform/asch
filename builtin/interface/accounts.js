module.exports = function (router) {
  router.get('/:address', async function (req) {
    let account = await app.model.Account.findOne({
      condition: {
        address: req.params.address
      }
    })
    if (!account) throw new Error('Accout not found')
    return { account: account }
  })
}