const async = require('async')
const fs = require('fs')
const path = require('path')
const Sandbox = require('asch-sandbox')
const ip = require('ip')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')

let modules
let library
let self
const priv = {}
const shared = {}

priv.launched = {}
priv.loading = {}
priv.removing = {}
priv.unconfirmedNames = {}
priv.unconfirmedLinks = {}
priv.unconfirmedAscii = {}
priv.baseDir = ''
priv.chainBaseDir = ''
priv.sandboxes = {}
priv.chainReady = {}
priv.routes = {}
priv.unconfirmedOutTansfers = {}
priv.defaultRouteId = null

// Constructor
function Chains(cb, scope) {
  library = scope
  self = this

  priv.baseDir = library.config.baseDir
  priv.chainBaseDir = library.config.chainDir

  priv.attachApi()

  // fs.exists(path.join(library.config.publicDir, 'chains'), (exists) => {
  //   if (exists) {
  //     rmdir(path.join(library.config.publicDir, 'chains'), (err) => {
  //       if (err) {
  //         library.logger.error(err)
  //       }

  //       priv.createBasePathes((err2) => {
  //         setImmediate(cb, err2, self)
  //       })
  //     })
  //   } else {
  //     priv.createBasePathes((err) => {
  //       setImmediate(cb, err, self)
  //     })
  //   }
  // })
  setImmediate(cb, null, self)
}

priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.get('/installed', (req, res) => {
    priv.getInstalledIds((err, files) => {
      if (err) {
        library.logger.error('Failed to get installed chain ids', err)
        return res.json({ success: false, error: 'Server error' })
      }

      if (files.length === 0) {
        return res.json({ success: true, chain: [] })
      }

      return priv.getByNames(files, (err2, chains) => {
        if (err2) {
          library.logger.error('Failed to get installed chains', err2)
          return res.json({ success: false, error: 'Server error' })
        }

        return res.json({ success: true, chains })
      })
    })
  })

  router.get('/installedIds', (req, res) => {
    priv.getInstalledIds((err, files) => {
      if (err) {
        library.logger.error('Failed to get installed ids', err)
        return res.json({ success: false, error: 'Server error' })
      }

      return res.json({ success: true, ids: files })
    })
  })

  library.network.app.use('/api/chains', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.get = (name, cb) => (async () => {
  try {
    const chain = await priv.getChainByName(name)
    if (!chain) return cb('Chain not found')
    return cb(null, chain)
  } catch (e) {
    library.logger.error('Failed to get chain by name', e)
    return cb('Failed to get chain')
  }
})()

priv.getByNames = (names, cb) => (async () => {
  try {
    const chains = app.sdb.getAllCached('Chain', c => names.indexOf(c.name) >= 0)
    return cb(null, chains)
  } catch (e) {
    library.logger.error(e)
    return cb('Failed to get chains')
  }
})()

priv.createBasePathes = (cb) => {
  async.series([
    (next) => {
      fs.exists(priv.chainBaseDir, (exists) => {
        if (exists) {
          return setImmediate(next)
        }
        return fs.mkdir(priv.chainBaseDir, next)
      })
    },
    (next) => {
      const chainPublic = path.join(priv.baseDir, 'public', 'dist', 'chains')
      fs.exists(chainPublic, (exists) => {
        if (exists) {
          return setImmediate(next)
        }
        return fs.mkdir(chainPublic, cb)
      })
    },
  ], (err) => {
    setImmediate(cb, err)
  })
}

priv.getInstalledIds = (cb) => {
  fs.readdir(priv.chainBaseDir, cb)
}

priv.symlink = (chain, cb) => {
  const chainPath = path.join(priv.chainBaseDir, chain.name)
  const chainPublicPath = path.resolve(chainPath, 'public')
  const chainPublicLink = path.resolve(priv.baseDir, 'public', 'dist', 'chains', chain.name)
  fs.exists(chainPublicPath, (exists) => {
    if (exists) {
      return fs.exists(chainPublicLink, (linkEists) => {
        if (linkEists) {
          return setImmediate(cb)
        }
        return fs.symlink(chainPublicPath, chainPublicLink, cb)
      })
    }
    return setImmediate(cb)
  })
}

priv.apiHandler = (message, callback) => {
  // Get all modules
  try {
    const strs = message.call.split('#')
    const mod = strs[0]
    const call = strs[1]

    if (!modules[mod]) {
      return setImmediate(callback, `Invalid module in call: ${message.call}`)
    }

    if (!modules[mod].sandboxApi) {
      return setImmediate(callback, 'This module doesn\'t have sandbox api')
    }

    return modules[mod].sandboxApi(call, { body: message.args, chain: message.chain }, callback)
  } catch (e) {
    return setImmediate(callback, `Invalid call ${e.toString()}`)
  }
}

priv.chainRoutes = (chain, cb) => {
  const routes = Sandbox.routes

  priv.routes[chain.name] = new Router()

  routes.forEach((router) => {
    if (router.method === 'get' || router.method === 'post' || router.method === 'put') {
      priv.routes[chain.name][router.method](router.path, (req, res) => {
        const reqParams = {
          query: (router.method === 'get') ? req.query : req.body,
          params: req.params,
        }
        self.request(chain.name, router.method, router.path, reqParams, (error, body) => {
          let err = error
          if (!err && body.error) {
            err = body.error
          }
          if (err) {
            return res.json({ error: err.toString() })
          }
          body.success = true
          return res.json(body)
        })
      })
    }
  })
  if (!priv.defaultRouteId) {
    priv.defaultRouteId = chain.name
    library.network.app.use('/api/chains/default/', priv.routes[chain.name])
  }
  library.network.app.use(`/api/chains/${chain.name}/`, priv.routes[chain.name])
  library.network.app.use(`/api/chains/${chain.tid}/`, priv.routes[chain.name])
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
  return setImmediate(cb)
}

priv.launch = (body, cb) => {
  library.scheme.validate(body, {
    type: 'object',
    properties: {
      params: {
        type: 'array',
        minLength: 1,
      },
      name: {
        type: 'string',
        minLength: 1,
      },
      master: {
        type: 'string',
        minLength: 0,
      },
    },
    required: ['name'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    if (priv.launched[body.name]) {
      return cb('Chain already launched')
    }

    body.params = body.params || ['']

    return async.auto({
      chain: async.apply(priv.get, body.name),

      installedIds: async.apply(priv.getInstalledIds),

      symlink: ['chain', 'installedIds', (next, results) => {
        if (results.installedIds.indexOf(body.name) < 0) {
          return next('Chain not installed')
        }
        return priv.symlink(results.chain, next)
      }],

      launch: ['symlink', (next, results) => {
        priv.launchApp(results.chain, body.params, next)
      }],

      route: ['launch', (next, results) => {
        priv.chainRoutes(results.chain, (err2) => {
          if (err2) {
            return priv.stop(results.chain, next)
          }
          return next()
        })
      }],
    }, (err3) => {
      if (err3) {
        library.logger.error(`Failed to launch chain ${body.name}: ${err3}`)
        cb('Failed to launch chain')
      } else {
        priv.launched[body.name] = true
        cb()
      }
    })
  })
}

priv.readJson = (file, cb) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return cb(err)
    }
    try {
      return cb(null, JSON.parse(data))
    } catch (e) {
      return cb(e.toString())
    }
  })
}

