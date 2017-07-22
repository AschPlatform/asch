var ByteBuffer = require("bytebuffer");
var crypto = require('crypto');
var async = require('async');
var ed = require('../utils/ed.js');
var constants = require('../utils/constants.js');
var slots = require('../utils/slots.js');
var Router = require('../utils/router.js');
var TransactionTypes = require('../utils/transaction-types.js');
var sandboxHelper = require('../utils/sandbox.js');
var addressHelper = require('../utils/address.js')

var genesisblock = null;
// Private fields
var modules, library, self, private = {}, shared = {};

private.unconfirmedNumber = 0;
private.unconfirmedTransactions = [];
private.unconfirmedTransactionsIdIndex = {};

function Transfer() {
  this.create = function (data, trs) {
    trs.recipientId = data.recipientId;
    trs.amount = data.amount;

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee();
  }

  this.verify = function (trs, sender, cb) {
    if (!addressHelper.isAddress(trs.recipientId)) {
      return cb("Invalid recipient");
    }

    if (trs.amount <= 0) {
      return cb("Invalid transaction amount");
    }

    if (trs.recipientId == sender.address) {
      return cb("Invalid recipientId, cannot be your self");
    }

    var lastBlock = modules.blocks.getLastBlock()
    if (sender.lockHeight && lastBlock && lastBlock.height + 1 <= sender.lockHeight) {
      return cb('Account is locked')
    }

    cb(null, trs);
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    return null;
  }

  this.apply = function (trs, block, sender, cb) {
    modules.accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
      if (err) {
        return cb(err);
      }

      modules.accounts.mergeAccountAndGet({
        address: trs.recipientId,
        balance: trs.amount,
        u_balance: trs.amount,
        blockId: block.id,
        round: modules.round.calc(block.height)
      }, function (err) {
        cb(err);
      });
    });
  }

  this.undo = function (trs, block, sender, cb) {
    modules.accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
      if (err) {
        return cb(err);
      }

      modules.accounts.mergeAccountAndGet({
        address: trs.recipientId,
        balance: -trs.amount,
        u_balance: -trs.amount,
        blockId: block.id,
        round: modules.round.calc(block.height)
      }, function (err) {
        cb(err);
      });
    });
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
  }

  this.objectNormalize = function (trs) {
    delete trs.blockId;
    return trs;
  }

  this.dbRead = function (raw) {
    return null;
  }

  this.dbSave = function (trs, cb) {
    setImmediate(cb);
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

function Storage() {
  this.create = function (data, trs) {
    trs.asset.storage = {
      content: Buffer.isBuffer(data.content) ? data.content.toString('hex') : data.content
    }

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    var binary = Buffer.from(trs.asset.storage.content, 'hex');
    return (Math.floor(binary.length / 200) + 1) * library.base.block.calculateFee();
  }

  this.verify = function (trs, sender, cb) {
    if (!trs.asset.storage || !trs.asset.storage.content) {
      return cb('Invalid transaction asset');
    }
    if (new Buffer(trs.asset.storage.content, 'hex').length > 4096) {
      return cb('Invalid storage content size');
    }

    cb(null, trs);
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    return ByteBuffer.fromHex(trs.asset.storage.content).toBuffer();
  }

  this.apply = function (trs, block, sender, cb) {
    setImmediate(cb);
  }

  this.undo = function (trs, block, sender, cb) {
    setImmediate(cb);
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.storage, {
      type: "object",
      properties: {
        content: {
          type: "string",
          format: "hex"
        }
      },
      required: ['content']
    });

    if (!report) {
      throw Error('Invalid storage parameters: ' + library.scheme.getLastError());
    }

    return trs;
  }

  this.dbRead = function (raw) {
    if (!raw.st_content) {
      return null;
    } else {
      var storage = {
        content: raw.st_content
      }

      return { storage: storage };
    }
  }

  this.dbSave = function (trs, cb) {
    try {
      var content = new Buffer(trs.asset.storage.content, 'hex');
    } catch (e) {
      return cb(e.toString())
    }

    library.dbLite.query("INSERT INTO storages(transactionId, content) VALUES($transactionId, $content)", {
      transactionId: trs.id,
      content: content
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

function Lock() {
  this.create = function (data, trs) {
    trs.args = data.args

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee();
  }

  this.verify = function (trs, sender, cb) {
    if (trs.args.length > 1) return cb('Invalid args length')
    if (trs.args[0].length > 50) return cb('Invalid lock height')
    var lockHeight = Number(trs.args[0])

    var lastBlock = modules.blocks.getLastBlock()

    if (isNaN(lockHeight) || lockHeight <= lastBlock.height) return cb('Invalid lock height')
    if (sender.lockHeight && lastBlock.height + 1 <= sender.lockHeight) return cb('Account is locked')

    cb(null, trs);
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    return null
  }

  this.apply = function (trs, block, sender, cb) {
    library.base.account.set(sender.address, { lockHeight: Number(trs.args[0]) }, cb)
  }

  this.undo = function (trs, block, sender, cb) {
    library.base.account.set(sender.address, { lockHeight: 0 }, cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
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
    return trs;
  }

  this.dbRead = function (raw) {
    return null;
  }

  this.dbSave = function (trs, cb) {
    setImmediate(cb);
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
function Transactions(cb, scope) {
  library = scope;
  genesisblock = library.genesisblock;
  self = this;
  self.__private = private;
  private.attachApi();

  library.base.transaction.attachAssetType(TransactionTypes.SEND, new Transfer());
  library.base.transaction.attachAssetType(TransactionTypes.STORAGE, new Storage());
  library.base.transaction.attachAssetType(TransactionTypes.LOCK, new Lock());

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
    "get /": "getTransactions",
    "get /get": "getTransaction",
    "get /unconfirmed/get": "getUnconfirmedTransaction",
    "get /unconfirmed": "getUnconfirmedTransactions",
    "put /": "addTransactions"
  });

  router.use(function (req, res, next) {
    res.status(500).send({ success: false, error: "API endpoint not found" });
  });

  library.network.app.use('/api/transactions', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });

  private.attachStorageApi();
}

private.attachStorageApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.map(shared, {
    "get /get": "getStorage",
    "get /:id": "getStorage",
    "put /": "putStorage"
  });

  router.use(function (req, res, next) {
    res.status(500).send({ success: false, error: "API endpoint not found" });
  });

  library.network.app.use('/api/storages', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.list = function (filter, cb) {
  var sortFields = ['t.id', 't.blockId', 't.amount', 't.fee', 't.type', 't.timestamp', 't.senderPublicKey', 't.senderId', 't.recipientId', 't.confirmations', 'b.height'];
  var params = {}, fields_or = [], owner = "";
  if (filter.blockId) {
    fields_or.push('blockId = $blockId')
    params.blockId = filter.blockId;
  }
  if (filter.senderPublicKey) {
    fields_or.push('lower(hex(senderPublicKey)) = $senderPublicKey')
    params.senderPublicKey = filter.senderPublicKey;
  }
  if (filter.senderId) {
    fields_or.push('senderId = $senderId');
    params.senderId = filter.senderId;
  }
  if (filter.recipientId) {
    fields_or.push('recipientId = $recipientId')
    params.recipientId = filter.recipientId;
  }
  if (filter.ownerAddress && filter.ownerPublicKey) {
    owner = '(lower(hex(senderPublicKey)) = $ownerPublicKey or recipientId = $ownerAddress)';
    params.ownerPublicKey = filter.ownerPublicKey;
    params.ownerAddress = filter.ownerAddress;
  } else if (filter.ownerAddress) {
    owner = '(senderId = $ownerAddress or recipientId = $ownerAddress)';
    params.ownerAddress = filter.ownerAddress;
  }
  if (filter.type >= 0) {
    fields_or.push('type = $type');
    params.type = filter.type;
  }
  if (filter.uia) {
    fields_or.push('(type >=9 and type <= 14)')
  }

  if (filter.message) {
    fields_or.push('message = $message')
    params.message = filter.message
  }

  if (filter.limit >= 0) {
    params.limit = filter.limit;
  }
  if (filter.offset >= 0) {
    params.offset = filter.offset;
  }

  if (filter.orderBy) {
    var sort = filter.orderBy.split(':');
    var sortBy = sort[0].replace(/[^\w_]/gi, '').replace('_', '.');
    if (sort.length == 2) {
      var sortMethod = sort[1] == 'desc' ? 'desc' : 'asc'
    } else {
      sortMethod = "desc";
    }
  }

  if (sortBy) {
    if (sortFields.indexOf(sortBy) < 0) {
      return cb("Invalid sort field");
    }
  }

  if (filter.limit > 100) {
    return cb("Invalid limit. Maximum is 100");
  }

  var uiaCurrencyJoin = ''
  if (filter.currency) {
    uiaCurrencyJoin = 'inner join transfers ut on ut.transactionId = t.id and ut.currency = "' + filter.currency + '" '
  }

  library.dbLite.query("select count(t.id) " +
    "from trs t " +
    "inner join blocks b on t.blockId = b.id " + uiaCurrencyJoin +
    (fields_or.length || owner ? "where " : "") + " " +
    (fields_or.length ? "(" + fields_or.join(' or ') + ") " : "") + (fields_or.length && owner ? " and " + owner : owner), params, { "count": Number }, function (err, rows) {
      if (err) {
        return cb(err);
      }

      var count = rows.length ? rows[0].count : 0;

      // Need to fix 'or' or 'and' in query
      library.dbLite.query("select t.id, b.height, t.blockId, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), t.signatures, t.args, t.message, (select max(height) + 1 from blocks) - b.height " +
        "from trs t " +
        "inner join blocks b on t.blockId = b.id " + uiaCurrencyJoin +
        (fields_or.length || owner ? "where " : "") + " " +
        (fields_or.length ? "(" + fields_or.join(' or ') + ") " : "") + (fields_or.length && owner ? " and " + owner : owner) + " " +
        (filter.orderBy ? 'order by ' + sortBy + ' ' + sortMethod : '') + " " +
        (filter.limit ? 'limit $limit' : '') + " " +
        (filter.offset ? 'offset $offset' : ''), params, ['t_id', 'b_height', 't_blockId', 't_type', 't_timestamp', 't_senderPublicKey', 't_senderId', 't_recipientId', 't_amount', 't_fee', 't_signature', 't_signSignature', 't_signatures', 't_args', 't_message', 'confirmations'], function (err, rows) {
          if (err) {
            return cb(err);
          }

          var transactions = [];
          for (var i = 0; i < rows.length; i++) {
            transactions.push(library.base.transaction.dbRead(rows[i]));
          }
          var data = {
            transactions: transactions,
            count: count
          }
          cb(null, data);
        });
    });
}

private.getById = function (id, cb) {
  library.dbLite.query("select t.id, b.height, t.blockId, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), t.args, t.message, (select max(height) + 1 from blocks) - b.height " +
    "from trs t " +
    "inner join blocks b on t.blockId = b.id " +
    "where t.id = $id", { id: id }, ['t_id', 'b_height', 't_blockId', 't_type', 't_timestamp', 't_senderPublicKey', 't_senderId', 't_recipientId', 't_amount', 't_fee', 't_signature', 't_signSignature', 't_args', 't_message', 'confirmations'], function (err, rows) {
      if (err || !rows.length) {
        return cb(err || "Can't find transaction: " + id);
      }

      var transacton = library.base.transaction.dbRead(rows[0]);
      cb(null, transacton);
    });
}

private.addUnconfirmedTransaction = function (transaction, sender, cb) {
  self.applyUnconfirmed(transaction, sender, function (err) {
    if (err) {
      self.removeUnconfirmedTransaction(transaction.id);
      return setImmediate(cb, err);
    }

    private.unconfirmedTransactions.push(transaction);
    var index = private.unconfirmedTransactions.length - 1;
    private.unconfirmedTransactionsIdIndex[transaction.id] = index;
    private.unconfirmedNumber++;

    setImmediate(cb);
  });
}

// Public methods
Transactions.prototype.getUnconfirmedTransaction = function (id) {
  var index = private.unconfirmedTransactionsIdIndex[id];
  return private.unconfirmedTransactions[index];
}

Transactions.prototype.getUnconfirmedTransactionList = function (reverse, limit) {
  var a = [];

  for (var i = 0; i < private.unconfirmedTransactions.length; i++) {
    if (private.unconfirmedTransactions[i] !== false) {
      a.push(private.unconfirmedTransactions[i]);
    }
  }

  a = reverse ? a.reverse() : a;

  if (limit) {
    a.splice(limit);
  }

  return a;
}

Transactions.prototype.removeUnconfirmedTransaction = function (id) {
  if (private.unconfirmedTransactionsIdIndex[id] == undefined) {
    return
  }
  var index = private.unconfirmedTransactionsIdIndex[id];
  delete private.unconfirmedTransactionsIdIndex[id];
  private.unconfirmedTransactions[index] = false;
  private.unconfirmedNumber--;
}

Transactions.prototype.hasUnconfirmedTransaction = function (transaction) {
  var index = private.unconfirmedTransactionsIdIndex[transaction.id];
  return index !== undefined && private.unconfirmedTransactions[index] !== false;
}

Transactions.prototype.processUnconfirmedTransaction = function (transaction, broadcast, cb) {
  if (!transaction) {
    return cb("No transaction to process!");
  }
  if (!transaction.id) {
    transaction.id = library.base.transaction.getId(transaction);
  }
  if (!global.featureSwitch.enableUIA && transaction.type >= 8 && transaction.type <= 14) {
    return cb("Feature not activated");
  }
  if (!global.featureSwitch.enable1_3_0 && ([5, 6, 7, 100].indexOf(transaction.type) !== -1 || transaction.message || transaction.args)) {
    return cb("Feature not activated");
  }
  // Check transaction indexes
  if (private.unconfirmedTransactionsIdIndex[transaction.id] !== undefined) {
    return cb("Transaction " + transaction.id + " already exists, ignoring...");
  }

  modules.accounts.setAccountAndGet({ publicKey: transaction.senderPublicKey }, function (err, sender) {
    function done(err) {
      if (err) {
        return cb(err);
      }

      private.addUnconfirmedTransaction(transaction, sender, function (err) {
        if (err) {
          return cb(err);
        }

        library.bus.message('unconfirmedTransaction', transaction, broadcast);

        cb();
      });
    }

    if (err) {
      return done(err);
    }

    if (transaction.requesterPublicKey && sender && sender.multisignatures && sender.multisignatures.length) {
      modules.accounts.getAccount({ publicKey: transaction.requesterPublicKey }, function (err, requester) {
        if (err) {
          return done(err);
        }

        if (!requester) {
          return cb("Invalid requester");
        }

        library.base.transaction.process(transaction, sender, requester, function (err, transaction) {
          if (err) {
            return done(err);
          }

          library.base.transaction.verify(transaction, sender, done);
        });
      });
    } else {
      library.base.transaction.process(transaction, sender, function (err, transaction) {
        if (err) {
          return done(err);
        }

        library.base.transaction.verify(transaction, sender, done);
      });
    }
  });
}

Transactions.prototype.applyUnconfirmedList = function (ids, cb) {
  async.eachSeries(ids, function (id, cb) {
    var transaction = self.getUnconfirmedTransaction(id);
    modules.accounts.setAccountAndGet({ publicKey: transaction.senderPublicKey }, function (err, sender) {
      if (err) {
        self.removeUnconfirmedTransaction(id);
        return setImmediate(cb);
      }
      self.applyUnconfirmed(transaction, sender, function (err) {
        if (err) {
          self.removeUnconfirmedTransaction(id);
        }
        setImmediate(cb);
      });
    });
  }, cb);
}

Transactions.prototype.undoUnconfirmedList = function (cb) {
  var ids = [];
  async.eachSeries(private.unconfirmedTransactions, function (transaction, cb) {
    if (transaction !== false) {
      ids.push(transaction.id);
      self.undoUnconfirmed(transaction, cb);
    } else {
      setImmediate(cb);
    }
  }, function (err) {
    cb(err, ids);
  })
}

Transactions.prototype.apply = function (transaction, block, sender, cb) {
  library.base.transaction.apply(transaction, block, sender, cb);
}

Transactions.prototype.undo = function (transaction, block, sender, cb) {
  library.base.transaction.undo(transaction, block, sender, cb);
}

Transactions.prototype.applyUnconfirmed = function (transaction, sender, cb) {
  if (!sender && transaction.blockId != genesisblock.block.id) {
    return cb("Invalid block id");
  } else {
    if (transaction.requesterPublicKey) {
      modules.accounts.getAccount({ publicKey: transaction.requesterPublicKey }, function (err, requester) {
        if (err) {
          return cb(err);
        }

        if (!requester) {
          return cb("Invalid requester");
        }

        library.base.transaction.applyUnconfirmed(transaction, sender, requester, cb);
      });
    } else {
      library.base.transaction.applyUnconfirmed(transaction, sender, cb);
    }
  }
}

Transactions.prototype.undoUnconfirmed = function (transaction, cb) {
  modules.accounts.getAccount({ publicKey: transaction.senderPublicKey }, function (err, sender) {
    if (err) {
      return cb(err);
    }
    self.removeUnconfirmedTransaction(transaction.id)
    library.base.transaction.undoUnconfirmed(transaction, sender, cb);
  });
}

Transactions.prototype.receiveTransactions = function (transactions, cb) {
  if (private.unconfirmedNumber > constants.maxTxsPerBlock) {
    setImmediate(cb, "Too many transactions");
    return;
  }
  async.eachSeries(transactions, function (transaction, next) {
    self.processUnconfirmedTransaction(transaction, true, next);
  }, function (err) {
    cb(err, transactions);
  });
}

Transactions.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Transactions.prototype.list = function (query, cb) {
  private.list(query, cb)
}

// Events
Transactions.prototype.onBind = function (scope) {
  modules = scope;
}

// Shared
shared.getTransactions = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      blockId: {
        type: "string"
      },
      limit: {
        type: "integer",
        minimum: 0,
        maximum: 100
      },
      type: {
        type: "integer",
        minimum: 0,
        maximum: 10
      },
      orderBy: {
        type: "string"
      },
      offset: {
        type: "integer",
        minimum: 0
      },
      senderPublicKey: {
        type: "string",
        format: "publicKey"
      },
      ownerPublicKey: {
        type: "string",
        format: "publicKey"
      },
      ownerAddress: {
        type: "string"
      },
      senderId: {
        type: "string"
      },
      recipientId: {
        type: "string"
      },
      amount: {
        type: "integer",
        minimum: 0,
        maximum: constants.fixedPoint
      },
      fee: {
        type: "integer",
        minimum: 0,
        maximum: constants.fixedPoint
      },
      uia: {
        type: "integer",
        minimum: 0,
        maximum: 1
      },
      currency: {
        type: "string",
        minimum: 1,
        maximum: 22
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    private.list(query, function (err, data) {
      if (err) {
        return cb("Failed to get transactions");
      }

      cb(null, { transactions: data.transactions, count: data.count });
    });
  });
}

shared.getTransaction = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['id']
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    private.getById(query.id, function (err, transaction) {
      if (!transaction || err) {
        return cb("Transaction not found");
      }
      cb(null, { transaction: transaction });
    });
  });
}

