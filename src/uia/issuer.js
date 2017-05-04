var constants = require('../utils/constants.js')

function Issuer() {
  this.create = function (data, trs) {
    trs.recipientId = null
    trs.amount = 0
    trs.asset.uiaIssuer = {
      name: data.name,
      desc: data.desc
    }

    return trs
  }

  this.calculateFee = function (trs, sender) {
    // FIXME catch exception
    // FIXME bind library on global
    // var bytes = this.getBytes(trs)
    //return (100 + (Math.floor(bytes.length / 200) + 1)) * library.base.block.calculateFee()
    return 100 * constants.fixedPoint
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) return setImmediate(cb, 'Invalid recipient')
    if (trs.amount != 0) return setImmediate(cb, 'Invalid transaction amount')

    var issuer = trs.asset.uiaIssuer
    if (!/^[A-Za-z]{1,16}$/.test(issuer.name)) return setImmediate(cb, 'Invalid issuer name')
    if (!issuer.desc) return setImmediate(cb, 'Invalid issuer desc')
    if (issuer.desc.length > 4096) return setImmediate(cb, 'Invalid issuer desc size')

    library.model.isIssuerExists(issuer.name, sender.address, function (err, exists) {
      if (err) return cb(err)
      if (exists) return cb('Double register')
      setImmediate(cb, null, trs)
    })
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs)
  }

  this.getBytes = function (trs) {
    return Buffer.concat([
      new Buffer(trs.asset.uiaIssuer.name, 'utf8'),
      new Buffer(trs.asset.uiaIssuer.desc, 'utf8')
    ])
  }

  this.apply = function (trs, block, sender, cb) {
    setImmediate(cb)
  }

  this.undo = function (trs, block, sender, cb) {
    setImmediate(cb)
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var nameKey = trs.asset.uiaIssuer.name + ':' + trs.type
    var idKey = sender.address + ':' + trs.type
    if (library.oneoff.has(nameKey) || library.oneoff.has(idKey)) {
      return setImmediate(cb, 'Double submit')
    }
    library.oneoff.set(nameKey, true)
    library.oneoff.set(idKey, true)
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var nameKey = trs.asset.uiaIssuer.name + ':' + trs.type
    var idKey = sender.address + ':' + trs.type
    library.oneoff.delete(nameKey)
    library.oneoff.delete(idKey)
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.uiaIssuer, {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 16
        },
        desc: {
          type: 'string',
          minLength: 1,
          maxLength: 4096
        }
      },
      required: ['name', 'desc']
    })

    if (!report) {
      throw Error('Can\'t parse issuer: ' + library.scheme.getLastError())
    }

    return trs
  }

  this.dbRead = function (raw) {
    if (!raw.issuers_name) {
      return null
    } else {
      var issuer = {
        transactionId: raw.t_id,
        name: raw.issuers_name,
        desc: raw.issuers_desc
      }

      return { uiaIssuer: issuer }
    }
  }

  this.dbSave = function (trs, cb) {
    // FIXME catch exceptions on upper layer
    var asset = trs.asset.uiaIssuer
    var values = {
      transactionId: trs.id,
      issuerId: trs.senderId,
      name: asset.name,
      desc: asset.desc
    }
    library.model.add('issuers', values, cb)
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

module.exports = new Issuer