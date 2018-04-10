module.exports = {
  table: 'gateway_logs',
  tableFields: [
    { name: 'gateway', type: 'String', length: 10, index: true },
    { name: 'seq', type: 'Number' , index: true },
    { name: 'type', type: 'Number', index: true },
  ]
}