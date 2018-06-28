const crypto = require('crypto')
const util = require('util')
const ed = require('../utils/ed.js')
const Router = require('../utils/router.js')
const slots = require('../utils/slots.js')
const BlockStatus = require('../utils/block-status.js')
const sandboxHelper = require('../utils/sandbox.js')
const addressHelper = require('../utils/address.js')

let modules
let library
let self
const priv = {}
const shared = {}

const BOOK_KEEPER_NAME = 'round_bookkeeper'

priv.loaded = false
priv.blockStatus = new BlockStatus()
priv.keypairs = {}
priv.forgingEanbled = true

function Delegates(cb, scope) {
  library = scope
  self = this
  priv.attachApi()

  setImmediate(cb, null, self)
}

priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules && priv.loaded) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /count': 'count',
    'get /voters': 'getVoters',
    'get /get': 'getDelegate',
    'get /': 'getDelegates',
  })

  if (process.env.DEBUG) {
    router.get('/forging/disableAll', (req, res) => {
      self.disableForging()
      return res.json({ success: true })
    })

    router.get('/forging/enableAll', (req, res) => {
      self.enableForging()
      return res.json({ success: true })
    })
  }

  router.post('/forging/enable', (req, res) => {
    const body = req.body
    library.scheme.validate(body, {
      type: 'object',
      properties: {
        secret: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        publicKey: {
          type: 'string',
          format: 'publicKey',
        },
      },
      required: ['secret'],
    }, (err) => {
      if (err) {
        return res.json({ success: false, error: err[0].message })
      }

      const ip = req.connection.remoteAddress

      if (library.config.forging.access.whiteList.length > 0
        && library.config.forging.access.whiteList.indexOf(ip) < 0) {
        return res.json({ success: false, error: 'Access denied' })
      }

      const keypair = ed.MakeKeypair(crypto.createHash('sha256').update(body.secret, 'utf8').digest())

      if (body.publicKey) {
        if (keypair.publicKey.toString('hex') !== body.publicKey) {
          return res.json({ success: false, error: 'Invalid passphrase' })
        }
      }

      if (priv.keypairs[keypair.publicKey.toString('hex')]) {
        return res.json({ success: false, error: 'Forging is already enabled' })
      }

      return modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, (err2, account) => {
        if (err2) {
          return res.json({ success: false, error: err2.toString() })
        }
        if (account && account.isDelegate) {
          priv.keypairs[keypair.publicKey.toString('hex')] = keypair
          library.logger.info(`Forging enabled on account: ${account.address}`)
          return res.json({ success: true, address: account.address })
        }
        return res.json({ success: false, error: 'Delegate not found' })
      })
    })
  })

  router.post('/forging/disable', (req, res) => {
    const body = req.body
    library.scheme.validate(body, {
      type: 'object',
      properties: {
        secret: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        publicKey: {
          type: 'string',
          format: 'publicKey',
        },
      },
      required: ['secret'],
    }, (err) => {
      if (err) {
        return res.json({ success: false, error: err[0].message })
      }

      const ip = req.connection.remoteAddress

      if (library.config.forging.access.whiteList.length > 0
          && library.config.forging.access.whiteList.indexOf(ip) < 0) {
        return res.json({ success: false, error: 'Access denied' })
      }

      const keypair = ed.MakeKeypair(crypto.createHash('sha256').update(body.secret, 'utf8').digest())

      if (body.publicKey) {
        if (keypair.publicKey.toString('hex') !== body.publicKey) {
          return res.json({ success: false, error: 'Invalid passphrase' })
        }
      }

      if (!priv.keypairs[keypair.publicKey.toString('hex')]) {
        return res.json({ success: false, error: 'Delegate not found' })
      }

      return modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, (err2, account) => {
        if (err2) {
          return res.json({ success: false, error: err2.toString() })
        }
        if (account && account.isDelegate) {
          delete priv.keypairs[keypair.publicKey.toString('hex')]
          library.logger.info(`Forging disabled on account: ${account.address}`)
          return res.json({ success: true, address: account.address })
        }
        return res.json({ success: false, error: 'Delegate not found' })
      })
    })
  })

  router.get('/forging/status', (req, res) => {
    const query = req.query
    library.scheme.validate(query, {
      type: 'object',
      properties: {
        publicKey: {
          type: 'string',
          format: 'publicKey',
        },
      },
      required: ['publicKey'],
    }, (err) => {
      if (err) {
        return res.json({ success: false, error: err[0].message })
      }

      return res.json({ success: true, enabled: !!priv.keypairs[query.publicKey] })
    })
  })

  library.network.app.use('/api/delegates', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.getBlockSlotData = (slot, height, cb) => {
  self.generateDelegateList(height, (err, activeDelegates) => {
    if (err) {
      return cb(err)
    }
    const lastSlot = slots.getLastSlot(slot)

    for (let currentSlot = slot; currentSlot < lastSlot; currentSlot += 1) {
      const delegatePos = currentSlot % slots.delegates

      const delegateKey = activeDelegates[delegatePos]

      if (delegateKey && priv.keypairs[delegateKey]) {
        return cb(null, {
          time: slots.getSlotTime(currentSlot),
          keypair: priv.keypairs[delegateKey],
        })
      }
    }
    return cb(null, null)
  })
}

priv.loop = (cb) => {
  if (!priv.forgingEanbled) {
    library.logger.trace('Loop:', 'forging disabled')
    return setImmediate(cb)
  }
  if (!Object.keys(priv.keypairs).length) {
    library.logger.trace('Loop:', 'no delegates')
    return setImmediate(cb)
  }

  if (!priv.loaded || modules.loader.syncing()) {
    library.logger.trace('Loop:', 'node not ready')
    return setImmediate(cb)
  }

  const currentSlot = slots.getSlotNumber()
  const lastBlock = modules.blocks.getLastBlock()

  if (currentSlot === slots.getSlotNumber(lastBlock.timestamp)) {
    return setImmediate(cb)
  }

  if (Date.now() % 10000 > 5000) {
    library.logger.trace('Loop:', 'maybe too late to collect votes')
    return setImmediate(cb)
  }

  return priv.getBlockSlotData(currentSlot, lastBlock.height + 1, (err, currentBlockData) => {
    if (err || currentBlockData === null) {
      library.logger.trace('Loop:', 'skipping slot')
      return setImmediate(cb)
    }

    return library.sequence.add(done => (async () => {
      try {
        if (slots.getSlotNumber(currentBlockData.time) === slots.getSlotNumber()
          && modules.blocks.getLastBlock().timestamp < currentBlockData.time) {
          await modules.blocks.generateBlock(currentBlockData.keypair, currentBlockData.time)
        }
        done()
      } catch (e) {
        done(e)
      }
    })(), (err2) => {
      if (err2) {
        library.logger.error('Failed generate block within slot:', err2)
      }
      cb()
    })
  })
}

priv.loadMyDelegates = (cb) => {
  let secrets = []
  if (library.config.forging.secret) {
    secrets = util.isArray(library.config.forging.secret)
      ? library.config.forging.secret : [library.config.forging.secret]
  }

  return (async () => {
    try {
      const delegates = app.sdb.getAllCached('Delegate')
      if (!delegates || !delegates.length) {
        return cb('Delegates not found in db')
      }
      const delegateMap = new Map()
      for (const d of delegates) {
        delegateMap.set(d.publicKey, d)
      }
      for (const secret of secrets) {
        const keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret, 'utf8').digest())
        const publicKey = keypair.publicKey.toString('hex')
        if (delegateMap.has(publicKey)) {
          priv.keypairs[publicKey] = keypair
          library.logger.info(`Forging enabled on account: ${delegateMap.get(publicKey).address}`)
        } else {
          library.logger.info(`Delegate with this public key not found: ${keypair.publicKey.toString('hex')}`)
        }
      }
      return cb()
    } catch (e) {
      return cb(e)
    }
  })()
}

