module.exports = {
  table: 'peer_dapps',
  tableFields: [
    { name: 'peerId', type: 'Number', not_null: true, index: true },
    { name: 'dappId', type: 'String', not_null: true, length: 64, index: true }
  ]
}