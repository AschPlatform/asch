module.exports = {
  table: 'gateway_deposits',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true },
    { name: 'currency', type: 'String', length: 10, index: true },
    { name: 'gateway', type: 'String', length: 20, index: true },
    { name: 'address', type: 'String', length: 50, index: true },
    { name: 'amount', type: 'String', length: 50 },
    { name: 'confirmations', type: 'Number' },
    { name: 'processed', type: 'Number' },
    { name: 'oid', type: 'String', length: 64 , unique: true }
  ]
}
