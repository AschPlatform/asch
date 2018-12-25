module.exports = {
  table: 'account_pledges',
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'freeNetUsed', type: 'BigInt', default: 0 },
    { name: 'netUsed', type: 'BigInt', default: 0 },
    { name: 'energyUsed', type: 'BigInt', default: 0 },
    { name: 'pledgeAmountForBP', type: 'BigInt', default: 0 },
    { name: 'pledgeAmountForEnergy', type: 'BigInt', default: 0 },
    { name: 'bpLockHeight', type: 'BigInt', default: 0 },
    { name: 'energyLockHeight', type: 'BigInt', default: 0 },
    { name: 'lastFreeNetUpdateHeight', type: 'BigInt', default: 0 },
    { name: 'lastBPUpdateHeight', type: 'BigInt', default: 0 },
    { name: 'lastEnergyUpdateHeight', type: 'BigInt', default: 0 },
  ]
}
