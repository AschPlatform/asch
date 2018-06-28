module.exports = {
  table: 'variables',
  memory: true,
  tableFields: [
    {
      name: 'key',
      type: 'String',
      length: 256,
      not_null: true,
      primary_key: true
    },
    {
      name: 'value',
      type: 'Text',
      not_null: true
    }
  ]
}