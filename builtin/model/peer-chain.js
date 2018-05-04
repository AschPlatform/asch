module.exports = {
  table: 'peer_chains',
  tableFields: [
    { name: 'peerId', type: 'Number', not_null: true, primary_key: true },
    { name: 'chain', type: 'String', not_null: true, length: 64, primary_key: true }
  ]
}