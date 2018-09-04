module.exports = {
  table: 'block_indexs',
  local: true,
  tableFields: [
    { name: 'blockHeight', type: 'BigInt', primary_key: true },
    { name: 'producerName', type: 'String', length: 50, index: true }
  ]
}
