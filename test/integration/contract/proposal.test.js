const debug = require('debug')('BASIC')
const config = require('../../smoke/config')
const lib = require('../../lib')

const gDelegates = []
let proposalId
async function initDelegates() {
  debug('init delegate accounts ...')
  for (const secret of lib.config.forging.secret) {
    gDelegates.push(lib.genNormalAccount(secret))
  }
  const allDelegates = (await lib.apiGetAsync('/delegates?limit=101')).body.delegates

  const addressMap = new Map()
  for (const d of allDelegates) {
    addressMap.set(d.address, d)
  }
  for (const d of gDelegates) {
    if (addressMap.get(d.address)) {
      d.name = addressMap.get(d.address).name
    }
  }
}

jest.setTimeout(1000000)

describe('proposal test', () => {
  test('Prepare data for proposal test', async () => {
    debug('============================= Proposal Test =============================')
    await initDelegates()
    const addresses = gDelegates.map(d => d.address)
    const amount = 50000000000
    const f = 10000000
    for (const proposal of config.proposals) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, proposal.account.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    for (const addr of addresses) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, addr],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    for (const ga of config.gatewayAccounts) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, ga.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    for (const validator of config.bitcoinValidators) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, validator.aschAccount.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()
  })


  test('vefiry submit proposal', async () => {
    debug('Into vefiry submit proposal test ...')
    const proposal = config.proposals[0]
    trs = {
      secret: proposal.account.secret,
      type: 300,
      fee: 1000000000,
      args: [
        proposal.title,
        proposal.desc,
        proposal.topic,
        proposal.content,
        10000,
      ],
    }
    proposalId = (await lib.transactionUnsignedAsync(trs)).body.transactionId
    await lib.onNewBlockAsync()

    // TODO: verify record was created in table proposals
  })


  test('test negative submit proposal', async () => {
    debug('Into negative submit proposal test ...')
    const expectedError = 'Invalid proposal topic'
    const proposal = config.proposals[0]
    trs = {
      secret: proposal.account.secret,
      type: 300,
      fee: 1000000000,
      args: [
        proposal.title,
        proposal.desc,
        'gateway_reg',
        proposal.content,
        10000,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('vefiry vote proposal', async () => {
    debug('Into vefiry vote proposal test ...')
    for (const d of gDelegates) {
      trs = {
        secret: d.secret,
        type: 301,
        fee: 10000000,
        args: [proposalId],
      }
      // debug(`--->vote for proposal:${proposalId} ${config.proposals[0].title} by ${d.name}`)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: verify records were created in table proposal_votes
  })


  test('test negative vote proposal', async () => {
    debug('Into negative vote proposal test ...')
    const expectedError = 'Proposal not found'
    trs = {
      secret: gDelegates[0].secret,
      type: 301,
      fee: 10000000,
      args: ['1234567809'],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('vefiry activate proposal', async () => {
    debug('Into vefiry activate proposal test ...')
    trs = {
      secret: gDelegates[0].secret,
      type: 302,
      fee: 0,
      args: [proposalId],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: verify records were created or updated in table
    // gateways, gateway_currencys or gateway_members
  })


  test('test negative activate proposal', async () => {
    debug('Into negative activate proposal test ...')
    const expectedError = 'Already activated'
    trs = {
      secret: gDelegates[0].secret,
      type: 302,
      fee: 0,
      args: [proposalId],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('vefiry gateway registerMember', async () => {
    debug('============================= Gateway Test =============================')
    debug('Into verify gateway registerMember test ...')
    // Set name for bitcoin validators
    for (const validator of config.bitcoinValidators) {
      trs = {
        secret: validator.aschAccount.secret,
        type: 2,
        fee: 10000000000,
        args: [validator.name],
      }
      debug('--->set name for gateway validator:', validator.aschAccount.address)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // Register gateway member
    for (const validator of config.bitcoinValidators) {
      trs = {
        secret: validator.aschAccount.secret,
        type: 401,
        fee: 10000000000,
        args: [
          'bitcoin',
          validator.bitcoinAccount.publicKey,
          'Validator description of bitcoin gateway',
        ],
      }
      debug('--->register gateway validator:', validator.aschAccount.address)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: verify records were created in table gateway_members
  })


  test('test negative gateway registerMember', async () => {
    debug('Into negative gateway registerMember test ...')
    const expectedError = 'Account already have a role'
    trs = {
      secret: config.bitcoinValidators[0].aschAccount.secret,
      type: 401,
      fee: 10000000000,
      args: [
        'bitcoin',
        config.bitcoinValidators[0].bitcoinAccount.publicKey,
        'Validator description of bitcoin gateway',
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })

  test('vefiry gateway openAccount', async () => {
    debug('Into verify gateway openAccount test ...')
    debug('--->Init gateway ...')
    trs = {
      secret: config.proposals[2].account.secret,
      type: 300,
      fee: 1000000000,
      args: [
        config.proposals[2].title,
        config.proposals[2].desc,
        config.proposals[2].topic,
        config.proposals[2].content,
        10000,
      ],
    }
    debug(`------>submit proposal: ${config.proposals[2].title}`)
    proposalId = (await lib.transactionUnsignedAsync(trs)).body.transactionId
    await lib.onNewBlockAsync()

    for (const d of gDelegates) {
      trs = {
        secret: d.secret,
        type: 301,
        fee: 10000000,
        args: [proposalId],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    debug('------>vote for proposal')
    await lib.onNewBlockAsync()

    trs = {
      secret: gDelegates[0].secret,
      type: 302,
      fee: 10000000,
      args: [proposalId],
    }
    debug(`------>activate proposal: ${config.proposals[2].title}`)
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    debug('--->open account ...')
    for (const ga of config.gatewayAccounts) {
      trs = {
        secret: ga.secret,
        type: 400,
        fee: 10000000000,
        args: ['bitcoin'],
      }
      debug('------>open gateway account for:', ga.address)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: verify records were created in table gateway_accounts
  })


  test('test negative gateway openAccount', async () => {
    debug('Into negative gateway openAccount test ...')
    const expectedError = 'Account already opened'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 400,
      fee: 10000000000,
      args: ['bitcoin'],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('vefiry gateway deposit', async () => {
    debug('Into verify gateway deposit test ...')
    trs = {
      secret: config.bitcoinValidators[0].aschAccount.secret,
      type: 402,
      fee: 1000000,
      args: [
        'bitcoin',
        '2N1DLUt9S1Dd9jetmekKsD6cE7USTQvD6t3',
        'BTC',
        '123456789',
        'ABCDEFGH'.repeat(8),
      ],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: verify records were created in table gateway_deposits
  })

  test('test negative gateway deposit', async () => {
    debug('Into negative gateway deposit test ...')
    const expectedError = 'Permission denied'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 402,
      fee: 1000000,
      args: [
        'bitcoin',
        config.gatewayAccounts[0].address,
        'BTC',
        '123456789',
        'ABCDEFGH'.repeat(8),
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('vefiry gateway withdrawal', async () => {
    debug('Into verify gateway withdrawal test ...')
    // deposit twice to add confirmation
    trs = {
      secret: config.bitcoinValidators[1].aschAccount.secret,
      type: 402,
      fee: 1000000,
      args: [
        'bitcoin',
        '2N1DLUt9S1Dd9jetmekKsD6cE7USTQvD6t3',
        'BTC',
        '123456789',
        'ABCDEFGH'.repeat(8),
      ],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 403,
      fee: 1000000,
      args: [
        '2N1DLUt9S1Dd9jetmekKsD6cE7USTQvD6t3',
        'bitcoin',
        'BTC',
        '100000000',
        '100',
      ],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()
  })


  test('test negative gateway withdrawal', async () => {
    debug('Into negative gateway withdrawal test ...')
    const expectedError = 'Invalid withdrawal address'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 403,
      fee: 1000000,
      args: [
        '2N1DLUt9S1Dd9jetmekKsD6cE7USTQvD6t31',
        'bitcoin',
        'BTC',
        '200',
        '100',
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('test negative gateway submitWithdrawalTransaction', async () => {
    debug('Into negative gateway submitWithdrawalTransaction test ...')
    const expectedError = 'Gateway withdrawal not exist'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 404,
      fee: 1000000,
      args: [
        'e37ce7186912ba5f19cd6c239c7638ba3081b1bff576846c17effa970db66d88',
        config.gatewayAccounts[0].address,
        'ABCDEFGH'.repeat(8),
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('test negative gateway submitWithdrawalSignature', async () => {
    debug('Into negative gateway submitWithdrawalSignature test ...')
    const expectedError = 'Gateway withdrawal not exist'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 405,
      fee: 1000000,
      args: [
        '1c52d74cc468066ebff00079fdaf1a4447da843da8b84d5d4ff7e49a099abcde',
        'ABCDEFGH'.repeat(8),
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('test negative gateway submitOutTransactionId', async () => {
    debug('Into negative gateway submitOutTransactionId test ...')
    const expectedError = 'Invalid out transaciton id'
    trs = {
      secret: config.gatewayAccounts[0].secret,
      type: 406,
      fee: 1000000,
      args: [
        '1c52d74cc468066ebff00079fdaf1a4447da843da8b84d5d4ff7e49a099f356e',
        '',
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })
})
