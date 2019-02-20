module.exports = {
    table: 'contract_transfers',
    tableFields: [
      { name: 'id', type: 'Number', not_null: true, primary_key: true },
      { name: 'tid', type: 'String', length: 64, not_null: true, index: true },
      { name: 'height', type: 'Number', not_null: true, index: true }, 
      { name: 'senderId', type: 'String', length: 50, not_null: true, index: true },
      { name: 'recipientId', type: 'String', length: 50, not_null: true, index: true },
      { name: 'currency', type: 'String', length: 30, not_null: true, index: true },
      { name: 'amount', type: 'BigInt', length: 50, not_null: true },
      { name: 'timestamp', type: 'Number', index: true }
    ]
  }
  