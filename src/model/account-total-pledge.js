module.exports = {
  table: 'account_total_pledges',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'totalPledgeForBP', type: 'BigInt', default: 0 },
    { name: 'totalPledgeForEnergy', type: 'BigInt', default: 0 },
    { name: 'totalNetLimit', type: 'BigInt', default: 0 },
    { name: 'totalEnergyLimit', type: 'BigInt', default: 0 },
    { name: 'freeNetLimit', type: 'BigInt', default: 0 },
  ]
}
