module.exports = {
  table: 'gateway_members',
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true },
    { name: 'gateway', type: 'String', length: 20, index: true },
    { name: 'desc', type: 'Text' },
    { name: 'outPublicKey', type: 'Text' },
    { name: 'elected', type: 'Number', default: 0, index: true },
    { name: 'timestamp', type: 'Number' },
  ]
}
