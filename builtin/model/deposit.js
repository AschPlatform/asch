module.exports = {
  table: 'deposits',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'dappId', type: 'String', length: 64, index: true },
    { name: 'currency', type: 'String', length: 22 },
    { name: 'amount', type: 'String', length: 50 }
  ]
}