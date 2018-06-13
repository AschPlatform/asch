const bignum = require('bignumber')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')
const slots = require('../utils/slots.js')
require('colors')

let modules
let library
let self
const priv = {}
const shared = {}

priv.loaded = false
priv.syncing = false
priv.loadingLastBlock = null
priv.genesisBlock = null
priv.total = 0
priv.blocksToSync = 0
priv.syncIntervalId = null

function Loader(cb, scope) {
  library = scope
  priv.genesisBlock = library.genesisblock
  priv.loadingLastBlock = library.genesisblock
  self = this
  priv.attachApi()

  setImmediate(cb, null, self)
}

priv.attachApi = () => {
  const router = new Router()

  router.map(shared, {
    'get /status': 'status',
    'get /status/sync': 'sync',
  })

  library.network.app.use('/api/loader', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.syncTrigger = (turnOn) => {
  if (turnOn === false && priv.syncIntervalId) {
    clearTimeout(priv.syncIntervalId)
    priv.syncIntervalId = null
  }
  if (turnOn === true && !priv.syncIntervalId) {
    setImmediate(function nextSyncTrigger() {
      library.network.io.sockets.emit('loader/sync', {
        blocks: priv.blocksToSync,
        height: modules.blocks.getLastBlock().height,
      })
      priv.syncIntervalId = setTimeout(nextSyncTrigger, 1000)
    })
  }
}

priv.loadFullDb = (peer, cb) => {
  const contact = peer[1]
  const peerStr = `${contact.hostname}:${contact.port}`

  const commonBlockId = priv.genesisBlock.block.id

  library.logger.debug(`Loading blocks from genesis from ${peerStr}`)

  modules.blocks.loadBlocksFromPeer(peer, commonBlockId, cb)
}

priv.findUpdate = (lastBlock, peer, cb) => {
  const contact = peer[1]
  const peerStr = `${contact.hostname}:${contact.port}`

  library.logger.info(`Looking for common block with ${peerStr}`)

  modules.blocks.getCommonBlock(peer, lastBlock.height, (err, commonBlock) => {
    if (err || !commonBlock) {
      library.logger.error('Failed to get common block:', err)
      return cb()
    }

    library.logger.info(`Found common block ${commonBlock.id} (at ${commonBlock.height}) 
      with peer ${peerStr}, last block height is ${lastBlock.height}`)
    const toRemove = lastBlock.height - commonBlock.height

    if (toRemove >= 5) {
      library.logger.error(`long fork with peer ${peerStr}`)
      return cb()
    }

    return (async () => {
      try {
        // FIXME
        await app.sdb.rollbackBlock()
        modules.transactions.clearUnconfirmed()
        if (toRemove > 0) {
          for (let h = lastBlock.height; h > commonBlock.height; h--) {
            library.logger.info(`rollback block height: ${h}`)
            await app.sdb.rollbackBlock(h)
          }
        }
      } catch (e) {
        library.logger.error('Failed to rollback block', e)
        return cb()
      }
      library.logger.debug(`Loading blocks from peer ${peerStr}`)
      return modules.blocks.loadBlocksFromPeer(peer, commonBlock.id, (err2) => {
        if (err) {
          library.logger.error(`Failed to load blocks, ban 60 min: ${peerStr}`, err2)
        }
        cb()
      })
    })()
  })
}

priv.loadBlocks = (lastBlock, cb) => {
  modules.peer.randomRequest('height', {}, (err, ret, peer) => {
    if (err) {
      library.logger.error('Failed to request form random peer', { err, peer })
      return cb()
    }

    const contact = peer[1]
    const peerStr = `${contact.hostname}:${contact.port}`
    library.logger.info(`Check blockchain on ${peerStr}`)

    ret.height = Number.parseInt(ret.height, 10)

    const report = library.scheme.validate(ret, {
      type: 'object',
      properties: {
        height: {
          type: 'integer',
          minimum: 0,
        },
      },
      required: ['height'],
    })

    if (!report) {
      library.logger.log(`Failed to parse blockchain height: ${peerStr}\n${library.scheme.getLastError()}`)
      return cb()
    }

    if (bignum(lastBlock.height).lt(ret.height)) {
      priv.blocksToSync = ret.height

      if (lastBlock.id !== priv.genesisBlock.block.id) {
        return priv.findUpdate(lastBlock, peer, cb)
      }
      return priv.loadFullDb(peer, cb)
    }
    return cb()
  })
}

priv.loadUnconfirmedTransactions = (cb) => {
  modules.peer.randomRequest('transactions', {}, (err, data, peer) => {
    if (err) {
      return cb()
    }

    const report = library.scheme.validate(data.body, {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          uniqueItems: true,
        },
      },
      required: ['transactions'],
    })

    if (!report) {
      return cb()
    }

    const transactions = data.body.transactions
    const contact = peer[1]
    const peerStr = `${contact.hostname}:${contact.port}`

    for (let i = 0; i < transactions.length; i++) {
      try {
        transactions[i] = library.base.transaction.objectNormalize(transactions[i])
      } catch (e) {
        library.logger.log(`Transaction ${transactions[i] ? transactions[i].id : 'null'} is not valid, ban 60 min`, peerStr)
        return cb()
      }
    }

    const trs = []
    for (let i = 0; i < transactions.length; ++i) {
      if (!modules.transactions.hasUnconfirmed(transactions[i])) {
        trs.push(transactions[i])
      }
    }
    library.logger.info(`Loading ${transactions.length} unconfirmed transaction from peer ${peerStr}`)
    return library.sequence.add((done) => {
      modules.transactions.processUnconfirmedTransactions(trs, done)
    }, cb)
  })
}

