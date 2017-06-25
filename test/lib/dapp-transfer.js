let crypto = require('crypto')
let bignum = require('bignumber')
let extend = require('extend')
let node = require('./../variables.js')
let DEBUG = require('debug')('dapp-transfer')
let expect = node.expect

let DAPP_TEMPLATE = {
  "name": "asch-hello-dapp",
  "link": "https://github.com/sqfasd/asch-hello-dapp/archive/master.zip",
  "category": 1,
  "description": "A hello world demo for asch dapp",
  "tags": "asch,dapp,demo",
  "icon": "http://o7dyh3w0x.bkt.clouddn.com/hello.png",
  "type": 0
}

function genNormalAccounts(n) {
  let accounts = []
  for (let i = 0; i < n; ++i) {
    accounts.push(node.genNormalAccount())
  }
  return accounts
}

async function registerDAppAsync(options, account) {
  let res = await node.submitTransactionAsync(node.asch.dapp.createDApp(options, account.password))
  DEBUG('register dapp response', res.body)
  return res
}

async function inTransferAsync(options, account) {
  let res = await node.submitTransactionAsync(node.asch.transfer.createInTransfer(options.dappId, options.currency, options.amount, account.password))
  DEBUG('in transfer response', res.body)
  return res
}

async function outTransferAsync(options, account) {
  let trs = node.asch.transfer.createOutTransfer(options.recipientId, options.dappId, options.transactionId, options.currency, options.amount, account.password)
  let res = await node.submitTransactionAsync(trs)
  DEBUG('out transfer response', res.body)
  return res
}

async function getAssetBalanceAsync(address, currency) {
  let res = await node.apiGetAsync('/uia/balances/' + address + '/' + currency)
  DEBUG('get asset balance response', res.body)
  expect(res.body.balance.currency).to.equal(currency)
  return res.body.balance.balance
}

async function getDAppBalanceAsync(dappId, currency) {
  let res = await node.apiGetAsync('/dapps/balances/' + dappId + '/' + currency)
  DEBUG('get dapp balance response', res.body)
  expect(res.body).to.have.property('success').to.be.true
  return res.body.balance.balance
}

