const debug = require('debug')('BASIC')
const config = require('../../smoke/config')
const lib = require('../../lib')

jest.setTimeout(1000000)

describe('uia test', () => {
  test('Transer xas to issuers', async () => {
    const amount = 250000000000
    const f = 10000000
    for (const issuer of config.issuers) {
      const trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: f,
        type: 1,
        args: [amount, issuer.account.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()
  })


  test('verify register issuer', async () => {
    debug('Into verify register issuer test ...')
    for (const issuer of config.issuers) {
      const trs = {
        secret: issuer.account.secret,
        type: 100,
        fee: 10000000000,
        args: [issuer.name, issuer.desc],
      }
      debug('--->register issuer:', issuer.name)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: Verify records were added in table issuers
  })


  test('test negative register issuer', async () => {
    debug('Into negative register issuer test ...')
    const expectedError = 'Invalid issuer name'
    issuer = config.issuers[0]
    const trs = {
      secret: issuer.account.secret,
      type: 100,
      fee: 10000000000,
      args: ['01ChinaBank', issuer.desc],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify register asset', async () => {
    debug('Into verify register asset test ...')
    for (const issuer of config.issuers) {
      for (const asset of issuer.assets) {
        const trs = {
          secret: issuer.account.secret,
          type: 101,
          fee: 50000000000,
          args: [
            asset.name,
            asset.desc,
            asset.maximum,
            asset.precision,
          ],
        }
        debug('--->register asset:', asset.name)
        await lib.transactionUnsignedAsync(trs)
      }
    }
    await lib.onNewBlockAsync()

    // TODO: Verify corresponding records were added in table assets
  })

  test('test negative register asset', async () => {
    debug('Into negative register asset test ...')
    const expectedError = 'Invalid asset precision'
    const issuer = config.issuers[1]
    const asset = issuer.assets[0]
    const trs = {
      secret: issuer.account.secret,
      type: 101,
      fee: 50000000000,
      args: [
        asset.name,
        asset.desc,
        asset.maximum,
        17,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify issue', async () => {
    debug('Into verify issue test ...')
    for (const issuer of config.issuers) {
      for (const asset of issuer.assets) {
        const trs = {
          secret: issuer.account.secret,
          type: 102,
          fee: 10000000,
          args: [
            `${issuer.name}.${asset.name}`,
            asset.issueAmount,
          ],
        }
        debug('--->issue asset:', asset.name)
        await lib.transactionUnsignedAsync(trs)
      }
    }
    await lib.onNewBlockAsync()

    // TODO: Verify corresponding records were added in table balances
  })


  test('test negative issue', async () => {
    debug('Into negative issue test ...')
    const expectedError = 'Asset not exists'
    const issuer = config.issuers[0]
    const asset = issuer.assets[0]
    const trs = {
      secret: issuer.account.secret,
      type: 102,
      fee: 10000000,
      args: [
        `${issuer.name}.AAA`,
        asset.issueAmount,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify transfer', async () => {
    debug('Into verify transfer test ...')
    for (const issuer of config.issuers) {
      for (const asset of issuer.assets) {
        const trs = {
          secret: issuer.account.secret,
          type: 103,
          fee: 10000000,
          args: [
            `${issuer.name}.${asset.name}`,
            '100000',
            config.agents[0].address,
          ],
        }
        debug('--->transfer asset:', asset.name)
        await lib.transactionUnsignedAsync(trs)
      }
    }
    await lib.onNewBlockAsync()
  })


  test('test negative transfer', async () => {
    debug('Into negative transfer test ...')
    const expectedError = 'Invalid currency'
    const issuer = config.issuers[0]
    const trs = {
      secret: issuer.account.secret,
      type: 103,
      fee: 10000000,
      args: [
        'AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDD',
        '100000',
        config.agents[0].address,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify chain register', async () => {
    debug('============================= Chain Test =============================')
    debug('Into verify chain register test ...')
    for (const chain of config.chains) {
      const trs = {
        secret: config.issuers[0].account.secret,
        type: 200,
        fee: 10000000000,
        args: [
          chain.name,
          chain.desc,
          chain.link,
          chain.icon,
          chain.delegates,
          chain.unlockDelegates,
        ],
      }
      debug('--->register chain:', chain.name)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: Verify corresponding records were created in table accounts, chains, chain_delegates
  })


  test('test negative chain register', async () => {
    debug('Into negative chain register test ...')
    const expectedError = 'Unlock number should be greater than 3'
    const chain = config.chains[0]
    const trs = {
      secret: config.issuers[0].account.secret,
      type: 200,
      fee: 10000000000,
      args: [
        chain.name,
        chain.desc,
        chain.link,
        chain.icon,
        chain.delegates,
        2,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify chain deposit', async () => {
    debug('Into verify chain deposit test ...')
    for (const chain of config.chains) {
      const currencyFullName = `${config.issuers[0].name}.${config.issuers[0].assets[0].name}`
      const trs = {
        secret: config.issuers[0].account.secret,
        type: 204,
        fee: 10000000,
        args: [
          chain.name,
          currencyFullName,
          String(Number(config.issuers[0].assets[0].issueAmount) / 10),
        ],
      }
      debug(`--->deposit ${currencyFullName} to chain ${chain.name}`)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: check corresponding changes in table accounts, balances, deposits
  })


  test('test negative chain deposit', async () => {
    debug('Into negative chain deposit test ...')
    const expectedError = 'Insufficient balance'
    const chain = config.chains[0]
    const currencyFullName = `${config.issuers[0].name}.${config.issuers[0].assets[0].name}`
    const trs = {
      secret: config.issuers[0].account.secret,
      type: 204,
      fee: 10000000,
      args: [
        chain.name,
        currencyFullName,
        '60000000000000000',
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify chain withdrawal', async () => {
    debug('Into verify chain withdrawal test ...')
    const chain = config.chains[0]
    const currencyFullName = `${config.issuers[0].name}.${config.issuers[0].assets[0].name}`
    const trs = {
      secret: config.issuers[0].account.secret,
      type: 205,
      fee: 10000000,
      args: [
        chain.name,
        config.recipients[0].address,
        currencyFullName,
        String(Number(config.issuers[0].assets[0].issueAmount) / 20),
        'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
        1234567890,
      ],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: If currency is not XAS, check table balances. If currency is XAS, check table accounts
    // Check table withdrawals
  })


  test('test negative chain withdrawal', async () => {
    debug('Into negative chain deposit test ...')
    const expectedError = 'Invalid chain name'
    const currencyFullName = `${config.issuers[0].name}.${config.issuers[0].assets[0].name}`
    const trs = {
      secret: config.issuers[0].account.secret,
      type: 205,
      fee: 10000000,
      args: [
        '',
        config.recipients[0].address,
        currencyFullName,
        String(Number(config.issuers[0].assets[0].issueAmount) / 20),
        'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
        1234567890,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })
})
