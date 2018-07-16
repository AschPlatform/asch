require('../setup')
const config = require('../../smoke/config')
const lib = require('../../lib')

describe('basic contracts', () => {

  test('verify transfer', async () => {
    const address = config.issuers[0].account.address
    const amount = 100000000
    const trs = {
      secret: config.Gaccount.secret,
      fee: 10000000,
      type: 1,
      args: [amount, address],
    }
      
    await lib.sleep(5000)
    // Get balance before transfer
    const originalBalance = await lib.getBalanceAsync(address)
    console.log('originalBalance balance:', originalBalance.body.balance)

    // Transfer money to address
    // await lib.giveMoneyAsync(address, amount)
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // Get balance after transfer
    const updateBalance = await lib.getBalanceAsync(address)
    console.log('updateBalance balance:', updateBalance.body.balance)

    // Verify the balance has growth of amount
    result = updateBalance.body.balance - originalBalance.body.balance
    expect(result).toEqual(amount)
  })

  // test('verify setName', async() => {
  //   const secret = config.agents[0].secret
  //   const name = config.agents[0].name
  //   const trs = {
  //     secret: secret,
  //     type: 2,
  //     fee: 1000000000,
  //     args: [
  //       name,
  //     ],
  //   }

  //   await lib.transactionUnsignedAsync(trs)

  //   // TODO: Verify the name has been set successfully in table accounts

  // })

  // test('verify setPassword', async() => {
  //   const address = config.agents[0].address
  //   const publicKey = config.agents[0].publicKey
  //   const trs = {
  //     secret: config.agents[0].secret,
  //     type: 3,
  //     fee: 500000000,
  //     args: [
  //       publicKey,
  //     ],
  //   }

  //   await lib.transactionUnsignedAsync(trs)

  //   const account = await lib.getAccountAsync(address)

  //   expect(account.secondPublicKey).toEqual(publicKey)

  // })

  // test('verify lock', async() => {

  // })

  // test('verify unlock', async() => {

  // })

  // test('verify registerGroup', async() => {

  // })

  // test('verify registerAgent', async() => {

  // })

  // test('verify setAgent', async() => {

  // })

  // test('verify cancelAgent', async() => {

  // })

  // test('verify registerDelegate', async() => {

  // })

  // test('verify vote', async() => {

  // })

  // test('verify unvote', async() => {

  // })
})
