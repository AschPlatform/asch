var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')
var ByteBuffer = require('bytebuffer')
var flagsHelper = require('./flags-helper')

function Flags() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaFlags = {
      currency: data.currency,
      flagType: data.flagType,
      flag: data.flag
    }
    return trs
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee()
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var asset = trs.asset.uiaFlags
    if (!flagsHelper.isValidFlagType(asset.flagType)) return setImmediate(cb, 'Invalid asset flag type')
    if (!flagsHelper.isValidFlag(asset.flagType, asset.flag)) return setImmediate(cb, 'Invalid asset flag')

    library.model.getAssetByName(trs.asset.uiaFlags.currency, function (err, result) {
      if (err) return cb('Database error: ' + err)
      if (!result) return cb('Asset not exists')

      if (result.issuerId !== sender.address) return cb('Permission not allowed')
      
      if (result.writeoff) return cb('Asset already writeoff')

      if (!result.allowWriteoff && asset.flagType === 2) return cb('Writeoff not allowed')
      if (!result.allowWhitelist && asset.flagType === 1 && asset.flag === 1) return cb('Whitelist not allowed')
      if (!result.allowBlacklist && asset.flagType === 1 && asset.flag === 0) return cb('Blacklist not allowed')
      if (flagsHelper.isSameFlag(asset.flagType, asset.flag, result)) return cb('Flag double set')

      return cb()
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    var bb = new ByteBuffer()
    var asset = trs.asset.uiaFlags
    bb.writeString(asset.currency)
    bb.writeByte(asset.flagType)
    bb.writeByte(asset.flag)
    bb.flip()
    return bb.toBuffer()
  }

  this.apply = function (trs, block, sender, cb) {
    var asset = trs.asset.uiaFlags
    library.model.updateAssetFlag(asset.currency, asset.flag, flagsHelper.getTypeName(asset.flagType), cb)
  }

  this.undo = function (trs, block, sender, cb) {
    var asset = trs.asset.uiaFlags
    library.model.updateAssetFlag(asset.currency, asset.flag ^ 1, flagsHelper.getTypeName(asset.flagType), cb)
    setImmediate(cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var key = trs.asset.uiaFlags.currency + ':' + trs.type
    if (library.oneoff.has(key)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(key, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    library.oneoff.delete(trs.asset.uiaFlags.currency + ':' + trs.type)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaFlags, {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          minLength: 1,
          maxLength: 22
        },
        flagType: {
          type: 'integer'
        },
        flag: {
          type: 'integer'
        }
      },
      required: ['currency', 'flagType', 'flag']
    })

    if (!report) {
      throw Error('Can\'t parse flags: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.flags_currency) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        currency: raw.flags_currency,
        flagType: raw.flags_flagType,
        flag: raw.flags_flag
      }

      return { uiaFlags: asset }
    }
  }

  this.dbSave = function (trs, cb) {
    var asset = trs.asset.uiaFlags
    var values = {
      transactionId: trs.id,
      currency: asset.currency,
      flagType: asset.flagType,
      flag: asset.flag
    }
    library.model.add('flags', values, cb)
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

module.exports = new Flags