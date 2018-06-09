var _ = require('lodash');
var expect = require('chai').expect;
var chai = require('chai');
var supertest = require('supertest');
var async = require('async');
var request = require('request');
var asch = require('asch-js');

var addressHelper = require('../src/utils/address.js');

// Node configuration
var config = require('../config.json');
var constants = require('../src/utils/constants.js');

var baseUrl = 'http://' + config.address + ':' + config.port;
var api = supertest(baseUrl + '/api');
var peer = supertest(baseUrl + '/peer');

var normalizer = 100000000; // Use this to convert XAS amount to normal value
var blockTime = 10000; // Block time in miliseconds
var blockTimePlus = 12000; // Block time + 2 seconds in miliseconds
var version = '0.9.0' // Node version

// Holds Fee amounts for different transaction types
var Fees = {
  voteFee: 10000000,
  transactionFee: 10000000,
  secondPasswordFee: 500000000,
  delegateRegistrationFee: 10000000000,
  multisignatureRegistrationFee: 500000000,
  dappAddFee: 10000000000
};

var guestbookDapp = {
  icon: 'http://o7dyh3w0x.bkt.clouddn.com/logo.png',
  link: 'https://github.com/sqfasd/hello-dapp/archive/master.zip'
};

// Account info for delegate to register manually
var Daccount = {
  'address': '4180149793392527131',
  'publicKey': 'fe16b09612ca50a6cbcc0a95bdf30bfa11e12c1aded819916cadb0c1e769b4bf',
  'password': 'demise hidden width hand solid deal doll party danger pencil foil oven',
  'secondPassword': 'brother maid replace hard scorpion clinic sentence bridge goose gun mass next',
  'balance': 0,
  'delegateName': 'ManualDelegate',
};

// Existing delegate account in blockchain
var Eaccount = {
  'address': '6518038767050467653',
  'publicKey': '8e5178db2bf10555cb57264c88833c48007100748d593570e013c9b15b17004e',
  'password': 'silk palace wall awful village found text hammer move jazz squeeze express',
  'balance': 0,
  'delegateName': 'asch_g1'
};

// Account info for genesis account - Needed for voting, registrations and Tx

var Gaccount = {
  'address': 'APSu9NhiCTtvRGx1EpkeKNubiApiBWMf7T',
  'publicKey': '56a2ef5646bbfcc0747101864d53da961363a20aec8344f6cb078a0fc47030e8',
  'password': 'token exhibit rich scare arch devote trash scout element label room master',
  'balance': 10000000000000000
};

// Random XAS Amount
var RANDOM_COIN = Math.floor(Math.random() * (100000 * 100000000)) + 1; // Remove 1 x 0 for reduced fees (delegate + Tx)

// Used to create random delegates names
function randomDelegateName() {
  var size = randomNumber(1, 20); // Min. delegate name size is 1, Max. delegate name is 20
  var delegateName = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < size; i++)
    delegateName += possible.charAt(Math.floor(Math.random() * possible.length));

  return delegateName;
}

// Randomize a property from within an object
function randomProperty(obj, needKey) {
  var keys = Object.keys(obj)

  if (!needKey) {
    return obj[keys[keys.length * Math.random() << 0]];
  } else {
    return keys[keys.length * Math.random() << 0];
  }
};

// Randomizes XAS amount
function randomCoin() {
  return Math.floor(Math.random() * (10000 * 100000000)) + (1000 * 100000000);
}

function _getHeight(url, cb) {
  request({
    type: 'GET',
    url: url + '/api/blocks/getHeight',
    json: true
  }, function (err, resp, body) {
    if (err || resp.statusCode != 200) {
      return cb(err || 'Status code is not 200 (getHeight)');
    } else {
      return cb(null, body.height);
    }
  })
}

// Returns current block height
function getHeight(cb) {
  _getHeight(baseUrl, cb)
}

function onNewBlock(cb) {
  getHeight(function (err, height) {
    //console.log('Height: ' + height);
    if (err) {
      return cb(err);
    } else {
      waitForNewBlock(height, cb);
    }
  });
}

// Function used to wait until a new block has been created
function waitForNewBlock(height, cb) {
  var actualHeight = height;
  async.doWhilst(
    function (cb) {
      request({
        type: 'GET',
        url: baseUrl + '/api/blocks/getHeight',
        json: true
      }, function (err, resp, body) {
        if (err || resp.statusCode != 200) {
          return cb(err || 'Got incorrect status');
        }

        if (height + 1 == body.height) {
          height = body.height;
        }

        setTimeout(cb, 1000);
      });
    },
    function () {
      return actualHeight == height;
    },
    function (err) {
      if (err) {
        return setImmediate(cb, err);
      } else {
        return setImmediate(cb, null, height);
      }
    }
  )
}

// Adds peers to local node
function addPeers(numOfPeers, cb) {
  var operatingSystems = ['win32', 'win64', 'ubuntu', 'debian', 'centos'];
  var ports = [4000, 5000, 7000, 8000];

  var os, version, port;

  var i = 0;
  async.whilst(function () {
    return i < numOfPeers
  }, function (next) {
    os = operatingSystems[randomizeSelection(operatingSystems.length)];
    version = 'development';
    port = ports[randomizeSelection(ports.length)];

    request({
      type: 'GET',
      url: baseUrl + '/peer/height',
      json: true,
      headers: {
        'version': version,
        'port': port,
        'magic': config.magic,
        'os': os
      }
    }, function (err, resp, body) {
      if (err || resp.statusCode != 200) {
        return next(err || 'Status code is not 200 (getHeight)');
      } else {
        i++;
        next();
      }
    })
  }, function (err) {
    return cb(err);
  });
}

