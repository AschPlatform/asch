module.exports = {
  table: 'gateway_logs',
  local: true,
  memory: true,
  tableFields: [
    { name: 'gateway', type: 'String', length: 20, composite_key: true, index: true },
    { name: 'type', type: 'Number', composite_key: true },
    { name: 'seq', type: 'Number', index: true }
  ]
}
