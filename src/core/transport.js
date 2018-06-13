const extend = require('extend')
const crypto = require('crypto')
const bignum = require('bignumber')
const Router = require('../utils/router.js')
const slots = require('../utils/slots.js')
const sandboxHelper = require('../utils/sandbox.js')

let modules
let library
let self
const priv = {}
const shared = {}

priv.headers = {}
priv.loaded = false
priv.chainMessageCache = {}

// Constructor
function Transport(cb, scope) {
  library = scope
  self = this
  priv.attachApi()

  setImmediate(cb, null, self)
}

priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.post('/transactions', (req, res) => {
    if (modules.loader.syncing()) {
      return res.status(500).send({
        success: false,
        error: 'Blockchain is syncing',
      })
    }
    const lastBlock = modules.blocks.getLastBlock()
    const lastSlot = slots.getSlotNumber(lastBlock.timestamp)
    if (slots.getNextSlot() - lastSlot >= 12) {
      library.logger.error('Blockchain is not ready', { getNextSlot: slots.getNextSlot(), lastSlot, lastBlockHeight: lastBlock.height })
      return res.status(200).json({ success: false, error: 'Blockchain is not ready' })
    }

    res.set(priv.headers)

    if (req.headers.magic !== library.config.magic) {
      return res.status(500).send({
        success: false,
        error: 'Request is made on the wrong network',
        expected: library.config.magic,
        received: req.headers.magic,
      })
    }

    let transaction
    try {
      transaction = library.base.transaction.objectNormalize(req.body.transaction)
    } catch (e) {
      library.logger.error('Received transaction parse error', {
        raw: req.body,
        trs: transaction,
        error: e.toString(),
      })
      return res.status(200).json({ success: false, error: 'Invalid transaction body' })
    }

    return library.sequence.add((cb) => {
      library.logger.log(`Received transaction ${transaction.id} from http client`)
      modules.transactions.processUnconfirmedTransaction(transaction, cb)
    }, (err) => {
      if (err) {
        library.logger.warn(`Receive invalid transaction ${transaction.id}`, err)
        const errMsg = err.message ? err.message : err.toString()
        res.status(200).json({ success: false, error: errMsg })
      } else {
        library.bus.message('unconfirmedTransaction', transaction, true)
        res.status(200).json({ success: true, transactionId: transaction.id })
      }
    })
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/peer', router)
}

priv.hashsum = (obj) => {
  const buf = Buffer.from(JSON.stringify(obj), 'utf8')
  const hashdig = crypto.createHash('sha256').update(buf).digest()
  const temp = Buffer.alloc(8)
  for (let i = 0; i < 8; i++) {
    temp[i] = hashdig[7 - i]
  }

  return bignum.fromBuffer(temp).toString()
}

Transport.prototype.broadcast = (topic, message) => {
  modules.peer.publish(topic, message)
}

Transport.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
Transport.prototype.onBind = (scope) => {
  modules = scope
  priv.headers = {
    os: modules.system.getOS(),
    version: modules.system.getVersion(),
    port: modules.system.getPort(),
    magic: modules.system.getMagic(),
  }
}

Transport.prototype.onBlockchainReady = () => {
  priv.loaded = true
}

Transport.prototype.onPeerReady = () => {
  modules.peer.handle('commonBlock', (req, res) => {
    const query = req.params.body
    if (!Number.isInteger(query.max)) return res.send({ error: 'Field max must be integer' })
    if (!Number.isInteger(query.min)) return res.send({ error: 'Field min must be integer' })
    // TODO validate query.ids
    const max = query.max
    const min = query.min
    const ids = query.ids
    return (async () => {
      try {
        let blocks = await app.sdb.getBlocksByHeightRange(min, max)
        // app.logger.trace('find common blocks in database', blocks)
        if (!blocks || !blocks.length) {
          return res.send({ success: false, error: 'Blocks not found' })
        }
        blocks = blocks.reverse()
        let commonBlock = null
        for (const i in ids) {
          if (blocks[i].id === ids[i]) {
            commonBlock = blocks[i]
            break
          }
        }
        if (!commonBlock) {
          return res.send({ success: false, error: 'Common block not found' })
        }
        return res.send({ success: true, common: commonBlock })
      } catch (e) {
        app.logger.error(`Failed to find common block: ${e}`)
        return res.send({ success: false, error: 'Failed to find common block' })
      }
    })()
  })

  modules.peer.handle('blocks', (req, res) => {
    // TODO validate req.query.lastBlockId
    const query = req.params.body
    let blocksLimit = 200
    if (query.limit) {
      blocksLimit = Math.min(blocksLimit, Number(query.limit))
    }

    return (async () => {
      const lastBlockId = query.lastBlockId
      try {
        const lastBlock = await app.sdb.getBlockById(lastBlockId)
        if (!lastBlock) throw new Error(`Last block not found: ${lastBlockId}`)

        const minHeight = lastBlock.height + 1
        let maxHeight = (minHeight + blocksLimit) - 1
        const blocks = await app.sdb.getBlocksByHeightRange(minHeight, maxHeight)

        if (!blocks || !blocks.length) {
          return res.send({ blocks: [] })
        }

        maxHeight = blocks[blocks.length - 1].height
        const transactions = await app.sdb.findAll('Transaction', {
          condition: {
            height: { $gt: lastBlock.height, $lte: maxHeight },
          },
        })
        const firstHeight = blocks[0].height
        for (const t of transactions) {
          const h = t.height
          const b = blocks[h - firstHeight]
          if (b) {
            if (!b.transactions) {
              b.transactions = []
            }
            b.transactions.push(t)
          }
        }
        return res.send({ blocks })
      } catch (e) {
        app.logger.error('Failed to get blocks or transactions', e)
        return res.send({ blocks: [] })
      }
    })()
  })

  modules.peer.handle('votes', (req, res) => {
    // TODO validate req.params.query{height, id, signature}
    library.bus.message('receiveVotes', req.params.body.votes)
    res.send({})
  })

  modules.peer.handle('transactions', (req, res) => {
    res.send({ transactions: modules.transactions.getUnconfirmedTransactionList() })
  })

  modules.peer.handle('height', (req, res) => {
    res.send({
      height: modules.blocks.getLastBlock().height,
    })
  })

  modules.peer.handle('chainRequest', (req, res) => {
    const params = req.params
    const query = req.params.body
    try {
      if (!params.chain) {
        return res.send({ success: false, error: 'missed chain' })
      }
      if (!params.timestamp || !params.hash) {
        return res.status(200).json({
          success: false,
          error: 'missed hash sum',
        })
      }
      const newHash = priv.hashsum(query, params.timestamp)
      if (newHash !== params.hash) {
        return res.send({ success: false, error: 'wrong hash sum' })
      }
    } catch (e) {
      library.logger.error('receive invalid chain request', { error: e.toString(), params })
      return res.send({ success: false, error: e.toString() })
    }

    return modules.chains.request(
      params.chain,
      query.method,
      query.path,
      { query: params.query },
      (err, ret) => {
        if (!err && ret.error) {
          err = ret.error
        }

        if (err) {
          library.logger.error('failed to process chain request', err)
          return res.send({ success: false, error: err })
        }
        return res.send(extend({}, { success: true }, ret))
      },
    )
  })

  modules.peer.subscribe('block', (message) => {
    if (modules.loader.syncing()) {
      return
    }
    let block = message.body.block
    let votes = message.body.votes
    try {
      block = library.base.block.objectNormalize(block)
      votes = library.base.consensus.normalizeVotes(votes)
    } catch (e) {
      library.logger.log(`normalize block or votes object error: ${e.toString()}`)
    }
    library.bus.message('receiveBlock', block, votes)
  })

  modules.peer.subscribe('propose', (message) => {
    if (typeof message.body.propose === 'string') {
      message.body.propose =
        library.protobuf.decodeBlockPropose(Buffer.from(message.body.propose, 'base64'))
    }
    library.scheme.validate(message.body.propose, {
      type: 'object',
      properties: {
        height: {
          type: 'integer',
          minimum: 1,
        },
        id: {
          type: 'string',
          maxLength: 64,
        },
        timestamp: {
          type: 'integer',
        },
        generatorPublicKey: {
          type: 'string',
          format: 'publicKey',
        },
        address: {
          type: 'string',
        },
        hash: {
          type: 'string',
          format: 'hex',
        },
        signature: {
          type: 'string',
          format: 'signature',
        },
      },
      required: ['height', 'id', 'timestamp', 'generatorPublicKey', 'address', 'hash', 'signature'],
    }, (err) => {
      if (err) {
        library.logger.error('Received propose is invalid', { propose: message.body.propose, error: err })
        return
      }
      library.bus.message('receivePropose', req.body.propose)
    })
  })

  modules.peer.subscribe('transaction', (message) => {
    if (modules.loader.syncing()) {
      return
    }
    const lastBlock = modules.blocks.getLastBlock()
    const lastSlot = slots.getSlotNumber(lastBlock.timestamp)
    if (slots.getNextSlot() - lastSlot >= 12) {
      library.logger.error('Blockchain is not ready', { getNextSlot: slots.getNextSlot(), lastSlot, lastBlockHeight: lastBlock.height })
      return
    }

    if (typeof message.body.transaction === 'string') {
      message.body.transaction =
        library.protobuf.decodeTransaction(Buffer.from(message.body.transaction, 'base64'))
    }
    let transaction
    try {
      transaction = library.base.transaction.objectNormalize(message.body.transaction)
    } catch (e) {
      library.logger.error('Received transaction parse error', {
        message,
        trs: transaction,
        error: e.toString(),
      })
      return
    }

    library.sequence.add((cb) => {
      library.logger.log(`Received transaction ${transaction.id} from remote peer`)
      modules.transactions.processUnconfirmedTransaction(transaction, cb)
    }, (err) => {
      if (err) {
        library.logger.warn(`Receive invalid transaction ${transaction.id}`, err)
      } else {
        library.bus.message('unconfirmedTransaction', transaction, true)
      }
    })
  })

  modules.peer.subscribe('chainMessage', (message) => {
    try {
      if (!message.chain) {
        return
      }
      if (!message.timestamp || !message.hash) {
        return
      }
      const newHash = priv.hashsum(message.body, message.timestamp)
      if (newHash !== message.hash) {
        return
      }
    } catch (e) {
      library.logger.error(e)
      library.logger.debug('receive invalid chain message', message)
      return
    }

    if (priv.chainMessageCache[message.hash]) {
      res.sendStatus(200)
      return
    }

    priv.chainMessageCache[message.hash] = true
    modules.chains.message(message.chain, message.body, (err, body) => {
      if (!err && body.error) {
        err = body.error
      }

      if (err) {
        library.logger.error('failed to process chain message', err)
        return
      }
      library.bus.message('message', req.body, true)
    })
  })
}

Transport.prototype.onUnconfirmedTransaction = (transaction) => {
  const message = {
    body: {
      transaction,
    },
  }
  self.broadcast('transaction', message)
}

Transport.prototype.onNewBlock = (block, votes) => {
  const message = {
    body: {
      block, votes,
    },
  }
  self.broadcast('block', message)
}

Transport.prototype.onNewPropose = (propose) => {
  const message = {
    body: {
      propose: library.protobuf.encodeBlockPropose(propose).toString('base64'),
    },
  }
  self.broadcast('propose', message)
}

Transport.prototype.sendVotes = (votes, address) => {
  const params = {
    body: {
      votes,
    },
  }
  const parts = address.split(':')
  const contact = {
    hostname: parts[0],
    port: parts[1],
  }
  const identity = modules.peer.getIdentity(contact)
  const target = [identity, contact]
  modules.peer.request('votes', params, contact, target, (err) => {
    if (err) {
      library.logger.error('send votes error', err)
    }
  })
}

Transport.prototype.onMessage = (msg) => {
  const message = {
    chain: msg.chain,
    body: msg,
  }
  self.broadcast('chainMessage', message)
}

Transport.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
}

shared.message = (msg, cb) => {
  msg.timestamp = (new Date()).getTime()
  msg.hash = priv.hashsum(msg.body, msg.timestamp)

  self.broadcast('chainMessage', msg)

  cb(null, {})
}

shared.request = (req, cb) => {
  req.timestamp = (new Date()).getTime()
  req.hash = priv.hashsum(req.body, req.timestamp)

  if (req.body.peer) {
    modules.peer.request('chainRequest', req, req.body.peer, cb)
  } else {
    modules.peer.randomRequest('chainRequest', req, cb)
  }
}

module.exports = Transport