Delegates.prototype.getActiveDelegateKeypairs = (height, cb) => {
  self.generateDelegateList(height, (err, delegates) => {
    if (err) {
      return cb(err)
    }
    const results = []
    for (const key in priv.keypairs) {
      if (delegates.indexOf(key) !== -1) {
        results.push(priv.keypairs[key])
      }
    }
    return cb(null, results)
  })
}

Delegates.prototype.validateProposeSlot = (propose, cb) => {
  self.generateDelegateList(propose.height, (err, activeDelegates) => {
    if (err) {
      return cb(err)
    }
    const currentSlot = slots.getSlotNumber(propose.timestamp)
    const delegateKey = activeDelegates[currentSlot % slots.delegates]

    if (delegateKey && propose.generatorPublicKey === delegateKey) {
      return cb()
    }

    return cb('Failed to validate propose slot')
  })
}

// Public methods
Delegates.prototype.generateDelegateList = (height, cb) => (async () => {
  try {
    const truncDelegateList = self.getBookkeeper()
    const seedSource = modules.round.calc(height).toString()

    let currentSeed = crypto.createHash('sha256').update(seedSource, 'utf8').digest()
    for (let i = 0, delCount = truncDelegateList.length; i < delCount; i++) {
      for (let x = 0; x < 4 && i < delCount; i++, x++) {
        const newIndex = currentSeed[x] % delCount
        const b = truncDelegateList[newIndex]
        truncDelegateList[newIndex] = truncDelegateList[i]
        truncDelegateList[i] = b
      }
      currentSeed = crypto.createHash('sha256').update(currentSeed).digest()
    }

    cb(null, truncDelegateList)
  } catch (e) {
    cb(`Failed to get bookkeeper: ${e}`)
  }
})()

