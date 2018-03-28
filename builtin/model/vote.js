module.exports = {
  table: 'votes',
  tableFields: [
    { name: 'address', type: 'String', length: 50, not_null: true, index: true },
    { name: 'delegate', type: 'String', length: 50, not_null: true, index: true },
  ]
}