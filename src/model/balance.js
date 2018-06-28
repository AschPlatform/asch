module.exports = {
  table: 'balances',
  memory: true,
  tableFields: [
    { name: 'address', type: 'String', length: 64, not_null: true, composite_key: true, index: true },
    { name: 'currency', type: 'String', length: 30, not_null: true, composite_key: true, index: true },
    { name: 'balance', type: 'String', length: 50, not_null: true },
    { name: 'flag', type: 'Number', index: true }
  ]
}