Delegates.prototype.fork = (block, cause) => {
  library.logger.info('Fork', {
    delegate: block.delegate,
    block: {
      id: block.id,
      timestamp: block.timestamp,
      height: block.height,
      prevBlockId: block.prevBlockId,
    },
    cause,
  })
}

Delegates.prototype.validateBlockSlot = (block, cb) => {
  self.generateDelegateList(block.height, (err, activeDelegates) => {
    if (err) {
      return cb(err)
    }
    const currentSlot = slots.getSlotNumber(block.timestamp)
    const delegateKey = activeDelegates[currentSlot % 101]

    if (delegateKey && block.delegate === delegateKey) {
      return cb()
    }

    return cb(`Failed to verify slot, expected delegate: ${delegateKey}`)
  })
}

Delegates.prototype.getDelegates = (query, cb) => {
  let delegates = app.sdb.getAllCached('Delegate').map(d => Object.assign({}, d))
  if (!delegates || !delegates.length) return cb('No delegates')

  delegates = delegates.sort(self.compare)

  const lastBlock = modules.blocks.getLastBlock()
  const totalSupply = priv.blockStatus.calcSupply(lastBlock.height)
  for (let i = 0; i < delegates.length; ++i) {
    const d = delegates[i]
    d.rate = i + 1
    delegates[i].approval = ((d.votes / totalSupply) * 100).toFixed(2)

    let percent = 100 - (d.missedBlocks / (d.producedBlocks + d.missedBlocks) / 100)
    percent = percent || 0
    delegates[i].productivity = parseFloat(Math.floor(percent * 100) / 100).toFixed(2)

    delegates[i].vote = delegates[i].votes
    delegates[i].missedblocks = delegates[i].missedBlocks
    delegates[i].producedblocks = delegates[i].producedBlocks
  }
  return cb(null, delegates)
}

Delegates.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

Delegates.prototype.enableForging = () => {
  priv.forgingEanbled = true
}

