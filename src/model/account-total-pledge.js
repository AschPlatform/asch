module.exports = {
  table: 'account_total_pledges',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, not_null: true, primary_key: true },
    { name: 'totalPledgeForNet', type: 'BigInt', default: 0 },
    { name: 'totalPledgeForEnergy', type: 'BigInt', default: 0 },
    { name: 'netPerXAS', type: 'BigInt', default: 0 },
    { name: 'energyPerXAS', type: 'BigInt', default: 0 },
    { name: 'netPerPledgedXAS', type: 'BigInt', default: 0 },
    { name: 'energyPerPledgedXAS', type: 'BigInt', default: 0 },
    { name: 'gasprice', type: 'Number', default: 1.0 },
    { name: 'freeNetLimit', type: 'BigInt', default: 0 },
  ]
}
