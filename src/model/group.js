module.exports = {
  table: 'groups',
  tableFields: [
    { name: 'name', type: 'String', length: 20, primary_key: true },
    { name: 'address', type: 'String', length: 50, unique: true },
    { name: 'tid', type: 'String', length: 64 },
    { name: 'min', type: 'Number' },
    { name: 'max', type: 'Number' },
    { name: 'm', type: 'Number', default: 0 },
    { name: 'updateInterval', type: 'Number' },
    { name: 'createTime', type: 'Number' },
  ],
}
