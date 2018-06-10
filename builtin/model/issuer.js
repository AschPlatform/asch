module.exports = {
  table: 'issuers',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, index: true },
    { name: 'name', type: 'String', length: 32, primary_key: true },
    { name: 'issuerId', type: 'String', length: 50, index: true },
    { name: 'desc', type: 'Text' }
  ]
}