Delegates.prototype.disableForging = () => {
  priv.forgingEanbled = false
}

// Events
Delegates.prototype.onBind = (scope) => {
  modules = scope
}

Delegates.prototype.onBlockchainReady = () => {
  priv.loaded = true

  priv.loadMyDelegates(function nextLoop(err) {
    if (err) {
      library.logger.error('Failed to load delegates', err)
    }

    priv.loop(() => {
      setTimeout(nextLoop, 100)
    })
  })
}

Delegates.prototype.compare = (l, r) => {
  if (l.votes !== r.votes) {
    return r.votes - l.votes
  }
  return l.publicKey < r.publicKey ? 1 : -1
}

Delegates.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
}

Delegates.prototype.getTopDelegates = () => {
  const allDelegates = app.sdb.getAllCached('Delegate')
  return allDelegates.sort(self.compare).map(d => d.publicKey).slice(0, 101)
}

Delegates.prototype.getBookkeeperAddresses = () => {
  const bookkeeper = self.getBookkeeper()
  const addresses = new Set()
  for (const i of bookkeeper) {
    const address = addressHelper.generateNormalAddress(i)
    addresses.add(address)
  }
  return addresses
}

Delegates.prototype.getBookkeeper = () => {
  const item = app.sdb.getCached('Variable', BOOK_KEEPER_NAME)
  if (!item) throw new Error('Bookkeeper variable not found')
  return JSON.parse(item.value)
}

Delegates.prototype.updateBookkeeper = (delegates) => {
  const value = JSON.stringify(delegates || self.getTopDelegates())
  const bookKeeper = app.sdb.getCached('Variable', BOOK_KEEPER_NAME)
    || app.sdb.create('Variable', BOOK_KEEPER_NAME, { key: BOOK_KEEPER_NAME, value })

  bookKeeper.value = value
}

shared.getDelegate = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      publicKey: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      address: {
        type: 'string',
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return modules.delegates.getDelegates(query, (err2, delegates) => {
      if (err2) {
        return cb(err2)
      }

      const delegate = delegates.find((d) => {
        if (query.publicKey) {
          return d.publicKey === query.publicKey
        }
        if (query.address) {
          return d.address === query.address
        }
        if (query.name) {
          return d.name === query.name
        }

        return false
      })

      if (delegate) {
        return cb(null, { delegate })
      }
      return cb('Delegate not found')
    })
  })
}

shared.count = (req, cb) => (async () => {
  try {
    const count = app.sdb.getAllCached('Delegate').length
    return cb(null, { count })
  } catch (e) {
    library.logger.error('get delegate count error', e)
    return cb('Failed to count delegates')
  }
})()

shared.getVoters = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 50,
      },
    },
    required: ['name'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        const votes = await app.sdb.findAll('Vote', { condition: { delegate: query.name } })
        if (!votes || !votes.length) return cb(null, { accounts: [] })

        const addresses = votes.map(v => v.address)
        const accounts = await app.sdb.findAll('Account', { condition: { address: { $in: addresses } } })
        const lastBlock = modules.blocks.getLastBlock()
        const totalSupply = priv.blockStatus.calcSupply(lastBlock.height)
        for (const a of accounts) {
          a.balance = a.xas
          a.weightRatio = (a.weight * 100) / totalSupply
        }
        return cb(null, { accounts })
      } catch (e) {
        library.logger.error('Failed to find voters', e)
        return cb('Server error')
      }
    })()
  })
}

shared.getDelegates = (req, cb) => {
  const query = req.body
  const offset = Number(query.offset || 0)
  const limit = Number(query.limit || 0)
  if (Number.isNaN(limit) || Number.isNaN(offset)) {
    return cb('Invalid params')
  }

  return self.getDelegates({}, (err, delegates) => {
    if (err) return cb(err)
    return cb(null, {
      totalCount: delegates.length,
      delegates: delegates.slice(offset, offset + limit),
    })
  })
}

module.exports = Delegates
