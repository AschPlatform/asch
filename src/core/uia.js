var ByteBuffer = require('bytebuffer')
var bignum = require('bignumber')
var crypto = require('crypto')
var async = require('async')
var ed = require('../utils/ed.js')
var extend = require('extend')
var jsonSql = require('json-sql')()
jsonSql.setDialect('sqlite')
var constants = require('../utils/constants.js')
var slots = require('../utils/slots.js')
var Router = require('../utils/router.js')
var TransactionTypes = require('../utils/transaction-types.js')
var sandboxHelper = require('../utils/sandbox.js')
var flagsHelper = require('../uia/flags-helper.js')
var addressHelper = require('../utils/address.js')
var amountHelper = require('../utils/amount.js')

// Private fields
var modules, library, self, private = {}, shared = {}

// Constructor
function UIA(cb, scope) {
  library = scope
  self = this
  self.__private = private
  private.attachApi()

  library.base.transaction.attachAssetType(TransactionTypes.UIA_ISSUER, require('../uia/issuer.js'))
  library.base.transaction.attachAssetType(TransactionTypes.UIA_ASSET, require('../uia/asset.js'))
  library.base.transaction.attachAssetType(TransactionTypes.UIA_FLAGS, require('../uia/flags.js'))
  library.base.transaction.attachAssetType(TransactionTypes.UIA_ACL, require('../uia/acl.js'))
  library.base.transaction.attachAssetType(TransactionTypes.UIA_ISSUE, require('../uia/issue.js'))
  library.base.transaction.attachAssetType(TransactionTypes.UIA_TRANSFER, require('../uia/transfer.js'))

  library.model.getAllAssetBalances((err, results) => {
    if (err) return cb('Failed to load asset balances: ' + err)
    for (let i = 0; i < results.length; ++i) {
      let {currency, address, balance} = results[i]
      library.balanceCache.setAssetBalance(address, currency, balance)
    }
    library.balanceCache.commit()
    cb(null, self)
  })
}

// Private methods
private.attachApi = function () {
  var router = new Router()

  router.use(function (req, res, next) {
    if (modules) return next()
    res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /issuers': 'getIssuers',
    'get /issuers/:name': 'getIssuer',
    'get /issuers/:name/assets': 'getIssuerAssets',
    'get /assets': 'getAssets',
    'get /assets/:name': 'getAsset',
    'get /assets/:name/acl/:flag': 'getAssetAcl',
    'get /balances/:address': 'getBalances',
    'get /balances/:address/:currency': 'getBalance',
    'get /transactions/my/:address/': 'getMyTransactions',
    'get /transactions/my/:address/:currency': 'getMyTransactions',
    'get /transactions/:currency': 'getTransactions',

    // TODO(qingfeng) update issuer or asset description
    // 'put /issuers/:iid': 'updateIssuer',
    // 'put /assets/:aid': 'updateAsset',
    'put /issuers': 'registerIssuer',
    'put /assets': 'registerAssets',
    'put /assets/:name/acl': 'updateAssetAcl',
    'put /assets/:name/issue': 'issueAsset',
    'put /transfers': 'transferAsset',
    'put /assets/:name/flags': 'updateFlags',
  })

  router.use(function (req, res, next) {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/uia', router)
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next()
    library.logger.error(req.url, err)
    res.status(500).send({ success: false, error: err.toString() })
  })
}

// Public methods
UIA.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
UIA.prototype.onBind = function (scope) {
  modules = scope
}

