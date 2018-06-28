const crypto = require('crypto')
const util = require('util')
const ed = require('../utils/ed.js')
const Mnemonic = require('bitcore-mnemonic')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')
const addressHelper = require('../utils/address.js')

const PIFY = util.promisify

// priv fields
let modules
let library
let self
const priv = {}
const shared = {}

// Constructor
function Accounts(cb, scope) {
  library = scope
  self = this
  priv.attachApi()

  setImmediate(cb, null, self)
}

// priv methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'post /open': 'open',
    'post /open2': 'open2',
    'get /getBalance': 'getBalance',
    'get /getPublicKey': 'getPublickey',
    'post /generatePublicKey': 'generatePublickey',
    'get /delegates': 'myVotedDelegates',
    'get /': 'getAccount',
    'get /new': 'newAccount',
  })

  if (process.env.DEBUG && process.env.DEBUG.toUpperCase() === 'TRUE') {
    router.get('/getAllAccounts', (req, res) => res.json({ success: true, accounts: priv.accounts }))
  }

  router.get('/top', (req, res, next) => {
    req.sanitize(req.query, {
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
      },
    }, (err, report, query) => {
      if (err) return next(err)
      if (!report.isValid) return res.json({ success: false, error: report.issues })
      if (!query.limit) {
        query.limit = 100
      }
      return self.getAccounts({
        sort: {
          balance: -1,
        },
        offset: query.offset,
        limit: query.limit,
      }, (err2, raw) => {
        if (err2) {
          return res.json({ success: false, error: err2.toString() })
        }
        const accounts = raw.map(fullAccount => ({
          address: fullAccount.address,
          balance: fullAccount.balance,
          publicKey: fullAccount.publicKey,
        }))

        return res.json({ success: true, accounts })
      })
    })
  })

  router.get('/count', (req, res) => (async () => {
    try {
      const count = await app.sdb.count('Account')
      return res.json({ success: true, count })
    } catch (e) {
      return res.status(500).send({ success: false, error: 'Server error' })
    }
  })())

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint was not found' })
  })

  library.network.app.use('/api/accounts', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err)
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.openAccount = (secret, cb) => {
  const hash = crypto.createHash('sha256').update(secret, 'utf8').digest()
  const keypair = ed.MakeKeypair(hash)
  const publicKey = keypair.publicKey.toString('hex')
  const address = self.generateAddressByPublicKey(publicKey)
  shared.getAccount({ body: { address } }, (err, ret) => {
    if (ret && ret.account && !ret.account.publicKey) {
      ret.account.publicKey = publicKey
    }
    cb(err, ret)
  })
}

priv.openAccount2 = (publicKey, cb) => {
  const address = self.generateAddressByPublicKey(publicKey)
  shared.getAccount({ body: { address } }, (err, ret) => {
    if (ret && ret.account && !ret.account.publicKey) {
      ret.account.publicKey = publicKey
    }
    cb(err, ret)
  })
}

Accounts.prototype.generateAddressByPublicKey =
  publicKey => addressHelper.generateNormalAddress(publicKey)

Accounts.prototype.generateAddressByPublicKey2 = (publicKey) => {
  if (!global.featureSwitch.enableUIA) {
    return self.generateAddressByPublicKey(publicKey)
  }
  const oldAddress = self.generateAddressByPublicKey(publicKey)
  if (library.balanceCache.getNativeBalance(oldAddress)) {
    return oldAddress
  }
  return addressHelper.generateNormalAddress(publicKey)
}

Accounts.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
Accounts.prototype.onBind = (scope) => {
  modules = scope
}

// Shared

shared.newAccount = (req, cb) => {
  let ent = Number(req.body.ent)
  if ([128, 256, 384].indexOf(ent) === -1) {
    ent = 128
  }
  const secret = new Mnemonic(ent).toString()
  const keypair = ed.MakeKeypair(crypto.createHash('sha256').update(secret, 'utf8').digest())
  const address = self.generateAddressByPublicKey(keypair.publicKey)
  cb(null, {
    secret,
    publicKey: keypair.publicKey.toString('hex'),
    privateKey: keypair.privateKey.toString('hex'),
    address,
  })
}

