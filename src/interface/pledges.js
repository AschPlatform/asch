async function getPledges(req) {
  let pledge
  if (req.query.address) {
    pledge = await app.util.pledges.getNetEnergyLimit(req.query.address)
  } else {
    pledge = await app.util.pledges.getPledgeConfig()
  }
  return pledge
}

module.exports = (router) => {
  router.get('/', getPledges)
}