priv.launchApp = (chain, params, cb) => {
  const chainPath = path.join(priv.chainBaseDir, chain.name)

  priv.readJson(path.join(chainPath, 'config.json'), (err, chainConfig) => {
    if (err) {
      return setImmediate(cb, `Failed to read config.json file for: ${chain.name}`)
    }
    return async.eachSeries(chainConfig.peers, (peer, next) => {
      // FIXME
      modules.peer.addChain({
        ip: ip.toLong(peer.ip),
        port: peer.port,
        chain: chain.name,
      }, next)
    }, (err2) => {
      if (err2) {
        return setImmediate(cb, err2)
      }

      const sandbox = new Sandbox(
        chainPath, chain.name, params,
        priv.apiHandler, true, library.logger,
      )
      priv.sandboxes[chain.name] = sandbox

      sandbox.on('exit', (code) => {
        library.logger.info(`Chain ${chain.name} exited with code ${code}`)
        priv.stop(chain)
      })

      sandbox.on('error', (err3) => {
        library.logger.info(`Encountered error in chain ${chain.name}: ${err3.toString()}`)
        priv.stop(chain)
      })

      sandbox.run()
      return cb(null)
    })
  })
}

priv.stop = (chain) => {
  if (priv.sandboxes[chain.name]) {
    priv.sandboxes[chain.name].exit()
  }
  delete priv.sandboxes[chain.name]
  delete priv.routes[chain.name]
}

Chains.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

Chains.prototype.message = (chain, body, cb) => {
  self.request(chain, 'post', '/message', { query: body }, cb)
}

Chains.prototype.getInstalledIds = (cb) => {
  priv.getInstalledIds(cb)
}


Chains.prototype.request = (chain, method, uriPath, query, cb) => {
  if (!priv.sandboxes[chain]) {
    return cb('Chain not found')
  }
  if (!priv.chainReady[chain]) {
    return cb('Chain not ready')
  }
  return priv.sandboxes[chain].sendMessage({
    method,
    path: uriPath,
    query,
  }, cb)
}

