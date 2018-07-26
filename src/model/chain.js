module.exports = {
  table: 'chains',
  memory: true,
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'name', type: 'String', length: 32, unique: true },
    { name: 'address', type: 'String', length: 50, unique: true },
    { name: 'desc', type: 'String', length: 160 },
    { name: 'link', type: 'Text' },
    { name: 'icon', type: 'Text' },
    { name: 'unlockNumber', type: 'Number' }
  ]
}
