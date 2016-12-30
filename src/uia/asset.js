var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')

function Asset() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaAsset = {
      name: data.name,
      desc: data.desc,
      maximum: data.maximum,
      precision: data.precision,
      strategy: data.strategy
    }

    return trs
  }

  this.calculateFee = function (trs, sender) {
    var bytes = this.getBytes(trs)
    return (Math.floor(bytes.length / 200) + 1) * library.base.block.calculateFee()
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var asset = trs.asset.uiaAsset
    var nameParts = (asset.name || '').split('.')
    if (nameParts.length != 2) return setImmediate(cb, 'Invalid asset full name')

    var issuerName = nameParts[0]
    var assetName = nameParts[1]
    if (!assetName || !/^[A-Z]{3, 6}$/.test(assetName)) return setImmediate(cb, 'Invalid asset currency name')
    if (!asset.desc) return setImmediate(cb, 'Invalid asset desc')
    if (asset.desc.length > 4096) return setImmediate(cb, 'Invalid asset desc size')

    if (asset.precision > 16 || asset.precision < 0) return setImmediate(cb, 'Invalid asset precision')

    var bnMaximum = bignum(asset.maximum)
    if (bnMaximum.lt(1) || bnMaximum.gt('1e32')) return setImmediate(cb, 'Invalid asset maximum')

    if (asset.strategy && asset.strategy.length > 256) return setImmediate(cb, 'Invalid asset strategy size')

    library.model.exists('assets', { name: assetName }, function (err, exists) {
      if (err) return cb(err)
      if (exists) return cb('Asset already exists')
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
    var precision = new Buffer(1)
    precision[0] = trs.asset.uiaAsset.precision
    var buffer = Buffer.concat([
      new Buffer(trs.asset.uiaAsset.name, 'utf8'),
      new Buffer(trs.asset.uiaAsset.desc, 'utf8'),
      new Buffer(trs.asset.uiaAsset.maximum, 'utf8'),
      precision
    ])

    var strategy = trs.asset.uiaAsset.strategy
    if (strategy) {
      buffer = Buffer.concat(buffer, new Buffer(strategy, 'utf8'))
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
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    library.oneoff.delete(trs.asset.uiaAsset.name + ':' + trs.type)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaAsset, {
      object: true,
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 32
        },
        desc: {
          type: 'string',
          maxLength: 2048
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
    if (!raw.s_publicKey) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        name: raw.assets_name,
        desc: raw.assets_desc,
        maximum: raw.assets_maximum,
        precision: raw.assets_precision,
        strategy: raw.assets_strategy
      }

      return { asset: asset }
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