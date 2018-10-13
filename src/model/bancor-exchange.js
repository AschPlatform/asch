module.exports = {
  table: 'bancor_exchanges',
  tableFields: [
    { name: 'id', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'address', type: 'String', length: 50, not_null: true },
    { name: 'timestamp', type: 'Number', not_null: true },
    { name: 'type', type: 'String', length: 10, not_null: true },
    { name: 'owner', type: 'String', length: 50, not_null: true },
    { name: 'source', type: 'String', length: 20, not_null: true },
    { name: 'sourcePrecision', type: 'Number', not_null: true },
    { name: 'target', type: 'String', length: 20, not_null: true },
    { name: 'targetPrecision', type: 'Number', not_null: true },
    { name: 'price', type: 'Number', not_null: true },
    { name: 'targetAmount', type: 'String', length: 50, not_null: true },
    { name: 'sourceAmount', type: 'String', length: 50, not_null: true },
  ]
}
