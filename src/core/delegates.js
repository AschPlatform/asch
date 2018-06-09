var crypto = require('crypto');
var util = require('util');
var async = require('async');
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
var Router = require('../utils/router.js');
var slots = require('../utils/slots.js');
var BlockStatus = require("../utils/block-status.js");
var constants = require('../utils/constants.js');
var sandboxHelper = require('../utils/sandbox.js');
var addressHelper = require('../utils/address.js')
var PIFY = require('../utils/pify.js')
let jsonSql = require('json-sql')({ separatedValues: false })

require('array.prototype.find'); // Old node fix

// Private fields
var modules, library, self, private = {}, shared = {};

const BOOK_KEEPER_NAME = 'round_bookkeeper'

private.loaded = false;
private.blockStatus = new BlockStatus();
private.keypairs = {};
private.forgingEanbled = true;

function Delegate() {
  this.create = function (data, trs) {
    trs.recipientId = null;
    trs.amount = 0;
    trs.asset.delegate = {
      username: data.username,
      publicKey: data.sender.publicKey
    };

    if (trs.asset.delegate.username) {
      trs.asset.delegate.username = trs.asset.delegate.username.toLowerCase().trim();
    }

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return 100 * constants.fixedPoint;
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) {
      return setImmediate(cb, "Invalid recipient");
    }

    if (trs.amount != 0) {
      return setImmediate(cb, "Invalid transaction amount");
    }

    if (sender.isDelegate) {
      return cb("Account is already a delegate");
    }

    if (!trs.asset || !trs.asset.delegate) {
      return cb("Invalid transaction asset");
    }

    if (!trs.asset.delegate.username) {
      return cb("Username is undefined");
    }

    // if (trs.asset.delegate.username !== trs.asset.delegate.username.toLowerCase()) {
    //   return cb("Username should be lowercase");
    // }

    var allowSymbols = /^[a-z0-9!@$&_.]+$/g;

    var username = String(trs.asset.delegate.username).toLowerCase().trim();

    if (username == "") {
      return cb("Empty username");
    }

    if (username.length > 20) {
      return cb("Username is too long. Maximum is 20 characters");
    }

    if (addressHelper.isAddress(username)) {
      return cb("Username can not be a potential address");
    }

    if (!allowSymbols.test(username)) {
      return cb("Username can only contain alphanumeric characters with the exception of !@$&_.");
    }

    modules.accounts.getAccount({
      username: username
    }, function (err, account) {
      if (err) {
        return cb(err);
      }

      if (account) {
        return cb("Username already exists");
      }

      cb(null, trs);
    });
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    if (!trs.asset.delegate.username) {
      return null;
    }
    try {
      var buf = new Buffer(trs.asset.delegate.username, 'utf8');
    } catch (e) {
      throw Error(e.toString());
    }

    return buf;
  }

  this.apply = function (trs, block, sender, cb) {
    var data = {
      address: sender.address,
      u_isDelegate: 0,
      isDelegate: 1,
      vote: 0
    }

    if (trs.asset.delegate.username) {
      data.u_username = null;
      data.username = trs.asset.delegate.username;
    }

    modules.accounts.setAccountAndGet(data, cb);
  }

  this.undo = function (trs, block, sender, cb) {
    var data = {
      address: sender.address,
      u_isDelegate: 1,
      isDelegate: 0,
      vote: 0
    }

    if (!sender.nameexist && trs.asset.delegate.username) {
      data.username = null;
      data.u_username = trs.asset.delegate.username;
    }

    modules.accounts.setAccountAndGet(data, cb);
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    if (sender.isDelegate) {
      return cb("Account is already a delegate");
    }

    var nameKey = trs.asset.delegate.username + ':' + trs.type
    var idKey = sender.address + ':' + trs.type
    if (library.oneoff.has(nameKey) || library.oneoff.has(idKey)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(nameKey, true)
    library.oneoff.set(idKey, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var nameKey = trs.asset.delegate.name + ':' + trs.type
    var idKey = sender.address + ':' + trs.type
    library.oneoff.delete(nameKey)
    library.oneoff.delete(idKey)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.delegate, {
      type: "object",
      properties: {
        publicKey: {
          type: "string",
          format: "publicKey"
        }
      },
      required: ["publicKey"]
    });

    if (!report) {
      throw Error("Can't verify delegate transaction, incorrect parameters: " + library.scheme.getLastError());
    }

    return trs;
  }

  this.dbRead = function (raw) {
    if (!raw.d_username) {
      return null;
    } else {
      var delegate = {
        username: raw.d_username,
        publicKey: raw.t_senderPublicKey,
        address: raw.t_senderId
      }

      return { delegate: delegate };
    }
  }

  this.dbSave = function (trs, cb) {
    library.dbLite.query("INSERT INTO delegates(username, transactionId) VALUES($username, $transactionId)", {
      username: trs.asset.delegate.username,
      transactionId: trs.id
    }, cb);
  }

  this.ready = function (trs, sender) {
    if (util.isArray(sender.multisignatures) && sender.multisignatures.length) {
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
function Delegates(cb, scope) {
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
    if (modules && private.loaded) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.map(shared, {
    "get /count": "count",
    "get /voters": "getVoters",
    "get /get": "getDelegate",
    "get /": "getDelegates",
  });

  if (process.env.DEBUG) {

    router.get('/forging/disableAll', function (req, res) {
      self.disableForging();
      return res.json({ success: true });
    });

    router.get('/forging/enableAll', function (req, res) {
      self.enableForging();
      return res.json({ success: true });
    });
  }

  router.post('/forging/enable', function (req, res) {
    var body = req.body;
    library.scheme.validate(body, {
      type: "object",
      properties: {
        secret: {
          type: "string",
          minLength: 1,
          maxLength: 100
        },
        publicKey: {
          type: "string",
          format: "publicKey"
        }
      },
      required: ["secret"]
    }, function (err) {
      if (err) {
        return res.json({ success: false, error: err[0].message });
      }

      var ip = req.connection.remoteAddress;

      if (library.config.forging.access.whiteList.length > 0 && library.config.forging.access.whiteList.indexOf(ip) < 0) {
        return res.json({ success: false, error: "Access denied" });
      }

      var keypair = ed.MakeKeypair(crypto.createHash('sha256').update(body.secret, 'utf8').digest());

      if (body.publicKey) {
        if (keypair.publicKey.toString('hex') != body.publicKey) {
          return res.json({ success: false, error: "Invalid passphrase" });
        }
      }

      if (private.keypairs[keypair.publicKey.toString('hex')]) {
        return res.json({ success: false, error: "Forging is already enabled" });
      }

      modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
        if (err) {
          return res.json({ success: false, error: err.toString() });
        }
        if (account && account.isDelegate) {
          private.keypairs[keypair.publicKey.toString('hex')] = keypair;
          library.logger.info("Forging enabled on account: " + account.address);
          return res.json({ success: true, address: account.address });
        } else {
          return res.json({ success: false, error: "Delegate not found" });
        }
      });
    });
  });

  router.post('/forging/disable', function (req, res) {
    var body = req.body;
    library.scheme.validate(body, {
      type: "object",
      properties: {
        secret: {
          type: "string",
          minLength: 1,
          maxLength: 100
        },
        publicKey: {
          type: "string",
          format: "publicKey"
        }
      },
      required: ["secret"]
    }, function (err) {
      if (err) {
        return res.json({ success: false, error: err[0].message });
      }

      var ip = req.connection.remoteAddress;

      if (library.config.forging.access.whiteList.length > 0 && library.config.forging.access.whiteList.indexOf(ip) < 0) {
        return res.json({ success: false, error: "Access denied" });
      }

      var keypair = ed.MakeKeypair(crypto.createHash('sha256').update(body.secret, 'utf8').digest());

      if (body.publicKey) {
        if (keypair.publicKey.toString('hex') != body.publicKey) {
          return res.json({ success: false, error: "Invalid passphrase" });
        }
      }

      if (!private.keypairs[keypair.publicKey.toString('hex')]) {
        return res.json({ success: false, error: "Delegate not found" });
      }

      modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
        if (err) {
          return res.json({ success: false, error: err.toString() });
        }
        if (account && account.isDelegate) {
          delete private.keypairs[keypair.publicKey.toString('hex')];
          library.logger.info("Forging disabled on account: " + account.address);
          return res.json({ success: true, address: account.address });
        } else {
          return res.json({ success: false, error: "Delegate not found" });
        }
      });
    });
  });

  router.get('/forging/status', function (req, res) {
    var query = req.query;
    library.scheme.validate(query, {
      type: "object",
      properties: {
        publicKey: {
          type: "string",
          format: "publicKey"
        }
      },
      required: ["publicKey"]
    }, function (err) {
      if (err) {
        return res.json({ success: false, error: err[0].message });
      }

      return res.json({ success: true, enabled: !!private.keypairs[query.publicKey] });
    });
  });

  library.network.app.use('/api/delegates', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.getBlockSlotData = function (slot, height, cb) {
  self.generateDelegateList(height, function (err, activeDelegates) {
    if (err) {
      return cb(err);
    }
    var currentSlot = slot;
    var lastSlot = slots.getLastSlot(currentSlot);

    for (; currentSlot < lastSlot; currentSlot += 1) {
      var delegate_pos = currentSlot % slots.delegates;

      var delegate_id = activeDelegates[delegate_pos];

      if (delegate_id && private.keypairs[delegate_id]) {
        return cb(null, { time: slots.getSlotTime(currentSlot), keypair: private.keypairs[delegate_id] });
      }
    }
    cb(null, null);
  });
}

private.loop = function (cb) {
  if (!private.forgingEanbled) {
    library.logger.trace('Loop:', 'forging disabled');
    return setImmediate(cb);
  }
  if (!Object.keys(private.keypairs).length) {
    library.logger.trace('Loop:', 'no delegates');
    return setImmediate(cb);
  }

  if (!private.loaded || modules.loader.syncing()) {
    library.logger.trace('Loop:', 'node not ready');
    return setImmediate(cb);
  }

  var currentSlot = slots.getSlotNumber();
  var lastBlock = modules.blocks.getLastBlock();

  if (currentSlot == slots.getSlotNumber(lastBlock.timestamp)) {
    // library.logger.debug('Loop:', 'lastBlock is in the same slot');
    return setImmediate(cb);
  }

  if (Date.now() % 10000 > 5000) {
    library.logger.trace('Loop:', 'maybe too late to collect votes');
    return setImmediate(cb);
  }

  private.getBlockSlotData(currentSlot, lastBlock.height + 1, function (err, currentBlockData) {
    if (err || currentBlockData === null) {
      library.logger.trace('Loop:', 'skipping slot');
      return setImmediate(cb);
    }

    library.sequence.add(function generateBlock(cb) {
      (async function () {
        try {
          if (slots.getSlotNumber(currentBlockData.time) == slots.getSlotNumber() &&
            modules.blocks.getLastBlock().timestamp < currentBlockData.time) {
            await modules.blocks.generateBlock(currentBlockData.keypair, currentBlockData.time)
          }
          cb()
        } catch (e) {
          cb(e)
        }
      })()
    }, function (err) {
      if (err) {
        library.logger.error("Failed generate block within slot:", err);
      }
      return setImmediate(cb);
    });
  });
}

private.loadMyDelegates = function (cb) {
  var secrets = [];
  if (library.config.forging.secret) {
    secrets = util.isArray(library.config.forging.secret) ? library.config.forging.secret : [library.config.forging.secret];
  }

  (async function () {
    try {
      let delegates = app.sdb.getAllCached('Delegate')
      if (!delegates || !delegates.length) {
        return cb('Delegates not found in db')
      }
      let delegateMap = new Map
      for (let d of delegates) {
        delegateMap.set(d.publicKey, d)
      }
      for (let secret of secrets) {
        let keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret, 'utf8').digest());
        let publicKey = keypair.publicKey.toString('hex')
        if (delegateMap.has(publicKey)) {
          private.keypairs[publicKey] = keypair
          library.logger.info("Forging enabled on account: " + delegateMap.get(publicKey).address);
        } else {
          library.logger.info("Delegate with this public key not found: " + keypair.publicKey.toString('hex'));
        }
      }
      cb()
    } catch (e) {
      cb(e)
    }
  })()
}

