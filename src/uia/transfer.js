var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')
var mathjs = require('mathjs')
var amountHelper = require('../utils/amount.js')
var addressHelper = require('../utils/address.js')

function Transfer() {
  this.create = function (data, trs) {
    trs.amount = 0
    trs.recipientId = data.recipientId
    trs.asset.uiaTransfer = {
      currency: data.currency,
      amount: data.amount
    }
    return trs
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee()
  }

  this.verify = function (trs, sender, cb) {
    if (!addressHelper.isAddress(trs.recipientId)) return cb("Invalid recipient")
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var asset = trs.asset.uiaTransfer
    var error = amountHelper.validate(asset.amount)
    if (error) return setImmediate(cb, error)

    library.model.getAssetByName(asset.currency, function (err, assetDetail) {
      if (err) return cb('Database error: ' + err)
      if (!assetDetail) return cb('Asset not exists')
      if (assetDetail.writeoff) return cb('Asset already writeoff')
      if (!assetDetail.allowWhitelist && !assetDetail.allowBlacklist) return cb()

      // if (sender.address == assetDetail.issuerId) return cb()

      var aclTable = assetDetail.acl == 0 ? 'acl_black' : 'acl_white'

      library.model.checkAcl(aclTable, asset.currency, sender.address, trs.recipientId, function (err, isInList) {
        if (err) return cb('Database error when query acl: ' + err)
        if ((assetDetail.acl == 0) == isInList) return cb('Permission not allowed')
        cb()
      })
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    var buffer = Buffer.concat([
      new Buffer(trs.asset.uiaTransfer.currency, 'utf8'),
      new Buffer(trs.asset.uiaTransfer.amount, 'utf8')
    ])
    return buffer
  }

  this.apply = function (trs, block, sender, cb) {
    var transfer = trs.asset.uiaTransfer
    library.balanceCache.addAssetBalance(trs.recipientId, transfer.currency, transfer.amount)
    async.series([
      function (next) {
        library.model.updateAssetBalance(transfer.currency, '-' + transfer.amount, sender.address, next)
      },
      function (next) {
        library.model.updateAssetBalance(transfer.currency, transfer.amount, trs.recipientId, next)
      }
    ], cb)
  }

  this.undo = function (trs, block, sender, cb) {
    var transfer = trs.asset.uiaTransfer
    library.balanceCache.addAssetBalance(trs.recipientId, transfer.currency, '-' + transfer.amount)
    async.series([
      function (next) {
        library.model.updateAssetBalance(transfer.currency, transfer.amount, sender.address, next)
      },
      function (next) {
        library.model.updateAssetBalance(transfer.currency, '-' + transfer.amount, trs.recipientId, next)
      }
    ], cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.uiaTransfer
    var balance = library.balanceCache.getAssetBalance(sender.address, transfer.currency) || 0
    var surplus = bignum(balance).sub(transfer.amount)
    if (surplus.lt(0)) return setImmediate(cb, 'Insufficient asset balance')

    library.balanceCache.setAssetBalance(sender.address, transfer.currency, surplus.toString())
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.uiaTransfer
    library.balanceCache.addAssetBalance(sender.address, transfer.currency, transfer.amount)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaTransfer, {
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
      throw Error('Can\'t parse transfer: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.transfers_currency) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        currency: raw.transfers_currency,
        amount: raw.transfers_amount
      }

      return { uiaTransfer: asset }
    }
  }

  this.dbSave = function (trs, cb) {
    var currency = trs.asset.uiaTransfer.currency
    var amount = trs.asset.uiaTransfer.amount
    var values = {
      transactionId: trs.id,
      currency: currency,
      amount: amount
    }
    library.model.add('transfers', values, cb)
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

module.exports = new Transfer