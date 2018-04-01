module.exports = {
  table: 'proposals',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'topic', type: 'String', length: 256 },
    { name: 'content', type: 'String', length: 4096 },
    { name: 'activated', type: 'Number', default: 0 },
    { name: 'height', type: 'BigInt' }
  ]
}