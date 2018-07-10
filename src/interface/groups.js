async function getGroup(req) {
  const group = await app.sdb.findOne('Group', { condition: { address: req.params.address } })
  let members = []
  if (group) {
    members = await app.sdb.findAll('GroupMember', { condition: { name: group.name } })
    group.members = members
  }
  return { group }
}

module.exports = (router) => {
  router.get('/:address', getGroup)
}
