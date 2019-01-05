module.exports = {
  table: 'netenergyconsumptions',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'netUsed', type: 'BigInt', default: 0 },
    { name: 'energyUsed', type: 'BigInt', default: 0 },
    { name: 'fee', type: 'BigInt', default: 0 },
    { name: 'isFeeDeduct', type: 'Number', default: 0 },
    { name: 'height', type: 'BigInt', not_null: true },
    { name: 'address', type: 'String', length: 50, not_null: true },
  ]
}
