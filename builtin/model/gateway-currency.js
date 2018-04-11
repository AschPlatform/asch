module.exports = {
  table: 'gateway_currencys',
  tableFields: [
    { name: 'gateway', type: 'String', length: 10, index: true },
    { name: 'symbol', type: 'String', length: 10, index: true },
    { name: 'desc', type: 'Text' },
    { name: 'precision', type: 'Number' },
    { name: 'revoked', type: 'Number' }
  ]
}