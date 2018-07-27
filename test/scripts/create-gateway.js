const lib = require('../lib')

async function registerGateway(params, account) {
  const trs = {
    secret: account.secret,
    type: 300,
    fee: 1000000000,
    args: [
      params.title,
      params.desc,
      params.topic,
      params.content,
      10000,
    ],
  }
  const res = (await lib.transactionUnsignedAsync(trs))
  console.log('register gateway result:', res.body)
  await lib.onNewBlockAsync()
  return res.body.transactionId
}

async function voteProposal(tid, delegates) {
  for (const d of delegates) {
    const trs = {
      secret: d.secret,
      type: 301,
      fee: 10000000,
      args: [tid],
    }
    console.log('vote proposal:', tid)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  const trs = {
    secret: delegates[0].secret,
    type: 302,
    fee: 0,
    args: [tid],
  }
  console.log('activate proposal:', tid)
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()
}

async function registerValidators(validators) {
  for (const validator of validators) {
    const trs = {
      secret: validator.innerAccount.secret,
      type: 2,
      fee: 10000000000,
      args: [validator.name],
    }
    console.log('set name for gateway validator:', validator.innerAccount.address)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()

  for (const validator of validators) {
    const trs = {
      secret: validator.innerAccount.secret,
      type: 401,
      fee: 10000000000,
      args: [
        'bitcoincash',
        validator.outerAccount.publicKey,
        'Validator description of bitcoincash gateway',
      ],
    }
    console.log('register validator:', validator.innerAccount.address)
    await lib.transactionUnsignedAsync(trs)
  }
  await lib.onNewBlockAsync()
}

async function initGateway(params, account) {
  const trs = {
    secret: account.secret,
    type: 300,
    fee: 1000000000,
    args: [
      params.title,
      params.desc,
      params.topic,
      params.content,
      10000,
    ],
  }
  const res = await lib.transactionUnsignedAsync(trs)
  console.log('init gateway result:', res.body)
  await lib.onNewBlockAsync()
  return res.body.transactionId
}

async function openGatewayAccount(account) {
  const trs = {
    secret: account.secret,
    type: 400,
    fee: 10000000000,
    args: ['bitcoincash'],
  }
  console.log('open gateway account for:', account.address)
  await lib.transactionUnsignedAsync(trs)
}

async function main() {
  // const gatewayConfigFile = process.argv[2]
  const GC = require('./gateway-config')

  const delegates = []
  console.log('init delegate accounts ...')
  for (const secret of lib.config.forging.secret) {
    delegates.push(lib.getNormalAccount(secret))
  }

  const addresses = GC.validators.map(v => v.innerAccount.address)
    .concat(GC.gatewayAccounts.map(a => a.address))
    .concat(delegates.map(d => d.address))
  console.log(`give money to ${addresses.length} accounts`)
  await lib.giveMoneyAndWaitAsync(addresses)

  const registerTid = await registerGateway(GC.registerProposal, lib.GENESIS_ACCOUNT)

  await voteProposal(registerTid, delegates)

  await registerValidators(GC.validators)

  const initTid = await initGateway(GC.initProposal, lib.GENESIS_ACCOUNT)
  await voteProposal(initTid, delegates)

  for (const a of GC.gatewayAccounts) {
    await openGatewayAccount(a)
  }
  for (const v of GC.validators) {
    await openGatewayAccount(v.innerAccount)
  }
  await lib.onNewBlockAsync()
}

main().catch(console.error)
