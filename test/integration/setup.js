const shell = require('shelljs')
const lib = require('../lib')
const debug = require('debug')('BASIC')

jest.setTimeout(100000)

beforeAll(() => {
  // (async () => {
  //   shell.exec('node app.js --daemon')
  //   while (true) {
  //     await lib.sleep(1000)
  //     try {
  //       const address = lib.GENESIS_ACCOUNT.address
  //       const res = await lib.apiGetAsync(`/accounts/getBalance?address=${address}`)
  //       debug('get genesis account balance ', res.body)
  //       if (res.body.success) break
  //     } catch (e) {
  //       debug('get genesis account balance error', e)
  //     }
  //   }
  //   debug('Asch server started successfully')
  // })()
})

afterAll(() => {
  // shell.exec('kill `cat asch.pid`')
})

async function failTransaction(trs) {
  let actualError
  try {
    await lib.transactionUnsignedAsync(trs)
  } catch (e) {
    actualError = String(e)
  }
  return actualError
}

async function failSubmitTransaction(trs) {
  let actualError
  try {
    await lib.submitTransactionAsync(trs)
  } catch (e) {
    actualError = String(e)
  }
  return actualError
}

module.exports = {
  failTransaction,
  failSubmitTransaction,
}
