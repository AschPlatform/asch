var crypto = require('crypto');
var util = require('util');
var extend = require('extend');
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
var Mnemonic = require('bitcore-mnemonic');
var slots = require('../utils/slots.js');
var Router = require('../utils/router.js');
var BlockStatus = require("../utils/block-status.js");
var constants = require('../utils/constants.js');
var Diff = require('../utils/diff.js');
var sandboxHelper = require('../utils/sandbox.js');
var addressHelper = require('../utils/address.js');
var PIFY = util.promiseify

// Private fields
var modules, library, self, private = {}, shared = {};

private.blockStatus = new BlockStatus();

// Constructor
function Accounts(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;
  private.attachApi();

  setImmediate(cb, null, self);
}

// Private methods
private.attachApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.map(shared, {
    "post /open": "open",
    "post /open2": "open2",
    "get /getBalance": "getBalance",
    "get /getPublicKey": "getPublickey",
    "post /generatePublicKey": "generatePublickey",
    "get /delegates": "myVotedDelegates",
    "get /": "getAccount",
    "get /new": "newAccount"
  });

  if (process.env.DEBUG && process.env.DEBUG.toUpperCase() == "TRUE") {
    router.get('/getAllAccounts', function (req, res) {
      return res.json({ success: true, accounts: private.accounts });
    });
  }

  router.get('/top', function (req, res, next) {
    req.sanitize(req.query, {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          minimum: 0,
          maximum: 100
        },
        offset: {
          type: "integer",
          minimum: 0
        }
      }
    }, function (err, report, query) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });
      if (!query.limit) {
        query.limit = 100;
      }
      self.getAccounts({
        sort: {
          balance: -1
        },
        offset: query.offset,
        limit: query.limit
      }, function (err, raw) {
        if (err) {
          return res.json({ success: false, error: err.toString() });
        }
        var accounts = raw.map(function (fullAccount) {
          return {
            address: fullAccount.address,
            balance: fullAccount.balance,
            publicKey: fullAccount.publicKey
          }
        });

        res.json({ success: true, accounts: accounts });
      })
    })
  });

  router.get('/count', function (req, res) {
    library.dbLite.query('select count(*) from mem_accounts', { 'count': Number }, function (err, rows) {
      if (err || !rows) {
        return res.status(500).send({ success: false, error: 'Database error' })
      }
      return res.json({ success: true, count: rows[0].count });
    })
  });

  router.use(function (req, res, next) {
    res.status(500).send({ success: false, error: "API endpoint was not found" });
  });

  library.network.app.use('/api/accounts', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err);
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.openAccount = function (secret, cb) {
  var hash = crypto.createHash('sha256').update(secret, 'utf8').digest();
  var keypair = ed.MakeKeypair(hash);
  let publicKey = keypair.publicKey.toString('hex')
  var address = self.generateAddressByPublicKey(publicKey);
  shared.getAccount({ body: { address: address } }, function (err, ret) {
    if (ret && ret.account && !ret.account.publicKey) {
      ret.account.publicKey = publicKey
    }
    cb(err, ret)
  });
}

private.openAccount2 = function (publicKey, cb) {
  var address = self.generateAddressByPublicKey(publicKey);
  shared.getAccount({ body: { address: address } }, function (err, ret) {
    if (ret && ret.account && !ret.account.publicKey) {
      ret.account.publicKey = publicKey
    }
    cb(err, ret)
  });
}

// Public methods
Accounts.prototype.generateAddressByPublicKey = function (publicKey) {
  return addressHelper.generateBase58CheckAddress(publicKey)
}

Accounts.prototype.generateAddressByPublicKey2 = function (publicKey) {
  if (!global.featureSwitch.enableUIA) {
    return self.generateAddressByPublicKey(publicKey)
  }
  var oldAddress = self.generateAddressByPublicKey(publicKey)
  if (library.balanceCache.getNativeBalance(oldAddress)) {
    return oldAddress
  }
  return addressHelper.generateBase58CheckAddress(publicKey)
}

Accounts.prototype.getAccount = function (filter, fields, cb) {
  library.logger.trace('Accounts.prototype.getAccount ', filter)
  if (typeof fields === 'function') {
    cb = fields
  }
  var publicKey = filter.publicKey

  if (filter.address && !addressHelper.isAddress(filter.address)) {
    return cb('Invalid address getAccount');
  }

  if (filter.publicKey) {
    filter.address = self.generateAddressByPublicKey2(filter.publicKey);
    delete filter.publicKey;
  }
  library.logger.trace('Accounts.prototype.getAccount=========1', publicKey)

  function done(err, account) {
    library.logger.trace('Accounts.prototype.getAccount=========2' + err, account)
    if (!err && account && !account.publicKey) {
      account.publicKey = publicKey
    }
    cb(err, account)
  }

  if (typeof fields === 'function') {
    library.base.account.get(filter, done);
  } else {
    library.base.account.get(filter, fields, done);
  }
}

Accounts.prototype.getAccounts = function (filter, fields, cb) {
  library.base.account.getAll(filter, fields, cb);
}

