module.exports = {
  table: 'bancors',
  tableFields: [
    { name: 'owner', type: 'String', length: 50, composite_key: true },
    { name: 'stock', type: 'String', length: 20, composite_key: true },
    { name: 'money', type: 'String', length: 20, composite_key: true },
    { name: 'supply', type: 'BigInt', not_null: true },
    { name: 'stockBalance', type: 'BigInt', not_null: true },
    { name: 'moneyBalance', type: 'BigInt', not_null: true },
    { name: 'stockCw', type: 'Number', not_null: true },
    { name: 'moneyCw', type: 'Number', not_null: true },
    { name: 'relay', type: 'Number', not_null: true, default: 1 },
  ]
}
