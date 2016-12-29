var assert = require('assert')
var async = require('async')
var bignum = require('bignumber')
var ByteBuffer = require('bytebuffer')
var _ = require('lodash')
var flagsHelper = require('./flags-helper')

function Acl() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaAcl = {
      currency: data.currency,
      operator: data.operator,
      flag: data.flag,
      list: data.list
    }
    return trs
  }

  this.calculateFee = function (trs, sender) {
    return 2 * library.base.block.calculateFee()
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var asset = trs.asset.uiaAcl
    if (['+', '-'].indexOf(asset.operator) == -1) return setImmediate(cb, 'Invalid acl operator')
    if (!flagsHelper.isValidFlag(1, asset.flag)) return setImmediate(cb, 'Invalid acl flag')
    if (!_.isArray(asset.list) || asset.list.length == 0 || asset.list.length > 10) return setImmediate(cb, 'Invalid acl list')

    var isAddress = /^[0-9]{1,21}$/g
    for (var i = 0; i < asset.list; ++i) {
      if (!isAddress.test(asset.list[i])) return setImmediate("Invalid acl address")
      if (sender.address === asset.list[i]) return setImmediate('Issuer should not be in ACL list')
    }
    if (_.uniq(asset.list).length != asset.list.length) return setImmediate('Duplicated acl address')

    library.model.getAssetByName(asset.currency, function (err, result) {
      if (err) return cb(err)
      if (!result) return cb('Asset not exists')

      if (result.issuerId !== sender.address) return cb('Permission not allowed')

      if (result.writeoff) return cb('Asset already writeoff')
      if (result.acl != asset.flag) return cb('Current flag not match')

      var table = flagsHelper.getAclTable(asset.flag)
      var condition = [
        { currency: asset.currency },
        { address: { $in: asset.list } }
      ]
      library.model.exists(table, condition, function (err, exists) {
        if (err) return cb(err)
        if (exists) return cb('Some address already exists')
        return cb()
      })
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    var bb = new ByteBuffer()
    var asset = trs.asset.uiaAcl
    bb.writeString(asset.currency)
    bb.writeString(asset.operator)
    bb.writeByte(asset.flag)
    for (var i = 0; i < asset.list.length; ++i) {
      bb.writeString(asset.list[i])
    }
    bb.flip()
    return bb.toBuffer()
  }

  this.apply = function (trs, block, sender, cb) {
    var asset = trs.asset.uiaAcl
    var table = flagsHelper.getAclTable(asset.flag)
    if (asset.operator == '+') {
      library.model.addAssetAcl(table, asset.currency, asset.list, cb)
    } else {
      library.model.removeAssetAcl(table, asset.currency, asset.list, cb)
    }
  }

  this.undo = function (trs, block, sender, cb) {
    var asset = trs.asset.uiaAcl
    var table = flagsHelper.getAclTable(asset.flag)
    if (asset.operator == '-') {
      library.model.addAssetAcl(table, asset.currency, asset.list, cb)
    } else {
      library.model.removeAssetAcl(table, asset.currency, asset.list, cb)
    }
    setImmediate(cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var key = trs.asset.uiaAcl.currency + ':' + trs.type
    if (library.oneoff.has(key)) {
      return setImmediate(cb, 'Double submit')
    }
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    library.oneoff.delete(trs.asset.uiaAcl.currency + ':' + trs.type)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaAcl, {
      object: true,
      properties: {
        currency: {
          type: 'string',
          minLength: 1,
          maxLength: 16
        },
        operator: {
          type: 'string',
        },
        flag: {
          type: 'integer',
        },
        list: {
          type: 'array',
          minLength: 1,
          maxLength: 10,
          uniqueItems: true
        }
      },
      required: ['currency', 'operator', 'flag', 'list']
    })

    if (!report) {
      throw Error('Can\'t parse acl: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.acl_currency) {
      return null
    } else {
      var asset = {
        transactionId: raw.t_id,
        currency: raw.acls_currency,
        operator: raw.acls_operator,
        flag: raw.acls_flag,
        list: raw.acls_list.split(',')
      }

      return { uiaAcl: asset }
    }
  }

  this.dbSave = function (trs, cb) {
    var asset = trs.asset.uiaAcl
    var values = {
      transactionId: trs.id,
      currency: asset.currency,
      operator: asset.operator,
      flag: asset.flag,
      list: asset.list.join(',')
    }
    library.model.add('acls', values, cb)
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

module.exports = new Acl