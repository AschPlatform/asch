module.exports = {
  table: 'councils',
  tableFields: [
    { name: 'name', type: 'String', length: 20, primary_key: true },
    { name: 'desc', type: 'String', length: 4096, not_null: true },
    { name: 'updateInterval', type: 'Number' },
    { name: 'lastUpdateHeight', type: 'BigInt' },
    { name: 'revoked', type: 'Number', default: 0 }
  ]
}