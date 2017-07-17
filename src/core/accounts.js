var crypto = require('crypto');
var util = require('util');
var extend = require('extend');
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
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
    "get /delegates": "getDelegates",
    "get /delegates/fee": "getDelegatesFee",
    "put /delegates": "addDelegates",
    "get /": "getAccount"
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
    return res.json({ success: true, count: Object.keys(private.accounts).length });
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
  var address = self.generateAddressByPublicKey2(keypair.publicKey.toString('hex'));
  self.getAccount({ address: address }, function (err, account) {
    if (err) return cb(err)
    var account = account || {
      address: address,
      unconfirmedBalance: 0,
      balance: 0,
      // publicKey: account.publicKey,
      unconfirmedSignature: '',
      secondSignature: '',
      secondPublicKey: '',
      multisignatures: '',
      u_multisignatures: ''
    }
    return cb(null, account)
  });
}

private.openAccount2 = function (publicKey, cb) {
  var address = self.generateAddressByPublicKey2(publicKey);
  self.getAccount({ address: address }, function (err, account) {
    if (err) return cb(err)
    var account = account || {
      address: address,
      unconfirmedBalance: 0,
      balance: 0,
      // publicKey: account.publicKey,
      unconfirmedSignature: '',
      secondSignature: '',
      secondPublicKey: '',
      multisignatures: '',
      u_multisignatures: ''
    }
    return cb(null, account)
  });
}

// Public methods
Accounts.prototype.generateAddressByPublicKey = function (publicKey) {
  var publicKeyHash = crypto.createHash('sha256').update(publicKey, 'hex').digest();
  var temp = new Buffer(8);
  for (var i = 0; i < 8; i++) {
    temp[i] = publicKeyHash[7 - i];
  }

  var address = bignum.fromBuffer(temp).toString();
  if (!address) {
    throw Error("wrong publicKey " + publicKey);
  }
  return address;
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
  if (filter.publicKey) {
    filter.address = self.generateAddressByPublicKey2(filter.publicKey);
    delete filter.publicKey;
  }

  library.base.account.get(filter, fields, cb);
}

Accounts.prototype.getAccounts = function (filter, fields, cb) {
  library.base.account.getAll(filter, fields, cb);
}

Accounts.prototype.setAccountAndGet = function (data, cb) {
  var address = data.address || null;
  if (address === null) {
    if (data.publicKey) {
      address = self.generateAddressByPublicKey(data.publicKey);
      if (!data.isGenesis && !library.balanceCache.getNativeBalance(address)) {
        address = addressHelper.generateBase58CheckAddress(data.publicKey);
      }
      delete data.isGenesis;
    } else {
      return cb("Missing address or public key");
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
      return cb("Missing address or public key");
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

    private.openAccount(body.secret, function (err, account) {
      var accountData = null;
      if (!err) {
        accountData = {
          address: account.address,
          unconfirmedBalance: account.u_balance,
          balance: account.balance,
          publicKey: account.publicKey,
          unconfirmedSignature: account.u_secondSignature,
          secondSignature: account.secondSignature,
          secondPublicKey: account.secondPublicKey,
          multisignatures: account.multisignatures,
          u_multisignatures: account.u_multisignatures,
          lockHeight: account.lockHeight || 0
        };

        return cb(null, { account: accountData });
      } else {
        return cb(err);
      }
    });
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
    private.openAccount2(body.publicKey, function (err, account) {
      var accountData = null;
      if (!err) {
        accountData = {
          address: account.address,
          unconfirmedBalance: account.u_balance,
          balance: account.balance,
          // publicKey: account.publicKey,
          unconfirmedSignature: account.u_secondSignature,
          secondSignature: account.secondSignature,
          secondPublicKey: account.secondPublicKey,
          multisignatures: account.multisignatures,
          u_multisignatures: account.u_multisignatures,
          lockHeight: account.lockHeight || 0
        };
        var latestBlock = modules.blocks.getLastBlock();
        var ret = {
          account: accountData,
          latestBlock: {
            height: latestBlock.height,
            timestamp: latestBlock.timestamp
          },
          version: modules.peer.getVersion()
        }
        return cb(null, ret);
      } else {
        return cb(err);
      }
    });
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

    self.getAccount({ address: query.address }, function (err, account) {
      if (err) {
        return cb(err.toString());
      }
      var balance = account ? account.balance : 0;
      var unconfirmedBalance = account ? account.u_balance : 0;

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

    private.openAccount(body.secret, function (err, account) {
      var publicKey = null;
      if (!err && account) {
        publicKey = account.publicKey;
      }
      cb(err, {
        publicKey: publicKey
      });
    });
  });
}

shared.getDelegates = function (req, cb) {
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
      if (!account) {
        return cb("Account not found");
      }
      if (account.delegates) {
        self.getAccounts({
          isDelegate: 1,
          sort: { "vote": -1, "publicKey": 1 }
        }, ["username", "address", "publicKey", "vote", "missedblocks", "producedblocks"], function (err, delegates) {
          if (err) {
            return cb(err.toString());
          }

          var limit = query.limit || 101;
          var offset = query.offset || 0;
          var orderField = query.orderBy;

          orderField = orderField ? orderField.split(':') : null;
          limit = limit > 101 ? 101 : limit;

          var orderBy = orderField ? orderField[0] : null;
          var sortMode = orderField && orderField.length == 2 ? orderField[1] : 'asc';
          var count = delegates.length;
          var length = Math.min(limit, count);
          var realLimit = Math.min(offset + limit, count);

          var lastBlock = modules.blocks.getLastBlock();
          var totalSupply = private.blockStatus.calcSupply(lastBlock.height);

          for (var i = 0; i < delegates.length; i++) {
            delegates[i].rate = i + 1;
            delegates[i].approval = ((delegates[i].vote / totalSupply) * 100).toFixed(2);

            var percent = 100 - (delegates[i].missedblocks / ((delegates[i].producedblocks + delegates[i].missedblocks) / 100));
            percent = percent || 0;
            var outsider = i + 1 > slots.delegates;
            delegates[i].productivity = (!outsider) ? parseFloat(Math.floor(percent * 100) / 100).toFixed(2) : 0;
          }

          var result = delegates.filter(function (delegate) {
            return account.delegates.indexOf(delegate.publicKey) != -1;
          });

          cb(null, { delegates: result });
        });
      } else {
        cb(null, { delegates: [] });
      }
    });
  });
}

