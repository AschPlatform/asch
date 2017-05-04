var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')
var mathjs = require('mathjs')
var amountHelper = require('../utils/amount.js')

function Issue() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaIssue = {
      currency: data.currency,
      amount: data.amount
    }
    return trs
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee()
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var amount = trs.asset.uiaIssue.amount
    var error = amountHelper.validate(amount)
    if (error) return setImmediate(cb, error)

    library.model.getAssetByName(trs.asset.uiaIssue.currency, function (err, result) {
      if (err) return cb('Database error: ' + err)
      if (!result) return cb('Asset not exists')
      if (result.issuerId !== sender.address) return cb('Permission not allowed')
      if (result.writeoff) return cb('Asset already writeoff')

      var maximum = result.maximum
      var quantity = result.quantity
      var precision = result.precision
      if (bignum(quantity).plus(amount).gt(maximum)) return cb('Exceed issue limit')

      var strategy = result.strategy
      var genesisHeight = result.height
      var height = modules.blocks.getLastBlock().height + 1
      if (strategy) {
        try {
          var context = {
            maximum: mathjs.bignumber(maximum),
            precision: precision,
            quantity: mathjs.bignumber(quantity).plus(amount),
            genesisHeight: genesisHeight,
            height: height
          }
          if (!mathjs.eval(strategy, context)) return cb('Strategy not allowed')
        } catch (e) {
          return cb('Failed to execute strategy')
        }
      }
      return cb()
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    var buffer = Buffer.concat([
      new Buffer(trs.asset.uiaIssue.currency, 'utf8'),
      new Buffer(trs.asset.uiaIssue.amount, 'utf8')
    ])
    return buffer
  }

  this.apply = function (trs, block, sender, cb) {
    var currency = trs.asset.uiaIssue.currency
    var amount = trs.asset.uiaIssue.amount
    library.balanceCache.addAssetBalance(sender.address, currency, amount)
    async.series([
      function (next) {
        library.model.addAssetQuantity(currency, amount, next)
      },
      function (next) {
        library.model.updateAssetBalance(currency, amount, sender.address, next)
      }
    ], cb)
  }

  this.undo = function (trs, block, sender, cb) {
    var currency = trs.asset.uiaIssue.currency
    var amount = trs.asset.uiaIssue.amount
    var senderBalanceKey = currency + ':' + sender.address
    var balance = library.balanceCache.getAssetBalance(sender.address, currency) || 0
    if (bignum(balance).lt(amount)) return setImmediate(cb, 'Invalid asset balance: ' + balance)
    library.balanceCache.addAssetBalance(sender.address, currency, '-' + amount)
    async.series([
      function (next) {
        library.model.addAssetQuantity(currency, '-' + amount, next)
      },
      function (next) {
        library.model.updateAssetBalance(currency, '-' + amount, sender.address, next)
      }
    ], cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var key = trs.asset.uiaIssue.currency + ':' + trs.type
    if (library.oneoff.has(key)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(key, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    library.oneoff.delete(trs.asset.uiaIssue.currency + ':' + trs.type)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaIssue, {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          minLength: 1,
          maxLength: 22
        },
        amount: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        }
      },
      required: ['currency', 'amount']
    })

    if (!report) {
      throw Error('Can\'t parse issue: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.issues_currency) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        currency: raw.issues_currency,
        amount: raw.issues_amount
      }

      return { uiaIssue: asset }
    }
  }

  this.dbSave = function (trs, cb) {
    var currency = trs.asset.uiaIssue.currency
    var amount = trs.asset.uiaIssue.amount
    var values = {
      transactionId: trs.id,
      currency: currency,
      amount: amount
    }
    library.model.add('issues', values, cb)
  }

  this.ready = function (trs, sender) {
    if (sender.multisignatures.length) {
      if (!trs.signatures) {
        return false
      }
      return trs.signatures.length >= sender.multimin - 1
    } else {
      return true
    }
  }
}

module.exports = new Issue