Delegates.prototype.getActiveDelegateKeypairs = function (height, cb) {
  self.generateDelegateList(height, function (err, delegates) {
    if (err) {
      return cb(err);
    }
    var results = [];
    for (var key in private.keypairs) {
      if (delegates.indexOf(key) !== -1) {
        results.push(private.keypairs[key]);
      }
    }
    cb(null, results);
  });
}

Delegates.prototype.validateProposeSlot = function (propose, cb) {
  self.generateDelegateList(propose.height, function (err, activeDelegates) {
    if (err) {
      return cb(err);
    }
    var currentSlot = slots.getSlotNumber(propose.timestamp);
    var delegateKey = activeDelegates[currentSlot % slots.delegates];

    if (delegateKey && propose.generatorPublicKey == delegateKey) {
      return cb();
    }

    cb("Failed to validate propose slot");
  });
}

// Public methods
Delegates.prototype.generateDelegateList = function (height, cb) {
  (async function () {
    try {
      var truncDelegateList = self.getBookkeeper()
      var seedSource = modules.round.calc(height).toString();

      var currentSeed = crypto.createHash('sha256').update(seedSource, 'utf8').digest();
      for (var i = 0, delCount = truncDelegateList.length; i < delCount; i++) {
        for (var x = 0; x < 4 && i < delCount; i++ , x++) {
          var newIndex = currentSeed[x] % delCount;
          var b = truncDelegateList[newIndex];
          truncDelegateList[newIndex] = truncDelegateList[i];
          truncDelegateList[i] = b;
        }
        currentSeed = crypto.createHash('sha256').update(currentSeed).digest();
      }

      cb(null, truncDelegateList);
    } catch (e) {
      cb('Failed to get bookkeeper: ' + e)
    }
  })()
}

