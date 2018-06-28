module.exports = {
  table: 'agents',
  tableFields: [
    { name: 'name', type: 'String', length: 50, primary_key: true },
    { name: 'tid', type: 'String', length: 64, not_null: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true }
  ]
}