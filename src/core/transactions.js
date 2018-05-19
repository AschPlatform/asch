var ByteBuffer = require("bytebuffer")
var crypto = require('crypto')
var async = require('async')
var ed = require('../utils/ed.js')
var constants = require('../utils/constants.js')
var slots = require('../utils/slots.js')
var Router = require('../utils/router.js')
var TransactionTypes = require('../utils/transaction-types.js')
var sandboxHelper = require('../utils/sandbox.js')
var addressHelper = require('../utils/address.js')
var LimitCache = require('../utils/limit-cache.js')

var genesisblock = null;
// Private fields
var modules, library, self, private = {}, shared = {};

private.unconfirmedNumber = 0;
private.unconfirmedTransactions = [];
private.unconfirmedTransactionsIdIndex = {};

class TransactionPool {
  constructor() {
    this.index = new Map
    this.unConfirmed = new Array
  }

  add(trs) {
    this.unConfirmed.push(trs)
    this.index.set(trs.id, this.unConfirmed.length - 1)
  }

  remove(id) {
    let pos = this.index.get(id)
    delete this.index[id]
    this.unConfirmed[pos] = null
  }

  has(id) {
    let pos = this.index.get(id)
    return pos !== undefined && !!this.unConfirmed[pos]
  }

  getUnconfirmed() {
    var a = [];

    for (var i = 0; i < this.unConfirmed.length; i++) {
      if (!!this.unConfirmed[i]) {
        a.push(this.unConfirmed[i]);
      }
    }
    return a
  }

  clear() {
    this.index = new Map
    this.unConfirmed = new Array
  }

  get(id) {
    let pos = this.index.get(id)
    return this.unConfirmed[pos]
  }
}