shared.getUnconfirmedTransaction = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 64
      }
    },
    required: ['id']
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    var unconfirmedTransaction = self.getUnconfirmedTransaction(query.id);

    if (!unconfirmedTransaction) {
      return cb("Transaction not found");
    }

    cb(null, { transaction: unconfirmedTransaction });
  });
}

shared.getUnconfirmedTransactions = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      senderPublicKey: {
        type: "string",
        format: "publicKey"
      },
      address: {
        type: "string"
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    var transactions = self.getUnconfirmedTransactionList(true),
      toSend = [];

    if (query.senderPublicKey || query.address) {
      for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].senderPublicKey == query.senderPublicKey || transactions[i].recipientId == query.address) {
          toSend.push(transactions[i]);
        }
      }
    } else {
      for (var i = 0; i < transactions.length; i++) {
        toSend.push(transactions[i]);
      }
    }

    cb(null, { transactions: toSend });
  });
}

shared.addTransactions = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      amount: {
        type: "integer",
        minimum: 1,
        maximum: constants.totalAmount
      },
      recipientId: {
        type: "string",
        minLength: 1
      },
      publicKey: {
        type: "string",
        format: "publicKey"
      },
      secondSecret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      multisigAccountPublicKey: {
        type: "string",
        format: "publicKey"
      }
    },
    required: ["secret", "amount", "recipientId"]
  }, function (err) {
    if (err) {
      return cb(err[0].message + ': ' + err[0].path);
    }

    var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
    var keypair = ed.MakeKeypair(hash);

    if (body.publicKey) {
      if (keypair.publicKey.toString('hex') != body.publicKey) {
        return cb("Invalid passphrase");
      }
    }

    var query = { address: body.recipientId };

    library.balancesSequence.add(function (cb) {
      modules.accounts.getAccount(query, function (err, recipient) {
        if (err) {
          return cb(err.toString());
        }

        var recipientId = recipient ? recipient.address : body.recipientId;
        if (!recipientId) {
          return cb("Recipient not found");
        }

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
                  type: TransactionTypes.SEND,
                  amount: body.amount,
                  sender: account,
                  recipientId: recipientId,
                  keypair: keypair,
                  requester: keypair,
                  secondKeypair: secondKeypair
                });
              } catch (e) {
                return cb(e.toString());
              }
              modules.transactions.receiveTransactions([transaction], cb);
            });
          });
        } else {
          modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
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
                type: TransactionTypes.SEND,
                amount: body.amount,
                sender: account,
                recipientId: recipientId,
                keypair: keypair,
                secondKeypair: secondKeypair
              });
            } catch (e) {
              return cb(e.toString());
            }
            modules.transactions.receiveTransactions([transaction], cb);
          });
        }
      });
    }, function (err, transaction) {
      if (err) {
        return cb(err.toString());
      }

      cb(null, { transactionId: transaction[0].id });
    });
  });
}