Delegates.prototype.checkDelegates = function (publicKey, votes, cb) {
  if (util.isArray(votes)) {
    modules.accounts.getAccount({ publicKey: publicKey }, function (err, account) {
      if (err) {
        return cb(err);
      }
      if (!account) {
        return cb("Account not found");
      }

      var existing_votes = account.delegates ? account.delegates.length : 0;
      var additions = 0, removals = 0;

      async.eachSeries(votes, function (action, cb) {
        var math = action[0];

        if (math !== '+' && math !== '-') {
          return cb("Invalid math operator");
        }

        if (math == '+') {
          additions += 1;
        } else if (math == '-') {
          removals += 1;
        }

        var publicKey = action.slice(1);

        try {
          new Buffer(publicKey, "hex");
        } catch (e) {
          return cb("Invalid public key");
        }

        if (math == "+" && (account.delegates !== null && account.delegates.indexOf(publicKey) != -1)) {
          return cb("Failed to add vote, account has already voted for this delegate");
        }
        if (math == "-" && (account.delegates === null || account.delegates.indexOf(publicKey) === -1)) {
          return cb("Failed to remove vote, account has not voted for this delegate");
        }

        modules.accounts.getAccount({ publicKey: publicKey, isDelegate: 1 }, function (err, account) {
          if (err) {
            return cb(err);
          }

          if (!account) {
            return cb("Delegate not found");
          }

          cb();
        });
      }, function (err) {
        if (err) {
          return cb(err);
        }
        var total_votes = (existing_votes + additions) - removals;
        if (total_votes > 101) {
          var exceeded = total_votes - 101;
          return cb("Maximum number of 101 votes exceeded (" + exceeded + " too many).");
        } else {
          return cb();
        }
      })
    });
  } else {
    setImmediate(cb, "Please provide an array of votes");
  }
}

