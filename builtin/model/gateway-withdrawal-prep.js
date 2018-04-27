module.exports = {
  table: 'gateway_withdrawal_preps',
  tableFields: [
    { name: 'wid', type: 'String', length: 64 },
    { name: 'signer', type: 'String', length: 50 },
    { name: 'signature', type: 'Text' }
  ]
}