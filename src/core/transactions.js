const crypto = require('crypto')
const ed = require('../utils/ed.js')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')
const LimitCache = require('../utils/limit-cache.js')
const addressHelper = require('../utils/address.js')
const isArray = require('util').isArray

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
  const requestorId = transaction.requestorId
  if (!senderId) {
    throw new Error('Missing sender address')
  }

  let requestor = null
  let sender = await app.sdb.get('Account', senderId)
  if (!sender) {
    if (height > 0) throw new Error('Sender account not found')
    sender = app.sdb.create('Account', {
      address: senderId,
      name: '',
      xas: 0,
    })
  }

  if (requestorId) {
    if (!app.util.address.isNormalAddress(requestorId)) {
      throw new Error('Invalid requestor address')
    }

    requestor = await app.sdb.get('Account', requestorId)
    if (!requestor) {
      throw new Error('Requestor account not found')
    }
  } else {
    requestor = sender
  }

  const senderPublicKey = transaction.senderPublicKey
  if (senderPublicKey) {
    const signerId = transaction.requestorId || transaction.senderId
    if (addressHelper.generateNormalAddress(senderPublicKey) !== signerId) {
      throw new Error('Invalid senderPublicKey')
    }
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

Transactions.prototype.toAPIV1Transactions = (transArray, block) => {
  if (transArray && isArray(transArray) && transArray.length > 0) {
    return transArray.map(t => self.toAPIV1Transaction(t, block))
  }
  return []
}

function toV1TypeAndArgs(type, argsString) {
  let v1Type
  const args = JSON.parse(argsString)
  const v1Args = { }
  let result = { }
  switch (type) {
    case 1: // transfer
      v1Type = 0
      result = { amount: args[0], recipientId: args[1] }
      break
    case 3: // setPassword
      v1Type = 1
      result = { senderPublicKey: args[0] }
      break
    case 10: // registerDelegate
      v1Type = 2
      break
    case 11: // vote
      v1Type = 3
      reulst = { votes: args.map(v => `+${v}`).join(',') }
      break
    case 12: // unvote
      v1Type = 3
      reulst = { votes: args.map(v => `-${v}`).join(',') }
      break
    case 200: // register dapp
      v1Type = 5
      // args = [ dapp.name, dapp.description, dapp.link,
      // dapp.icon, dapp.delegates, dapp.unlockDelegates ]
      break
    case 204: // deposit
      v1Type = 6
      // args = [ it.name, it.currency, it.amount ];
      break
    case 205: // withdrawal
      v1Type = 7
      // args = [ ot.name, tx.senderId, ot.currency, ot.amount, ot.outtransactionId, 1 ]
      break
    case 100: // registerIssuer
      v1Type = 9
      // args = [ issuers.name, issuers.desc ];
      break
    case 101: // registerAsset
      v1Type = 10
      // args = [ asset.name, asset.desc, asset.maximum, asset.precision ]
      break
    case 102: // issue
      v1Type = 13
      // args = [ issue.currency, issue.amount ];
      break
    case 103: // UIA transfer
      v1Type = 14
      result = {
        asset: { uiaTransfer: { currency: args[0], amount: args[1] } },
        recipientId: args[2],
      }
      break
    case 4:
      v1Type = 100 // lock
      // args = [ tx.args[0], balance ];
      break
  }

  return Object.assign(result, { type: v1Type, args: v1Args, argsNew: args })
}

Transactions.prototype.toAPIV1Transaction = (trans, block) => {
  if (!trans) return trans

  const signArray = JSON.parse(trans.signatures)
  const result = {
    id: trans.id,
    height: trans.height,
    timestamp: trans.timestamp,
    senderPublicKey: trans.senderPublicKey,
    senderId: trans.senderId,
    signSignature: trans.signSignature,
    message: trans.message,
    fee: trans.fee,


    blockId: block.id,
    recipientId: '',
    amount: 0,
    asset: {},
    confirmations: block.confirmations,

    type: -1,
    signature: signArray.length === 1 ? signArray[0] : undefined,
    signatures: signArray.length === 1 ? undefined : signArray,
    args: {},
  }
  return Object.assign(result, toV1TypeAndArgs(trans.type, trans.args))
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
        let block
        if (query.blockId) {
          block = await app.sdb.getBlockById(query.blockId)
          if (block === undefined) {
            return cb(null, { transactions: [], count: 0 })
          }
          condition.height = block.height
        }
        const count = await app.sdb.count('Transaction', condition)
        let transactions = await app.sdb.find('Transaction', condition, { limit, offset })
        if (!transactions) transactions = []
        block = modules.blocks.toAPIV1Block(block)
        return cb(null, { transactions: self.toAPIV1Transactions(transactions, block), count })
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
    const callback = (err2, ret) =>
      (async () => {
        if (!ret || !ret.transaction) {
          cb(err2, ret)
        } else {
          let block = await app.sdb.getBlockByHeight(ret.transaction.height)
          block = modules.blocks.toAPIV1Block(block)
          cb(err2, { transaction: self.toAPIV1Transaction(ret.transaction, block) })
        }
      })()
    return self.getTransaction({ params: query }, callback)
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
          senderId: query.senderId || null,
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
