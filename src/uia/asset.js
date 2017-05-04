var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')
var amountHelper = require('../utils/amount.js')
var constants = require('../utils/constants.js')

function Asset() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaAsset = {
      name: data.name,
      desc: data.desc,
      maximum: data.maximum,
      precision: data.precision,
      strategy: data.strategy,
      allowWriteoff: data.allowWriteoff,
      allowWhitelist: data.allowWhitelist,
      allowBlacklist: data.allowBlacklist
    }

    return trs
  }

  this.calculateFee = function (trs, sender) {
    //var bytes = this.getBytes(trs)
    //return (500 + (Math.floor(bytes.length / 200) + 1)) * library.base.block.calculateFee()
    return 500 * constants.fixedPoint
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var asset = trs.asset.uiaAsset
    var nameParts = (asset.name || '').split('.')
    if (nameParts.length != 2) return setImmediate(cb, 'Invalid asset full name')

    var fullName = asset.name
    var issuerName = nameParts[0]
    var currencyName = nameParts[1]
    if (!currencyName || !/^[A-Z]{3,6}$/.test(currencyName)) return setImmediate(cb, 'Invalid asset currency name')
    if (!asset.desc) return setImmediate(cb, 'Invalid asset desc')
    if (asset.desc.length > 4096) return setImmediate(cb, 'Invalid asset desc size')

    if (asset.precision > 16 || asset.precision < 0) return setImmediate(cb, 'Invalid asset precision')

    var error = amountHelper.validate(asset.maximum)
    if (error) return setImmediate(cb, error)

    if (asset.strategy && asset.strategy.length > 256) return setImmediate(cb, 'Invalid asset strategy size')

    if (asset.allowWriteoff !== 0 && asset.allowWriteoff !== 1) return setImmediate(cb, 'Asset allowWriteoff is not valid')
    if (asset.allowWhitelist !== 0 && asset.allowWhitelist !== 1) return setImmediate(cb, 'Asset allowWhitelist is not valid')
    if (asset.allowBlacklist !== 0 && asset.allowBlacklist !== 1) return setImmediate(cb, 'Asset allowBlacklist is not valid')

    library.model.exists('assets', { name: fullName }, function (err, exists) {
      if (err) return cb(err)
      if (exists) return cb('Double register')
      library.model.getIssuerByName(issuerName, ['issuerId'], function (err, issuer) {
        if (err) return cb(err)
        if (!issuer) return cb('Issuer not exists')
        if (issuer.issuerId != sender.address) return cb('Permission not allowed')
        return cb(null)
      })
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    var asset = trs.asset.uiaAsset
    var buffer = Buffer.concat([
      new Buffer(asset.name, 'utf8'),
      new Buffer(asset.desc, 'utf8'),
      new Buffer(asset.maximum, 'utf8'),
      Buffer.from([asset.precision || 0]),
      new Buffer(asset.strategy || '', 'utf8'),
      Buffer.from([asset.allowWriteoff || 0]),
      Buffer.from([asset.allowWhitelist || 0]),
      Buffer.from([asset.allowBlacklist || 0])
    ])

    var strategy = trs.asset.uiaAsset.strategy
    if (strategy) {
      buffer = Buffer.concat([buffer, ])
    }
    return buffer
  }

  this.apply = function (trs, block, sender, cb) {
    setImmediate(cb)
  }

  this.undo = function (trs, block, sender, cb) {
    setImmediate(cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var key = trs.asset.uiaAsset.name + ':' + trs.type
    if (library.oneoff.has(key)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(key, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    library.oneoff.delete(trs.asset.uiaAsset.name + ':' + trs.type)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaAsset, {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 3,
          maxLength: 22
        },
        desc: {
          type: 'string',
          minLength: 1,
          maxLength: 4096
        },
        maximum: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        precision: {
          type: 'integer',
          minimum: 0,
          maximum: 16
        },
        strategy: {
          type: 'string',
          maxLength: 256
        },
        allowWriteoff: {
          type: 'integer',
          mininum: 0,
          maximum: 1
        },
        allowWhitelist: {
          type: 'integer',
          mininum: 0,
          maximum: 1
        },
        allowBlacklist: {
          type: 'integer',
          mininum: 0,
          maximum: 1
        }
      },
      required: ['name', 'desc', 'maximum', 'precision']
    })

    if (!report) {
      throw Error('Can\'t parse asset: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.assets_name) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        name: raw.assets_name,
        desc: raw.assets_desc,
        maximum: raw.assets_maximum,
        precision: raw.assets_precision,
        strategy: raw.assets_strategy,
        allowWriteoff: raw.assets_allowWriteoff,
        allowWhitelist: raw.assets_allowWhitelist,
        allowBlacklist: raw.assets_allowBlacklist
      }

      return { uiaAsset: asset }
    }
  }

  this.dbSave = function (trs, cb) {
    var asset = trs.asset.uiaAsset
    var nameParts = asset.name.split('.')
    assert(nameParts.length == 2)
    var values = {
      transactionId: trs.id,
      issuerName: nameParts[0],
      quantity: '0',
      name: asset.name,
      desc: asset.desc,
      maximum: asset.maximum,
      precision: asset.precision,
      strategy: asset.strategy,
      allowWriteoff: asset.allowWriteoff || 0,
      allowWhitelist: asset.allowWhitelist || 0,
      allowBlacklist: asset.allowBlacklist || 0,
      acl: 0,
      writeoff: 0
    }
    library.model.add('assets', values, cb)
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

module.exports = new Asset