Delegates.prototype.checkUnconfirmedDelegates = function (publicKey, votes, cb) {
  if (util.isArray(votes)) {
    modules.accounts.getAccount({ publicKey: publicKey }, function (err, account) {
      if (err) {
        return cb(err);
      }
      if (!account) {
        return cb("Account not found");
      }

      async.eachSeries(votes, function (action, cb) {
        var math = action[0];

        if (math !== '+' && math !== '-') {
          return cb("Invalid math operator");
        }

        var publicKey = action.slice(1);


        try {
          new Buffer(publicKey, "hex");
        } catch (e) {
          return cb("Invalid public key");
        }

        if (math == "+" && (account.u_delegates !== null && account.u_delegates.indexOf(publicKey) != -1)) {
          return cb("Failed to add vote, account has already voted for this delegate");
        }
        if (math == "-" && (account.u_delegates === null || account.u_delegates.indexOf(publicKey) === -1)) {
          return cb("Failed to remove vote, account has not voted for this delegate");
        }

        modules.accounts.getAccount({ publicKey: publicKey, isDelegate: 1 }, function (err, account) {
          if (err) {
            return cb(err);
          }

          if (!account) {
            return cb("Delegate not found");
          }

          cb();
        });
      }, cb)
    });
  } else {
    return setImmediate(cb, "Please provide an array of votes");
  }
}

