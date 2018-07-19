const supertest = require('supertest')
const async = require('async')
const AschJS = require('asch-js')
const request = require('request')
const config = require('../config')
const pkg = require('../package.json')

const baseUrl = `http://${config.address}:${config.port}`
const api = supertest(`${baseUrl}/api`)
const peer = supertest(`${baseUrl}/peer`)
const PIFY = require('util').promisify

const GENESIS_ACCOUNT = {
  address: 'ABuH9VHV3cFi9UKzcHXGMPGnSC4QqT2cZ5',
  publicKey: '116025d5664ce153b02c69349798ab66144edd2a395e822b13587780ac9c9c09',
  secret: 'stone elephant caught wrong spend traffic success fetch inside blush virtual element',
}

function randomCoin() {
  return Math.floor(Math.random() * (10000 * 100000000)) + (1000 * 100000000)
}

function getHeight(url, cb) {
  if (typeof url === 'function') {
    cb = url
    url = baseUrl
  }
  request({
    type: 'GET',
    url: `${url}/api/blocks/getHeight`,
    json: true,
  }, (err, resp, body) => {
    if (err || resp.statusCode !== 200) {
      return cb(err || 'Status code is not 200 (getHeight)')
    }
    return cb(null, body.height)
  })
}

function waitForNewBlock(height, cb) {
  const actualHeight = height
  async.doWhilst(
    (next) => {
      request({
        type: 'GET',
        url: `${baseUrl}/api/blocks/getHeight`,
        json: true,
      }, (err, resp, body) => {
        if (err || resp.statusCode !== 200) {
          return cb(err || 'Got incorrect status')
        }

        if (height + 1 === body.height) {
          height = body.height
        }

        return setTimeout(next, 1000)
      })
    },
    () => actualHeight === height,
    (err) => {
      if (err) {
        return setImmediate(cb, err)
      }
      return setImmediate(cb, null, height)
    },
  )
}

function onNewBlock(cb) {
  getHeight((err, height) => {
    if (err) {
      return cb(err)
    }
    return waitForNewBlock(height, cb)
  })
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
  api.get(path).end(cb)
  // .expect('Content-Type', /json/)
  // .expect(200)
  // .end(cb)
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function giveMoneyAndWaitAsync(addresses) {
  for (let i = 0; i < addresses.length; i++) {
    const res = await PIFY(giveMoney)(addresses[i], randomCoin())
    if (!res || !res.body) throw new Error('Server error')
    if (!res.body.success) throw new Error(res.body.error)
  }
  await PIFY(onNewBlock)()
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

module.exports = {
  GENESIS_ACCOUNT,
  onNewBlock,
  onNewBlockAsync: PIFY(onNewBlock),
  randomCoin,
  getNormalAccount,
  transaction,
  transactionAsync: PIFY(transaction),
  transactionUnsigned,
  transactionUnsignedAsync: PIFY(transactionUnsigned),
  giveMoney,
  giveMoneyAsync: PIFY(giveMoney),
  giveMoneyAndWaitAsync,
  apiGet,
  apiGetAsync: PIFY(apiGet),
  AschJS,
  config,
  sleep,
  getBalanceAsync: PIFY(getBalance),
  getAccountAsync: PIFY(getAccount),
}
