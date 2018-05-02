module.exports = {
  table: 'rounds',
  tableFields: [
    { name: 'roundId', type: 'BigInt', primary_key: true, not_null: true },
    { name: 'round', type: 'BigInt', index: true, not_null: true },
    { name: 'fees', type: 'BigInt', not_null: true },
    { name: 'rewards', type: 'BigInt', not_null: true },
  ]
}