Delegates.prototype.fork = function (block, cause) {
  library.logger.info('Fork', {
    delegate: block.delegate,
    block: { id: block.id, timestamp: block.timestamp, height: block.height, prevBlockId: block.prevBlockId },
    cause: cause
  });
}

Delegates.prototype.validateBlockSlot = function (block, cb) {
  self.generateDelegateList(block.height, function (err, activeDelegates) {
    if (err) {
      return cb(err);
    }
    var currentSlot = slots.getSlotNumber(block.timestamp);
    var delegateKey = activeDelegates[currentSlot % 101];

    if (delegateKey && block.delegate === delegateKey) {
      return cb();
    }

    cb("Failed to verify slot, expected delegate: " + delegateKey);
  });
}

Delegates.prototype.getDelegates = function (query, cb) {
  let delegates = app.sdb.getAllCached('Delegate').map((d) => Object.assign({}, d))
  if (!delegates || !delegates.length) return cb('No delegates')

  delegates = delegates.sort(self.compare)

  let lastBlock = modules.blocks.getLastBlock();
  let totalSupply = private.blockStatus.calcSupply(lastBlock.height);
  for (let i = 0; i < delegates.length; ++i) {
    let d = delegates[i]
    d.rate = i + 1
    delegates[i].approval = ((d.votes / totalSupply) * 100).toFixed(2);

    var percent = 100 - (d.missedBlocks / (d.producedBlocks + d.missedBlocks) / 100);
    percent = percent || 0;
    delegates[i].productivity = parseFloat(Math.floor(percent * 100) / 100).toFixed(2);

    delegates[i].vote = delegates[i].votes
    delegates[i].missedblocks = delegates[i].missedBlocks
    delegates[i].producedblocks = delegates[i].producedBlocks
  }
  return cb(null, delegates)
}

Delegates.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Delegates.prototype.enableForging = function () {
  private.forgingEanbled = true;
}

Delegates.prototype.disableForging = function () {
  private.forgingEanbled = false;
}

// Events
Delegates.prototype.onBind = function (scope) {
  modules = scope;
}

Delegates.prototype.onBlockchainReady = function () {
  private.loaded = true;

  private.loadMyDelegates(function nextLoop(err) {
    if (err) {
      library.logger.error("Failed to load delegates", err);
    }

    private.loop(function () {
      setTimeout(nextLoop, 100);
    });

  });
}

