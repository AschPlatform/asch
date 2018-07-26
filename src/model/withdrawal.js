module.exports = {
  table: 'withdrawals',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'chain', type: 'String', length: 64, index: true },
    { name: 'oid', type: 'String', length: 64, index: true },
    { name: 'currency', type: 'String', length: 22 },
    { name: 'amount', type: 'String', length: 50 },
    { name: 'recipientId', type: 'String', length: 50 },
    { name: 'seq', type: 'Number', index: true }
  ]
}
