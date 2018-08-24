const debug = require('debug')('BASIC')
const config = require('../../smoke/config')
const lib = require('../../lib')

const group = config.testGroup
let tid
let groupAccount
const groupAddress = lib.generateGroupAddress(group.name)

jest.setTimeout(1000000)

describe('group test', () => {
  test('verify registerGroup', async () => {
    debug('Into verify registerGroup test ...')
    const members = []
    for (const m of group.members) {
      members.push({ address: m.address, weight: 1 })
    }
    const trs = {
      secret: lib.GENESIS_ACCOUNT.secret,
      type: 6,
      fee: 500000000,
      args: [
        group.name,
        members,
        group.min,
        group.max,
        group.m,
        group.updateInterval,
      ],
    }
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: Verify account was created in table accounts.
    // The address was generated from name, should use util.address.generateGroupAddress
    // TODO: Verify group was created in table groups.
    // TODO: Verify group member was created in table group_members.
  })


  test('verify negative registerGroup', async () => {
    debug('Into negative registerGroup test ...')
    const expectedError = 'Min should be greater than 3'
    const members = []
    for (const m of group.members) {
      members.push({ address: m.address, weight: 1 })
    }
    const trs = {
      secret: lib.GENESIS_ACCOUNT.secret,
      type: 6,
      fee: 500000000,
      args: [
        group.name,
        members,
        2,
        group.max,
        group.m,
        group.updateInterval,
      ],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('Prepare data for proposal test', async () => {
    const amount = 30000000000
    trs = {
      secret: lib.GENESIS_ACCOUNT.secret,
      fee: 10000000,
      type: 1,
      args: [amount, group.name],
    }
    await lib.transactionUnsignedAsync(trs)
    for (const member of group.members) {
      trs = {
        secret: lib.GENESIS_ACCOUNT.secret,
        fee: 10000000,
        type: 1,
        args: [amount, member.address],
      }
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()
  })


  test('verify group vote', async () => {
    debug('Into verify group vote ...')
    // request group transaction
    groupAccount = (await lib.apiGetAsync(`/v2/accounts/${group.name}`)).body.account
    trs = {
      secret: group.members[0].secret,
      type: 1,
      fee: 20000000,
      senderId: groupAccount.address,
      args: [
        11230,
        group.members[1].address,
      ],
      mode: 1,
    }

    tid = (await lib.transactionUnsignedAsync(trs)).body.transactionId
    await lib.onNewBlockAsync()

    // vote for group transaction
    for (let i = 0; i < 3; ++i) {
      const member = group.members[i]
      trs = {
        secret: member.secret,
        type: 500,
        fee: 0,
        args: [tid],
      }
      debug(`--->group member ${member.address} vote for transaction: ${tid}`)
      await lib.transactionUnsignedAsync(trs)
    }
    await lib.onNewBlockAsync()

    // TODO: verify record was created in table group_votes
  })


  test('verify negative group vote', async () => {
    debug('Into negative group vote test ...')
    const expectedError = 'Request transaction not found'
    const member = group.members[0]
    trs = {
      secret: member.secret,
      type: 500,
      fee: 0,
      args: ['abcd'],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify group activate', async () => {
    debug('Into verify group activate ...')
    const member = group.members[0]
    trs = {
      secret: member.secret,
      type: 501,
      fee: 0,
      args: [tid],
    }
    debug(`--->activate group transaction: ${tid}`)
    await lib.transactionUnsignedAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: verify results
  })


  test('verify negative group activate', async () => {
    debug('Into negative group activate test ...')
    const expectedError = 'Request transaction not found'
    const member = group.members[0]
    trs = {
      secret: member.secret,
      type: 501,
      fee: 0,
      args: ['abcd'],
    }
    const error = await lib.failTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify group addMember', async () => {
    debug('Into verify group addMember ...')
    trs = lib.AschJS.transaction.createMultiSigTransaction({
      type: 502,
      fee: 100000000,
      senderId: groupAddress,
      args: [group.newMembers[0].address, 1, 4],
    })
    trs.signatures = []
    for (let i = 0; i < 3; i++) {
      trs.signatures.push(lib.AschJS.transaction
        .signMultiSigTransaction(trs, group.members[i].secret))
    }
    await lib.submitTransactionAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: verify record was created in table group_members
  })


  test('verify negative group addMember', async () => {
    debug('Into negative group addMember test ...')
    const expectedError = 'Signature weight not enough'
    trs = lib.AschJS.transaction.createMultiSigTransaction({
      type: 502,
      fee: 100000000,
      senderId: groupAddress,
      args: [group.newMembers[0].address, 1, 4],
    })
    trs.signatures = []
    for (let i = 0; i < 3; i++) {
      trs.signatures.push(lib.AschJS.transaction
        .signMultiSigTransaction(trs, group.members[i].secret))
    }
    const error = await lib.failSubmitTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })


  test('verify group removeMember', async () => {
    debug('Into verify group removeMember ...')
    trs = lib.AschJS.transaction.createMultiSigTransaction({
      type: 503,
      fee: 100000000,
      senderId: groupAddress,
      args: [
        group.newMembers[0].address,
        group.m - 1,
      ],
    })
    trs.signatures = []
    for (let i = 0; i < 4; i++) {
      trs.signatures.push(lib.AschJS.transaction
        .signMultiSigTransaction(trs, group.members[i].secret))
    }
    debug(`--->remove group member: ${group.newMembers[0].address}`)
    await lib.submitTransactionAsync(trs)
    await lib.onNewBlockAsync()

    // TODO: verify record was deleted in table group_members
  })


  test('verify negative group removeMember', async () => {
    debug('Into negative group removeMember test ...')
    const expectedError = 'Not a group member'
    trs = lib.AschJS.transaction.createMultiSigTransaction({
      type: 503,
      fee: 100000000,
      senderId: groupAddress,
      args: [
        group.newMembers[1].address,
        group.m - 1,
      ],
    })
    trs.signatures = []
    for (let i = 0; i < 4; i++) {
      trs.signatures.push(lib.AschJS.transaction
        .signMultiSigTransaction(trs, group.members[i].secret))
    }
    const error = await lib.failSubmitTransaction(trs)
    debug(`--->Actual error is '${error}', expected error is '${expectedError}'`)
    expect(error).toMatch(new RegExp(expectedError))
  })
})
