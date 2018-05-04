module.exports = {
  table: 'gateway_withdrawal_preps',
  tableFields: [
    { name: 'wid', type: 'String', length: 64, primary_key: true },
    { name: 'signer', type: 'String', length: 50, primary_key: true },
    { name: 'signature', type: 'Text' }
  ]
}