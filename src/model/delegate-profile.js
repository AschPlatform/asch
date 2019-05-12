module.exports = {
  table: 'delegate_profiles',
  memory: true,
  tableFields: [
    { name: 'name', type: 'String', length: 50, primary_key: true },
    { name: 'nodeName', type: 'String', length: 50 },
    { name: 'icon', type: 'String', length: 256 },
    { name: 'banner', type: 'String', length: 256 },
    { name: 'intro', type: 'String', length: 256 },
    { name: 'website', type: 'String', length: 512 },
  ]
}
