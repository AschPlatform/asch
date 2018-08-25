const debug = require('debug')('interface:block')
const lib = require('../../lib')

jest.setTimeout(1000000)

describe('block interfaces', () => {
  test('/api/v2/blocks', async () => {
    const ret = await lib.apiGetAsync('/v2/blocks')
    expect(ret.body).toBeTruthy()
    debug('get blocks length', ret.body.blocks)
    expect(ret.body.success).toEqual(true)
  })
})