private.queryTransactions = function (query, cb) {
  var func = 'list'
  var param = query
  var list = true
  if (typeof query.id !== 'undefined') {
    func = 'getById'
    param = query.id
    list = false
  }

  modules.transactions[func](param, function (err, data) {
    if (err) return cb('Failed to get transactions: ' + err)

    if (!list) data = { transactions: [data] }
    var sqls = []
    var typeToTable = {
      9: {
        table: 'issuers',
        fields: ['transactionId', 'name', 'desc']
      },
      10: {
        table: 'assets',
        fields: ['transactionId', 'name', 'desc', 'maximum', 'precision', 'strategy']
      },
      11: {
        table: 'flags',
        fields: ['transactionId', 'currency', 'flagType', 'flag']
      },
      12: {
        table: 'acls',
        fields: ['transactionId', 'currency', 'operator', 'flag', 'list']
      },
      13: {
        table: 'issues',
        fields: ['transactionId', 'currency', 'amount']
      },
      14: {
        table: 'transfers',
        fields: ['transactionId', 'currency', 'amount']
      }
    }
    data.transactions.forEach(function (trs) {
      if (!typeToTable[trs.type]) {
        return
      }
      trs.t_id = trs.id
      sqls.push({
        query: 'select ' + typeToTable[trs.type].fields.join(',') + ' from ' + typeToTable[trs.type].table + ' where transactionId="' + trs.id + '"',
        fields: typeToTable[trs.type].fields
      })
    })
    async.mapSeries(sqls, function (sql, next) {
      library.dbLite.query(sql.query, {}, sql.fields, next)
    }, function (err, rows) {
      if (err) return cb('Failed to get transaction assets: ' + err)

      for (let i = 0; i < rows.length; ++i) {
        if (rows[i].length == 0) continue
        var t = data.transactions[i]
        var type = t.type
        var table = typeToTable[type].table
        var asset = rows[i][0]
        for (let k in asset) {
          asset[table + '_' + k] = asset[k]
        }
        if (asset.transactionId == t.id) {
          asset.t_id = asset.transactionId
          t.asset = library.base.transaction.dbReadAsset(t.type, asset)
        }
        delete t.t_id
      }
      var assetNames = new Set
      data.transactions.forEach(function (trs) {
        if (trs.type === 13) {
          assetNames.add(trs.asset.uiaIssue.currency)
        } else if (trs.type === 14) {
          assetNames.add(trs.asset.uiaTransfer.currency)
        }
      })
      assetNames = Array.from(assetNames)
      async.mapSeries(assetNames, function (name, next) {
        library.model.getAssetByName(name, next)
      }, function (err, assets) {
        if (err) return cb('Failed to asset info: ' + err)
        var precisionMap = new Map
        assets.forEach(function (a) {
          precisionMap.set(a.name, a.precision)
        })
        data.transactions.forEach(function (trs) {
          var obj = null
          if (trs.type === 13) {
            obj = trs.asset.uiaIssue
          } else if (trs.type === 14) {
            obj = trs.asset.uiaTransfer
          }
          if (obj != null && precisionMap.has(obj.currency)) {
            var precision = precisionMap.get(obj.currency)
            obj.amountShow = amountHelper.calcRealAmount(obj.amount, precision)
            obj.precision = precision
          }
        })
        cb(null, data)
      })
    })
  })
}

// Shared
shared.getFee = function (req, cb) {
  var fee = null

  // FIXME(qingfeng)
  fee = 5 * constants.fixedPoint

  cb(null, { fee: fee })
}

shared.getIssuers = function (req, cb) {
  var query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    library.model.count('issuers', null, function (err, count) {
      if (err) return cb('Failed to get count: ' + err)

      library.model.getIssuers(query, ['name', 'desc', 'issuerId'], function (err, results) {
        if (err) return cb('Failed to get issuers: ' + err)

        cb(null, {
          issuers: results,
          count: count
        })
      })
    })
  })
}

shared.getIssuerByAddress = function (req, cb) {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid address')
  }
  library.model.getIssuerByAddress(req.params.address, ['name', 'desc'], function (err, issuer) {
    if (err) return cb('Database error: ' + err)
    if (!issuer) return cb('Issuer not found')
    cb(null, { issuer: issuer })
  })
}

shared.getIssuer = function (req, cb) {
  if (req.params && addressHelper.isAddress(req.params.name)) {
    req.params.address = req.params.name
    return shared.getIssuerByAddress(req, cb)
  }
  var query = req.params
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 16
      }
    },
    required: ['name']
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    library.model.getIssuerByName(query.name, ['name', 'desc', 'issuerId'], function (err, issuer) {
      if (!issuer || err) return cb('Issuer not found')
      cb(null, { issuer: issuer })
    })
  })
}

shared.getIssuerAssets = function (req, cb) {
  if (!req.params || !req.params.name || req.params.name.length > 32) {
    return cb(' Invalid parameters')
  }
  var query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    library.model.count('assets', { issuerName: req.params.name }, function (err, count) {
      if (err) return cb('Failed to get count: ' + err)

      var filter = {
        condition: { issuerName: req.params.name },
        limit: query.limit,
        offset: query.offset
      }
      library.model.getAssets(filter, function (err, results) {
        if (err) return cb('Failed to get assets: ' + err)

        cb(null, {
          assets: results,
          count: count
        })
      })
    })
  })
}

