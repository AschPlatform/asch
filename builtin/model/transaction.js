module.exports = {
  table: 'transactions',
  tableFields: [
    { name: 'id', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'type', type: 'Number', not_null: true, index: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true },
    { name: 'senderId', type: 'String', length: 50, index: true },
    { name: 'senderPublicKey', type: 'String', length: 64 },
    { name: 'accountId', type: 'String', length: 50, index: true },
    { name: 'fee', type: 'BigInt', not_null: true },
    { name: 'signatures', type: 'Text', not_null: true },
    { name: 'secondSignature', type: 'String', length: 128 },
    { name: 'args', type: 'Text' },
    { name: 'height', type: 'BigInt', not_null: true, index: true },
    { name: 'message', type: 'String', length: 256, index: true },
    { name: 'executed', type: 'Number', not_null: true, index: true, default: 1 },
  ]
}
