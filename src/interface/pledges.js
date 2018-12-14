async function getPledges(req) {
  const userPledge = await app.util.pledges.getNetEnergyLimit(req.qurey.address)
  return userPledge
}

module.exports = (router) => {
  router.get('/', getPledges)
}