shared.getAssets = function (req, cb) {
  var query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    library.model.count('assets', null, function (err, count) {
      if (err) return cb('Failed to get count: ' + err)

      var filter = {
        limit: query.limit,
        offset: query.offset
      }
      library.model.getAssets(filter, function (err, results) {
        if (err) return cb('Failed to get assets: ' + err)

        cb(null, {
          assets: results,
          count: count
        })
      })
    })
  })
}

shared.getAsset = function (req, cb) {
  var query = req.params
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 32
      }
    },
    required: ['name']
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    library.model.getAssetByName(query.name, function (err, asset) {
      if (err) return cb('Failed to get asset: ' + err)
      if (!asset) return cb('Asset not found')
      cb(null, { asset: asset })
    })
  })
}

shared.getAssetAcl = function (req, cb) {
  if (!req.params || !req.params.name || !req.params.flag) {
    return cb('Invalid parameters')
  }
  var query = extend({}, req.body, req.params)
  query.flag = Number(query.flag)
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    var table = flagsHelper.getAclTable(query.flag)
    library.model.count(table, { currency: query.name }, function (err, count) {
      if (err) return cb('Failed to get count: ' + err)

      var filter = {
        limit: query.limit,
        offset: query.offset
      }
      library.model.getAssetAcl(table, query.name, filter, function (err, results) {
        if (err) return cb('Failed to get acl: ' + err)

        cb(null, {
          list: results,
          count: count
        })
      })
    })
  })
}

shared.getBalances = function (req, cb) {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid address')
  }
  var query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])

    var condition = {
      address: req.params.address
    }
    library.model.count('mem_asset_balances', condition, function (err, count) {
      if (err) return cb('Failed to get count: ' + err)

      var filter = {
        limit: query.limit,
        offset: query.offset
      }
      library.model.getAccountBalances(req.params.address, filter, function (err, results) {
        if (err) return cb('Failed to get balances: ' + err)

        cb(null, {
          balances: results,
          count: count
        })
      })
    })
  })
}

shared.getBalance = function (req, cb) {
  if (!req.params) return cb('Invalid parameters')
  if (!addressHelper.isAddress(req.params.address)) return cb('Invalid address')
  if (!req.params.currency || req.params.currency.length > 22) return cb('Invalid currency')

  library.model.getAccountBalances(req.params.address, req.params.currency, function (err, results) {
    if (err) return cb('Failed to get balance: ' + err)
    if (!results || results.length == 0) return cb('Balance info not found')
    cb(null, { balance: results[0] })
  })
}

shared.getMyTransactions = function (req, cb) {
  if (!req.params || !addressHelper.isAddress(req.params.address)) {
    return cb('Invalid parameters')
  }
  var query = req.body
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])
    if (req.params.currency) {
      query.currency = req.params.currency
    } else {
      query.uia = 1
    }
    query.ownerAddress = req.params.address
    private.queryTransactions(query, cb)
  })
}

shared.getTransactions = function (req, cb) {
  if (!req.params || !req.params.currency) {
    return cb('Invalid parameters')
  }
  var single = false
  var query = req.body
  if (req.params.currency.length === 64) {
    query.id = req.params.currency
    single = true
  } else {
    query.currency = req.params.currency
  }
  library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      offset: {
        type: 'integer',
        minimum: 0
      }
    }
  }, function (err) {
    if (err) return cb('Invalid parameters: ' + err[0])
    private.queryTransactions(query, function (err, data) {
      if (err) return cb(err)
      if (single) {
        return cb(null, { transaction: data.transactions[0] })
      } else {
        return cb(null, data)
      }
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

shared.transferAsset = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      currency: {
        type: "string",
        maxLength: 22
      },
      amount: {
        type: "string",
        maxLength: 50
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
      },
      message: {
        type: "string",
        maxLength: 256
      }
    },
    required: ["secret", "amount", "recipientId", "currency"]
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
                type: TransactionTypes.UIA_TRANSFER,
                amount: body.amount,
                currency: body.currency,
                sender: account,
                recipientId: body.recipientId,
                keypair: keypair,
                requester: keypair,
                secondKeypair: secondKeypair,
                message: body.message
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
              type: TransactionTypes.UIA_TRANSFER,
              currency: body.currency,
              amount: body.amount,
              sender: account,
              recipientId: body.recipientId,
              keypair: keypair,
              secondKeypair: secondKeypair,
              message: body.message
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

      cb(null, { transactionId: transaction[0].id });
    });
  });
}

shared.updateFlags = function (req, cb) {
  cb(null, req)
}

module.exports = UIA