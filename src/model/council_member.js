module.exports = {
  table: 'council_members',
  memory: true,
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'tid', type: 'String', length: 64, unique: true, not_null: true },
    { name: 'name', type: 'String', length: 50, index: true },
    { name: 'publicKey', type: 'String', length: 64, unique: true },
    { name: 'votes', type: 'BigInt' },
    { name: 'website', type: 'String', length: 256 }
  ]
}
