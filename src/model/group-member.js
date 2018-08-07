module.exports = {
  table: 'group_members',
  tableFields: [
    { name: 'member', type: 'String', length: 50, composite_key: true, index: true },
    { name: 'name', type: 'String', length: 20, composite_key: true, index: true },
    { name: 'weight', type: 'Number', default: 1 },
  ]
}
