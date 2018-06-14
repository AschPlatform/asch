module.exports = {
  table: 'group_votes',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'targetId', type: 'String', length: 64, index: true },
    { name: 'voter', type: 'String', length: 50, index: true },
  ]
}