// Constructor
function Transactions(cb, scope) {
  library = scope;
  genesisblock = library.genesisblock;
  self = this;
  self.__private = private;
  self.pool = new TransactionPool()
  self.processedTrsCache = new LimitCache()
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
    "get /": "getTransactions",
    "get /get": "getTransaction",
    "get /unconfirmed/get": "getUnconfirmedTransaction",
    "get /unconfirmed": "getUnconfirmedTransactions",
    "put /": "addTransactionUnsigned"
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

Transactions.prototype.getUnconfirmedTransaction = function (id) {
  return self.pool.get(id)
}

Transactions.prototype.getUnconfirmedTransactionList = function () {
  return self.pool.getUnconfirmed()
}

Transactions.prototype.removeUnconfirmedTransaction = function (id) {
  self.pool.remove(id)
}

Transactions.prototype.hasUnconfirmed = function (id) {
  return self.pool.has(id)
}

Transactions.prototype.clearUnconfirmed = function () {
  self.pool.clear()
}

Transactions.prototype.getUnconfirmedTransactions = function (_, cb) {
  setImmediate(cb, null, { transactions: self.getUnconfirmedTransactionList() })
}

Transactions.prototype.getTransactions = function (req, cb) {
  let limit = Number(req.query.limit) || 100
  let offset = Number(req.query.offset) || 0
  let condition = {}
  if (req.query.senderId) {
    condition.senderId = req.query.senderId
  }
  if (req.query.type) {
    condition.type = Number(req.query.type)
  }

  (async () => {
    try {
      let count = await app.sdb.count('Transaction', condition)
      let transactions = await app.sdb.find('Transaction', condition, { limit, offset })
      if (!transactions) transactions = []
      return cb(null, { transactions: transactions, count: count })
    } catch (e) {
      app.logger.error('Failed to get transactions', e)
      return cb('System error: ' + e)
    }
  })()
}

Transactions.prototype.getTransaction = function (req, cb) {
  (async function () {
    try {
      if (!req.params || !req.params.id) return cb('Invalid transaction id')
      let id = req.params.id
      let trs = await app.sdb.query('Transaction', { id: id })
      if (!trs || !trs.length) return cb('Transaction not found')
      return cb(null, { transaction: trs })
    } catch (e) {
      return cb('System error: ' + e)
    }
  })()
}

Transactions.prototype.applyTransactionsAsync = async function (transactions) {
  for (let i = 0; i < transactions.length; ++i) {
    await self.applyUnconfirmedTransactionAsync(transactions[i])
  }
}

Transactions.prototype.processUnconfirmedTransactions = function (transactions, cb) {
  (async function () {
    try {
      for (let t of transactions) {
        await self.processUnconfirmedTransactionAsync(transaction)
      }
      cb(null, transactions)
    } catch (e) {
      cb(e.toString(), transactions)
    }
  })()
}

Transactions.prototype.processUnconfirmedTransaction = function (transaction, cb) {
  (async function () {
    try {
      await self.processUnconfirmedTransactionAsync(transaction)
      cb(null, transaction)
    } catch (e) {
      cb(e.toString(), transaction)
    }
  })()
}

Transactions.prototype.processUnconfirmedTransactionAsync = async function (transaction) {
  try {
    if (!transaction.id) {
      transaction.id = library.base.transaction.getId(transaction);
    }

    if (self.processedTrsCache.has(transaction.id)) {
      throw new Error('Transaction already processed')
    }

    await self.applyUnconfirmedTransactionAsync(transaction)
    self.pool.add(transaction)
    return transaction
  } catch (e) {
    throw e
  } finally {
    self.processedTrsCache.set(transaction.id, true)
  }
}

Transactions.prototype.applyUnconfirmedTransactionAsync = async function (transaction) {
  library.logger.debug('apply unconfirmed trs', transaction)

  if (self.pool.has(transaction.id)) {
    throw new Error('Transaction already in the pool')
  }

  if (!transaction.senderId) {
    transaction.senderId = modules.accounts.generateAddressByPublicKey(transaction.senderPublicKey)
  }
  let height = modules.blocks.getLastBlock().height

  let sender = await app.sdb.get('Account', transaction.senderId)
  if (!sender) throw new Error('Sender account not found')

  let exists = await app.sdb.exists('Transaction', { id: transaction.id })
  if (exists) {
    throw new Error('Transaction already confirmed')
  }

  let block = {
    height: height + 1,
  }

  let context = {
    trs: transaction,
    block,
    sender
  }
  if (height > 0) {
    let error = library.base.transaction.verify(context)
    if (error) throw new Error(error)
  }

  try {
    app.sdb.beginContract()
    await library.base.transaction.apply(context)
    app.sdb.commitContract()
  } catch (e) {
    app.sdb.rollbackContract()
    library.logger.error(e)
    throw e
  }
}

Transactions.prototype.addTransactionUnsigned = function (transaction, cb) {
  shared.addTransactionUnsigned({ body: transaction }, cb)
}

Transactions.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Transactions.prototype.list = function (query, cb) {
  private.list(query, cb)
}

Transactions.prototype.getById = function (id, cb) {
  private.getById(id, cb)
}

// Events
Transactions.prototype.onBind = function (scope) {
  modules = scope;
}

// Shared
shared.getTransactions = function (req, cb) {
  // FIXME
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

shared.addTransactionUnsigned = function (req, cb) {
  let query = req.body
  if (query.type) {
    query.type = Number(query.type)
  }
  let valid = library.scheme.validate(query, {
    type: 'object',
    properties: {
      secret: { type: 'string', maxLength: 100 },
      fee: { type: 'integer', min: 1 },
      type: { type: 'integer', min: 1 },
      args: { type: 'array' },
      message: { type: 'string', maxLength: 50 }
    },
    required: ['secret', 'fee', 'type']
  })
  if (!valid) {
    library.logger.warn('Failed to validate query params', library.scheme.getLastError())
    return setImmediate(cb, library.scheme.getLastError().details[0].message)
  }
  library.sequence.add(function addTransactionUnsigned(cb) {
    (async function () {
      try {
        let hash = crypto.createHash('sha256').update(query.secret, 'utf8').digest();
        let keypair = ed.MakeKeypair(hash);
        let secondKeyPair = null
        if (query.secondSecret) {
          secondKeyPair = ed.MakeKeypair(crypto.createHash('sha256').update(query.secondSecret, 'utf8').digest())
        }
        let trs = library.base.transaction.create({
          secret: query.secret,
          fee: query.fee,
          type: query.type,
          args: query.args || null,
          message: query.message || null,
          secondKeyPair: secondKeyPair,
          keypair: keypair
        })
        await self.processUnconfirmedTransactionAsync(trs)
        library.bus.message('unconfirmedTransaction', trs)
        cb(null, { transactionId: trs.id })
      } catch (e) {
        library.logger.warn('Failed to process unsigned transaction', e)
        cb(e.toString())
      }
    })()
  }, cb)
}

// Export
module.exports = Transactions;
