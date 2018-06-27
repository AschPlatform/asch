const crypto = require('crypto')
const async = require('async')
const ed = require('../utils/ed.js')
const jsonSql = require('json-sql')()

jsonSql.setDialect('sqlite')
const constants = require('../utils/constants.js')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')

const addressHelper = require('../utils/address.js')
const amountHelper = require('../utils/amount.js')
const isArray = require('util').isArray

// Private fields
let modules
let library
let self
const priv = {}
const shared = {}

// Constructor
function UIA(cb, scope) {
  library = scope
  self = this
  priv.attachApi()
  cb(null, self)
}

// Private methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /issuers': 'getIssuers',
    'get /issuers/:name': 'getIssuer',
    'get /issuers/:name/assets': 'getIssuerAssets',
    'get /assets': 'getAssets',
    'get /assets/:name': 'getAsset',
    'get /balances/:address': 'getBalances',
    'get /balances/:address/:currency': 'getBalance',
    /*
    'get /assets/:name/acl/:flag': 'getAssetAcl',
    'get /transactions/my/:address/': 'getMyTransactions',
    'get /transactions/my/:address/:currency': 'getMyTransactions',
    'get /transactions/:currency': 'getTransactions',
    */
    'put /transfers': 'transferAsset',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/uia', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err)
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

// Public methods
UIA.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

function trimPrecision(amount, precision) {
  const s = amount.toString()
  return Number.parseInt(s.substr(0, s.length - precision), 10)
}

UIA.prototype.toAPIV1Assets = assets => ((assets && isArray(assets) && assets.length > 0) ?
  assets.map(a => UIA.prototype.toAPIV1Asset(a)) :
  [])

UIA.prototype.toAPIV1Asset = (asset) => {
  if (!asset) return asset

  return {
    name: asset.name,
    desc: asset.desc,
    maximum: asset.maximum,
    precision: asset.precision,
    quantity: asset.quantity,
    issuerId: asset.issuerId,
    height: asset.height,
    writeoff: false,
    maximumShow: trimPrecision(asset.maximum, asset.precision),
    quantityShow: trimPrecision(asset.quantity, asset.precision),

    // "strategy"  => missing
    // "acl" => missing
    // "allowWriteoff" => missing
    // "allowWhitelist" => missing
    // "allowBlacklist" => missing
  }
}

// Events
UIA.prototype.onBind = (scope) => {
  modules = scope
}