// Public methods
Loader.prototype.syncing = () => priv.syncing

Loader.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

Loader.prototype.startSyncBlocks = () => {
  library.logger.debug('startSyncBlocks enter')
  if (!priv.loaded || self.syncing()) {
    library.logger.debug('blockchain is already syncing')
    return
  }
  library.sequence.add((cb) => {
    library.logger.debug('startSyncBlocks enter sequence')
    priv.syncing = true
    const lastBlock = modules.blocks.getLastBlock()
    priv.loadBlocks(lastBlock, (err) => {
      if (err) {
        library.logger.error('loadBlocks error:', err)
      }
      priv.syncing = false
      priv.blocksToSync = 0
      library.logger.debug('startSyncBlocks end')
      cb()
    })
  })
}

// Events
Loader.prototype.onPeerReady = () => {
  setImmediate(function nextSync() {
    const lastBlock = modules.blocks.getLastBlock()
    const lastSlot = slots.getSlotNumber(lastBlock.timestamp)
    if (slots.getNextSlot() - lastSlot >= 3) {
      self.startSyncBlocks()
    }
    setTimeout(nextSync, 10 * 1000)
  })

  setImmediate(() => {
    if (!priv.loaded || self.syncing()) return
    priv.loadUnconfirmedTransactions((err) => {
      if (err) {
        library.logger.error('loadUnconfirmedTransactions timer:', err)
      }
    })
  })
}

Loader.prototype.onBind = (scope) => {
  modules = scope
}

Loader.prototype.onBlockchainReady = () => {
  priv.loaded = true
}

Loader.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
  // if (!priv.isActive) {
  //   cb();
  // } else {
  //   setImmediate(function nextWatch() {
  //     if (priv.isActive) {
  //       setTimeout(nextWatch, 1 * 1000)
  //     } else {
  //       cb();
  //     }
  //   });
  // }
}

// Shared
shared.status = (req, cb) => {
  cb(null, {
    loaded: priv.loaded,
    now: priv.loadingLastBlock.height,
    blocksCount: priv.total,
  })
}

shared.sync = (req, cb) => {
  cb(null, {
    syncing: self.syncing(),
    blocks: priv.blocksToSync,
    height: modules.blocks.getLastBlock().height,
  })
}

// Export
module.exports = Loader
