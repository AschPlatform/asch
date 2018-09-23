const PIFY = require('util').promisify
const supertest = require('supertest')
const AschJS = require('asch-js')
const debug = require('debug')('LIB')
const config = require('../config')
const pkg = require('../package.json')

const addressHelper = require('./utils/address.js')

const baseUrl = `http://${config.address}:${config.port}`
const api = supertest(`${baseUrl}/api`)
const peer = supertest(`${baseUrl}/peer`)

const GENESIS_ACCOUNT = {
  address: 'ABuH9VHV3cFi9UKzcHXGMPGnSC4QqT2cZ5',
  publicKey: '116025d5664ce153b02c69349798ab66144edd2a395e822b13587780ac9c9c09',
  secret: 'stone elephant caught wrong spend traffic success fetch inside blush virtual element',
}

function genNormalAccount(password) {
  const pwd = password || randomPassword()
  const keys = AschJS.crypto.getKeys(pwd)
  return {
    address: addressHelper.generateNormalAddress(keys.publicKey),
    publicKey: keys.publicKey,
    password: pwd,
    secret: pwd,
  }
}

function generateGroupAddress(name) {
  return addressHelper.generateGroupAddress(name)
}

function randomCoin() {
  return Math.floor(Math.random() * (10000 * 100000000)) + (1000 * 100000000)
}

function randomSecret() {
  return Math.random().toString(36).substring(7)
}

function getNormalAccount(secret) {
  const sec = secret || randomSecret()
  const keys = AschJS.crypto.getKeys(sec)
  return {
    address: AschJS.crypto.getAddress(keys.publicKey),
    publicKey: keys.publicKey,
    secret: sec,
  }
}

function transaction(trs, cb) {
  peer.post('/transactions')
    .set('Accept', 'application/json')
    .set('version', pkg.version)
    .set('magic', config.magic)
    .set('port', config.port)
    .send({
      transaction: trs,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

function apiGet(path, cb) {
  api.get(path)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}
function apiGetAsync(path) {
  return PIFY(apiGet)(path)
}

function transactionUnsigned(trs, cb) {
  api.put('/transactions')
    .send(trs)
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) return cb(err)
      if (!res.body.success) return cb(res.body.error)
      return cb(null, res)
    })
}

function submitTransaction(trs, cb) {
  peer.post('/transactions')
    .set('Accept', 'application/json')
    .set('magic', config.magic)
    .set('port', config.port)
    .send({
      transaction: trs,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    // .end(cb);
    .end((err, res) => {
      if (err) return cb(err)
      if (!res.body.success) return cb(res.body.error)
      return cb(null, res)
    })
}

function giveMoney(address, amount, cb) {
  api.put('/transactions')
    .set('Accept', 'application/json')
    .send({
      secret: GENESIS_ACCOUNT.secret,
      fee: 10000000,
      type: 1,
      args: [amount, address],
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getHeight() {
  const ret = await apiGetAsync('/blocks/getHeight')
  debug('get height response', ret.body)
  return ret.body.height
}

async function onNewBlockAsync() {
  const firstHeight = await getHeight()
  let height
  do {
    await sleep(1000)
    height = await getHeight()
  } while (height <= firstHeight)
}

async function giveMoneyAndWaitAsync(addresses) {
  for (let i = 0; i < addresses.length; i++) {
    const res = await PIFY(giveMoney)(addresses[i], randomCoin())
    if (!res || !res.body) throw new Error('Server error')
    if (!res.body.success) throw new Error(res.body.error)
  }
  await onNewBlockAsync()
}

function getBalance(params, cb) {
  api.get(`/accounts/getBalance?address=${params}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

function getAccount(params, cb) {
  api.get(`/accounts?address=${params}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

async function failTransaction(trs) {
  let actualError
  try {
    await PIFY(transactionUnsigned)(trs)
  } catch (e) {
    actualError = String(e)
  }
  return actualError
}

async function failSubmitTransaction(trs) {
  let actualError
  try {
    await PIFY(submitTransaction)(trs)
  } catch (e) {
    actualError = String(e)
  }
  return actualError
}

module.exports = {
  GENESIS_ACCOUNT,
  onNewBlockAsync,
  randomCoin,
  getNormalAccount,
  transaction,
  transactionAsync: PIFY(transaction),
  transactionUnsigned,
  transactionUnsignedAsync: PIFY(transactionUnsigned),
  giveMoney,
  giveMoneyAsync: PIFY(giveMoney),
  giveMoneyAndWaitAsync,
  api,
  apiGet,
  apiGetAsync,
  getHeight,
  AschJS,
  config,
  sleep,
  getBalanceAsync: PIFY(getBalance),
  getAccountAsync: PIFY(getAccount),
  genNormalAccount,
  submitTransactionAsync: PIFY(submitTransaction),
  generateGroupAddress,
  failSubmitTransaction,
  failTransaction,
}
