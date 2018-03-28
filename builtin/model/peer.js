module.exports = {
  table: 'peers',
  tableFields: [
    { name: 'id', type: 'Number', primary_key: true },
    { name: 'ip', type: 'Number', not_null: true, index: true },
    { name: 'port', type: 'Number', not_null: true, index: true },
    { name: 'state', type: 'Number', not_null: true, index: true },
    { name: 'clock', type: 'Number', index: true },
    { name: 'os', type: 'String', length: 32, index: true },
    { name: 'version', type: 'String', length: 32, index: true },
  ]
}