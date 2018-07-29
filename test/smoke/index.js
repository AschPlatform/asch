
const assert = require('assert')
const lib = require('../lib.js')
const config = require('./config.js')

const gDelegates = []

async function initDelegates() {
  console.log('init delegate accounts ...')
  for (const secret of lib.config.forging.secret) {
    gDelegates.push(lib.getNormalAccount(secret))
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

async function sendMoneyToAccounts() {
  await lib.giveMoneyAsync(gDelegates[0].address, 5000000000000000)

  const addresses = gDelegates.map(d => d.address)
  for (const i of config.issuers) {
    addresses.push(i.account.address)
  }
  for (const i of config.agents) {
    addresses.push(i.address)
    for (const j of i.clienteles) {
      addresses.push(j.address)
    }
  }
  for (const i of config.bitcoinValidators) {
    addresses.push(i.aschAccount.address)
  }
  for (const i of config.proposals) {
    addresses.push(i.account.address)
  }
  for (const i of config.gatewayAccounts) {
    addresses.push(i.address)
  }
  for (const i of config.testGroup.members) {
    addresses.push(i.address)
  }
  console.log(`send money to ${addresses.length} accounts`)
  await lib.giveMoneyAndWaitAsync(addresses)
}

async function init() {
  await initDelegates()
  await sendMoneyToAccounts()
}

async function testUIA() {
  for (const issuer of config.issuers) {
    const trs = {
      secret: issuer.account.secret,
      type: 100,
      fee: 10000000000,
      args: [issuer.name, issuer.desc],
    }
    console.log('register issuer:', issuer.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()
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
      console.log('register asset:', asset.name)
      await lib.transactionUnsignedAsync(trs)
    }
  }
  await lib.onNewBlockAsync()
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
      console.log('issue asset:', asset.name)
      await lib.transactionUnsignedAsync(trs)
    }
  }
  await lib.onNewBlockAsync()
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
      console.log('transfer asset:', asset.name)
      await lib.transactionUnsignedAsync(trs)
    }
  }
  await lib.onNewBlockAsync()
}

