module.exports = {
  table: 'issuers',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, unique: true },
    { name: 'name', type: 'String', length: 32, primary_key: true },
    { name: 'issuerId', type: 'String', length: 50, unique: true },
    { name: 'desc', type: 'Text' }
  ]
}
