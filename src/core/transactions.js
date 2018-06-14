const crypto = require('crypto')
const ed = require('../utils/ed.js')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')
const LimitCache = require('../utils/limit-cache.js')

// let genesisblock = null
// Private fields
let modules
let library
let self
const priv = {}
const shared = {}

priv.unconfirmedNumber = 0
priv.unconfirmedTransactions = []
priv.unconfirmedTransactionsIdIndex = {}

class TransactionPool {
  constructor() {
    this.index = new Map()
    this.unConfirmed = []
  }

  add(trs) {
    this.unConfirmed.push(trs)
    this.index.set(trs.id, this.unConfirmed.length - 1)
  }

  remove(id) {
    const pos = this.index.get(id)
    delete this.index[id]
    this.unConfirmed[pos] = null
  }

  has(id) {
    const pos = this.index.get(id)
    return pos !== undefined && !!this.unConfirmed[pos]
  }

  getUnconfirmed() {
    const a = []

    for (let i = 0; i < this.unConfirmed.length; i++) {
      if (this.unConfirmed[i]) {
        a.push(this.unConfirmed[i])
      }
    }
    return a
  }

  clear() {
    this.index = new Map()
    this.unConfirmed = []
  }

  get(id) {
    const pos = this.index.get(id)
    return this.unConfirmed[pos]
  }
}

// Constructor
function Transactions(cb, scope) {
  library = scope
  genesisblock = library.genesisblock
  self = this
  self.pool = new TransactionPool()
  self.processedTrsCache = new LimitCache()
  priv.attachApi()

  setImmediate(cb, null, self)
}

// Private methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /': 'getTransactions',
    'get /get': 'getTransaction',
    'get /unconfirmed/get': 'getUnconfirmedTransaction',
    'get /unconfirmed': 'getUnconfirmedTransactions',
    'put /': 'addTransactionUnsigned',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/transactions', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })

  priv.attachStorageApi()
}

priv.attachStorageApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /get': 'getStorage',
    'get /:id': 'getStorage',
    'put /': 'putStorage',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/storages', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

Transactions.prototype.getUnconfirmedTransaction = id => self.pool.get(id)

Transactions.prototype.getUnconfirmedTransactionList = () => self.pool.getUnconfirmed()

Transactions.prototype.removeUnconfirmedTransaction = id => self.pool.remove(id)

Transactions.prototype.hasUnconfirmed = id => self.pool.has(id)

Transactions.prototype.clearUnconfirmed = () => self.pool.clear()

Transactions.prototype.getUnconfirmedTransactions = (_, cb) =>
  setImmediate(cb, null, { transactions: self.getUnconfirmedTransactionList() })

Transactions.prototype.getTransactions = (req, cb) => {
  const limit = Number(req.query.limit) || 100
  const offset = Number(req.query.offset) || 0
  const condition = {}
  if (req.query.senderId) {
    condition.senderId = req.query.senderId
  }
  if (req.query.type) {
    condition.type = Number(req.query.type)
  }

  (async () => {
    try {
      const count = await app.sdb.count('Transaction', condition)
      let transactions = await app.sdb.find('Transaction', condition, { limit, offset })
      if (!transactions) transactions = []
      return cb(null, { transactions, count })
    } catch (e) {
      app.logger.error('Failed to get transactions', e)
      return cb(`System error: ${e}`)
    }
  })()
}

Transactions.prototype.getTransaction = (req, cb) => {
  (async () => {
    try {
      if (!req.params || !req.params.id) return cb('Invalid transaction id')
      const id = req.params.id
      const trs = await app.sdb.find('Transaction', { id })
      if (!trs || !trs.length) return cb('Transaction not found')
      return cb(null, { transaction: trs[0] })
    } catch (e) {
      return cb(`System error: ${e}`)
    }
  })()
}

Transactions.prototype.applyTransactionsAsync = async (transactions) => {
  for (let i = 0; i < transactions.length; ++i) {
    await self.applyUnconfirmedTransactionAsync(transactions[i])
  }
}

Transactions.prototype.processUnconfirmedTransactions = (transactions, cb) => {
  (async () => {
    try {
      for (const transaction of transactions) {
        await self.processUnconfirmedTransactionAsync(transaction)
      }
      cb(null, transactions)
    } catch (e) {
      cb(e.toString(), transactions)
    }
  })()
}

Transactions.prototype.processUnconfirmedTransaction = (transaction, cb) => {
  (async () => {
    try {
      await self.processUnconfirmedTransactionAsync(transaction)
      cb(null, transaction)
    } catch (e) {
      cb(e.toString(), transaction)
    }
  })()
}