Delegates.prototype.compare = function (l, r) {
  return (l.votes !== r.votes) ? r.votes - l.votes : l.publicKey < r.publicKey ? 1 : -1 
}

Delegates.prototype.cleanup = function (cb) {
  private.loaded = false;
  cb();
}

Delegates.prototype.getTopDelegates = function () {
  let allDelegates = app.sdb.getAllCached('Delegate')
  return allDelegates.sort(self.compare).map(d => d.publicKey).slice(0, 101)
}

Delegates.prototype.getBookkeeperAddresses = function () {
  let bookkeeper = self.getBookkeeper()
  let addresses = new Set
  for (let i of bookkeeper) {
    let address = modules.accounts.generateAddressByPublicKey(i)
    addresses.add(address)
  }
  return addresses
}

Delegates.prototype.getBookkeeper = function () {
  let item = app.sdb.getCached('Variable', BOOK_KEEPER_NAME)
  if (!item) throw new Error('Bookkeeper variable not found')
  return JSON.parse(item.value)
}

Delegates.prototype.updateBookkeeper = function (delegates) {
  delegates = delegates || self.getTopDelegates()
  let value = JSON.stringify(delegates)
  let bookKeeper = app.sdb.getCached('Variable', BOOK_KEEPER_NAME) ||
    app.sdb.create('Variable', BOOK_KEEPER_NAME, { key: BOOK_KEEPER_NAME, value: value })

  bookKeeper.value = value
}

// Shared
shared.getDelegate = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      publicKey: {
        type: "string"
      },
      name: {
        type: "string"
      },
      address: {
        type: "string"
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    modules.delegates.getDelegates(query, function (err, delegates) {
      if (err) {
        return cb(err);
      }

      var delegate = delegates.find(function (d) {
        if (query.publicKey) {
          return d.publicKey == query.publicKey;
        } else if (query.address) {
          return d.address == query.address;
        } else if (query.name) {
          return d.name == query.name;
        }

        return false;
      });

      if (delegate) {
        cb(null, { delegate: delegate });
      } else {
        cb("Delegate not found");
      }
    });
  });
}

shared.count = function (req, cb) {
  (async function () {
    try {
      let count = app.sdb.getAllCached('Delegate').length
      return cb(null, { count })
    } catch (e) {
      library.logger.error('get delegate count error', e)
      return cb("Failed to count delegates");
    }
  })()
}

shared.getVoters = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: "string",
        maxLength: 50
      }
    },
    required: ['name']
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    (async function () {
      try {
        let votes = await app.sdb.findAll('Vote', { condition: { delegate: query.name } })
        if (!votes || !votes.length) return cb(null, { accounts: [] })

        let addresses = votes.map((v) => v.address)
        let accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addresses } } })
        let lastBlock = modules.blocks.getLastBlock();
        let totalSupply = private.blockStatus.calcSupply(lastBlock.height);
        for (let a of accounts) {
          a.balance = a.xas
          a.weightRatio = a.weight / totalSupply * 100
        }
        return cb(null, { accounts })
      } catch (e) {
        library.logger.error('Failed to find voters', e)
        return cb('Server error')
      }
    })()
  });
}

shared.getDelegates = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: "integer",
        minimum: 0,
        maximum: 101
      },
      offset: {
        type: "integer",
        minimum: 0
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    let offset = query.offset || 0
    let limit = query.limit || 20;

    self.getDelegates({}, function (err, delegates) {
      if (err) return cb(err)
      return cb(null, {
        totalCount: delegates.length,
        delegates: delegates.slice(offset, offset + limit)
      })
    })
  });
}

shared.getFee = function (req, cb) {
  var query = req.body;
  var fee = null;

  fee = 100 * constants.fixedPoint;

  cb(null, { fee: fee })
}

module.exports = Delegates;