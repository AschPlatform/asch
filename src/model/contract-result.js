module.exports = {
    table: 'contract_results',
    tableFields: [
      { name: 'tid', type: 'String', length: 64, primary_key: true },
      { name: 'contractId', type: 'Number', not_null: true, index: true },
      { name: 'success', type: 'Number', not_null: true },
      { name: 'error', type: 'String', length: 128 },
      { name: 'gas', type: 'Number' },
      { name: 'stateChangesHash', type: 'String', length: 64 },
      { name: 'data', type: 'Json' }
    ]
  }
  