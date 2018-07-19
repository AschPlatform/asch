module.exports = {
  table: 'transfers',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'senderId', type: 'String', length: 50, not_null: true, index: true },
    { name: 'recipientId', type: 'String', length: 50, not_null: true, index: true },
    { name: 'recipientName', type: 'String', length: 30 },
    { name: 'currency', type: 'String', length: 30, not_null: true, index: true },
    { name: 'amount', type: 'String', length: 50, not_null: true },
    { name: 'timestamp', type: 'Number', index: true },
    { name: 'height', type: 'BigInt', not_null: true, index: true },
  ]
}
