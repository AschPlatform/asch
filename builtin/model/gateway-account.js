module.exports = {
  table: 'gateway_accounts',
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true },
    { name: 'seq', type: 'Number' , index: true },
    { name: 'gateway', type: 'String', length: 10, index: true },
    { name: 'outAddress', type: 'String', length: 50, index: true },
    { name: 'attachment', type: 'Text' },
  ]
}