Transactions.prototype.processUnconfirmedTransactionAsync = async (transaction) => {
  try {
    if (!transaction.id) {
      transaction.id = library.base.transaction.getId(transaction)
    }

    if (self.processedTrsCache.has(transaction.id)) {
      throw new Error('Transaction already processed')
    }
    if (self.pool.has(transaction.id)) {
      throw new Error('Transaction already in the pool')
    }
    const exists = await app.sdb.exists('Transaction', { id: transaction.id })
    if (exists) {
      throw new Error('Transaction already confirmed')
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

Transactions.prototype.applyUnconfirmedTransactionAsync = async (transaction) => {
  library.logger.debug('apply unconfirmed trs', transaction)

  const height = modules.blocks.getLastBlock().height
  const block = {
    height: height + 1,
  }

  const senderId = transaction.senderId
  const accountId = transaction.accountId
  if (!senderId && !accountId) {
    throw new Error('Missing sender address')
  }

  let requestor = null
  let sender = null

  if (senderId) {
    if (!app.util.address.isNormalAddress(senderId)) {
      throw new Error('Invalid sender address')
    }

    const senderPublicKey = transaction.senderPublicKey
    if (modules.accounts.generateAddressByPublicKey(senderPublicKey) !== senderId) {
      throw new Error('Invalid senderPublicKey')
    }

    requestor = await app.sdb.get('Account', senderId)
    if (!requestor) {
      if (height > 0) throw new Error('Requestor account not found')

      requestor = app.sdb.create('Account', {
        address: senderId,
        name: '',
        xas: 0,
      })
    }
  }

  if (accountId) {
    if (app.util.address.isNormalAddress(accountId)) {
      throw new Error('Invalid account address')
    }
    sender = await app.sdb.get('Account', accountId)
    if (!sender) throw new Error('Sender account not found')
  } else {
    sender = requestor
  }

  const context = {
    trs: transaction,
    block,
    sender,
    requestor,
  }
  if (height > 0) {
    const error = await library.base.transaction.verify(context)
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

Transactions.prototype.addTransactionUnsigned = (transaction, cb) =>
  shared.addTransactionUnsigned({ body: transaction }, cb)

Transactions.prototype.sandboxApi = (call, args, cb) =>
  sandboxHelper.callMethod(shared, call, args, cb)

Transactions.prototype.list = (query, cb) => priv.list(query, cb)

Transactions.prototype.getById = (id, cb) => priv.getById(id, cb)

// Events
Transactions.prototype.onBind = (scope) => {
  modules = scope
}

// Shared
shared.getTransactions = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
      offset: {
        type: 'integer',
        minimum: 0,
      },
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      blockId: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    const limit = query.limit || 100
    const offset = query.offset || 0

    const condition = {}
    if (query.senderId) {
      condition.senderId = query.senderId
    }
    if (query.type) {
      condition.type = Number(query.type)
    }
    if (query.id) {
      condition.id = query.id
    }

    (async () => {
      try {
        if (query.blockId) {
          const block = await app.sdb.getBlockById(query.blockId)
          if (block === undefined) {
            return cb(null, { transactions: [], count: 0 })
          }
          condition.height = block.height
        }
        const count = await app.sdb.count('Transaction', condition)
        let transactions = await app.sdb.find('Transaction', condition, { limit, offset })
        if (!transactions) transactions = []
        return cb(null, { transactions, count })
      } catch (e) {
        app.logger.error('Failed to get transactions', e)
        return cb(`System error: ${e}`)
      }
    })()
    return null
  })
}

shared.getTransaction = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
    },
    required: ['id'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }
    return Transactions.prototype.getTransaction({ params: query }, cb)
  })
}

shared.getUnconfirmedTransaction = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 64,
      },
    },
    required: ['id'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    const unconfirmedTransaction = self.getUnconfirmedTransaction(query.id)

    return !unconfirmedTransaction ?
      cb('Transaction not found') :
      cb(null, { transaction: unconfirmedTransaction })
  })
}

shared.getUnconfirmedTransactions = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      senderPublicKey: {
        type: 'string',
        format: 'publicKey',
      },
      address: {
        type: 'string',
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    const transactions = self.getUnconfirmedTransactionList(true)
    const toSend = []

    if (query.senderPublicKey || query.address) {
      for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].senderPublicKey === query.senderPublicKey ||
          transactions[i].recipientId === query.address) {
          toSend.push(transactions[i])
        }
      }
    } else {
      transactions.forEach(t => toSend.push(t))
    }

    return cb(null, { transactions: toSend })
  })
}

shared.addTransactionUnsigned = (req, cb) => {
  const query = req.body
  if (query.type) {
    query.type = Number(query.type)
  }
  const valid = library.scheme.validate(query, {
    type: 'object',
    properties: {
      secret: { type: 'string', maxLength: 100 },
      fee: { type: 'integer', min: 1 },
      type: { type: 'integer', min: 1 },
      args: { type: 'array' },
      message: { type: 'string', maxLength: 50 },
    },
    required: ['secret', 'fee', 'type'],
  })
  if (!valid) {
    library.logger.warn('Failed to validate query params', library.scheme.getLastError())
    return setImmediate(cb, library.scheme.getLastError().details[0].message)
  }

  library.sequence.add((callback) => {
    (async () => {
      try {
        const hash = crypto.createHash('sha256').update(query.secret, 'utf8').digest()
        const keypair = ed.MakeKeypair(hash)
        let secondKeyPair = null
        if (query.secondSecret) {
          secondKeyPair = ed.MakeKeypair(crypto.createHash('sha256').update(query.secondSecret, 'utf8').digest())
        }
        const trs = library.base.transaction.create({
          secret: query.secret,
          fee: query.fee,
          type: query.type,
          accountId: query.accountId || null,
          args: query.args || null,
          message: query.message || null,
          secondKeyPair,
          keypair,
        })
        await self.processUnconfirmedTransactionAsync(trs)
        library.bus.message('unconfirmedTransaction', trs)
        callback(null, { transactionId: trs.id })
      } catch (e) {
        library.logger.warn('Failed to process unsigned transaction', e)
        callback(e.toString())
      }
    })()
  }, cb)
  return null
}

// Export
module.exports = Transactions
