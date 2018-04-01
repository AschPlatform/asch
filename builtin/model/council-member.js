module.exports = {
  table: 'council_members',
  tableFields: [
    { name: 'concil', type: 'String', length: 20, primary_key: true },
    { name: 'member', type: 'String', length: 50 }
  ]
}