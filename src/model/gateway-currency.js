module.exports = {
  table: 'gateway_currencys',
  tableFields: [
    { name: 'gateway', type: 'String', length: 20, composite_key: true, index: true },
    { name: 'symbol', type: 'String', length: 10, composite_key: true },
    { name: 'desc', type: 'Text' },
    { name: 'precision', type: 'Number' },
    { name: 'revoked', type: 'Number' }
  ]
}
