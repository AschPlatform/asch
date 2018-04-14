let node = require('../variables.js')
let config = require('./config.js')

let gDelegates = []

async function initDelegates() {
  console.log('init delegate accounts ...')
  for (let secret of node.config.forging.secret) {
    gDelegates.push(node.genNormalAccount(secret))
  }
  let allDelegates = (await node.apiGetAsync('/delegates?limit=101')).body.delegates

  let addressMap = new Map()
  for (let d of allDelegates) {
    addressMap.set(d.address, d)
  }
  for (let d of gDelegates) {
    d.name = addressMap.get(d.address).name
  }
}

async function sendMoneyToAccounts() {
  let addresses = gDelegates.map((d) => d.address)
  for (let i of config.issuers) {
    addresses.push(i.account.address)
  }
  for (let i of config.agents) {
    addresses.push(i.address)
    for (let j of i.clienteles) {
      addresses.push(j.address)
    }
  }
  for (let i of config.bitcoinValidators) {
    addresses.push(i.aschAccount.address)
  }
  for (let i of config.proposals) {
    addresses.push(i.account.address)
  }
  for (let i of config.gatewayAccounts) {
    addresses.push(i.address)
  }
  console.log('send money to ' + addresses.length + ' accounts')
  await node.giveMoneyAndWaitAsync(addresses)
}

async function init() {
  await initDelegates()
  await sendMoneyToAccounts()
}

async function testUIA() {
  for (let issuer of config.issuers) {
    let trs = {
      secret: issuer.account.secret,
      type: 100,
      fee: 10000000,
      args: [issuer.name, issuer.desc],
    }
    console.log('register issuer:', issuer.name)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()
  for (let issuer of config.issuers) {
    for (let asset of issuer.assets) {
      let trs = {
        secret: issuer.account.secret,
        type: 101,
        fee: 10000000,
        args: [
          asset.name,
          asset.desc,
          asset.maximum,
          asset.precision
        ]
      }
      console.log('register asset:', asset.name)
      await node.transactionUnsignedAsync(trs)
    }
  }
  await node.onNewBlockAsync()
  for (let issuer of config.issuers) {
    for (let asset of issuer.assets) {
      let trs = {
        secret: issuer.account.secret,
        type: 102,
        fee: 10000000,
        args: [
          issuer.name + '.' + asset.name,
          asset.issueAmount
        ]
      }
      console.log('issue asset:', asset.name)
      await node.transactionUnsignedAsync(trs)
    }
  }
  await node.onNewBlockAsync()
  for (let issuer of config.issuers) {
    for (let asset of issuer.assets) {
      let trs = {
        secret: issuer.account.secret,
        type: 103,
        fee: 10000000,
        args: [
          issuer.name + '.' + asset.name,
          '100000',
          config.agents[0].address
        ]
      }
      console.log('transfer asset:', asset.name)
      await node.transactionUnsignedAsync(trs)
    }
  }
  await node.onNewBlockAsync()
}

async function testAgent() {
  for (let agent of config.agents) {
    let trs = {
      secret: agent.secret,
      type: 2,
      fee: 10000000,
      args: [agent.name]
    }
    console.log('set agent name:', agent.name)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()

  for (let agent of config.agents) {
    let trs = {
      secret: agent.secret,
      type: 7,
      fee: 10000000,
      args: []
    }
    console.log('register agent:', agent.name)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()

  for (let agent of config.agents) {
    for (let clientele of agent.clienteles) {
      let balance = (await node.apiGetAsync('/v2/accounts/' + clientele.address)).body.account.xas
      let trs = {
        secret: clientele.secret,
        type: 4,
        fee: 10000000,
        args: [balance, 10000]
      }
      console.log('lock clientele:', clientele.address)
      await node.transactionUnsignedAsync(trs)
    }
  }
  await node.onNewBlockAsync()

  for (let agent of config.agents) {
    for (let clientele of agent.clienteles) {
      let trs = {
        secret: clientele.secret,
        type: 8,
        fee: 10000000,
        args: [agent.name]
      }
      console.log('set agent for:', clientele.address)
      await node.transactionUnsignedAsync(trs)
    }
  }
  await node.onNewBlockAsync()
}

async function testGateway() {
  let trs = {
    secret: config.proposals[0].account.secret,
    type: 300,
    fee: 10000000,
    args: [
      config.proposals[0].title,
      config.proposals[0].desc,
      config.proposals[0].topic,
      config.proposals[0].content,
      10000
    ]
  }
  console.log('submit proposal:', config.proposals[0].title)
  let proposalId = (await node.transactionUnsignedAsync(trs)).body.transactionId
  await node.onNewBlockAsync()

  for (let d of gDelegates) {
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId]
    }
    console.log('vote for proposal:', proposalId, config.proposals[0].title, 'by', d.name)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()

  trs = {
    secret: gDelegates[0].secret,
    type: 302,
    fee: 10000000,
    args: [proposalId]
  }
  console.log('activate proposal:', config.proposals[0].title)
  await node.transactionUnsignedAsync(trs)
  await node.onNewBlockAsync()

  trs = {
    secret: config.proposals[1].account.secret,
    type: 300,
    fee: 10000000,
    args: [
      config.proposals[1].title,
      config.proposals[1].desc,
      config.proposals[1].topic,
      config.proposals[1].content,
      100
    ]
  }
  console.log('submit proposal: ', config.proposals[1].title)
  proposalId = (await node.transactionUnsignedAsync(trs)).body.transactionId
  await node.onNewBlockAsync()

  for (let validator of config.bitcoinValidators) {
    trs = {
      secret: validator.aschAccount.secret,
      type: 401,
      fee: 10000000,
      args: [
        'bitcoin',
        validator.bitcoinAccount.publicKey,
        'Validator description of bitcoin gateway'
      ]
    }
    console.log('register gateway validator:', validator.aschAccount.address)
    await node.transactionUnsignedAsync(trs)
  }

  for (let i = 0; i < 10; ++i) {
    let d = gDelegates[i]
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId]
    }
    console.log('vote for proposal:', proposalId, config.proposals[1].title, 'by', d.name)
    await node.transactionUnsignedAsync(trs)
  }

  trs = {
    secret: config.proposals[2].account.secret,
    type: 300,
    fee: 10000000,
    args: [
      config.proposals[2].title,
      config.proposals[2].desc,
      config.proposals[2].topic,
      config.proposals[2].content,
      10000
    ]
  }
  console.log('submit proposal: ', config.proposals[2].title)
  proposalId = (await node.transactionUnsignedAsync(trs)).body.transactionId
  await node.onNewBlockAsync()

  for (let d of gDelegates) {
    trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [proposalId]
    }
    console.log('vote for proposal:', proposalId, config.proposals[2].title, 'by', d.name)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()

  trs = {
    secret: gDelegates[0].secret,
    type: 302,
    fee: 10000000,
    args: [proposalId]
  }
  console.log('activate proposal:', config.proposals[2].title)
  await node.transactionUnsignedAsync(trs)
  await node.onNewBlockAsync()

  for (let ga of config.gatewayAccounts) {
    trs = {
      secret: ga.secret,
      type: 400,
      fee: 10000000,
      args: ['bitcoin']
    }
    console.log('open gateway account for:', ga.address)
    await node.transactionUnsignedAsync(trs)
  }
  await node.onNewBlockAsync()
}

async function main() {
  await init()
  await testUIA()
  await testAgent()
  await testGateway()
}

(async function () {
  try {
    await main()
  } catch (e) {
    console.log(e)
  }
})()