Chains.prototype.onBind = (scope) => {
  modules = scope
}

Chains.prototype.cleanup = (cb) => {
  const chains = Object.keys(priv.launched)

  for (const chain of chains) {
    priv.stop(chain)
  }
  // TODO wait for all chains stopped
  library.logger.info('all chains stopped successfully')
  cb()
}

Chains.prototype.onBlockchainReady = () => {
  // priv.getInstalledIds((err, chains) => {
  //   library.logger.debug('find local installed chains', chains)
  //   if (err) {
  //     library.logger.error('Failed to get installed ids', err)
  //     return
  //   }
  //   library.logger.info(`start to launch ${chains.length} installed chains`)
  //   async.eachSeries(chains, (chain, next) => {
  //     const chainParams = library.config.chain.params[chain] || []
  //     priv.launch({ name: chain, params: chainParams }, (err2) => {
  //       if (err2) {
  //         library.logger.error(`Failed to launched chain[${chain}]`, err2)
  //       } else {
  //         library.logger.info(`Launched chain[${chain}] successfully`)
  //       }
  //       next()
  //     })
  //   })
  // })
}

Chains.prototype.onDeleteBlocksBefore = (block) => {
  Object.keys(priv.sandboxes).forEach((chain) => {
    const req = {
      query: {
        topic: 'rollback',
        message: { pointId: block.id, pointHeight: block.height },
      },
    }
    self.request(chain, 'post', '/message', req, (err) => {
      if (err) {
        library.logger.error('onDeleteBlocksBefore message', err)
      }
    })
  })
}

Chains.prototype.onNewBlock = (block) => {
  const req = {
    query: {
      topic: 'point',
      message: { id: block.id, height: block.height },
    },
  }
  Object.keys(priv.sandboxes).forEach((chain) => {
    self.request(chain, 'post', '/message', req, (err) => {
      if (err) {
        library.logger.error('chain response for message onNewBlock', err)
      }
    })
  })
}

priv.getChainByName = async (name) => {
  const chains = app.sdb.getAllCached('Chain', c => c.name === name)
  return chains !== undefined ? chains[0] : undefined
}

shared.getChain = (req, cb) => (async () => {
  try {
    const chain = await priv.getChainByName(req.name)
    if (!chain) return cb('Not found')
    const delegates = await app.sdb.findAll('ChainDelegate', { condition: { chain: req.chain } })
    if (delegates && delegates.length) {
      chain.delegates = delegates.map(d => d.delegate)
    }
    return cb(null, chain)
  } catch (e) {
    library.logger.error(e)
    return cb(`Failed to find chain: ${e}`)
  }
})()

shared.setReady = (req, cb) => {
  priv.chainReady[req.chain] = true
  library.bus.message('chainReady', req.chain, true)
  cb(null, {})
}

shared.getLastWithdrawal = (req, cb) => (async () => {
  try {
    const withdrawals = await app.sdb.find('Withdrawal', { chain: req.chain }, 1, { seq: -1 })
    if (!withdrawals || !withdrawals.length) {
      return cb(null, null)
    }
    return cb(null, withdrawals[0])
  } catch (e) {
    library.logger.error('getLastWithdrawal error', e)
    return cb('Failed to get last withdrawal transaction')
  }
})()

shared.getDeposits = (req, cb) => (async () => {
  try {
    const deposits = await app.sdb.getMany('Deposit', { seq: { $gt: req.body.seq }, chain: req.chain }, 100)
    return cb(null, deposits)
  } catch (e) {
    library.logger.error('getDeposits error', e)
    return cb('Failed to get deposit transactions')
  }
})()

shared.submitOutTransfer = (req, cb) => {
  const trs = req.body
  library.sequence.add((done) => {
    if (modules.transactions.hasUnconfirmed(trs)) {
      return done('Already exists')
    }
    library.logger.log(`Submit outtransfer transaction ${trs.id} from chain ${req.chain}`)
    return modules.transactions.processUnconfirmedTransaction(trs, done)
  }, cb)
}

shared.registerInterface = (options, cb) => {
  const chain = options.chain
  const method = options.body.method
  const uriPath = options.body.path
  priv.routes[chain][method](uriPath, (req, res) => {
    const reqParams = {
      query: (method === 'get') ? req.query : req.body,
      params: req.params,
    }
    self.request(chain, method, uriPath, reqParams, (e, b) => {
      const body = b || {}
      let err = e
      if (!err && body.error) {
        err = body.error
      }
      if (err) {
        return res.json({ error: err.toString() })
      }
      body.success = true
      return res.json(body)
    })
  })
  cb(null)
}

module.exports = Chains
