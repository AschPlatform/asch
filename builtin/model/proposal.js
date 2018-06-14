module.exports = {
  table: 'proposals',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'timestamp', type: 'Number', not_null: true, index: true },
    { name: 'title', type: 'String', length: 256 },
    { name: 'senderId', type: 'String', length: 50 },
    { name: 'desc', type: 'Text' },
    { name: 'topic', type: 'String', length: 256 },
    { name: 'content', type: 'Text' },
    { name: 'activated', type: 'Number', default: 0 , index: true },
    { name: 'endHeight', type: 'BigInt', index: true },
    { name: 'height', type: 'BigInt' }
  ]
}