shared.putStorage = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      secondSecret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      multisigAccountPublicKey: {
        type: "string",
        format: "publicKey"
      },
      content: {
        type: "string",
        minLength: 1,
        maxLength: 4096,
      },
      encode: {
        type: "string",
        minLength: 1,
        maxLength: 10
      },
      wait: {
        type: "integer",
        minimum: 0,
        maximum: 6
      }
    },
    required: ["secret", "content"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }
    var encode = body.encode;
    if (!encode) {
      encode = 'raw';
    }
    if (encode != 'raw' && encode != 'base64' && encode != 'hex') {
      return cb('Invalide content encode type');
    }
    var content;
    if (encode != 'raw') {
      try {
        content = new Buffer(body.content, encode);
      } catch (e) {
        return cb('Invalid content format with encode type ' + encode);
      }
    } else {
      content = new Buffer(body.content);
    }

    var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
    var keypair = ed.MakeKeypair(hash);

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
                type: TransactionTypes.STORAGE,
                sender: account,
                keypair: keypair,
                requester: keypair,
                secondKeypair: secondKeypair,
                content: content
              });
            } catch (e) {
              return cb(e.toString());
            }
            modules.transactions.receiveTransactions([transaction], cb);
          });
        });
      } else {
        modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
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
              type: TransactionTypes.STORAGE,
              sender: account,
              keypair: keypair,
              secondKeypair: secondKeypair,
              content: content
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
      // if (!body.wait) {
      if (1 === 1) {
        return cb(null, { transactionId: transaction[0].id });
      }

      var confirms = 0;
      function onConfirmed() {
        if (++confirms >= body.wait) {
          library.bus.removeListener('newBlock', onConfirmed);
          cb(null, { transactionId: transaction[0].id });
        }
      }
      library.bus.on('newBlock', onConfirmed);
    });
  });
}

shared.getStorage = function (req, cb) {
  var query;
  if (req.body && req.body.id) {
    query = req.body;
  } else if (req.params && req.params.id) {
    query = req.params;
  }
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['id']
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    library.dbLite.query("select t.id, b.height, t.blockId, t.type, t.timestamp, lower(hex(t.senderPublicKey)), " +
      "t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), " +
      "lower(hex(st.content)), " +
      "(select max(height) + 1 from blocks) - b.height " +
      "from trs t " +
      "inner join blocks b on t.blockId = b.id " +
      "inner join storages st on st.transactionId = t.id " +
      "where t.id = $id",
      { id: query.id },
      [
        't_id', 'b_height', 't_blockId', 't_type', 't_timestamp', 't_senderPublicKey',
        't_senderId', 't_recipientId', 't_amount', 't_fee', 't_signature', 't_signSignature',
        'st_content', 'confirmations'
      ],
      function (err, rows) {
        if (err || !rows.length) {
          return cb(err || "Can't find transaction: " + query.id);
        }

        var transacton = library.base.transaction.dbRead(rows[0]);
        cb(null, transacton);
      });
  });
}

// Export
module.exports = Transactions;
