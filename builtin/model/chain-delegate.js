module.exports = {
  table: 'chain_delegates',
  tableFields: [
    { name: 'chain', type: 'String', length: 64, index: true },
    { name: 'delegate', type: 'String', length: 64, index: true }
  ]
}