async function testAgent() {
  for (const agent of config.agents) {
    const trs = {
      secret: agent.secret,
      type: 2,
      fee: 1000000000,
      args: [agent.name],
    }
    console.log('set agent name:', agent.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  for (const agent of config.agents) {
    const trs = {
      secret: agent.secret,
      type: 7,
      fee: 10000000000,
      args: [],
    }
    console.log('register agent:', agent.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  for (const agent of config.agents) {
    for (const clientele of agent.clienteles) {
      const uri = `/v2/accounts/${clientele.address}`
      const balance = (await lib.apiGetAsync(uri)).body.account.xas
      const trs = {
        secret: clientele.secret,
        type: 4,
        fee: 10000000,
        args: [balance, 10000],
      }
      console.log('lock clientele:', clientele.address)
      await lib.transactionUnsignedAsync(trs)
    }
  }
  await lib.onNewBlockAsync()

  for (const agent of config.agents) {
    for (const clientele of agent.clienteles) {
      const trs = {
        secret: clientele.secret,
        type: 8,
        fee: 10000000,
        args: [agent.name],
      }
      console.log('set agent for:', clientele.address)
      await lib.transactionUnsignedAsync(trs)
    }
  }
  await lib.onNewBlockAsync()
}

async function testGateway() {
  let trs = {
    secret: config.proposals[0].account.secret,
    type: 300,
    fee: 1000000000,
    args: [
      config.proposals[0].title,
      config.proposals[0].desc,
      config.proposals[0].topic,
      config.proposals[0].content,
      10000,
    ],
  }
  console.log('submit proposal:', config.proposals[0].title)
  let proposalId = (await lib.transactionUnsignedAsync(trs)).body.transactionId
  await lib.onNewBlockAsync()

  for (const d of gDelegates) {
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId],
    }
    console.log('vote for proposal:', proposalId, config.proposals[0].title, 'by', d.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  trs = {
    secret: gDelegates[0].secret,
    type: 302,
    fee: 0,
    args: [proposalId],
  }
  console.log('activate proposal:', config.proposals[0].title)
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()

  trs = {
    secret: config.proposals[1].account.secret,
    type: 300,
    fee: 1000000000,
    args: [
      config.proposals[1].title,
      config.proposals[1].desc,
      config.proposals[1].topic,
      config.proposals[1].content,
      10000,
    ],
  }
  console.log('submit proposal: ', config.proposals[1].title)
  proposalId = (await lib.transactionUnsignedAsync(trs)).body.transactionId
  await lib.onNewBlockAsync()

  for (const validator of config.bitcoinValidators) {
    trs = {
      secret: validator.aschAccount.secret,
      type: 2,
      fee: 10000000000,
      args: [validator.name],
    }
    console.log('set name for gateway validator:', validator.aschAccount.address)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

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
    console.log('register gateway validator:', validator.aschAccount.address)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  for (let i = 0; i < 10; ++i) {
    const d = gDelegates[i]
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId],
    }
    console.log('vote for proposal:', proposalId, config.proposals[1].title, 'by', d.name)
    await lib.transactionUnsignedAsync(trs)
  }

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
  console.log('submit proposal: ', config.proposals[2].title)
  proposalId = (await lib.transactionUnsignedAsync(trs)).body.transactionId
  await lib.onNewBlockAsync()

  for (const d of gDelegates) {
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId],
    }
    console.log('vote for proposal:', proposalId, config.proposals[2].title, 'by', d.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  trs = {
    secret: gDelegates[0].secret,
    type: 302,
    fee: 10000000,
    args: [proposalId],
  }
  console.log('activate proposal:', config.proposals[2].title)
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()

  for (const ga of config.gatewayAccounts) {
    trs = {
      secret: ga.secret,
      type: 400,
      fee: 10000000000,
      args: ['bitcoin'],
    }
    console.log('open gateway account for:', ga.address)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()
}

async function testChain() {
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
    console.log('register chain:', chain.name)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

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
    console.log(`deposit ${currencyFullName} to chain ${chain.name}`)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()
}

async function testGroup() {
  // step 1: register group
  const group = config.testGroup
  const members = []
  for (const m of group.members) {
    members.push({ address: m.address, weight: 1 })
  }
  let trs = {
    secret: gDelegates[0].secret,
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
  console.log(`register group: ${group.name}`)
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()

  // step 2: send money to group and the requestor account
  console.log('send money to the group and requestor account')
  await lib.giveMoneyAndWaitAsync([group.name, group.members[0].address])

  // step 3: request group transaction
  const groupAccount = (await lib.apiGetAsync(`/v2/accounts/${group.name}`)).body.account
  console.log('get group account', groupAccount)
  trs = {
    secret: group.members[0].secret,
    type: 1,
    fee: 20000000,
    senderId: groupAccount.address,
    args: [
      11230,
      group.members[1].address,
    ],
  }

  const tid = (await lib.transactionUnsignedAsync(trs)).body.transactionId
  await lib.onNewBlockAsync()

  // step 4: vote for group transaction
  for (let i = 0; i < 3; ++i) {
    const member = group.members[i]
    trs = {
      secret: member.secret,
      type: 500,
      fee: 0,
      args: [tid],
    }
    console.log(`group member ${member.address} vote for transaction: ${tid}`)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  // step 5: activate group transaction
  trs = {
    secret: group.members[0].secret,
    type: 501,
    fee: 0,
    args: [tid],
  }
  console.log(`activate group transaction: ${tid}`)
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()

  // step 6: remove group member
  trs = lib.AschJS.transaction.createMultiSigTransaction({
    type: 503,
    fee: 100000000,
    senderId: groupAccount.address,
    args: [
      group.members[0].address,
      group.m - 1,
    ],
  })
  trs.signatures = []
  for (let i = 0; i < 3; i++) {
    const sig = lib.AschJS.transaction.signMultiSigTransaction(trs, group.members[i].secret)
    trs.signatures.push(sig)
  }
  console.log(`remove group member: ${group.members[0].address}`)
  await lib.transactionAsync(trs)
  await lib.onNewBlockAsync()

  const groupInfo = (await lib.apiGetAsync(`/v2/groups/${groupAccount.address}`)).body.group
  assert(groupInfo.m === group.m - 1)
  assert(groupInfo.members.length === group.members.length - 1)
}

async function main() {
  await init()
  await testUIA()
  await testAgent()
  await testGateway()
  await testChain()
  await testGroup()
}

main().catch(console.error)
