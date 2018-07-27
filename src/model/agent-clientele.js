module.exports = {
  table: 'agent_clienteles',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'agent', type: 'String', length: 50, index: true },
    { name: 'clientele', type: 'String', length: 50, unique: true },
  ]
}
