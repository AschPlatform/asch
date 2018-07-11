const lib = require('../../lib')
require('../setup')

describe('basic contracts', () => {
  test('first', async () => {
    console.log('enter basic first')
    await lib.sleep(2000)
    console.log('exit basic first')
  })
})
