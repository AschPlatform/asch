var async = require('async')
var bignum = require('bignumber')
var jsonSql = require('json-sql')()
var amountHelper = require('./amount')

class Model {
  constructor(dbLite) {
    this.dbLite = dbLite
  }

  exists(table, condition, cb) {
    this.count(table, condition, function (err, count) {
      if (err) return cb(err)
      cb(null, count > 0)
    })
  }

  count(table, condition, cb) {
    var sql = jsonSql.build({
      type: 'select',
      table: table,
      fields: ['count(*)'],
      condition: condition
    })
    sql.query = sql.query.replace(/"/g, '')
    this.dbLite.query(sql.query, sql.values, { count: Number }, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      cb(null, rows[0].count)
    })
  }

  getIssuerByName(name, fields, cb) {
    var filter = {
      condition: { name: name }
    }
    this.getIssuers(filter, fields, function (err, issuers) {
      if (err) return cb(err)
      cb(null, issuers && issuers[0])
    })
  }

  getIssuerByAddress(address, fields, cb) {
    var filter = {
      condition: { issuerId: address }
    }
    this.getIssuers(filter, fields, function (err, issuers) {
      if (err) return cb(err)
      cb(null, issuers && issuers[0])
    })
  }

  getIssuers(filter, fields, cb) {
    var limit = (filter && filter.limit) || 100
    var offset = (filter && filter.offset) || 0
    var sql = jsonSql.build({
      type: 'select',
      table: 'issuers',
      condition: filter.condition,
      fields: fields,
      limit: filter.limit || 20,
      offset: filter.offset || 0
    })

    var fieldConv = {}
    fields.forEach((item) => {
      fieldConv[item] = String
    })
    this.dbLite.query(sql.query, sql.values, fieldConv, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      cb(null, rows)
    })
  }

  // TODO(qingfeng) make it more generic
  add(table, values, cb) {
    var sql = jsonSql.build({
      type: 'insert',
      table: table,
      values: values
    })
    this.dbLite.query(sql.query, sql.values, cb)
  }

  getAssets(filter, cb) {
    var sql = jsonSql.build({
      table: 'assets',
      alias: 'a',
      condition: filter.condition,
      limit: filter.limit,
      offset: filter.offset,
      join: [{
        type: 'inner',
        table: 'issuers',
        alias: 'i',
        on: {
          'a.issuerName': 'i.name'
        }
      }, {
          type: 'inner',
          table: 'trs',
          alias: 't',
          on: {
            'a.transactionId': 't.id'
          }
        }, {
          type: 'inner',
          table: 'blocks',
          alias: 'b',
          on: {
            't.blockId': 'b.id'
          }
        }],
      fields: [
        { 'a.name': 'name' },
        { 'a.desc': 'desc' },
        { 'a.maximum': 'maximum' },
        { 'a.precision': 'precision' },
        { 'a.strategy': 'strategy' },
        { 'a.quantity': 'quantity' },
        { 'b.height': 'height' },
        { 'i.issuerId': 'issuerId' },
        { 'a.acl': 'acl' },
        { 'a.writeoff': 'writeoff' },
        { 'a.allowWriteoff': 'allowWriteoff' },
        { 'a.allowWhitelist': 'allowWhitelist' },
        { 'a.allowBlacklist': 'allowBlacklist' }
      ]
    })
    var fieldConv = {
      name: String,
      desc: String,
      maximum: String,
      precision: Number,
      strategy: String,
      quantity: String,
      height: Number,
      issuerId: String,
      acl: Number,
      writeoff: Number,
      allowWriteoff: Number,
      allowWhitelist: Number,
      allowBlacklist: Number
    }
    this.dbLite.query(sql.query, sql.values, fieldConv, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      for (let i = 0; i < rows.length; ++i) {
        let precision = rows[i].precision
        rows[i].maximum = bignum(rows[i].maximum).toString(10)
        rows[i].maximumShow = amountHelper.calcRealAmount(rows[i].maximum, precision)
        rows[i].quantity = bignum(rows[i].quantity).toString(10)
        rows[i].quantityShow = amountHelper.calcRealAmount(rows[i].quantity, precision)
      }
      cb(null, rows)
    })
  }

  getAssetByName(name, cb) {
    var filter = {
      condition: {
        'a.name': name
      }
    }
    this.getAssets(filter, function (err, assets) {
      if (err) return cb(err)
      return cb(null, assets && assets[0])
    })
  }

  addAssetQuantity(currency, amount, cb) {
    var sql = 'select quantity from assets where name=$name'
    this.dbLite.query(sql, { name: currency }, { quantity: String }, (err, rows) => {
      if (err) return cb('Database error when query asset: ' + err)
      if (!rows || !rows.length) return cb('Asset not exists')
      var quantity = rows[0].quantity
      var sql = jsonSql.build({
        type: 'update',
        table: 'assets',
        condition: { name: currency },
        modifier: {
          quantity: bignum(quantity).plus(amount).toString()
        }
      })
      this.dbLite.query(sql.query, sql.values, (err) => {
        if (err) return cb('Database error when update asset: ' + err)
        cb()
      })
    })
  }

  updateAssetBalance(currency, amount, address, cb) {
    var sql = 'select balance from mem_asset_balances where address=$address and currency=$currency'
    var condition = {
      address: address,
      currency: currency
    }
    this.dbLite.query(sql, condition, { balance: String }, (err, rows) => {
      if (err) return cb('Databae error when query asset balance: ' + err)
      var balance = '0'
      var balanceExist = false
      if (rows && rows.length > 0) {
        balance = rows[0].balance
        balanceExist = true
      }
      var newBalance = bignum(balance).plus(amount)
      if (newBalance.lt(0)) {
        return cb('Asset balance not enough')
      }
      var statement = {
        table: 'mem_asset_balances'
      }
      if (balanceExist) {
        statement.type = 'update'
        statement.condition = condition
        statement.modifier = { balance: newBalance.toString() }
      } else {
        statement.type = 'insert'
        statement.values = {
          address: address,
          balance: newBalance.toString(),
          currency: currency
        }
      }
      var sql = jsonSql.build(statement)
      this.dbLite.query(sql.query, sql.values, (err) => {
        if (err) return cb('Database error when updateBalance: ' + err)
        cb()
      })
    })
  }

  updateAssetFlag(currency, flag, flagName, cb) {
    var modifier = {}
    modifier[flagName] = flag
    var sql = jsonSql.build({
      type: 'update',
      table: 'assets',
      condition: {
        name: currency
      },
      modifier: modifier
    })
    this.dbLite.query(sql.query, sql.values, function (err) {
      if (err) return cb('Database error: ' + err)
      cb()
    })
  }

  getAssetAcl(table, currency, filter, cb) {
    var sql = jsonSql.build({
      type: 'select',
      table: table,
      condition: {
        currency: currency
      },
      fields: ['address'],
      limit: filter.limit,
      offset: filter.offset
    })
    this.dbLite.query(sql.query, sql.values, { address: String }, cb)
  }

  addAssetAcl(table, currency, list, cb) {
    var sqls = []
    for (var i = 0; i < list.length; ++i) {
      sqls.push(jsonSql.build({
        type: 'insert',
        or: 'ignore',
        table: table,
        values: {
          currency: currency,
          address: list[i]
        }
      }))
    }
    async.eachSeries(sqls, (sql, next) => {
      this.dbLite.query(sql.query, sql.values, next)
    }, cb)
  }

  removeAssetAcl(table, currency, list, cb) {
    var sql = jsonSql.build({
      type: 'remove',
      table: table,
      condition: [
        { currency: currency },
        { address: { $in: list } }
      ]
    })
    this.dbLite.query(sql.query, sql.values, cb)
  }

  getAllAssetBalances(cb) {
    var sql = jsonSql.build({
      type: 'select',
      table: 'mem_asset_balances',
      fields: ['currency', 'address', 'balance']
    })
    var fieldConv = {
      currency: String,
      address: String,
      balance: String
    }
    this.dbLite.query(sql.query, sql.values, fieldConv, cb)
  }

  getAccountBalances(address, filter, cb) {
    var condition = {
      address: address
    }
    var limit
    var offset
    if (typeof filter === 'string') {
      condition.currency = filter
    } else {
      limit = filter.limit
      offset = filter.offset
    }
    var sql = jsonSql.build({
      type: 'select',
      condition: condition,
      limit: limit,
      offset: offset,
      table: 'mem_asset_balances',
      alias: 'b',
      join: [
        {
          type: 'inner',
          table: 'assets',
          alias: 'a',
          on: {
            'a.name': 'b.currency'
          }
        }
      ],
      fields: {
        'b.currency': 'currency',
        'b.balance': 'balance',
        'a.maximum': 'maximum',
        'a.precision': 'precision',
        'a.quantity': 'quantity',
        'a.writeoff': 'writeoff',
        'a.allowWriteoff': 'allowWriteoff',
        'a.allowWhitelist': 'allowWhitelist',
        'a.allowBlacklist': 'allowBlacklist'
      }
    })
    var fieldConv = {
      currency: String,
      balance: String,
      maximum: String,
      precision: Number,
      quantity: String,
      writeoff: Number,
      allowWriteoff: Number,
      allowWhitelist: Number,
      allowBlacklist: Number

    }
    this.dbLite.query(sql.query, sql.values, fieldConv, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      for (let i = 0; i < rows.length; ++i) {
        let precision = rows[i].precision
        rows[i].maximum = bignum(rows[i].maximum).toString(10)
        rows[i].maximumShow = amountHelper.calcRealAmount(rows[i].maximum, precision)
        rows[i].quantity = bignum(rows[i].quantity).toString(10)
        rows[i].quantityShow = amountHelper.calcRealAmount(rows[i].quantity, precision)
        rows[i].balance = bignum(rows[i].balance).toString(10)
        rows[i].balanceShow = amountHelper.calcRealAmount(rows[i].balance, precision)
      }
      cb(null, rows)
    })
  }

  getDAppBalance(dappId, currency, cb) {
    if (currency !== 'XAS') {
      return this.getAccountBalances(dappId, currency, function (err, rows) {
        if (err) return cb('Database error: ' + err)
        if (!rows || !rows.length) return cb(null, '0')
        return cb(null, rows[0])
      })
    }
    var sql = jsonSql.build({
      type: 'select',
      table: 'mem_asset_balances',
      condition: {
        address: dappId,
        currency: currency
      },
      fields: ['balance']
    })
    this.dbLite.query(sql.query, sql.values, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      if (!rows || !rows.length) return cb(null, '0')
      return cb(null, { currency: currency, balance: rows[0][0] })
    })
  }

  checkAcl(table, currency, senderId, recipientId, cb) {
    var sqls = []
    if (!!senderId) sqls.push('select address from $table where address=$senderId and currency=$currency')
    if (!!recipientId) sqls.push('select address from $table where address=$recipientId and currency=$currency')
    var values = {
      table: table,
      senderId: senderId,
      recipientId: recipientId,
      currency: currency
    }
    this.dbLite.query(sqls.join(';'), values, function (err, res) {
      if (err) return cb(err)
      cb(null, res.length != 0)
    })
  }

  isIssuerExists(name, id, cb) {
    var sql = 'select name from issuers where name=$name;select name from issuers where issuerId=$id'
    var values = {
      name: name,
      id: id
    }
    this.dbLite.query(sql, values, ['name'], function (err, rows) {
      if (err) return cb('Database error: ' + err)
      cb(null, rows && rows.length > 0)
    })
  }

  getAllNativeBalances(cb) {
    var sql = jsonSql.build({
      type: 'select',
      table: 'mem_accounts',
      fields: ['address', 'balance']
    })
    var fieldConv = {
      address: String,
      balance: String
    }
    this.dbLite.query(sql.query, sql.values, fieldConv, cb)
  }

  getDApps(condition, cb) {
    var sql = jsonSql.build({
      type: 'select',
      table: 'dapps',
      fields: [
        'name', 'description', 'tags', 'link', 'type', 'category', 'icon', 'delegates', 'unlockDelegates', 'transactionId'
      ],
      condition: condition
    })
    var fieldConv = {
      name: String,
      description: String,
      tags: String,
      link: String,
      type: Number,
      category: Number,
      icon: String,
      delegates: String,
      unlockDelegates: Number,
      transactionId: String
    }
    this.dbLite.query(sql.query, sql.values, fieldConv, function (err, rows) {
      if (err) return cb('Database error: ' + err)
      for (var i in rows) {
        rows[i].delegates = rows[i].delegates.split(',')
      }
      cb(null, rows)
    })
  }

  getDAppById(id, cb) {
    this.getDApps({ transactionId: id }, function (err, dapps) {
      if (err) return cb(err)
      if (!dapps || !dapps.length) return cb('DApp not found')
      return cb(null, dapps[0])
    })
  }

  getDAppsByIds(ids, cb) {
    this.getDApps({ transactionId: { $in: ids } }, function (err, dapps) {
      if (err) return cb(err)
      return cb(null, dapps)
    })
  }
}

module.exports = Model;