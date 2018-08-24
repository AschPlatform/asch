const lib = require('../lib')

module.exports = async function () {
  console.log('\r\n=============setup=============')
  console.log('starting asch service ....')
  require('../../app.js')
  await lib.sleep(5000)
  await lib.onNewBlockAsync()
  console.log('asch service started')
}
