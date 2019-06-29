module.exports = {
  table: 'accounts',
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'name', type: 'String', length: 20, unique: true },
    { name: 'xas', type: 'BigInt', default: 0 },
    { name: 'publicKey', type: 'String', length: 64 },
    { name: 'secondPublicKey', type: 'String', length: 64 },
    { name: 'isLocked', type: 'Number', default: 0 },
    { name: 'isAgent', type: 'Number', default: 0 },
    { name: 'isDelegate', type: 'Number', default: 0 },
    { name: 'role', type: 'Number', default: 0 },
    { name: 'lockHeight', type: 'BigInt', default: 0 },
    { name: 'agent', type: 'String', length: 50 },
    { name: 'weight', type: 'BigInt', default: 0 },
    { name: 'agentWeight', type: 'BigInt', default: 0 },
  ]
}
