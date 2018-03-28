module.exports = {
  table: 'dapps',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'name', type: 'String', length: 32, index: true },
    { name: 'description', type: 'String', length: 160 },
    { name: 'tags', type: 'String', length: 160 },
    { name: 'link', type: 'Text' },
    { name: 'icon', type: 'Text' },
    { name: 'type', type: 'Number' },
    { name: 'category', type: 'Number' },
    { name: 'delegates', type: 'Text', },
    { name: 'unlockDelegates', type: 'Number' }
  ]
}