const shell = require('shelljs')
const lib = require('../lib')

jest.setTimeout(100000)

beforeAll(() => {
  (async () => {
    shell.exec('node app.js --daemon')
    while (true) {
      await lib.sleep(1000)
      try {
        let res = await lib.apiGetAsync('/blocks/getHeight')
        console.log('get height result', res.body)
        if (res.body.success) break
      } catch (e) {
        console.log('get height error', e)
      }
    }
    console.log('Asch server started successfully')
  })()
})

afterAll(() => {
  shell.exec('kill `cat asch.pid`')
})
