module.exports = {
  table: 'gateway_withdrawals',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'currency', type: 'String', length: 50, index: true },
    { name: 'amount', type: 'String', length: 50 },
    { name: 'address', type: 'String', length: 50, index: true },
    { name: 'processed', type: 'Number', default: 0 },
    { name: 'oid', type: 'String', length: 64 }
  ]
}