priv.queryTransactions = (query, cb) => {
  let func = 'list'
  let param = query
  let list = true
  if (typeof query.id !== 'undefined') {
    func = 'getById'
    param = query.id
    list = false
  }

  modules.transactions[func](param, (err, data) => {
    if (err) return cb(`Failed to get transactions: ${err}`)

    if (!list) data = { transactions: [data] }
    const sqls = []
    const typeToTable = {
      9: {
        model: 'Issuer',
        fields: ['transactionId', 'name', 'desc'],
      },
      10: {
        model: 'Asset',
        fields: ['transactionId', 'name', 'desc', 'maximum', 'precision', 'strategy'],
      },
      11: {
        model: 'Flag',
        fields: ['transactionId', 'currency', 'flagType', 'flag'],
      },
      12: {
        model: 'Acl',
        fields: ['transactionId', 'currency', 'operator', 'flag', 'list'],
      },
      13: {
        model: 'Issue',
        fields: ['transactionId', 'currency', 'amount'],
      },
      14: {
        model: 'Transfer',
        fields: ['transactionId', 'currency', 'amount'],
      },
    }
    data.transactions.forEach((trs) => {
      if (!typeToTable[trs.type]) return

      trs.t_id = trs.id
      sqls.push({
        model: typeToTable[trs.type].model,
        fields: typeToTable[trs.type].fields,
      })
    })
    return async.mapSeries(sqls, (sql, next) => {
      // FIXME: to fix this function
      next()
      // app.sdb.findAll({ })
      // library.dbLite.query(sql.query, {}, sql.fields, next)
    }, (sqlErr, rows) => {
      if (sqlErr) return cb(`Failed to get transaction assets: ${sqlErr}`)

      for (let i = 0; i < rows.length; ++i) {
        if (rows[i].length === 0) continue
        const t = data.transactions[i]
        const type = t.type
        const table = typeToTable[type].table
        const asset = rows[i][0]
        for (const k in asset) {
          if (asset[k] || true) {
            asset[`${table}_${k}`] = asset[k]
          }
        }
        if (asset.transactionId === t.id) {
          asset.t_id = asset.transactionId
          t.asset = library.base.transaction.dbReadAsset(t.type, asset)
        }
        delete t.t_id
      }
      let assetNames = new Set()
      data.transactions.forEach((trs) => {
        if (trs.type === 13) {
          assetNames.add(trs.asset.uiaIssue.currency)
        } else if (trs.type === 14) {
          assetNames.add(trs.asset.uiaTransfer.currency)
        }
      })
      assetNames = Array.from(assetNames)
      return async.mapSeries(assetNames, (name, next) => {
        library.model.getAssetByName(name, next)
      }, (assetErr, assets) => {
        if (assetErr) return cb(`Failed to asset info: ${assetErr}`)
        const precisionMap = new Map()
        assets.forEach((a) => {
          precisionMap.set(a.name, a.precision)
        })
        data.transactions.forEach((trs) => {
          let obj = null
          if (trs.type === 13) {
            obj = trs.asset.uiaIssue
          } else if (trs.type === 14) {
            obj = trs.asset.uiaTransfer
          }
          if (obj != null && precisionMap.has(obj.currency)) {
            const precision = precisionMap.get(obj.currency)
            obj.amountShow = amountHelper.calcRealAmount(obj.amount, precision)
            obj.precision = precision
          }
        })
        return cb(null, data)
      })
    })
  })
}

// Shared
shared.getFee = (req, cb) => {
  let fee = null

  // FIXME(qingfeng)
  fee = 5 * constants.fixedPoint
  cb(null, { fee })
}

shared.getIssuers = (req, cb) => {
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
    },
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)
    return (async () => {
      try {
        const limitAndOffset = { limit: query.limit || 100, offset: query.offset || 0 }
        const count = await app.sdb.count('Issuer', {})
        const issues = await app.sdb.find('Issuer', {}, limitAndOffset)
        return cb(null, { count, issues })
      } catch (dbErr) {
        return cb(`Failed to get issuers: ${dbErr}`)
      }
    })()
  })
}

shared.getIssuerByAddress = (req, cb) => {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid address')
  }
  return (async () => {
    try {
      const issues = await app.sdb.find('Issuer', { address: req.params.address })
      if (!issuers || issuers.length === 0) return cb('Issuer not found')
      return cb(null, { issuer: issues[0] })
    } catch (dbErr) {
      return cb(`Failed to get issuer: ${dbErr}`)
    }
  })()
}

shared.getIssuer = (req, cb) => {
  if (req.params && addressHelper.isAddress(req.params.name)) {
    req.params.address = req.params.name
    return shared.getIssuerByAddress(req, cb)
  }
  const query = req.params
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 16,
      },
    },
    required: ['name'],
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)

    return (async () => {
      try {
        const issuers = await app.sdb.find('Issuer', { name: req.params.name })
        if (!issuers || issuers.length === 0) return cb('Issuer not found')
        return cb(null, { issuer: issues[0] })
      } catch (dbErr) {
        return cb(`Failed to get issuers: ${dbErr}`)
      }
    })()
  })
  return null
}

shared.getIssuerAssets = (req, cb) => {
  if (!req.params || !req.params.name || req.params.name.length > 32) {
    cb(' Invalid parameters')
    return
  }
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
    },
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)

    return (async () => {
      try {
        const limitAndOffset = { limit: query.limit || 100, offset: query.offset || 0 }
        const condition = { issuerName: req.params.name }
        const count = await app.sdb.count('Asset', condition)
        const assets = await app.sdb.find('Asset', condition, limitAndOffset)
        return cb(null, { count, assets: UIA.prototype.toAPIV1Assets(assets) })
      } catch (dbErr) {
        return cb(`Failed to get assets: ${dbErr}`)
      }
    })()
  })
}

