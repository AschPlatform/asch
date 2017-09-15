var crypto = require('crypto')
var bignum = require('bignumber')
var node = require('./../variables.js')
var DEBUG = require('debug')('uia')
var expect = node.expect

async function registerIssuerAsync(name, desc, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createIssuer(name, desc, account.password))
  DEBUG('register issuer response', res.body)
  return res
}

async function registerAssetAsync(name, desc, maximum, precision, strategy, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createAsset(name, desc, maximum, precision, strategy, 1, 1, 1, account.password))
  DEBUG('register asset response', res.body)
  return res
}

async function issueAssetAsync(currency, amount, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createIssue(currency, amount, account.password))
  DEBUG('issue asset response', res.body)
  return res
}

async function writeoffAssetAsync(currency, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createFlags(currency, 2, 1, account.password))
  DEBUG('writeoff asset response', res.body)
  return res
}

async function changeFlagsAsync(currency, flagType, flag, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createFlags(currency, flagType, flag, account.password))
  DEBUG('change flags response', res.body)
  return res
}

async function changeFlagsAsync(currency, flagType, flag, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createFlags(currency, flagType, flag, account.password))
  DEBUG('change flags response', res.body)
  return res
}

async function updateAclAsync(currency, operator, flag, list, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createAcl(currency, operator, flag, list, account.password))
  DEBUG('update acl response', res.body)
  return res
}

async function transferAsync(currency, amount, recipientId, account) {
  var res = await node.submitTransactionAsync(node.asch.uia.createTransfer(currency, amount, recipientId, '', account.password))
  DEBUG('transfer asset response', res.body)
  return res
}

