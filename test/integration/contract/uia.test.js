const lib = require('../../lib')
require('../setup')

describe('uia', () => {
  test('first', async () => {
    console.log('enter uia first')
    await lib.sleep(2000)
    console.log('exit uia first')
  })
})