// Used to randomize selecting from within an array. Requires array length
function randomizeSelection(length) {
  return Math.floor(Math.random() * length);
}

// Returns a random number between min (inclusive) and max (exclusive)
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Calculates the expected fee from a transaction
function expectedFee(amount) {
  return parseInt(Fees.transactionFee);
}

// Used to create random usernames
function randomUsername() {
  var size = randomNumber(1, 16); // Min. username size is 1, Max. username size is 16
  var username = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&_.';

  for (var i = 0; i < size; i++)
    username += possible.charAt(Math.floor(Math.random() * possible.length));

  return username;
}

function randomIssuerName() {
  var size = randomNumber(1, 16); // Min. username size is 1, Max. username size is 16
  var name = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (var i = 0; i < size; i++)
    name += possible.charAt(Math.floor(Math.random() * possible.length));

  return name;
}

function randomCapitalUsername() {
  var size = randomNumber(1, 16); // Min. username size is 1, Max. username size is 16
  var username = 'A';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&_.';

  for (var i = 0; i < size - 1; i++)
    username += possible.charAt(Math.floor(Math.random() * possible.length));

  return username;
}

// Used to create random basic accounts
function randomAccount() {
  var account = {
    'address': '',
    'publicKey': '',
    'password': '',
    'secondPassword': '',
    'username': '',
    'balance': 0
  };

  account.password = randomPassword();
  account.secondPassword = randomPassword();
  account.username = randomDelegateName();

  return account;
}

function genNormalAccount(password) {
  var password = password || randomPassword()
  var keys = asch.crypto.getKeys(password)
  return {
    address: addressHelper.generateBase58CheckAddress(keys.publicKey),
    publicKey: keys.publicKey,
    password: password,
    secret: password
  }
}

function randomTid() {
  return genNormalAccount().publicKey
}

// Used to create random transaction accounts (holds additional info to regular account)
function randomTxAccount() {
  return _.defaults(randomAccount(), {
    sentAmount: '',
    paidFee: '',
    totalPaidFee: '',
    transactions: []
  })
}

// Used to create random passwords
function randomPassword() {
  return Math.random().toString(36).substring(7);
}

function submitTransaction(trs, cb) {
  peer.post('/transactions')
    .set('Accept', 'application/json')
    .set('version', version)
    .set('magic', config.magic)
    .set('port', config.port)
    .send({
      transaction: trs
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb);
}

function apiGet(path, cb) {
  api.get(path)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

function transactionUnsigned(trs, cb) {
  api.put('/transactions')
    .send(trs)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) return cb(err)
      if (!res.body.success) return cb(res.body.error)
      cb(null, res)
    })
}

function giveMoney(address, amount, cb) {
  api.put('/transactions')
    .set('Accept', 'application/json')
    .send({
      secret: Gaccount.password,
      fee: 10000000,
      type: 1,
      args: [amount, address]
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

async function giveMoneyAndWaitAsync(addresses) {
  for (let i = 0; i < addresses.length; i++) {
    let res = await PIFY(giveMoney)(addresses[i], randomCoin())
    expect(res.body).to.have.property('success').to.be.true
  }
  await PIFY(onNewBlock)()
}

function sleep(n, cb) {
  setTimeout(cb, n * 1000)
}

function openAccount(params, cb) {
  api.post('/accounts/open')
    .set('Accept', 'application/json')
    .send(params)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(cb)
}

function PIFY(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, result) => {
        return err ? reject(err) : resolve(result)
      }])
    })
  }
}

function EIFY(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, result) => {
        return resolve([err, result])
      }])
    })
  }
}

// Exports variables and functions for access from other files
module.exports = {
  api: api,
  chai: chai,
  peer: peer,
  asch: asch,
  supertest: supertest,
  expect: expect,
  version: version,
  RANDOM_COIN: RANDOM_COIN,
  Gaccount: Gaccount,
  Daccount: Daccount,
  Eaccount: Eaccount,
  guestbookDapp: guestbookDapp,
  Fees: Fees,
  normalizer: normalizer,
  blockTime: blockTime,
  blockTimePlus: blockTimePlus,
  randomProperty: randomProperty,
  randomDelegateName: randomDelegateName,
  randomCoin: randomCoin,
  randomPassword: randomPassword,
  randomAccount: randomAccount,
  randomTxAccount: randomTxAccount,
  randomUsername: randomUsername,
  randomIssuerName: randomIssuerName,
  randomNumber: randomNumber,
  randomCapitalUsername: randomCapitalUsername,
  expectedFee: expectedFee,
  addPeers: addPeers,
  config: config,
  waitForNewBlock: waitForNewBlock,
  _getheight: _getHeight,
  getHeight: getHeight,
  onNewBlock: onNewBlock,
  submitTransaction: submitTransaction,
  apiGet: apiGet,
  genNormalAccount: genNormalAccount,
  openAccount: openAccount,
  PIFY: PIFY,
  EIFY: EIFY,

  submitTransactionAsyncE: EIFY(submitTransaction),
  onNewBlockAsyncE: EIFY(onNewBlock),
  apiGetAsyncE: EIFY(apiGet),
  giveMoneyAsyncE: EIFY(giveMoney),

  submitTransactionAsync: PIFY(submitTransaction),
  onNewBlockAsync: PIFY(onNewBlock),
  apiGetAsync: PIFY(apiGet),
  giveMoneyAsync: PIFY(giveMoney),
  giveMoneyAndWaitAsync: giveMoneyAndWaitAsync,
  sleepAsync: PIFY(sleep),
  openAccountAsync: PIFY(openAccount),
  randomTid: randomTid,
  transactionUnsignedAsync: PIFY(transactionUnsigned)
};