describe('Test UIA', () => {

  describe('Normal caces', () => {
    var ISSUER1 = {
      name: 'issuername',
      desc: 'issuer1_desc'
    }

    var ASSET1 = {
      name: 'BTC',
      desc: 'asset1_desc',
      maximum: '10000000000000',
      precision: 6,
      strategy: ''
    }

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
        1,
        1,
        1,
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
      expect(res.body.asset.maximum).to.equal(ASSET1.maximum)
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

      var issuerBalance = (res.body.balances[0] && res.body.balances[0].balance) || 0

      var [err, res] = await node.apiGetAsyncE('/uia/balances/' + transferAddress)
      DEBUG('get recipient balance before issue response', err, res.body)
      expect(err).to.not.exist

      var recipientBalance = (res.body.balances[0] && res.body.balances[0].balance) || 0

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
      trs = node.asch.uia.createTransfer(currency, transferAmount, transferAddress, '', node.Gaccount.password)
      DEBUG('create transfer trs', trs)
      var [err, res] = await node.submitTransactionAsyncE(trs)
      DEBUG('transfer asset response', err, res.body)
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

      trs = node.asch.uia.createTransfer(currency, '10', account1.address, '', node.Gaccount.password)
      res = await node.submitTransactionAsync(trs)
      DEBUG('transfer to account1 response', res.body)
      expect(res.body).to.have.property('success').to.be.true

      trs = node.asch.uia.createTransfer(currency, '10', account2.address, '', node.Gaccount.password)
      res = await node.submitTransactionAsync(trs)
      DEBUG('transfer to account2 response', res.body)
      expect(res.body).to.have.property('success').to.be.true

      trs = node.asch.uia.createTransfer(currency, '10', node.genNormalAccount().address, '', node.Gaccount.password)
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

      res = await registerIssuerAsync('normalname', '', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      var largeString = new Buffer(5000).toString()
      res = await registerIssuerAsync('normalname', largeString, account)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerIssuerAsync('invalid_name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid issuer name/)

      res = await registerIssuerAsync('invalid.name', 'normal desc', account)
      expect(res.body).to.have.property('error').to.match(/^Invalid issuer name/)
    })

    it('Insufficient balance', async function () {
      var account = node.genNormalAccount()
      var res = await registerIssuerAsync(node.randomIssuerName(), 'normal desc', account)
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

    it('Invalid asset maximum', async function () {
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '0', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '-1', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1e49', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, 'NaN', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1000000000000000000000000000000000000000000000001', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid amount range/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, 'invalid_number', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, '1000.5', VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)
    })

    it('Invalid asset precision', async function () {
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, -1, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, 17, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Invalid asset strategy', async function () {
      var largeString = new Buffer(300).toString()
      var res = await registerAssetAsync(VALID_ASSET_NAME, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, largeString, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Issuer not exist', async function () {
      var account = node.genNormalAccount()
      var name = node.randomIssuerName() + '.BTC'
      var res = await registerAssetAsync(name, VALID_DESC, VALID_MAXIMUM, VALID_PRECISION, VALID_STRATEGY, ISSUER_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Issuer not exists/)
    })

    it('Double submit and double register', async function () {
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

  describe('Parameter validate fail cases', () => {
    var ISSUE_ACCOUNT = node.genNormalAccount()
    var ASSET_NAME = 'NotExistName.BTC'

    it('should fail to issue if amount is invalid', async function () {
      var res = await issueAssetAsync(ASSET_NAME, '', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await issueAssetAsync(ASSET_NAME, '0', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await issueAssetAsync(ASSET_NAME, 'invalid_number', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)

      res = await issueAssetAsync(ASSET_NAME, '1000.5', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Amount should be integer/)
    })

    it('should fail to change flags if parameters is invalid', async function () {
      var res = await changeFlagsAsync(ASSET_NAME, -1, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset flag type/)

      res = await changeFlagsAsync(ASSET_NAME, 1, -1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset flag/)

      res = await changeFlagsAsync(ASSET_NAME, 2, -1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid asset flag/)
    })

    it('should fail to update acl if parameters is invalid', async function () {
      var validFlag = 0
      var validOperator = '+'
      var validList = [node.genNormalAccount().address]
      var res = await updateAclAsync(ASSET_NAME, '+-', validFlag, validList, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await updateAclAsync(ASSET_NAME, '|', validFlag, validList, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid acl operator/)

      res = await updateAclAsync(ASSET_NAME, validOperator, -1, validList, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid acl flag/)

      res = await updateAclAsync(ASSET_NAME, validOperator, validFlag, [], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid acl list/)

      var bigList = []
      for (let i = 0; i < 11; ++i) {
        bigList.push(node.genNormalAccount().address)
      }
      res = await updateAclAsync(ASSET_NAME, validOperator, validFlag, bigList, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid acl list/)

      var unUniqList = ['123', '123']
      res = await updateAclAsync(ASSET_NAME, validOperator, validFlag, unUniqList, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await updateAclAsync(ASSET_NAME, validOperator, validFlag, [ISSUE_ACCOUNT.address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Issuer should not be in ACL list/)

      res = await updateAclAsync(ASSET_NAME, validOperator, validFlag, ['invalid address'], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Acl contains invalid address/)
    })

    it('should fail to do anything if asset not exists', async function () {
      var notExistAssetName = 'NotExistName.CNY'
      var res = await issueAssetAsync(notExistAssetName, '1', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset not exists/)

      res = await changeFlagsAsync(notExistAssetName, 1, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset not exists/)

      res = await updateAclAsync(notExistAssetName, '+', 0, ['123'], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset not exists/)

      res = await transferAsync(notExistAssetName, '1', '123', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset not exists/)
    })
  })

  describe('Asset operation fail cases', () => {
    var ISSUE_ACCOUNT = node.genNormalAccount()
    var ISSUER_NAME = node.randomIssuerName()
    var ASSET_NAME = ISSUER_NAME + '.GOLD'
    var MAX_AMOUNT = '100000'

    before(async function () {
      await node.giveMoneyAndWaitAsync([ISSUE_ACCOUNT.address])
      var res = await registerIssuerAsync(ISSUER_NAME, 'valid desc', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await registerAssetAsync(ASSET_NAME, 'valid desc', MAX_AMOUNT, 1, '', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()
    })

    it('should have no permission to operate if asset belongs to other account', async function () {
      var account = node.genNormalAccount()
      var res = await issueAssetAsync(ASSET_NAME, '1', account)
      expect(res.body).to.have.property('error').to.match(/^Permission not allowed/)

      res = await changeFlagsAsync(ASSET_NAME, 1, 1, account)
      expect(res.body).to.have.property('error').to.match(/^Permission not allowed/)

      res = await updateAclAsync(ASSET_NAME, '+', 0, [node.genNormalAccount().address], account)
      expect(res.body).to.have.property('error').to.match(/^Permission not allowed/)
    })

    it('should fail to issue if amount exceed the limit', async function () {
      var res = await issueAssetAsync(ASSET_NAME, bignum(MAX_AMOUNT).plus(1).toString(), ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Exceed issue limit/)
    })

    it('should fail to double submit issuing', async function () {
      var res = await issueAssetAsync(ASSET_NAME, '1', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      res = await issueAssetAsync(ASSET_NAME, '2', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)

      await node.onNewBlockAsync()
    })

    it('should fail to double set flag', async function () {
      // default acl flag is 0
      var res = await changeFlagsAsync(ASSET_NAME, 1, 0, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Flag double set/)
    })

    it('should fail to double submit flags', async function () {
      var res = await changeFlagsAsync(ASSET_NAME, 1, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      res = await changeFlagsAsync(ASSET_NAME, 2, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)

      await node.onNewBlockAsync()
    })

    it('should fail to doulbe submit acl', async function () {
      var res = await updateAclAsync(ASSET_NAME, '+', 0, [node.genNormalAccount().address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      res = await updateAclAsync(ASSET_NAME, '+', 0, [node.genNormalAccount().address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Double submit/)

      await node.onNewBlockAsync()
    })

    it('should fail to add acl if some address is already in acl', async function () {
      var address1 = node.genNormalAccount().address
      var address2 = node.genNormalAccount().address
      var res = await updateAclAsync(ASSET_NAME, '+', 0, [address1], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await updateAclAsync(ASSET_NAME, '+', 0, [address1, address2], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Double add acl address/)

      res = await updateAclAsync(ASSET_NAME, '+', 1, [address1, address2], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      res = await updateAclAsync(ASSET_NAME, '-', 0, [address1, address2], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()
    })

    it('should fail to do anything if asset is writeoff', async function () {
      var res = await writeoffAssetAsync(ASSET_NAME, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await issueAssetAsync(ASSET_NAME, '1', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset already writeoff/)

      res = await changeFlagsAsync(ASSET_NAME, 1, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset already writeoff/)
      await node.onNewBlockAsync()

      res = await updateAclAsync(ASSET_NAME, '+', 0, [node.genNormalAccount().address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset already writeoff/)

      res = await transferAsync(ASSET_NAME, '1', node.genNormalAccount().address, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Asset already writeoff/)
    })
  })

  describe('Test issue strategy', () => {
    async function registerAssetWithStrategyAsync(maximum, strategy) {
      var account = node.genNormalAccount()
      var issuerName = node.randomIssuerName()
      var assetName = issuerName + '.RUBY'
      await node.giveMoneyAndWaitAsync([account.address])
      var res = await registerIssuerAsync(issuerName, 'valid desc', account)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = await registerAssetAsync(assetName, 'valid desc', maximum, 1, strategy, account)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()
      return {
        account: account,
        issuerName: issuerName,
        assetName: assetName
      }
    }
    it('normal cases should be ok', async function () {
      var assetInfo = await registerAssetWithStrategyAsync('10000', 'quantity <= maximum / 10 * (height - genesisHeight)')
      console.log(assetInfo)
      var account = assetInfo.account
      var assetName = assetInfo.assetName

      var res = await issueAssetAsync(assetName, '1001', account)
      expect(res.body).to.have.property('error').to.match(/^Strategy not allowed/)

      res = await issueAssetAsync(assetName, '1000', account)
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()
      res = await issueAssetAsync(assetName, '1001', account)
      expect(res.body).to.have.property('error').to.match(/^Strategy not allowed/)

      await node.onNewBlockAsync()
      res = await issueAssetAsync(assetName, '2000', account)
      expect(res.body).to.have.property('success').to.be.true

      await node.onNewBlockAsync()

      var anotherAccount = node.genNormalAccount()
      await node.giveMoneyAndWaitAsync([anotherAccount.address])
      res = await transferAsync(assetName, '3001', anotherAccount.address, account)
      expect(res.body).to.have.property('error').to.match(/^Insufficient asset balance/)

      res = await transferAsync(assetName, '3000', anotherAccount.address, account)
      expect(res.body).to.have.property('success').to.be.true
      res = await transferAsync(assetName, '1', anotherAccount.address, account)
      expect(res.body).to.have.property('error').to.match(/^Insufficient asset balance/)

      await node.onNewBlockAsync()

      res = await node.apiGetAsync('/uia/balances/' + account.address)
      DEBUG('get sender\'s balances first time', res.body)
      expect(res.body.balances[0].currency).to.equal(assetName)
      expect(res.body.balances[0].balance).to.equal('0')

      res = await node.apiGetAsync('/uia/balances/' + anotherAccount.address)
      DEBUG('get recipient\'s balances first time', res.body)
      expect(res.body.balances[0].currency).to.equal(assetName)
      expect(res.body.balances[0].balance).to.equal('3000')

      res = await transferAsync(assetName, '1000', account.address, anotherAccount)
      expect(res.body).to.have.property('success').to.be.true
      res = await transferAsync(assetName, '2001', account.address, anotherAccount)
      expect(res.body).to.have.property('error').to.match(/^Insufficient asset balance/)
      await node.onNewBlockAsync()

      res = await node.apiGetAsync('/uia/balances/' + account.address)
      DEBUG('get sender\'s balances second time', res.body)
      expect(res.body.balances[0].currency).to.equal(assetName)
      expect(res.body.balances[0].balance).to.equal('1000')

      res = await node.apiGetAsync('/uia/balances/' + anotherAccount.address)
      DEBUG('get recipient\'s balances second time', res.body)
      expect(res.body.balances[0].currency).to.equal(assetName)
      expect(res.body.balances[0].balance).to.equal('2000')
    })
  })

  describe('Test modify permission', () => {
    var ISSUE_ACCOUNT = node.genNormalAccount()
    var ISSUER_NAME = node.randomIssuerName()
    var ASSET_NAME = ISSUER_NAME + '.SILVER'
    var MAX_AMOUNT = '100000'

    async function registerAssetWithAllowParameters(allowWriteoff, allowWhitelist, allowBlacklist) {
      var trs = node.asch.uia.createAsset(ASSET_NAME, 'valid desc', MAX_AMOUNT, 1, '', allowWriteoff, allowWhitelist, allowBlacklist, ISSUE_ACCOUNT.password)
      var res = await node.submitTransactionAsync(trs)
      DEBUG('registerAssetWithAllowParameters', res.body)
      return res
    }

    it('Invalid allow parameters', async function () {
      var res = await registerAssetWithAllowParameters(-1, 1, 1)
      expect(res.body).to.have.property('error').to.match(/^Asset allowWriteoff is not valid/)

      res = await registerAssetWithAllowParameters(1, 2, 1)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)

      res = await registerAssetWithAllowParameters(1, 1, 999)
      expect(res.body).to.have.property('error').to.match(/^Invalid transaction body/)
    })

    it('Flags modifing should be denied with special asset parameters', async function () {
      await node.giveMoneyAndWaitAsync([ISSUE_ACCOUNT.address])
      var res = await registerIssuerAsync(ISSUER_NAME, 'valid desc', ISSUE_ACCOUNT)
      expect(res.body).to.have.property('success').to.be.true
      await node.onNewBlockAsync()

      res = registerAssetWithAllowParameters(0, 0, 0)
      await node.onNewBlockAsync()

      res = await node.apiGetAsync('/uia/assets/' + ASSET_NAME)
      DEBUG('get assets response', res.body)
      expect(res.body.asset.allowWriteoff).to.equal(0)
      expect(res.body.asset.allowWhitelist).to.equal(0)
      expect(res.body.asset.allowBlacklist).to.equal(0)

      res = await writeoffAssetAsync(ASSET_NAME, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Writeoff not allowed/)

      res = await changeFlagsAsync(ASSET_NAME, 1, 1, ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Whitelist not allowed/)

      res = await updateAclAsync(ASSET_NAME, '+', 0, [node.genNormalAccount().address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Blacklist not allowed/)

      res = await updateAclAsync(ASSET_NAME, '+', 1, [node.genNormalAccount().address], ISSUE_ACCOUNT)
      expect(res.body).to.have.property('error').to.match(/^Whitelist not allowed/)
    })
  })

})