shared.getDelegatesFee = function (req, cb) {
  var query = req.body;
  cb(null, { fee: 1 * constants.fixedPoint });
}

shared.addDelegates = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: 'string',
        minLength: 1
      },
      publicKey: {
        type: 'string',
        format: 'publicKey'
      },
      secondSecret: {
        type: 'string',
        minLength: 1
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
    var keypair = ed.MakeKeypair(hash);

    if (body.publicKey) {
      if (keypair.publicKey.toString('hex') != body.publicKey) {
        return cb("Invalid passphrase");
      }
    }

    library.balancesSequence.add(function (cb) {
      if (body.multisigAccountPublicKey && body.multisigAccountPublicKey != keypair.publicKey.toString('hex')) {
        modules.accounts.getAccount({ publicKey: body.multisigAccountPublicKey }, function (err, account) {
          if (err) {
            return cb(err.toString());
          }

          if (!account) {
            return cb("Multisignature account not found");
          }

          if (!account.multisignatures || !account.multisignatures) {
            return cb("Account does not have multisignatures enabled");
          }

          if (account.multisignatures.indexOf(keypair.publicKey.toString('hex')) < 0) {
            return cb("Account does not belong to multisignature group");
          }

          modules.accounts.getAccount({ publicKey: keypair.publicKey }, function (err, requester) {
            if (err) {
              return cb(err.toString());
            }

            if (!requester || !requester.publicKey) {
              return cb("Invalid requester");
            }

            if (requester.secondSignature && !body.secondSecret) {
              return cb("Invalid second passphrase");
            }

            if (requester.publicKey == account.publicKey) {
              return cb("Invalid requester");
            }

            var secondKeypair = null;

            if (requester.secondSignature) {
              var secondHash = crypto.createHash('sha256').update(body.secondSecret, 'utf8').digest();
              secondKeypair = ed.MakeKeypair(secondHash);
            }

            try {
              var transaction = library.base.transaction.create({
                type: TransactionTypes.VOTE,
                votes: body.delegates,
                sender: account,
                keypair: keypair,
                secondKeypair: secondKeypair,
                requester: keypair
              });
            } catch (e) {
              return cb(e.toString());
            }
            modules.transactions.receiveTransactions([transaction], cb);
          });
        });
      } else {
        self.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
          if (err) {
            return cb(err.toString());
          }
          if (!account) {
            return cb("Account not found");
          }

          if (account.secondSignature && !body.secondSecret) {
            return cb("Invalid second passphrase");
          }

          var secondKeypair = null;

          if (account.secondSignature) {
            var secondHash = crypto.createHash('sha256').update(body.secondSecret, 'utf8').digest();
            secondKeypair = ed.MakeKeypair(secondHash);
          }

          try {
            var transaction = library.base.transaction.create({
              type: TransactionTypes.VOTE,
              votes: body.delegates,
              sender: account,
              keypair: keypair,
              secondKeypair: secondKeypair
            });
          } catch (e) {
            return cb(e.toString());
          }
          modules.transactions.receiveTransactions([transaction], cb);
        });
      }
    }, function (err, transaction) {
      if (err) {
        return cb(err.toString());
      }

      cb(null, { transaction: transaction[0] });
    });
  });
}

shared.getAccount = function (req, cb) {
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
      if (!account) {
        account = {
          address: query.address,
          unconfirmedBalance: 0,
          balance: 0,
          publicKey: '',
          unconfirmedSignature: '',
          secondSignature: '',
          secondPublicKey: '',
          multisignatures: '',
          u_multisignatures: '',
          lockHeight: 0
        }
      }

      var latestBlock = modules.blocks.getLastBlock();
      cb(null, {
        account: {
          address: account.address,
          unconfirmedBalance: account.u_balance,
          balance: account.balance,
          publicKey: account.publicKey,
          unconfirmedSignature: account.u_secondSignature,
          secondSignature: account.secondSignature,
          secondPublicKey: account.secondPublicKey,
          multisignatures: account.multisignatures,
          u_multisignatures: account.u_multisignatures,
          lockHeight: account.lockHeight
        },
        latestBlock: {
          height: latestBlock.height,
          timestamp: latestBlock.timestamp
        },
        version: modules.peer.getVersion()
      });
    });
  });
}

// Export
module.exports = Accounts;
