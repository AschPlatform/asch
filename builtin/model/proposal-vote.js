module.exports = {
  table: 'proposal_votes',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'pid', type: 'String', length: 64, index: true },
    { name: 'voter', type: 'String', length: 50 , index: true }
  ]
}