shared.open = (req, cb) => {
  const { body } = req
  library.scheme.validate(body, {
    type: 'object',
    properties: {
      secret: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
    },
    required: ['secret'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return priv.openAccount(body.secret, cb)
  })
}

shared.open2 = (req, cb) => {
  const { body } = req
  library.scheme.validate(body, {
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
      return cb(err[0].message)
    }
    return priv.openAccount2(body.publicKey, cb)
  })
}

shared.getBalance = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
      },
    },
    required: ['address'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    if (!addressHelper.isAddress(query.address)) {
      return cb('Invalid address')
    }

    return shared.getAccount({ body: { address: query.address } }, (err2, ret) => {
      if (err2) {
        return cb(err2.toString())
      }
      const balance = ret && ret.account ? ret.account.balance : 0
      const unconfirmedBalance = ret && ret.account ? ret.account.unconfirmedBalance : 0

      return cb(null, { balance, unconfirmedBalance })
    })
  })
}

shared.getPublickey = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        minLength: 1,
      },
    },
    required: ['address'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return self.getAccount({ address: query.address }, (err2, account) => {
      if (err2) {
        return cb(err2.toString())
      }
      if (!account || !account.publicKey) {
        return cb('Account does not have a public key')
      }
      return cb(null, { publicKey: account.publicKey })
    })
  })
}

shared.generatePublickey = (req, cb) => {
  const { body } = req
  library.scheme.validate(body, {
    type: 'object',
    properties: {
      secret: {
        type: 'string',
        minLength: 1,
      },
    },
    required: ['secret'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    const kp = ed.MakeKeypair(crypto.createHash('sha256').update(secret, 'utf8').digest())
    const publicKey = kp.publicKey.toString('hex')
    return cb(null, { publicKey })
  })
}

shared.myVotedDelegates = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        minLength: 1,
      },
      name: {
        type: 'string',
        minLength: 1,
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        let addr
        if (query.name) {
          const account = await app.sdb.getBy('Account', { name: query.name })
          if (!account) {
            return cb('Account not found')
          }
          addr = account.address
        } else {
          addr = query.address
        }
        const votes = await app.sdb.findAll('Vote', { condition: { address: addr } })
        if (!votes || !votes.length) {
          return cb(null, { delegates: [] })
        }
        const delegateNames = new Set()
        for (const v of votes) {
          delegateNames.add(v.delegate)
        }
        const delegates = await PIFY(modules.delegates.getDelegates)({})
        if (!delegates || !delegates.length) {
          return cb(null, { delegates: [] })
        }

        const myVotedDelegates = delegates.filter(d => delegateNames.has(d.name))
        return cb(null, { delegates: myVotedDelegates })
      } catch (e) {
        library.logger.error('get voted delegates error', e)
        return cb('Server error')
      }
    })()
  })
}

shared.getAccount = (req, cb) => {
  const query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        minLength: 1,
        mexLength: 50,
      },
    },
    required: ['address'],
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        const account = await app.sdb.findOne('Account', { condition: { address: query.address } })
        let accountData
        if (!account) {
          accountData = {
            address: query.address,
            unconfirmedBalance: 0,
            balance: 0,
            secondPublicKey: '',
            lockHeight: 0,
          }
        } else {
          const unconfirmedAccount = await app.sdb.attach('Account', account)
          accountData = {
            address: account.address,
            unconfirmedBalance: unconfirmedAccount.xas,
            balance: account.xas,
            secondPublicKey: account.secondPublicKey,
            lockHeight: account.lockHeight || 0,
          }
        }
        const latestBlock = modules.blocks.getLastBlock()
        const ret = {
          account: accountData,
          latestBlock: {
            height: latestBlock.height,
            timestamp: latestBlock.timestamp,
          },
          version: modules.peer.getVersion(),
        }
        cb(null, ret)
      } catch (e) {
        library.logger.error('Failed to get account', e)
        cb('Server error')
      }
    })()
  })
}

module.exports = Accounts
