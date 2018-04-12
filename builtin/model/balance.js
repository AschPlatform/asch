module.exports = {
  table: 'balances',
  tableFields: [
    { name: 'address', type: 'String', length: 50, not_null: true, index: true },
    { name: 'currency', type: 'String', length: 30, not_null: true, index: true },
    { name: 'balance', type: 'String', length: 50, not_null: true },
    { name: 'flag', type: 'Number', index: true }
  ]
}