describe('dapp transfer', function () {
  let delegateAccounts = genNormalAccounts(5)
  let publicKeys = delegateAccounts.map((a) => {
    return a.publicKey
  })
  let dapp = extend(true, { delegates: publicKeys, unlockDelegates: 3 }, DAPP_TEMPLATE)
  dapp.name = node.randomUsername()
  dapp.link = dapp.link.replace('sqfasd', node.randomUsername())
  let dappId = ''

  let issuerName = node.randomIssuerName()
  let assetName = 'CNY'

  it('should fail to register dapp with invalid params', async () => {
    let dapp1 = extend(true, {}, dapp)
    dapp1.delegates.push(dapp1.delegates[0])
    let res = await registerDAppAsync(dapp1, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

    let dapp2 = extend(true, {}, dapp)
    dapp2.delegates[0] = dapp2.delegates[0].slice(1)
    res = await registerDAppAsync(dapp2, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid dapp delegates format/)

    let dapp3 = extend(true, {}, dapp)
    dapp3.delegates = []
    res = await registerDAppAsync(dapp3, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid dapp delegates/)

    let dapp4 = extend(true, {}, dapp)
    dapp4.delegates.pop()
    res = await registerDAppAsync(dapp4, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid dapp delegates/)

    let dapp5 = extend(true, {}, dapp)
    dapp5.unlockDelegates = 102
    res = await registerDAppAsync(dapp5, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

    let dapp6 = extend(true, {}, dapp)
    dapp6.unlockDelegates = dapp6.delegates.length + 1
    res = await registerDAppAsync(dapp6, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid unlock delegates number/)

    let dapp7 = extend(true, {}, dapp)
    dapp7.unlockDelegates = 2
    res = await registerDAppAsync(dapp7, node.Gaccount)
    expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
  })

  it('should be ok to register dapp with valid params', async () => {
    let res = await registerDAppAsync(dapp, node.Gaccount)
    expect(res.body).to.have.property('success').to.be.true
    dappId = res.body.transactionId
    await node.onNewBlockAsync()
  })

  it('should be ok to transfer XAS to an app', async () => {
    let account = node.genNormalAccount()
    await node.giveMoneyAndWaitAsync([account.address])

    let res = await node.apiGetAsync('/accounts/getBalance?address=' + account.address)
    expect(res.body).to.have.property('success').to.be.true
    let balance1 = res.body.balance
    let options = {
      dappId: dappId,
      currency: 'XAS',
      amount: 100000000
    }
    res = await inTransferAsync(options, account)
    expect(res.body).to.have.property('success').to.be.true

    await node.onNewBlockAsync()

    res = await node.apiGetAsync('/accounts/getBalance?address=' + account.address)
    expect(res.body).to.have.property('success').to.be.true
    let balance2 = res.body.balance

    expect(balance1 - options.amount - node.Fees.transactionFee).to.equal(balance2)

    res = await node.apiGetAsync('/dapps/balances/' + dappId + '/XAS')
    DEBUG('get dapp balance response', res.body)
    expect(res.body).to.have.property('success').to.be.true
    let dappBalance = res.body.balance.balance
    expect(dappBalance).to.equal(String(options.amount))
  })

  it('should be ok to transfer assets to an app', async () => {
    let account = node.genNormalAccount()
    await node.giveMoneyAndWaitAsync([account.address])

    let currency = issuerName + '.' + assetName
    let maximum = '10000000000'
    let issueAmount = '1000000000'
    let res = await node.submitTransactionAsync(node.asch.uia.createIssuer(issuerName, 'issuer desc', account.password))
    expect(res.body).to.have.property('success').to.be.true
    await node.onNewBlockAsync()

    let trs = node.asch.uia.createAsset(
      currency,
      'asset desc',
      maximum,
      6,
      '',
      1, 1, 1,
      account.password)
    res = await node.submitTransactionAsync(trs)
    expect(res.body).to.have.property('success').to.be.true
    await node.onNewBlockAsync()

    res = await node.submitTransactionAsync(node.asch.uia.createIssue(currency, issueAmount, account.password))
    expect(res.body).to.have.property('success').to.be.true
    await node.onNewBlockAsync()

    let balance1 = await getAssetBalanceAsync(account.address, currency)
    expect(balance1).to.equal(issueAmount)

    let transferOptions = {
      dappId: dappId,
      currency: currency,
      amount: '100000000'
    }
    res = await inTransferAsync(transferOptions, account)
    expect(res.body).to.have.property('success').to.be.true

    await node.onNewBlockAsync()

    let balance2 = await getAssetBalanceAsync(account.address, currency)

    expect(bignum(balance1).sub(transferOptions.amount).toString()).to.equal(balance2)

    res = await node.apiGetAsync('/dapps/balances/' + dappId + '/' + currency)
    DEBUG('get dapp balance response', res.body)
    expect(res.body).to.have.property('success').to.be.true
    let dappBalance = res.body.balance.balance
    expect(dappBalance).to.equal(String(transferOptions.amount))
  })

  it('should be failed to transfer from app to account with invalid params', async () => {
    let recipientAccount = node.genNormalAccount()
    let dappBalance = await getDAppBalanceAsync(dappId, 'XAS')
    let transferOptions = {
      recipientId: recipientAccount.address,
      dappId: dappId,
      transactionId: node.randomTid(),
      currency: 'XAS',
      amount: bignum(dappBalance).plus(1).toString()
    }
    let res = await outTransferAsync(transferOptions, recipientAccount)
    expect(res.body).to.have.property('error').to.match(/^Sender must be dapp delegate/)

    let trs = node.asch.transfer.createOutTransfer(recipientAccount.address, dappId, node.randomTid(), 'XAS', '1', delegateAccounts[0].password)
    res = await node.submitTransactionAsync(trs)
    DEBUG('submit out transfer response', res.body)
    expect(res.body).to.have.property('error').to.match(/^Invalid signature number/)

    trs.signatures = []
    for (let i = 0; i < delegateAccounts.length; ++i) {
      trs.signatures.push(node.asch.transfer.signOutTransfer(trs, delegateAccounts[i].password))
    }
    trs.signatures.push(node.asch.transfer.signOutTransfer(trs, recipientAccount.password))
    res = await node.submitTransactionAsync(trs)
    DEBUG('submito out transfer response', res.body)
    expect(res.body).to.have.property('error').to.match(/^Invalid signature number/)
    
    trs.signatures = []
    for (let i = 0; i < dapp.unlockDelegates; ++i) {
      trs.signatures.push(node.asch.transfer.signOutTransfer(trs, node.genNormalAccount().password))
    }
    res =await node.submitTransactionAsync(trs)
    DEBUG('submit out transfer response', res.body)
    expect(res.body).to.have.property('error').to.match(/^Valid signatures not enough/)
  })

  it('should be ok to transfer XAS from app to account', async () => {
    let recipientAccount = node.genNormalAccount()
    let amount = '10000000'
    let dappBalance1 = await getDAppBalanceAsync(dappId, 'XAS')
    let trs = node.asch.transfer.createOutTransfer(recipientAccount.address, dappId, node.randomTid(), 'XAS', amount, delegateAccounts[0].password)
    trs.signatures = []
    for (let i = 0; i < dapp.unlockDelegates; ++i) {
      trs.signatures.push(node.asch.transfer.signOutTransfer(trs, delegateAccounts[i].password))
    }
    let res = await node.submitTransactionAsync(trs)
    DEBUG('submit out transfer response', res.body)
    expect(res.body).to.have.property('success').to.be.true

    await node.onNewBlockAsync()

    let dappBalance2 = await getDAppBalanceAsync(dappId, 'XAS')
    expect(bignum(dappBalance1).sub(amount).sub(node.Fees.transactionFee).toString()).to.equal(dappBalance2)

    res = await node.apiGetAsync('/accounts/getBalance?address=' + recipientAccount.address)
    expect(res.body).to.have.property('success').to.be.true
    let recipientBalance = res.body.balance
    expect(String(recipientBalance)).to.equal(amount)
  })

  it('should be ok to transfer assets from app to account', async () => {
    let recipientAccount = node.genNormalAccount()
    let currency = issuerName + '.' + assetName
    let amount = '10000000'
    let dappBalance1 = await getDAppBalanceAsync(dappId, currency)
    let dappXasBalance1 = await getDAppBalanceAsync(dappId, 'XAS')
    let trs = node.asch.transfer.createOutTransfer(recipientAccount.address, dappId, node.randomTid(), currency, amount, delegateAccounts[0].password)
    trs.signatures = []
    for (let i = 0; i < dapp.unlockDelegates; ++i) {
      trs.signatures.push(node.asch.transfer.signOutTransfer(trs, delegateAccounts[i].password))
    }
    let res = await node.submitTransactionAsync(trs)
    DEBUG('submit out transfer response', res.body)
    expect(res.body).to.have.property('success').to.be.true

    await node.onNewBlockAsync()

    let dappBalance2 = await getDAppBalanceAsync(dappId, currency)
    let dappXasBalance2 = await getDAppBalanceAsync(dappId, 'XAS')
    expect(bignum(dappBalance1).sub(amount).toString()).to.equal(dappBalance2)
    expect(bignum(dappXasBalance1).sub(node.Fees.transactionFee).toString()).to.equal(dappXasBalance2)

    res = await node.apiGetAsync('/accounts/getBalance?address=' + recipientAccount.address)
    expect(res.body).to.have.property('success').to.be.true
    let recipientBalance = await getAssetBalanceAsync(recipientAccount.address, currency)
    expect(String(recipientBalance)).to.equal(amount)
  })
})