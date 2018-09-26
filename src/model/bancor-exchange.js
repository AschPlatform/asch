module.exports = {
  table: 'bancor_exchanges',
  tableFields: [
    { name: 'address', type: 'String', length: 50, not_null: true, composite_key: true },
    { name: 'timestamp', type: 'Number', not_null: true, composite_key: true },
    { name: 'type', type: 'String', length: 10 },
    { name: 'owner', type: 'String', length: 50, composite_key: true },
    { name: 'source', type: 'String', length: 20, not_null: true, composite_key: true },
    { name: 'target', type: 'String', length: 20, not_null: true, composite_key: true },
    { name: 'ratio', type: 'Number', not_null: true, index: true },
    { name: 'buyed', type: 'Number', not_null: true, index: true },
    { name: 'used', type: 'Number', not_null: true, index: true },
  ]
}
