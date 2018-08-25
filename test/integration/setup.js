const lib = require('../lib')

module.exports = async () => {
  console.log('\r\n=============setup=============')
  console.log('starting asch service ....')
  require('../../app.js')
  await lib.sleep(2000)

  let height = null
  while (!height) {
    try {
      height = await lib.getHeight()
    } catch (e) {
      height = null
    }
  }
  console.log('asch service started')
}
