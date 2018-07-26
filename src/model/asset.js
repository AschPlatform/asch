module.exports = {
  table: 'assets',
  memory: true,
  tableFields: [
    { name: 'name', type: 'String', length: 50, primary_key: true },
    { name: 'tid', type: 'String', length: 64, not_null: true, unique: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true },
    { name: 'maximum', type: 'String', length: 50, not_null: true, index: true },
    { name: 'precision', type: 'Number' },
    { name: 'quantity', type: 'String', length: 50 },
    { name: 'desc', type: 'Text' },
    { name: 'issuerId', type: 'String', length: 50 }
  ]
}