Accounts.prototype.setAccountAndGet = function (data, cb) {
  library.logger.debug('setAccountAndGet data is:', data)
  var address = data.address || null;
  if (address === null) {
    if (data.publicKey) {
      address = self.generateAddressByPublicKey(data.publicKey);
      if (!data.isGenesis && !library.balanceCache.getNativeBalance(address)) {
        address = addressHelper.generateBase58CheckAddress(data.publicKey);
      }
      delete data.isGenesis;
    } else {
      library.logger.debug('setAccountAndGet error and data is:', data)
      return cb("Missing address or public key in setAccountAndGet");
    }
  }
  if (!address) {
    return cb("Invalid public key");
  }
  library.base.account.set(address, data, function (err) {
    if (err) {
      return cb(err);
    }
    library.base.account.get({ address: address }, cb);
  });
}

Accounts.prototype.mergeAccountAndGet = function (data, cb) {
  var address = data.address || null;
  if (address === null) {
    if (data.publicKey) {
      address = self.generateAddressByPublicKey2(data.publicKey);
    } else {
      return cb("Missing address or public key in mergeAccountAndGet");
    }
  }
  if (!address) {
    return cb("Invalid public key");
  }
  library.base.account.merge(address, data, cb);
}

Accounts.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Accounts.prototype.onBind = function (scope) {
  modules = scope;
}

// Shared

shared.newAccount = function (req, cb) {
  var ent = Number(req.body.ent)
  if ([128, 256, 384].indexOf(ent) === -1) {
    ent = 128
  }
  var secret = new Mnemonic(ent).toString();
  var keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret, 'utf8').digest());
  var address = self.generateAddressByPublicKey(keypair.publicKey)
  cb(null, {
    secret: secret,
    publicKey: keypair.publicKey.toString('hex'),
    privateKey: keypair.privateKey.toString('hex'),
    address: address
  })
}

shared.open = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      }
    },
    required: ["secret"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    private.openAccount(body.secret, cb);
  });
}

shared.open2 = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      publicKey: {
        type: "string",
        format: 'publicKey'
      }
    },
    required: ["publicKey"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }
    private.openAccount2(body.publicKey, cb);
  });
}

shared.getBalance = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      address: {
        type: "string",
        minLength: 1,
        maxLength: 50
      }
    },
    required: ["address"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    if (!addressHelper.isAddress(query.address)) {
      return cb('Invalid address');
    }

    shared.getAccount({ body: { address: query.address } }, function (err, ret) {
      if (err) {
        return cb(err.toString());
      }
      var balance = ret && ret.account ? ret.account.balance : 0;
      var unconfirmedBalance = ret && ret.account ? ret.account.unconfirmedBalance : 0;

      cb(null, { balance: balance, unconfirmedBalance: unconfirmedBalance });
    });
  });
}

shared.getPublickey = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      address: {
        type: "string",
        minLength: 1
      }
    },
    required: ["address"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    self.getAccount({ address: query.address }, function (err, account) {
      if (err) {
        return cb(err.toString());
      }
      if (!account || !account.publicKey) {
        return cb("Account does not have a public key");
      }
      cb(null, { publicKey: account.publicKey });
    });
  });
}

shared.generatePublickey = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1
      }
    },
    required: ["secret"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    private.openAccount(body.secret, function (err, ret) {
      var publicKey = null;
      if (!err && ret && ret.account) {
        publicKey = ret.account.publicKey;
      }
      cb(err, {
        publicKey: publicKey
      });
    });
  });
}

shared.myVotedDelegates = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      address: {
        type: "string",
        minLength: 1
      },
      name: {
        type: "string",
        minLength: 1
      }
    },
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    (async function () {
      try {
        let address
        if (query.name) {
          let account = await app.sdb.getBy('Account', { name: query.name })
          if (!account) {
            return cb('Account not found')
          }
          address = account.address
        } else {
          address = query.address
        }
        let votes = await app.sdb.findAll('Vote', { condition: { address: address } })
        if (!votes || !votes.length) {
          return cb(null, { delegates: [] })
        }
        let delegateNames = new Set()
        for (let v of votes) {
          delegateNames.add(v.delegate)
        }
        let delegates = await PIFY(modules.delegates.getDelegates)({})
        if (!delegates || !delegates.length) {
          return cb(null, { delegates: [] })
        }

        let myVotedDelegates = delegates.filter((d) => delegateNames.has(d.name))
        return cb(null, { delegates: myVotedDelegates })
      } catch (e) {
        library.logger.error('get voted delegates error', e)
        return cb('Server error')
      }
    })()
  });
}

shared.getAccount = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      address: {
        type: "string",
        minLength: 1,
        mexLength: 50
      }
    },
    required: ["address"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    (async function () {
      try {
        let account = await app.sdb.findOne('Account', { condition: { address: query.address } })
        let accountData
        if (!account) {
          accountData = {
            address: query.address,
            unconfirmedBalance: 0,
            balance: 0,
            secondPublicKey: '',
            lockHeight: 0
          }
        } else {
          let unconfirmedAccount = await app.sdb.attach('Account', account)
          accountData = {
            address: account.address,
            unconfirmedBalance: unconfirmedAccount.xas,
            balance: account.xas,
            secondPublicKey: account.secondPublicKey,
            lockHeight: account.lockHeight || 0
          };
        }
        let latestBlock = modules.blocks.getLastBlock()
        let ret = {
          account: accountData,
          latestBlock: {
            height: latestBlock.height,
            timestamp: latestBlock.timestamp
          },
          version: modules.peer.getVersion()
        }
        cb(null, ret);
      } catch (e) {
        library.logger.error('Failed to get account', e)
        cb('Server error')
      }
    })()
  });
}

// Export
module.exports = Accounts;