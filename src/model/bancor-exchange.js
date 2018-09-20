module.exports = {
  table: 'bancor_exchanges',
  tableFields: [
    { name: 'address', type: 'String', length: 50, not_null: true, composite_key: true },
    { name: 'timestamp', type: 'Number', not_null: true, composite_key: true },
    { name: 'type', type: 'String', length: 10, primary_key: true },
    { name: 'pair', type: 'String', length: 50, not_null: true },
    { name: 'ratio', type: 'Number', not_null: true, index: true },
    { name: 'buyed', type: 'Number', not_null: true, index: true },
    { name: 'used', type: 'Number', not_null: true, index: true },
  ]
}
