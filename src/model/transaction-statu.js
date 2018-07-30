module.exports = {
  table: 'transaction_status',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'executed', type: 'Number', not_null: true, index: true, default: 0 },
  ]
}