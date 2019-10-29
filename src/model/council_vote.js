module.exports = {
  table: 'council_votes',
  tableFields: [
    { name: 'voter', type: 'String', length: 50, not_null: true, composite_key: true },
    { name: 'session', type: 'Number', composite_key: true },
    { name: 'targets', type: 'String', length: 150, not_null: true }
  ]
}