shared.getAssets = (req, cb) => {
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
    },
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)
    return (async () => {
      try {
        const condition = {}
        const limitAndOffset = { limit: query.limit || 100, offset: query.offset || 0 }
        const count = await app.sdb.count('Asset', condition)
        const assets = await app.sdb.find('Asset', condition, limitAndOffset)
        return cb(null, { count, assets: UIA.prototype.toAPIV1Assets(assets) })
      } catch (dbErr) {
        return cb(`Failed to get assets: ${dbErr}`)
      }
    })()
  })
}

shared.getAsset = (req, cb) => {
  const query = req.params
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 32,
      },
    },
    required: ['name'],
  }, (err) => {
    if (err) cb(`Invalid parameters: ${err[0]}`)

    return (async () => {
      try {
        const condition = { name: query.name }
        const assets = await app.sdb.find('Asset', condition)
        if (!assets || assets.length === 0) return cb('Asset not found')
        return cb(null, { asset: UIA.prototype.toAPIV1Asset(assets[0]) })
      } catch (dbErr) {
        return cb(`Failed to get asset: ${dbErr}`)
      }
    })()
  })
}


shared.getBalances = (req, cb) => {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid address')
  }
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
    },
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)

    return (async () => {
      try {
        const condition = { address: req.params.address }
        const count = await app.sdb.count('Balance', condition)
        const resultRange = { limit: query.limit, offset: query.offset }
        const balances = await app.sdb.find('Balance', condition, resultRange)
        return cb(null, { count, balances })
      } catch (dbErr) {
        return cb(`Failed to get balances: ${dbErr}`)
      }
    })()
  })
  return null
}

shared.getBalance = (req, cb) => {
  if (!req.params) return cb('Invalid parameters')
  if (!addressHelper.isAddress(req.params.address)) return cb('Invalid address')
  if (!req.params.currency || req.params.currency.length > 22) return cb('Invalid currency')

  return (async () => {
    try {
      const condition = { address: req.params.address, currency: req.params.currency }
      const balances = await app.sdb.find('Balance', condition)
      if (!balances || balances.length === 0) return cb('Balance info not found')
      return cb(null, { balance: balances[0] })
    } catch (dbErr) {
      return cb(`Failed to get issuers: ${dbErr}`)
    }
  })()
}

shared.getMyTransactions = (req, cb) => {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid parameters')
  }
  const query = req.body
  return library.scheme.validate(query, {
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
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)
    if (req.params.currency) {
      query.currency = req.params.currency
    } else {
      query.uia = 1
    }
    query.ownerAddress = req.params.address
    return priv.queryTransactions(query, cb)
  })
}

shared.getTransactions = (req, cb) => {
  if (!req.params || !req.params.currency) {
    return cb('Invalid parameters')
  }
  let single = false
  const query = req.body
  if (req.params.currency.length === 64) {
    query.id = req.params.currency
    single = true
  } else {
    query.currency = req.params.currency
  }
  return library.scheme.validate(query, {
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
  }, (err) => {
    if (err) return cb(`Invalid parameters: ${err[0]}`)
    return priv.queryTransactions(query, (queryErr, data) => {
      if (queryErr) return cb(queryErr)
      if (single) {
        return cb(null, { transaction: data.transactions[0] })
      }
      return cb(null, data)
    })
  })
}

shared.registerIssuer = function (req, cb) {
  cb(null, req)
}

shared.registerAssets = function (req, cb) {
  cb(null, req)
}

shared.updateAssetAcl = function (req, cb) {
  cb(null, req)
}

shared.issueAsset = function (req, cb) {
  cb(null, req)
}

