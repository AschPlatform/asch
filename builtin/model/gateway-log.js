module.exports = {
  table: 'gateway_logs',
  tableFields: [
    { name: 'gateway', type: 'String', length: 10, primary_key: true, index: true },
    { name: 'type', type: 'Number', primary_key: true },
    { name: 'seq', type: 'Number', index: true }
  ]
}