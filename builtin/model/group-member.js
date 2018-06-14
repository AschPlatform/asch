module.exports = {
  table: 'group_members',
  tableFields: [
    { name: 'member', type: 'String', length: 50, primary_key: true },
    { name: 'name', type: 'String', length: 20, index: true },
    { name: 'weight', type: 'Number', default: 1 },
  ]
}