shared.transferAsset = (req, cb) => {
  const body = req.body
  return library.scheme.validate(body, {
    type: 'object',
    properties: {
      secret: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      currency: {
        type: 'string',
        maxLength: 22,
      },
      amount: {
        type: 'string',
        maxLength: 50,
      },
      recipientId: {
        type: 'string',
        minLength: 1,
      },
      publicKey: {
        type: 'string',
        format: 'publicKey',
      },
      secondSecret: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      multisigAccountPublicKey: {
        type: 'string',
        format: 'publicKey',
      },
      message: {
        type: 'string',
        maxLength: 256,
      },
    },
    required: ['secret', 'amount', 'recipientId', 'currency'],
  }, (err) => {
    if (err) return cb(`${err[0].message}: ${err[0].path}`)

    const hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest()
    const keypair = ed.MakeKeypair(hash)

    if (body.publicKey) {
      if (keypair.publicKey.toString('hex') !== body.publicKey) {
        return cb('Invalid passphrase')
      }
    }

    return library.sequence.add((callback) => {
      if (body.multisigAccountPublicKey && body.multisigAccountPublicKey !== keypair.publicKey.toString('hex')) {
        const condition = { publicKey: body.multisigAccountPublicKey }
        modules.accounts.getAccount(condition, (multisigErr, account) => {
          if (multisigErr) return callback(multisigErr.toString())

          if (!account) return callback('Multisignature account not found')

          if (!account.multisignatures || !account.multisignatures) {
            return callback('Account does not have multisignatures enabled')
          }

          if (account.multisignatures.indexOf(keypair.publicKey.toString('hex')) < 0) {
            return callback('Account does not belong to multisignature group')
          }

          const pkCondition = { publicKey: keypair.publicKey }
          return modules.accounts.getAccount(pkCondition, (getErr, requester) => {
            if (getErr) {
              return callback(err.toString())
            }

            if (!requester || !requester.publicKey) {
              return callback('Invalid requester')
            }

            if (requester.secondSignature && !body.secondSecret) {
              return callback('Invalid second passphrase')
            }

            if (requester.publicKey === account.publicKey) {
              return callback('Invalid requester')
            }

            let secondKeypair = null

            if (requester.secondSignature) {
              const secondHash = crypto.createHash('sha256').update(body.secondSecret, 'utf8').digest()
              secondKeypair = ed.MakeKeypair(secondHash)
            }

            try {
              const transaction = library.base.transaction.create({
                amount: body.amount,
                currency: body.currency,
                sender: account,
                recipientId: body.recipientId,
                keypair,
                requester: keypair,
                secondKeypair,
                message: body.message,
              })
              return modules.transactions.processUnconfirmedTransaction(transaction, cb)
            } catch (e) {
              return callback(e.toString())
            }
          })
        })
        return null
      }
      const condition = { publicKey: keypair.publicKey.toString('hex') }
      return modules.accounts.getAccount(condition, (getErr, account) => {
        if (getErr) {
          return callback(getErr.toString())
        }
        if (!account) {
          return callback('Account not found')
        }

        if (account.secondSignature && !body.secondSecret) {
          return callback('Invalid second passphrase')
        }

        let secondKeypair = null

        if (account.secondSignature) {
          const secondHash = crypto.createHash('sha256').update(body.secondSecret, 'utf8').digest()
          secondKeypair = ed.MakeKeypair(secondHash)
        }

        try {
          const transaction = library.base.transaction.create({
            currency: body.currency,
            amount: body.amount,
            sender: account,
            recipientId: body.recipientId,
            keypair,
            secondKeypair,
            message: body.message,
          })
          return modules.transactions.processUnconfirmedTransaction(transaction, cb)
        } catch (e) {
          return callback(e.toString())
        }
      })
    }, (seqErr, transaction) => {
      if (seqErr) return cb(err.toString())

      return cb(null, { transactionId: transaction[0].id })
    })
  })
}

shared.updateFlags = (req, cb) => {
  cb(null, req)
}

module.exports = UIA
