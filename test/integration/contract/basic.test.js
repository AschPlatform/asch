const debug = require('debug')('BASIC')
const config = require('../../smoke/config')
const lib = require('../../lib')

jest.setTimeout(1000000)

describe('basic contracts', () => {
  test('verify transfer', async () => {
    debug('Into verify transfer test...')
    const address = config.agents[0].address
    const amount = 25000000000
    const f = 10000000

    // Get balance before transfer
    const originalBalance = await lib.getBalanceAsync(address)

    // Transfer money to agents and delegates
    for (const agent of config.agents) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, agent.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    for (const del of config.delegates) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, del.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // Get balance after transfer
    const updateBalance = await lib.getBalanceAsync(address)

    // Verify the balance has growth of amount
    result = updateBalance.body.balance - originalBalance.body.balance
    debug(`--->Actual balance is '${result}', expected balance is '${amount}'`)
    expect(result).toEqual(amount)
  })


  test('verify negative transfer', async () => {
    debug('Into negative transfer test ...')
    const expectedError = 'Amount should be integer'
    const address = config.agents[0].address
    const amount = -25000000000
    const f = 10000000

    const trs = {
      secret: lib.GENESIS_ACCOUNT.secret,
      fee: f,
      type: 1,
      args: [amount, address],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify setName', async () => {
    debug('Into verify setName test...')
    const f = 1000000000
    // Set names for agents and delegates
    for (const agent of config.agents) {
      const trs = {
        secret: agent.secret,
        type: 2,
        fee: f,
        args: [
          agent.name,
        ],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    for (const del of config.delegates) {
      const trs = {
        secret: del.secret,
        type: 2,
        fee: f,
        args: [
          del.name,
        ],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: Verify the name has been set successfully in table accounts.
    // Name was not exposed in GetAccount.
    // Option 1: Update asch-core~accounts, add name in response
    // Option 2: Transfer money to account using account name, verify the transferring result
  })


  test('verify negative setName', async () => {
    debug('Into negative setName test ...')
    const expectedError = 'Invalid name'
    const f = 1000000000
    const name = 'Aname01'
    const trs = {
      secret: config.agents[0].secret,
      type: 2,
      fee: f,
      args: [
        name,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify setPassword', async () => {
    debug('Into verify setPassword test ...')
    const scrt = config.agents[1].secret
    const address = config.agents[1].address
    const publicKey = config.agents[0].publicKey
    const trsSetPassword = {
      secret: scrt,
      type: 3,
      fee: 500000000,
      args: [
        publicKey,
      ],
    }

    // Set second password
    await lib.transactionUnsignedAsync(trsSetPassword)
    await lib.onNewBlockAsync()

    // Verify second password has been set in account
    const res = await lib.getAccountAsync(address)
    debug(`--->Actual password is '${res.body.account.secondPublicKey}', expected password is '${publicKey}'`)
    expect(res.body.account.secondPublicKey).toEqual(publicKey)
  })


  test('verify negative setPassword', async () => {
    debug('Into negative setPassword test ...')
    const expectedError = 'Second signature not provided'
    const scrt = config.agents[1].secret
    const publicKey = config.agents[0].publicKey + 1
    const trs = {
      secret: scrt,
      type: 3,
      fee: 500000000,
      args: [
        publicKey,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify lock', async () => {
    debug('Into verify lock test ...')
    const clientele = config.agents[0].clienteles[0]
    const address = clientele.address
    const amount = 3000000000
    const f = 10000000
    const balanceWantToLock = 1000000000
    const lockHeight = 300000
    const trsTransfer = {
      secret: lib.GENESIS_ACCOUNT.secret,
      fee: f,
      type: 1,
      args: [amount, address],
    }

    const trs = {
      secret: clientele.secret,
      type: 4,
      fee: f,
      args: [lockHeight, balanceWantToLock],
    }

    // Transfer xas to clientele
    await lib.transactionUnsignedAsync(trsTransfer)
    await lib.onNewBlockAsync()

    // Lock clientele
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    const expectedBalance = amount - balanceWantToLock - f
    const res = await lib.getAccountAsync(address)
    debug(`--->Actual balance is '${res.body.account.balance}', expected balance is '${expectedBalance}'`)
    expect(res.body.account.balance).toEqual(expectedBalance)
  })


  test('verify negative lock', async () => {
    debug('Into negative lock test ...')
    const expectedError = 'Invalid lock height'
    const f = 10000000
    const balanceWantToLock = 1000000000
    const lockHeight = 3000
    const trs = {
      secret: config.agents[0].clienteles[0].secret,
      type: 4,
      fee: f,
      args: [lockHeight, balanceWantToLock],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })

  // test('verify unlock', async () => {
  // })


  test('verify registerAgent', async () => {
    debug('Into verify registerAgent test ...')
    const scrt = config.agents[0].secret
    // const role = config.AccountRole.AGENT
    // const isAgent = 1
    const trs = {
      secret: scrt,
      type: 7,
      fee: 10000000000,
      args: [],
    }

    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: Verify the role and isAgent field was set correctly in agent account
    // const res = await lib.getAccountAsync(address)
    // expect(res.body.account.role).toEqual(AGENT)
    // expect(res.body.account.isAgent).toEqual(isAgent)
  })


  test('verify negative registerAgent', async () => {
    debug('Into negative registerAgent test ...')
    const expectedError = 'Fee not enough'
    const trs = {
      secret: config.agents[0].secret,
      type: 7,
      fee: 1000000000,
      args: [],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify setAgent', async () => {
    debug('Into verify setAgent test ...')
    const agentName = config.agents[0].name
    const clientele = config.agents[0].clienteles[0]
    // const clienteleLockedBalance = 1000000000
    const f = 10000000

    const trs = {
      secret: clientele.secret,
      type: 8,
      fee: f,
      args: [agentName],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()
    // TODO: Check result in table agent_clienteles
    // TODO: Verify agentWeight of agent increase clientele_locked_balance
  })


  test('verify negative setAgent', async () => {
    debug('Into negative setAgent test ...')
    const expectedError = 'Agent cannot set agent'
    const f = 10000000
    const agentName = config.agents[1].name
    const trs = {
      secret: config.agents[0].secret,
      type: 8,
      fee: f,
      args: [agentName],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify cancelAgent', async () => {
    debug('Into verify cancelAgent test ...')
    const clientele = config.agents[0].clienteles[0]
    // const clienteleLockedBalance = 1000000000
    const trs = {
      secret: clientele.secret,
      type: 9,
      fee: 0,
      args: [],
    }

    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()
    // TODO: Verify agentWeight of agent account has clienteleLockedBalance reduction
  })


  test('verify negative cancelAgent', async () => {
    debug('Into negative cancelAgent test ...')
    const expectedError = 'Sender account not found'
    const trs = {
      secret: config.agents[0].clienteles[1].secret,
      type: 9,
      fee: 0,
      args: [],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify registerDelegate', async () => {
    debug('Into verify registerDelegate test ...')
    const f = 10000000000
    // const isDelegate = 1
    // const role = config.AccountRole.DELEGATE

    for (const delegate of config.delegates) {
      const trs = {
        secret: delegate.secret,
        type: 10,
        fee: f,
        args: [],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()
    // TODO: Verify field isDelegate, role of delegate account has assigned value
  })


  test('verify negative registerDelegate', async () => {
    debug('Into negative registerDelegate test ...')
    const expectedError = 'Account already have a role'
    const f = 10000000000
    const trs = {
      secret: config.agents[0].secret,
      type: 10,
      fee: f,
      args: [],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify vote', async () => {
    debug('Into verify vote test ...')
    const scrt = config.agents[0].secret
    const f = 10000000
    const delegates = config.delegates.map(del => del.name)
    const trs = {
      secret: scrt,
      type: 11,
      fee: f,
      args: [delegates.join(',')],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: Verify there will be new records in table votes
  })


  test('verify negative vote', async () => {
    debug('Into negative vote test ...')
    const expectedError = 'Delegate already voted: del001'
    scrt = config.agents[0].secret
    f = 10000000
    const delegates = config.delegates.map(del => del.name)
    const trs = {
      secret: scrt,
      type: 11,
      fee: f,
      args: [delegates.join(',')],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify unvote', async () => {
    debug('Into verify unvote test ...')
    const scrt = config.agents[0].secret
    const f = 10000000
    const delegates = config.delegates.map(del => del.name)
    const trs = {
      secret: scrt,
      type: 12,
      fee: f,
      args: [delegates.join(',')],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO Verify records related with assigned agent will be deleted in table votes
  })


  test('verify negative unvote', async () => {
    debug('Into negative unvote test ...')
    const expectedError = 'Duplicated vote item'
    const scrt = config.agents[0].secret
    const f = 10000000
    const delegates = ['del001', 'del001', 'del003']
    const trs = {
      secret: scrt,
      type: 12,
      fee: f,
      args: [delegates.join(',')],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })
})
