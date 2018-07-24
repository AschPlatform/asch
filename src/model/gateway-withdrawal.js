module.exports = {
  table: 'gateway_withdrawals',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true },
    { name: 'gateway', type: 'String', length: 20, index: true },
    { name: 'senderId', type: 'String', length: 50, index: true },
    { name: 'recipientId', type: 'String', length: 50 },
    { name: 'currency', type: 'String', length: 10, index: true },
    { name: 'seq', type: 'Number' , index: true },
    { name: 'amount', type: 'String', length: 50 },
    { name: 'fee', type: 'String', length: 50 },
    { name: 'outTransaction', type: 'Text' },
    { name: 'signs', type: 'Number', default: 0 },
    { name: 'ready', type: 'Number', default: 0 },
    { name: 'oid', type: 'String', length: 64 }
  ]
}
