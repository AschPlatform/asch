module.exports = {
  table: 'gateways',
  tableFields: [
    { name: 'name', type: 'String', length: 20, primary_key: true },
    { name: 'desc', type: 'Text' },
    { name: 'updateInterval', type: 'Number' },
    { name: 'minimumMembers', type: 'Number' },
    { name: 'lastUpdateHeight', type: 'BigInt' },
    { name: 'activated', type: 'Number', default: 0 },
    { name: 'revoked', type: 'Number', default: 0 },
    { name: 'version', type: 'Number' },
    { name: 'createTime', type: 'Number' },
  ]
}
