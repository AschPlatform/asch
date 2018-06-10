module.exports = {
  table: 'delegates',
  memory: true,
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'tid', type: 'String', length: 64, index: true, not_null: true },
    { name: 'name', type: 'String', length: 50, index: true },
    { name: 'publicKey', type: 'String', length: 64, index: true },
    { name: 'votes', type: 'BigInt', index: true },
    { name: 'producedBlocks', type: 'BigInt' },
    { name: 'missedBlocks', type: 'BigInt' },
    { name: 'fees', type: 'BigInt' },
    { name: 'rewards', type: 'BigInt' }
  ]
}