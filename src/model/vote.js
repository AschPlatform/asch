module.exports = {
  table: 'votes',
  tableFields: [
    { name: 'address', type: 'String', length: 50, not_null: true, composite_key: true },
    { name: 'delegate', type: 'String', length: 50, not_null: true, composite_key: true },
  ]
}