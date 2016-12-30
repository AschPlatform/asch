var crypto = require('crypto')
var bignum = require('bignumber')
var node = require('./../variables.js')
var DEBUG = require('debug')('uia')
var expect = node.expect

var ISSUER1 = {
  name: 'issuer1_name',
  desc: 'issuer1_desc'
}

var ASSET1 = {
  name: 'BTC',
  desc: 'asset1_desc',
  maximum: '10000000000000',
  precision: 6,
  strategy: ''
}

async function registerIssuerAsync(name, desc, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createIssuer(name, desc, account.password))
  DEBUG('register issuer response', res.body)
  return res
}

async function registerAssetAsync(name, desc, maximum, precision, strategy, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createAsset(name, desc, maximum, precision, strategy, account.password))
  DEBUG('register asset response', res.body)
  return res
}

describe('Test UIA', () => {

  describe('Normal caces', () => {
    it('Get issuers should be ok', async function () {
      var [err, res] = await node.apiGetAsyncE('/uia/issuers')
      DEBUG('get /uia/issuers response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.count).to.be.a('number')
      expect(res.body.issuers).to.be.instanceOf(Array)
    })

    it('Register issuer should be ok', async function () {
      var trs = node.asch.uia.createIssuer(ISSUER1.name, ISSUER1.desc, node.Gaccount.password)
      DEBUG('create issuer trs', trs)
      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('submit issuer response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      var [err, res] = await node.apiGetAsyncE('/uia/issuers/' + ISSUER1.name)
      DEBUG('get /uia/issuers/:name response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('issuer')
      expect(res.body.issuer.name).to.equal(ISSUER1.name)
      expect(res.body.issuer.issuerId).to.equal(node.Gaccount.address)
    })

    it('Register asset should be ok', async function () {
      var currency = ISSUER1.name + '.' + ASSET1.name
      var trs = node.asch.uia.createAsset(
        currency,
        ASSET1.desc,
        ASSET1.maximum,
        ASSET1.precision,
        ASSET1.strategy,
        node.Gaccount.password)
      DEBUG('create asset trs', trs)

      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('submit asset response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      var [err, res] = await node.apiGetAsyncE('/uia/issuers/' + ISSUER1.name + '/assets')
      DEBUG('get /uia/issuers/:name/assets response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.count).to.be.a('number')
      expect(res.body.assets).to.be.instanceOf(Array)

      var [err, res] = await node.apiGetAsyncE('/uia/assets/' + currency)
      DEBUG('get /uia/assets/:name response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.asset.name).to.equal(currency)
      expect(res.body.asset.desc).to.equal(ASSET1.desc)
      expect(res.body.asset.maximum).to.equal(ASSET1.maxmimum)
      expect(res.body.asset.precision).to.equal(ASSET1.precision)
      expect(res.body.asset.issuerId).to.equal(node.Gaccount.address)
      expect(res.body.asset.quantity).to.equal('0')
      expect(res.body.asset.acl).to.equal(0)
      expect(res.body.asset.writeoff).to.equal(0)
    })

    it('Issue and transfer asset should be ok', async function () {
      var currency = ISSUER1.name + '.' + ASSET1.name
      var transferAddress = '12345'

      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + node.Gaccount.address)
      DEBUG('get issuer balance before issue response', err, res.body)
      expect(err).to.not.exist

      var issuerBalance = res.body.balances[0].balance

      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + transferAddress)
      DEBUG('get recipient balance before issue response', err, res.body)
      expect(err).to.not.exist

      var recipientBalance = res.body.balances[0].balance

      var [err, res] = await node.apiGetAsyncE('/uia/assets/' + currency)
      DEBUG('get asset before issue response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.asset.name).to.equal(currency)

      var quantity = res.body.asset.quantity

      var amount = '10000000000'
      var trs = node.asch.uia.createIssue(currency, amount, node.Gaccount.password)
      DEBUG('create issue trs', trs)

      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('submit issue response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      issuerBalance = bignum(issuerBalance).plus(amount).toString()
      quantity = bignum(quantity).plus(amount).toString()

      var [err, res] = await node.apiGetAsyncE('/uia/assets/' + currency)
      DEBUG('get asset after issue response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.asset.name).to.equal(currency)
      expect(res.body.asset.quantity).to.equal(quantity)

      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + node.Gaccount.address)
      DEBUG('get issuer balance after issue response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.count).to.be.a('number')
      expect(res.body.balances).to.be.instanceOf(Array)
      expect(res.body.balances.length).to.equal(1)
      expect(res.body.balances[0].currency).to.equal(currency)
      expect(res.body.balances[0].balance).to.equal(issuerBalance)

      var transferAmount = '10'
      trs = node.asch.uia.createTransfer(currency, transferAmount, transferAddress, node.Gaccount.password)
      DEBUG('create transfer trs', trs)
      var [err, res] = await node.submitTransactionAsyncE(trs)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsyncE()

      issuerBalance = bignum(issuerBalance).sub(transferAmount).toString()
      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + node.Gaccount.address)
      DEBUG('get issuer balance response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.count).to.be.a('number')
      expect(res.body.balances).to.be.instanceOf(Array)
      expect(res.body.balances.length).to.equal(1)
      expect(res.body.balances[0].currency).to.equal(currency)
      expect(res.body.balances[0].balance).to.equal(issuerBalance)

      recipientBalance = bignum(recipientBalance).plus(transferAmount).toString()
      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + transferAddress)
      DEBUG('get recipient balance response', err, res.body)
      expect(err).to.not.exist
      expect(res.body.count).to.be.a('number')
      expect(res.body.balances).to.be.instanceOf(Array)
      expect(res.body.balances.length).to.equal(1)
      expect(res.body.balances[0].currency).to.equal(currency)
      expect(res.body.balances[0].balance).to.equal(recipientBalance)

    })

    it('Update flags and acl should be ok', async function () {
      var currency = ISSUER1.name + '.' + ASSET1.name

      var [err, res] = await node.apiGetAsyncE('/uia/assets/' + currency)
      expect(err).to.not.exist
      expect(res.body.asset.name).to.equal(currency)
      expect(res.body.asset.acl).to.equal(0)

      // get white list before update acl
      res = await node.apiGetAsync('/uia/assets/' + currency + '/acl/1')
      expect(res.body.count).to.be.a('number')
      expect(res.body.list).to.be.instanceOf(Array)
      var origCount = res.body.count
      expect(origCount >= 0).to.be.ok

      // change to white list mode
      var trs = node.asch.uia.createFlags(currency, 1, 1, node.Gaccount.password)
      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('change flags response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true


      await node.onNewBlockAsyncE()

      var [err, res] = await node.apiGetAsyncE('/uia/assets/' + currency)
      expect(err).to.not.exist
      expect(res.body.asset.name).to.equal(currency)
      expect(res.body.asset.acl).to.equal(1)

      // add address to white list
      var account1 = node.genNormalAccount()
      var account2 = node.genNormalAccount()
      var whiteList = [account1.address, account2.address]
      trs = node.asch.uia.createAcl(currency, '+', 1, whiteList, node.Gaccount.password)
      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('update acl response', err, res.body)
      expect(err).to.not.exist
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      // get white list
      res = await node.apiGetAsync('/uia/assets/' + currency + '/acl/1')
      expect(res.body.count).to.be.a('number')
      expect(res.body.list).to.be.instanceOf(Array)
      expect(res.body.count == origCount + 2).to.be.ok

      trs = node.asch.uia.createTransfer(currency, '10', account1.address, node.Gaccount.password)
      res = await node.submitTransactionAsync(trs)
      DEBUG('transfer to account1 response', res.body)
      expect(res.body).to.have.property('success').to.be.true

      trs = node.asch.uia.createTransfer(currency, '10', account2.address, node.Gaccount.password)
      res = await node.submitTransactionAsync(trs)
      DEBUG('transfer to account2 response', res.body)
      expect(res.body).to.have.property('success').to.be.true

      trs = node.asch.uia.createTransfer(currency, '10', node.genNormalAccount().address, node.Gaccount.password)
      res = await node.submitTransactionAsync(trs)
      DEBUG('transfer to random account response', res.body)
      expect(res.body).to.have.property('success').to.be.false
      expect(res.body).to.have.property('error').to.match(/^Permission not allowed/)
    })

  })

  describe('Register issuer fail cases', () => {

    it('Invalid parameters', async function () {
      var account = node.genNormalAccount()
      var res = await registerIssuerAsync('', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerIssuerAsync('tooooooooo_long_name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerIssuerAsync('normal_name', '', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      var largeString = new Buffer(5000).toString()
      res = await registerIssuerAsync('normal_name', largeString, account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerIssuerAsync('invalid_name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid issuer name/)

      res = await registerIssuerAsync('invalid.name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid issuer name/)
    })

    it('Insufficient balance', async function () {
      var account = node.genNormalAccount()
      var res = await registerIssuerAsync('normal_name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Insufficient balance/)
    })

    it('Double submit', async function () {
      var account = node.genNormalAccount()
      var anotherAccount = node.genNormalAccount()
      await node.giveMoneyAndWaitAsync([account.address, anotherAccount.address])

      var registeredName = node.randomIssuerName()
      var res = await registerIssuerAsync(registeredName, 'normal desc', account)
      expect(res.body).to.have.property('success').to.be.true

      res = await registerIssuerAsync(node.randomIssuerName(), 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)

      res = await registerIssuerAsync(registeredName, 'normal desc', anotherAccount)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)
    })

    it('Double register', async function () {
      var account = node.genNormalAccount()
      var anotherAccount = node.genNormalAccount()
      await node.giveMoneyAndWaitAsync([account.address, anotherAccount.address])

      var registeredName = node.randomIssuerName()
      var res = await registerIssuerAsync(registeredName, 'normal desc', account)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await registerIssuerAsync(node.randomIssuerName(), 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Double register/)

      res = await registerIssuerAsync(registeredName, 'normal desc', anotherAccount)
      expect(res.body).to.have.property('error').to.match(/^Double register/)
    })
  })

  describe('Register asset fail cases', () => {
    var ISSUER_ACCOUNT = node.genNormalAccount()
    var ISSUER_NAME = node.randomIssuerName()
    var VALID_ASSET_NAME = ISSUER_NAME + '.BTC'
    var VALID_DESC = 'valid desc'
    var VALID_MAXIMUM = '10000000'
    var VALID_PRECISION = 3
    var VALID_STRATEGY = ''

    before(async function () {
      await node.giveMoneyAndWaitAsync([ISSUER_ACCOUNT.address])
    })

    it('Invalid asset name', async function () {
      var INVALID_NAME_CASES = [
        {
          error: /^Invalid transaction body/,
          cases: [
            '',
            'ab',
            '12345678901234567890123'
          ]
        },
        {
          error: /^Invalid asset full name/,
          cases: [
            'qingfeng_BTC',
            'qingfeng BTC',
            'qing.feng.BTC'
          ]
        },
        {
          error: /^Invalid asset currency name/,
          cases: [
            'qingfeng.',
            'qingfeng.B',
            'qingfeng.BT',
            'qingfeng.BTC1',
            'qingfeng.btc',
            'qingfeng.BT-C',
            'qingfeng.LONGNAME',
          ]
        }
      ]
      for (let i = 0; i < INVALID_NAME_CASES.length; ++i) {
        let error = INVALID_NAME_CASES[i].error
        for (let j = 0; j < INVALID_NAME_CASES[i].cases.length; ++j) {
          let name = INVALID_NAME_CASES[i].cases[j]
          let res = await registerAssetAsync(name, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
          DEBUG('register asset fail case', name, res.body)
          expect(res.body).to.have.property('error').to.match(error)
        }
      }
    })

    it('Invalid asset desc', async function () {
      var res = await registerAssetAsync(VALID_ASSET_NAME, '', VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      var largeDesc = new Buffer(5000).toString()
      res = await registerAssetAsync(VALID_ASSET_NAME, largeDesc, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Invalid asset maximum balance', async function () {
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '0', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset maximum range/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '-1', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset maximum range/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1e49', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset maximum range/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1000000000000000000000000000000000000000000000001', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset maximum range/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, 'invalid_number', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset maximum should be number/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1000.5', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset maximum should be integer/)
    })

    it('Invalid asset precision', async function () {
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, -1, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, 17, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Invalid asset strategy', async function () {
      var largeString = new Buffer(257).toString()
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, largeString, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Issuer not exist', async function () {
      var account = node.genNormalAccount()
      var name = node.randomIssuerName() + '.BTC'
      var res = await registerAssetAsync(name, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Issuer not exists/)
    })

    it.only('Double submit and double register', async function () {
      var account = node.genNormalAccount()
      await node.giveMoneyAndWaitAsync([account.address])

      var issuerName = node.randomIssuerName()
      var assetName = issuerName + '.BTC'
      var res = await registerIssuerAsync(issuerName, 'normal desc', account)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await registerAssetAsync(assetName, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, account)
      expect(res.body).to.have.property('success').to.be.true

      res = await registerAssetAsync(assetName, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION + 1, VALID_STRATEGY, account)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)
      await node.onNewBlockAsync()
      res = await registerAssetAsync(assetName, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, account)
      expect(res.body).to.have.property('error').to.match(/^Double register/)
    })
  })

  describe('Issue asset fail cases', () => {
  })

})
