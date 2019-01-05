module.exports = {
  table: 'account_pledges',
  tableFields: [
    { name: 'address', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'freeNetUsed', type: 'BigInt', default: 0 },
    { name: 'netUsed', type: 'BigInt', default: 0 },
    { name: 'energyUsed', type: 'BigInt', default: 0 },
    { name: 'pledgeAmountForNet', type: 'BigInt', default: 0 },
    { name: 'pledgeAmountForEnergy', type: 'BigInt', default: 0 },
    { name: 'netLockHeight', type: 'BigInt', default: 0 },
    { name: 'energyLockHeight', type: 'BigInt', default: 0 },
    { name: 'lastFreeNetUpdateDay', type: 'BigInt', default: 0 },
    { name: 'lastNetUpdateDay', type: 'BigInt', default: 0 },
    { name: 'lastEnergyUpdateDay', type: 'BigInt', default: 0 },
    { name: 'heightOffset', type: 'BigInt', default: 0 },
  ]
}
