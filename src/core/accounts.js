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
var TransactionTypes = require('../utils/transaction-types.js');
var Diff = require('../utils/diff.js');
var sandboxHelper = require('../utils/sandbox.js');
var addressHelper = require('../utils/address.js');

// Private fields
var modules, library, self, private = {}, shared = {};

private.blockStatus = new BlockStatus();

function Vote() {
  this.create = function (data, trs) {
    trs.recipientId = null;
    trs.asset.vote = {
      votes: data.votes
    };

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return 0.1 * constants.fixedPoint;
  }

  this.verify = function (trs, sender, cb) {
    if (!trs.asset.vote || !trs.asset.vote.votes || !trs.asset.vote.votes.length) {
      return setImmediate(cb, "No votes sent");
    }

    if (trs.asset.vote.votes && trs.asset.vote.votes.length > 33) {
      return setImmediate(cb, "Voting limit exceeded. Maximum is 33 votes per transaction");
    }

    modules.delegates.checkDelegates(trs.senderPublicKey, trs.asset.vote.votes, function (err) {
      setImmediate(cb, err, trs);
    });
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    try {
      var buf = trs.asset.vote.votes ? new Buffer(trs.asset.vote.votes.join(''), 'utf8') : null;
    } catch (e) {
      throw Error(e.toString());
    }

    return buf;
  }

  this.apply = function (trs, block, sender, cb) {
    library.base.account.merge(sender.address, {
      delegates: trs.asset.vote.votes,
      blockId: block.id,
      round: modules.round.calc(block.height)
    }, cb);
  }

  this.undo = function (trs, block, sender, cb) {
    if (trs.asset.vote.votes === null) return cb();

    var votesInvert = Diff.reverse(trs.asset.vote.votes);

    library.base.account.merge(sender.address, {
      delegates: votesInvert,
      blockId: block.id,
      round: modules.round.calc(block.height)
    }, cb);
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    if (modules.blocks.getLastBlock() &&
      modules.blocks.getLastBlock().height < 1294343 &&
      global.Config.netVersion === 'mainnet') {
      return setImmediate(cb)
    }
    var key = sender.address + ':' + trs.type
    if (library.oneoff.has(key)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(key, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var key = sender.address + ':' + trs.type
    library.oneoff.delete(key)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.vote, {
      type: "object",
      properties: {
        votes: {
          type: "array",
          minLength: 1,
          maxLength: 101,
          uniqueItems: true
        }
      },
      required: ['votes']
    });

    if (!report) {
      throw new Error("Incorrect votes in transactions: " + library.scheme.getLastError());
    }

    return trs;
  }

  this.dbRead = function (raw) {
    // console.log(raw.v_votes);

    if (!raw.v_votes) {
      return null
    } else {
      var votes = raw.v_votes.split(',');
      var vote = {
        votes: votes
      };
      return { vote: vote };
    }
  }

  this.dbSave = function (trs, cb) {
    library.dbLite.query("INSERT INTO votes(votes, transactionId) VALUES($votes, $transactionId)", {
      votes: util.isArray(trs.asset.vote.votes) ? trs.asset.vote.votes.join(',') : null,
      transactionId: trs.id
    }, cb);
  }

  this.ready = function (trs, sender) {
    if (sender.multisignatures.length) {
      if (!trs.signatures) {
        return false;
      }
      return trs.signatures.length >= sender.multimin - 1;
    } else {
      return true;
    }
  }
}

// Constructor
function Accounts(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;
  private.attachApi();

  library.base.transaction.attachAssetType(TransactionTypes.VOTE, new Vote());

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
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.openAccount = function (secret, cb) {
  var hash = crypto.createHash('sha256').update(secret, 'utf8').digest();
  var keypair = ed.MakeKeypair(hash);
  let publicKey = keypair.publicKey.toString('hex')
  var address = self.generateAddressByPublicKey2(publicKey);
  shared.getAccount({ body: { address: address } }, function (err, ret) {
    if (ret && ret.account && !ret.account.publicKey) {
      ret.account.publicKey = publicKey
    }
    cb(err, ret)
  });
}

private.openAccount2 = function (publicKey, cb) {
  var address = self.generateAddressByPublicKey2(publicKey);
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
  var address = self.generateAddressByPublicKey2(keypair.publicKey)
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
      }
    },
    required: ["address"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    (async function () {
      try {
        let votes = await app.model.Vote.findAll({
          condition: {
            address: query.address
          },
        })
        if (!votes || !votes.length) {
          return cb(null, { delegates: [] })
        }
        let delegateNames = new Set()
        for (let v of votes) {
          delegateNames.add(v.delegate)
        }
        let delegates = await app.model.Delegate.findAll()
        if (!delegates || !delegates.length) {
          return cb(null, { delegates: [] })
        }
        delegates = delegates.sort(function (l, r) {
          if (l.votes !== r.votes)  return r.votes - l.votes
          return r.publicKey < l.publicKey
        })

        let lastBlock = modules.blocks.getLastBlock();
        let totalSupply = private.blockStatus.calcSupply(lastBlock.height);
        let votedDelegates = []
        for (let i = 0; i < delegates.length; ++i) {
          let d = delegates[i]
          d.rate = i + 1
          delegates[i].approval = ((d.votes / totalSupply) * 100).toFixed(2);

          var percent = 100 - (d.missedBlocks / (d.producedBlocks + d.missedBlocks) / 100);
          percent = percent || 0;
          delegates[i].productivity = parseFloat(Math.floor(percent * 100) / 100).toFixed(2);
          if (delegateNames.has(d.name)) {
            votedDelegates.push(d)
          }
        }
        cb(null, { delegates: votedDelegates })
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
        let account = await app.model.Account.findOne({ condition: { address: query.address } })
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
          let unconfirmedAccount = app.sdb.get('Account', { address: query.address })
          accountData = {
            address: account.address,
            unconfirmedBalance: unconfirmedAccount.xas,
            balance: account.xas,
            secondPublicKey: account.secondPublicKey,
            lockHeight: account.lockHeight || 0
          };
        }
        let latestBlock = modules.blocks.getLastBlock();
        var ret = {
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