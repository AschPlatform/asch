const shell = require('shelljs')
const lib = require('../lib')

async function init() {
  shell.exec('node app.js --daemon')
  console.log('-----', Date.now())
  await lib.sleep(5000)
  const res = await lib.apiGetAsync('/block/getHeight')
  console.log(res)
}

(async () => {
  await init()
})()
