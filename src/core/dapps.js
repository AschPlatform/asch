var async = require('async');
var ByteBuffer = require("bytebuffer");
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var bignum = require('bignumber')
var request = require('request');
var ed = require('../utils/ed.js');
var Sandbox = require('asch-sandbox');
var rmdir = require('rimraf');
var ip = require('ip');
var valid_url = require('valid-url');
var DecompressZip = require('decompress-zip');
var dappCategory = require('../utils/dapp-category.js');
var TransactionTypes = require('../utils/transaction-types.js');
var Router = require('../utils/router.js');
var constants = require('../utils/constants.js');
var sandboxHelper = require('../utils/sandbox.js');
var addressHelper = require('../utils/address.js')
var amountHelper = require('../utils/amount.js')

var modules, library, self, private = {}, shared = {};

private.launched = {};
private.loading = {};
private.removing = {};
private.unconfirmedNames = {};
private.unconfirmedLinks = {};
private.unconfirmedAscii = {};
private.appPath = '';
private.dappsPath = '';
private.sandboxes = {};
private.dappready = {};
private.routes = {};
private.unconfirmedOutTansfers = {};
private.defaultRouteId = null;

const WITNESS_CLUB_DAPP_NAME = 'asch-community'

function OutTransfer() {
  this.create = function (data, trs) {
    trs.recipientId = data.recipientId;
    trs.amount = 0;

    trs.asset.outTransfer = {
      dappId: data.dappId,
      transactionId: data.transactionId,
      currency: data.currency,
      amount: String(data.amount)
    };

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee();
  }

  this.verify = function (trs, sender, cb) {
    if (!trs.recipientId) {
      return setImmediate(cb, "Invalid recipient");
    }

    var transfer = trs.asset.outTransfer

    if (trs.amount) {
      return setImmediate(cb, "Invalid transaction amount");
    }

    if (!transfer.dappId) {
      return setImmediate(cb, "Invalid dapp id for out transfer");
    }

    if (!transfer.transactionId) {
      return setImmediate(cb, "Invalid dapp id for input transfer");
    }

    if (!transfer.currency) {
      return setImmediate(cb, "Invalid currency for out transfer")
    }

    if (!transfer.amount) {
      return setImmediate(cb, "Invalid amount for out transfer")
    }

    if (!trs.signatures || !trs.signatures.length) {
      return setImmediate(cb, 'Invalid signatures')
    }

    var currency = trs.asset.outTransfer.currency
    if (currency === 'XAS') return cb()
    library.model.getAssetByName(currency, function (err, assetDetail) {
      if (err) return cb('Database error: ' + err)
      if (!assetDetail) return cb('Asset not exists')
      if (assetDetail.writeoff) return cb('Asset already writeoff')
      if (!assetDetail.allowWhitelist && !assetDetail.allowBlacklist) return cb()

      var aclTable = assetDetail.acl == 0 ? 'acl_black' : 'acl_white'

      library.model.checkAcl(aclTable, currency, null, trs.recipientId, function (err, isInList) {
        if (err) return cb('Database error when query acl: ' + err)
        if ((assetDetail.acl == 0) == isInList) return cb('Permission not allowed')
        cb()
      })
    })
  }

  this.process = function (trs, sender, cb) {
    var transfer = trs.asset.outTransfer
    library.model.getDAppById(transfer.dappId, function (err, dapp) {
      if (err) {
        library.logger.error(err.toString());
        return cb("Failed to find dapp: " + err);
      }

      if (!dapp) {
        return cb('DApp not found: ' + transfer.dappId)
      }

      if (private.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId]) {
        return cb("Transaction is already processing: " + trs.asset.outTransfer.transactionId);
      }

      if (dapp.delegates.indexOf(trs.senderPublicKey) === -1) return cb('Sender must be dapp delegate')

      if (!trs.signatures || trs.signatures.length !== dapp.unlockDelegates) return cb('Invalid signature number')
      var validSignatureNumber = 0
      var bytes = library.base.transaction.getBytes(trs, true, true)
      try {
        for (let i in trs.signatures) {
          for (let j in dapp.delegates) {
            if (library.base.transaction.verifyBytes(bytes, dapp.delegates[j], trs.signatures[i])) {
              validSignatureNumber++
              break
            }
          }
          if (validSignatureNumber >= dapp.unlockDelegates) break
        }
      } catch (e) {
        return cb('Failed to verify signatures: ' + e)
      }
      if (validSignatureNumber < dapp.unlockDelegates) return cb('Valid signatures not enough')

      library.dbLite.query("SELECT count(*) FROM outtransfer WHERE outTransactionId = $transactionId", {
        transactionId: trs.asset.outTransfer.transactionId
      }, { 'count': Number }, function (err, rows) {
        if (err) {
          library.logger.error(err.toString());
          return cb("Failed to find history outtransfer: " + err);
        }
        var count = rows[0].count;
        if (count) return cb("Transaction is already confirmed");
        return cb(null, trs)
      })
    });
  }

  this.getBytes = function (trs) {
    try {
      var buf = new Buffer([]);
      var dappIdBuf = new Buffer(trs.asset.outTransfer.dappId, 'utf8');
      var transactionIdBuff = new Buffer(trs.asset.outTransfer.transactionId, 'utf8');
      var currencyBuff = new Buffer(trs.asset.outTransfer.currency, 'utf8')
      var amountBuff = new Buffer(trs.asset.outTransfer.amount, 'utf8')
      buf = Buffer.concat([buf, dappIdBuf, transactionIdBuff, currencyBuff, amountBuff]);
    } catch (e) {
      throw Error(e.toString());
    }

    return buf;
  }

  this.apply = function (trs, block, sender, cb) {
    var transfer = trs.asset.outTransfer
    private.unconfirmedOutTansfers[transfer.transactionId] = false;

    if (transfer.currency !== 'XAS') {
      library.balanceCache.addAssetBalance(trs.recipientId, transfer.currency, transfer.amount)
      async.series([
        function (next) {
          library.model.updateAssetBalance(transfer.currency, '-' + transfer.amount, transfer.dappId, next)
        },
        function (next) {
          library.model.updateAssetBalance('XAS', '-' + trs.fee, transfer.dappId, next)
        },
        function (next) {
          library.model.updateAssetBalance(transfer.currency, transfer.amount, trs.recipientId, next)
        }
      ], cb)
    } else {
      modules.accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
        if (err) {
          return cb(err);
        }
        var amount = Number(transfer.amount)
        modules.accounts.mergeAccountAndGet({
          address: trs.recipientId,
          balance: amount,
          u_balance: amount,
          blockId: block.id,
          round: modules.round.calc(block.height)
        }, function (err) {
          if (err) return cb(err);
          library.model.updateAssetBalance('XAS', -amount - trs.fee, transfer.dappId, cb);
        });
      });
    }
  }

  this.undo = function (trs, block, sender, cb) {
    var transfer = trs.asset.outTransfer
    private.unconfirmedOutTansfers[transfer.transactionId] = true;

    if (transfer.currency !== 'XAS') {
      library.balanceCache.addAssetBalance(trs.recipientId, transfer.currency, transfer.amount)
      async.series([
        function (next) {
          library.model.updateAssetBalance(transfer.currency, transfer.amount, transfer.dappId, next)
        },
        function (next) {
          library.model.updateAssetBalance('XAS', trs.fee, transfer.dappId, next)
        },
        function (next) {
          library.model.updateAssetBalance(transfer.currency, '-' + transfer.amount, trs.recipientId, next)
        }
      ], cb)
    } else {
      modules.accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
        if (err) {
          return cb(err);
        }
        var amount = Number(transfer.amount)
        modules.accounts.mergeAccountAndGet({
          address: trs.recipientId,
          balance: -amount,
          u_balance: -amount,
          blockId: block.id,
          round: modules.round.calc(block.height)
        }, function (err) {
          if (err) return cb(err);
          library.model.updateAssetBalance('XAS', amount + trs.fee, transfer.dappId, cb);
        });
      });
    }
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.outTransfer
    private.unconfirmedOutTansfers[transfer.transactionId] = true
    var balance = library.balanceCache.getAssetBalance(transfer.dappId, transfer.currency) || 0
    var fee = trs.fee
    if (transfer.currency === 'XAS') {
      var amount = Number(transfer.amount) + fee
      if (bignum(balance).lt(amount)) return setImmediate(cb, 'Insufficient balance')
      library.balanceCache.addAssetBalance(transfer.dappId, transfer.currency, -amount)
    } else {
      var xasBalance = library.balanceCache.getAssetBalance(transfer.dappId, 'XAS') || 0
      if (bignum(xasBalance).lt(fee)) return setImmediate(cb, 'Insufficient balance')
      if (bignum(balance).lt(transfer.amount)) return setImmediate(cb, 'Insufficient asset balance')
      library.balanceCache.addAssetBalance(transfer.dappId, 'XAS', -fee)
      library.balanceCache.addAssetBalance(transfer.dappId, transfer.currency, '-' + transfer.amount)
    }
    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.outTransfer
    private.unconfirmedOutTansfers[transfer.transactionId] = false
    var fee = trs.fee
    if (transfer.currency === 'XAS') {
      var amount = Number(transfer.amount) + fee
      library.balanceCache.addAssetBalance(transfer.dappId, transfer.currency, amount)
    } else {
      library.balanceCache.addAssetBalance(transfer.dappId, 'XAS', fee)
      library.balanceCache.addAssetBalance(transfer.dappId, transfer.currency, transfer.amount)
    }
    setImmediate(cb)
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.outTransfer, {
      type: 'object',
      properties: {
        dappId: {
          type: "string",
          minLength: 1
        },
        transactionId: {
          type: "string",
          minLength: 1
        },
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
      required: ["dappId", "transactionId", "currency", "amount"]
    });

    if (!report) {
      throw Error("Unable to verify dapp out transaction, invalid parameters: " + library.scheme.getLastError().details[0].message);
    }

    return trs;
  }

  this.dbRead = function (raw) {
    if (!raw.ot_dappId) {
      return null;
    } else {
      var outTransfer = {
        dappId: raw.ot_dappId,
        transactionId: raw.ot_outTransactionId,
        currency: raw.ot_currency,
        amount: raw.ot_amount
      }

      return { outTransfer: outTransfer };
    }
  }

  this.dbSave = function (trs, cb) {
    var transfer = trs.asset.outTransfer
    var dappId = transfer.dappId
    var currency = transfer.currency
    var amount = transfer.amount
    var outTransactionId = transfer.transactionId
    var values = {
      transactionId: trs.id,
      dappId: dappId,
      currency: currency,
      amount: amount,
      outTransactionId: outTransactionId
    }
    library.model.add('outtransfer', values, function (err) {
      if (err) return cb(err)
      self.message(transfer.dappId, {
        topic: "withdrawalCompleted",
        message: {
          transactionId: trs.id
        }
      }, function () { });
      return cb()
    })
  }

  this.ready = function (trs, sender) {
    if (sender.multisignatures.length) {
      if (!trs.signatures) {
        return false;
      }
      return trs.signatures.length >= sender.multimin - 1;
    } else {
      return true;
    }
  }
}

function InTransfer() {
  this.create = function (data, trs) {
    trs.recipientId = null;

    if (data.currency === 'XAS') {
      trs.amount = Number(data.amount)
      trs.asset.inTransfer = {
        dappId: data.dappId,
        currency: data.currency
      };
    } else {
      trs.asset.inTransfer = {
        dappId: data.dappId,
        currency: data.currency,
        amount: data.amount,
      };
    }

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return library.base.block.calculateFee();
  }

  this.verify = function (trs, sender, cb) {
    if (trs.recipientId) {
      return setImmediate(cb, "Invalid recipient");
    }

    if (!addressHelper.isBase58CheckAddress(sender.address)) {
      return setImmediate(cb, "Old address not supported")
    }

    var asset = trs.asset.inTransfer

    if (asset.currency !== 'XAS') {
      if (trs.amount || !asset.amount) return setImmediate(cb, "Invalid transfer amount")
      var error = amountHelper.validate(trs.asset.inTransfer.amount)
      if (error) return setImmediate(cb, error)
    } else {
      if (!trs.amount || asset.amount) return setImmediate(cb, "Invalid transfer amount")
    }

    library.dbLite.query("SELECT count(*) FROM dapps WHERE transactionId=$id", {
      id: trs.asset.inTransfer.dappId
    }, ['count'], function (err, rows) {
      if (err) {
        library.logger.error(err.toString());
        return setImmediate(cb, "Dapp not found: " + trs.asset.inTransfer.dappId);
      }

      var count = rows[0].count;
      if (count == 0) {
        return setImmediate(cb, "Dapp not found: " + trs.asset.inTransfer.dappId);
      }

      var currency = trs.asset.inTransfer.currency
      if (currency === 'XAS') return cb()
      library.model.getAssetByName(currency, function (err, assetDetail) {
        if (err) return cb('Database error: ' + err)
        if (!assetDetail) return cb('Asset not exists')
        if (assetDetail.writeoff) return cb('Asset already writeoff')
        if (!assetDetail.allowWhitelist && !assetDetail.allowBlacklist) return cb()

        var aclTable = assetDetail.acl == 0 ? 'acl_black' : 'acl_white'

        library.model.checkAcl(aclTable, currency, sender.address, null, function (err, isInList) {
          if (err) return cb('Database error when query acl: ' + err)
          if ((assetDetail.acl == 0) == isInList) return cb('Permission not allowed')
          cb()
        })
      })
    });

  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    try {
      var buf = new Buffer([]);
      var dappId = new Buffer(trs.asset.inTransfer.dappId, 'utf8');
      if (trs.asset.inTransfer.currency !== 'XAS') {
        var currency = new Buffer(trs.asset.inTransfer.currency, 'utf8');
        var amount = new Buffer(trs.asset.inTransfer.amount, 'utf8');
        buf = Buffer.concat([buf, dappId, currency, amount]);
      } else {
        var currency = new Buffer(trs.asset.inTransfer.currency, 'utf8');
        buf = Buffer.concat([buf, dappId, currency]);
      }
    } catch (e) {
      throw Error(e.toString());
    }

    return buf;
  }

  this.apply = function (trs, block, sender, cb) {
    var asset = trs.asset.inTransfer
    var dappId = asset.dappId

    if (asset.currency === 'XAS') {
      library.balanceCache.addAssetBalance(dappId, asset.currency, trs.amount)
      library.model.updateAssetBalance(asset.currency, trs.amount, dappId, cb)
    } else {
      library.balanceCache.addAssetBalance(dappId, asset.currency, asset.amount)
      async.series([
        function (next) {
          library.model.updateAssetBalance(asset.currency, '-' + asset.amount, sender.address, next)
        },
        function (next) {
          library.model.updateAssetBalance(asset.currency, asset.amount, dappId, next)
        }
      ], cb)
    }
  }

  this.undo = function (trs, block, sender, cb) {
    var transfer = trs.asset.inTransfer
    var dappId = asset.dappId

    if (transfer.currency === 'XAS') {
      library.balanceCache.addAssetBalance(dappId, transfer.currency, '-' + trs.amount)
      library.model.updateAssetBalance(transfer.currency, '-' + trs.amount, dappId, cb)
    } else {
      library.balanceCache.addAssetBalance(dappId, transfer.currency, transfer.amount)
      async.series([
        function (next) {
          library.model.updateAssetBalance(transfer.currency, transfer.amount, sender.address, next)
        },
        function (next) {
          library.model.updateAssetBalance(transfer.currency, '-' + transfer.amount, dappId, next)
        }
      ], cb)
    }
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.inTransfer
    if (transfer.currency === 'XAS') return setImmediate(cb)
    var balance = library.balanceCache.getAssetBalance(sender.address, transfer.currency) || 0
    var surplus = bignum(balance).sub(transfer.amount)
    if (surplus.lt(0)) return setImmediate(cb, 'Insufficient asset balance')

    library.balanceCache.setAssetBalance(sender.address, transfer.currency, surplus.toString())
    setImmediate(cb);
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    var transfer = trs.asset.inTransfer
    if (transfer.currency === 'XAS') return setImmediate(cb)
    library.balanceCache.addAssetBalance(sender.address, transfer.currency, transfer.amount)
    setImmediate(cb);
  }

  this.objectNormalize = function (trs) {
    var report = library.scheme.validate(trs.asset.inTransfer, {
      type: 'object',
      properties: {
        dappId: {
          type: "string",
          minLength: 1
        },
        currency: {
          type: 'string',
          minLength: 1,
          maxLength: 22
        },
        amount: {
          type: 'string',
          minLength: 0,
          maxLength: 50
        }
      },
      required: ["dappId", 'currency']
    });

    if (!report) {
      throw Error("Unable to verify dapp intransfer, invalid parameters: " + library.scheme.getLastError().details[0].message);
    }

    return trs;
  }

  this.dbRead = function (raw) {
    if (!raw.it_dappId) {
      return null;
    } else {
      var inTransfer = {
        dappId: raw.it_dappId,
        currency: raw.it_currency,
        amount: raw.it_amount
      }

      return { inTransfer: inTransfer };
    }
  }

  this.dbSave = function (trs, cb) {
    var dappId = trs.asset.inTransfer.dappId
    var currency = trs.asset.inTransfer.currency
    var amount = trs.asset.inTransfer.amount
    var values = {
      transactionId: trs.id,
      dappId: trs.asset.inTransfer.dappId,
      currency: trs.asset.inTransfer.currency,
      amount: trs.asset.inTransfer.amount
    }
    library.model.add('intransfer', values, cb)
  }

  this.ready = function (trs, sender) {
    if (sender.multisignatures.length) {
      if (!trs.signatures) {
        return false;
      }
      return trs.signatures.length >= sender.multimin - 1;
    } else {
      return true;
    }
  }
}

function DApp() {
  this.create = function (data, trs) {
    trs.recipientId = null;
    trs.amount = 0;

    trs.asset.dapp = {
      category: data.category,
      name: data.name,
      description: data.description,
      tags: data.tags,
      type: data.dapp_type,
      link: data.link,
      icon: data.icon,
      delegates: data.delegates,
      unlockDelegates: data.unlockDelegates
    };

    return trs;
  }

  this.calculateFee = function (trs, sender) {
    return 100 * constants.fixedPoint;
  }

  function checkDuplicate(trs, cb) {
    library.dbLite.query("SELECT name, link FROM dapps WHERE (name = $name or link = $link) and transactionId != $transactionId", {
      name: trs.asset.dapp.name,
      link: trs.asset.dapp.link || null,
      transactionId: trs.id
    }, ['name', 'link'], function (err, rows) {
      if (err) {
        return cb("Database error");
      }

      if (rows.length > 0) {
        var dapp = rows[0];

        if (dapp.name == trs.asset.dapp.name) {
          return cb("Dapp name already exists: " + dapp.name);
        } else if (dapp.link == trs.asset.dapp.link) {
          return cb("Dapp link already exists: " + dapp.link);
        } else {
          return cb("Unknown error");
        }
      } else {
        return cb();
      }
    });
  }

  this.verify = function (trs, sender, cb) {
    var dapp = trs.asset.dapp

    if (trs.recipientId) {
      return setImmediate(cb, "Invalid recipient");
    }

    if (trs.amount != 0) {
      return setImmediate(cb, "Invalid transaction amount");
    }

    if (!dapp.category) {
      return setImmediate(cb, "Invalid dapp category");
    }

    var foundCategory = false;
    for (var i in dappCategory) {
      if (dappCategory[i] == dapp.category) {
        foundCategory = true;
        break;
      }
    }

    if (!foundCategory) {
      return setImmediate(cb, "Unknown dapp category");
    }

    if (dapp.icon) {
      if (!valid_url.isUri(dapp.icon)) {
        return setImmediate(cb, "Invalid icon link");
      }

      var length = dapp.icon.length;

      if (
        dapp.icon.indexOf('.png') != length - 4 &&
        dapp.icon.indexOf('.jpg') != length - 4 &&
        dapp.icon.indexOf('.jpeg') != length - 5
      ) {
        return setImmediate(cb, "Invalid icon file type")
      }

      if (dapp.icon.length > 160) {
        return setImmediate(cb, "Dapp icon url is too long. Maximum is 160 characters");
      }
    }

    if (dapp.type > 1 || dapp.type < 0) {
      return setImmediate(cb, "Invalid dapp type");
    }

    if (!valid_url.isUri(dapp.link)) {
      return setImmediate(cb, "Invalid dapp link");
    }

    if (dapp.link.indexOf(".zip") != dapp.link.length - 4) {
      return setImmediate(cb, "Invalid dapp file type")
    }

    if (dapp.link.length > 160) {
      return setImmediate(cb, "Dapp link is too long. Maximum is 160 characters");
    }

    if (!dapp.name || dapp.name.trim().length == 0 || dapp.name.trim() != dapp.name) {
      return setImmediate(cb, "Missing dapp name");
    }

    if (dapp.name.length > 32) {
      return setImmediate(cb, "Dapp name is too long. Maximum is 32 characters");
    }

    if (dapp.description && dapp.description.length > 160) {
      return setImmediate(cb, "Dapp description is too long. Maximum is 160 characters");
    }

    if (dapp.tags && dapp.tags.length > 160) {
      return setImmediate(cb, "Dapp tags is too long. Maximum is 160 characters");
    }

    if (dapp.tags) {
      var tags = dapp.tags.split(',');

      tags = tags.map(function (tag) {
        return tag.trim();
      }).sort();

      for (var i = 0; i < tags.length - 1; i++) {
        if (tags[i + 1] == tags[i]) {
          return setImmediate(cb, "Encountered duplicate tags: " + tags[i]);
        }
      }
    }

    if (!dapp.delegates || dapp.delegates.length < 5 || dapp.delegates.length > 101) {
      return setImmediate(cb, "Invalid dapp delegates");
    }
    for (let i in dapp.delegates) {
      if (dapp.delegates[i].length != 64) {
        return setImmediate(cb, "Invalid dapp delegates format");
      }
    }

    if (!dapp.unlockDelegates || dapp.unlockDelegates < 3 || dapp.unlockDelegates > dapp.delegates.length) {
      return setImmediate(cb, "Invalid unlock delegates number")
    }

    checkDuplicate(trs, cb);
  }

  this.process = function (trs, sender, cb) {
    setImmediate(cb, null, trs);
  }

  this.getBytes = function (trs) {
    var dapp = trs.asset.dapp
    try {
      var buf = new Buffer([]);
      var nameBuf = new Buffer(dapp.name, 'utf8');
      buf = Buffer.concat([buf, nameBuf]);

      if (dapp.description) {
        var descriptionBuf = new Buffer(dapp.description, 'utf8');
        buf = Buffer.concat([buf, descriptionBuf]);
      }

      if (dapp.tags) {
        var tagsBuf = new Buffer(dapp.tags, 'utf8');
        buf = Buffer.concat([buf, tagsBuf]);
      }

      if (dapp.link) {
        buf = Buffer.concat([buf, new Buffer(dapp.link, 'utf8')]);
      }

      if (dapp.icon) {
        buf = Buffer.concat([buf, new Buffer(dapp.icon, 'utf8')]);
      }

      var bb = new ByteBuffer(1, true);
      bb.writeInt(dapp.type);
      bb.writeInt(dapp.category);
      bb.writeString(dapp.delegates.join(','))
      bb.writeInt(dapp.unlockDelegates)
      bb.flip();

      buf = Buffer.concat([buf, bb.toBuffer()]);
    } catch (e) {
      throw Error(e.toString());
    }

    return buf;
  }

  this.apply = function (trs, block, sender, cb) {
    if (trs.asset.dapp.name === WITNESS_CLUB_DAPP_NAME) {
      global.state.clubInfo = trs.asset.dapp
      global.state.clubInfo.transactionId = trs.id
    }
    setImmediate(cb);
  }

  this.undo = function (trs, block, sender, cb) {
    if (trs.asset.dapp.name === WITNESS_CLUB_DAPP_NAME) {
      global.state.clubInfo = null
    }
    setImmediate(cb);
  }

  this.applyUnconfirmed = function (trs, sender, cb) {
    if (private.unconfirmedNames[trs.asset.dapp.name]) {
      return setImmediate(cb, "Dapp name already exists");
    }

    if (trs.asset.dapp.link && private.unconfirmedLinks[trs.asset.dapp.link]) {
      return setImmediate(cb, "Dapp link already exists");
    }

    private.unconfirmedNames[trs.asset.dapp.name] = true;
    private.unconfirmedLinks[trs.asset.dapp.link] = true;

    setImmediate(cb)
  }

  this.undoUnconfirmed = function (trs, sender, cb) {
    delete private.unconfirmedNames[trs.asset.dapp.name];
    delete private.unconfirmedLinks[trs.asset.dapp.link];

    setImmediate(cb);
  }

  this.objectNormalize = function (trs) {
    for (var i in trs.asset.dapp) {
      if (trs.asset.dapp[i] === null || typeof trs.asset.dapp[i] === 'undefined') {
        delete trs.asset.dapp[i];
      }
    }

    var report = library.scheme.validate(trs.asset.dapp, {
      type: "object",
      properties: {
        category: {
          type: "integer",
          minimum: 0,
          maximum: 9
        },
        name: {
          type: "string",
          minLength: 1,
          maxLength: 32
        },
        description: {
          type: "string",
          minLength: 0,
          maxLength: 160
        },
        tags: {
          type: "string",
          minLength: 0,
          maxLength: 160
        },
        type: {
          type: "integer",
          minimum: 0
        },
        link: {
          type: "string",
          minLength: 0,
          maxLength: 2000
        },
        icon: {
          type: "string",
          minLength: 0,
          maxLength: 2000
        },
        delegates: {
          type: "array",
          minLength: 5,
          maxLength: 101,
          uniqueItems: true
        },
        unlockDelegates: {
          type: "integer",
          minimum: 3,
          maximum: 101
        }
      },
      required: ["type", "name", "category", "delegates", "unlockDelegates"]
    });

    if (!report) {
      throw Error("Failed to normalize dapp transaction body: " + library.scheme.getLastError().details[0].message);
    }

    return trs;
  }

  this.dbRead = function (raw) {
    if (!raw.dapp_name) {
      return null;
    } else {
      var dapp = {
        name: raw.dapp_name,
        description: raw.dapp_description,
        tags: raw.dapp_tags,
        type: raw.dapp_type,
        link: raw.dapp_link,
        category: raw.dapp_category,
        icon: raw.dapp_icon,
        delegates: raw.dapp_delegates.split(','),
        unlockDelegates: raw.dapp_unlockDelegates
      }

      return { dapp: dapp };
    }
  }

  this.dbSave = function (trs, cb) {
    var dapp = trs.asset.dapp
    var values = {
      type: dapp.type,
      name: dapp.name,
      description: dapp.description || null,
      tags: dapp.tags || null,
      link: dapp.link || null,
      icon: dapp.icon || null,
      category: dapp.category,
      delegates: dapp.delegates.join(','),
      unlockDelegates: dapp.unlockDelegates,
      transactionId: trs.id
    }
    library.model.add('dapps', values, function (err) {
      if (err) {
        return cb(err);
      } else {
        // Broadcast
        library.network.io.sockets.emit('dapps/change', {});
        return cb();
      }
    })
  }

  this.ready = function (trs, sender) {
    if (sender.multisignatures.length) {
      if (!trs.signatures) {
        return false;
      }
      return trs.signatures.length >= sender.multimin - 1;
    } else {
      return true;
    }
  }
}

// Constructor
function DApps(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;

  private.appPath = library.config.baseDir;
  private.dappsPath = library.config.dappsDir

  library.base.transaction.attachAssetType(TransactionTypes.DAPP, new DApp());
  library.base.transaction.attachAssetType(TransactionTypes.IN_TRANSFER, new InTransfer());
  library.base.transaction.attachAssetType(TransactionTypes.OUT_TRANSFER, new OutTransfer());

  private.attachApi();

  fs.exists(path.join(library.config.publicDir, 'dapps'), function (exists) {
    if (exists) {
      rmdir(path.join(library.config.publicDir, 'dapps'), function (err) {
        if (err) {
          library.logger.error(err);
        }

        private.createBasePathes(function (err) {
          setImmediate(cb, err, self);
        });
      })
    } else {
      private.createBasePathes(function (err) {
        setImmediate(cb, null, self);
      });
    }
  });

}

private.attachApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.put('/', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        secret: {
          type: "string",
          minLength: 1
        },
        secondSecret: {
          type: "string",
          minLength: 1
        },
        publicKey: {
          type: "string",
          format: "publicKey"
        },
        category: {
          type: "integer",
          minimum: 0
        },
        name: {
          type: "string",
          minLength: 1,
          maxLength: 32
        },
        description: {
          type: "string",
          minLength: 0,
          maxLength: 160
        },
        tags: {
          type: "string",
          minLength: 0,
          maxLength: 160
        },
        type: {
          type: "integer",
          minimum: 0
        },
        link: {
          type: "string",
          maxLength: 2000,
          minLength: 1
        },
        icon: {
          type: "string",
          minLength: 1,
          maxLength: 2000
        }
      },
      required: ["secret", "type", "name", "category"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
      var keypair = ed.MakeKeypair(hash);

      if (body.publicKey) {
        if (keypair.publicKey.toString('hex') != body.publicKey) {
          return res.json({ success: false, error: "Invalid passphrase" });
        }
      }

      library.balancesSequence.add(function (cb) {
        modules.accounts.getAccount({ publicKey: keypair.publicKey.toString('hex') }, function (err, account) {
          if (err) {
            return cb("Database error");
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
              type: TransactionTypes.DAPP,
              sender: account,
              keypair: keypair,
              secondKeypair: secondKeypair,
              category: body.category,
              name: body.name,
              description: body.description,
              tags: body.tags,
              dapp_type: body.type,
              link: body.link,
              icon: body.icon,
              delegates: body.delegates,
              unlockDelegates: body.unlockDelegates
            });
          } catch (e) {
            return cb(e.toString());
          }

          modules.transactions.receiveTransactions([transaction], cb);
        });
      }, function (err, transaction) {
        if (err) {
          return res.json({ success: false, error: err.toString() });
        }
        res.json({ success: true, transaction: transaction[0] });
      });
    });
  });

  router.get('/', function (req, res, next) {
    req.sanitize(req.query, {
      type: "object",
      properties: {
        category: {
          type: "string",
          minLength: 1
        },
        name: {
          type: "string",
          minLength: 1,
          maxLength: 32
        },
        type: {
          type: "integer",
          minimum: 0
        },
        link: {
          type: "string",
          maxLength: 2000,
          minLength: 1
        },
        limit: {
          type: "integer",
          minimum: 0,
          maximum: 100
        },
        icon: {
          type: "string",
          minLength: 1
        },
        offset: {
          type: "integer",
          minimum: 0
        },
        orderBy: {
          type: "string",
          minLength: 1
        }
      }
    }, function (err, report, query) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      private.count(function (err, count) {
        if (err) {
          return res.json({ success: false, error: "Failed to count dapps" });
        }
        private.list(query, function (err, dapps) {
          if (err) {
            return res.json({ success: false, error: "Dapp not found" });
          }

          res.json({ success: true, dapps: dapps, count: count });
        });
      });
    });
  });

  router.get('/get', function (req, res, next) {
    req.sanitize(req.query, {
      type: "object",
      properties: {
        id: {
          type: 'string',
          minLength: 1
        }
      },
      required: ["id"]
    }, function (err, report, query) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      private.get(query.id, function (err, dapp) {
        if (err) {
          return res.json({ success: false, error: err });
        }

        return res.json({ success: true, dapp: dapp });
      });
    });
  });

  router.get('/search', function (req, res, next) {
    req.sanitize(req.query, {
      type: "object",
      properties: {
        q: {
          type: 'string',
          minLength: 1
        },
        category: {
          type: 'integer',
          minimum: 0,
          maximum: 8
        },
        installed: {
          type: 'integer',
          minimum: 0,
          maximum: 1
        }
      },
      required: ["q"]
    }, function (err, report, query) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      var category = null;

      if (query.category) {
        category = query.category;
      }

      library.dbLite.query("CREATE VIRTUAL TABLE IF NOT EXISTS dapps_search USING fts4(content=dapps, name, description, tags)", function (err, rows) {
        if (err) {
          library.logger.error(err);
          return res.json({ success: false, error: "Sql error, check logs" });
        } else {
          // INSERT INTO t3(docid, b, c) SELECT id, b, c FROM t2;

          library.dbLite.query("INSERT OR IGNORE INTO dapps_search(docid, name, description, tags) SELECT rowid, name, description, tags FROM dapps", function (err, rows) {
            if (err) {
              library.logger.error(err);
              return res.json({ success: false, error: "Sql error, check logs" })
            } else {
              library.dbLite.query("SELECT rowid FROM dapps_search WHERE dapps_search MATCH $q", { q: query.q + "*" }, ["rowid"], function (err, rows) {
                if (err) {
                  library.logger.error(err);
                  return res.json({ success: false, error: "Sql error, check logs" });
                } else if (rows.length > 0) {
                  var categorySql = "";

                  if (category === 0 || category > 0) {
                    categorySql = " AND category = $category"
                  }

                  var rowids = rows.map(function (row) {
                    return row.rowid;
                  });

                  library.dbLite.query("SELECT transactionId, name, description, tags, link, type, category, icon FROM dapps WHERE rowid IN (" + rowids.join(',') + ")" + categorySql, { category: category }, {
                    'transactionId': String,
                    'name': String,
                    'description': String,
                    'tags': String,
                    'link': String,
                    'type': Number,
                    'category': Number,
                    'icon': String
                  }, function (err, rows) {
                    if (err) {
                      library.logger.error(err);
                      return res.json({ success: false, error: "Sql error, check logs" });
                    } else {
                      if (query.installed === null || typeof query.installed === 'undefined') {
                        return res.json({ success: true, dapps: rows });
                      } else if (query.installed == 1) {
                        private.getInstalledIds(function (err, installed) {
                          if (err) {
                            return res.json({
                              success: false,
                              error: "Can't get installed dapps ids"
                            });
                          }

                          var dapps = [];
                          rows.forEach(function (dapp) {
                            if (installed.indexOf(dapp.transactionId) >= 0) {
                              dapps.push(dapp);
                            }
                          });

                          return res.json({ success: true, dapps: dapps });
                        });
                      } else {
                        private.getInstalledIds(function (err, installed) {
                          if (err) {
                            return res.json({
                              success: false,
                              error: "Can't get installed dapps ids to get uninstalled"
                            });
                          }

                          var dapps = [];
                          rows.forEach(function (dapp) {
                            if (installed.indexOf(dapp.transactionId) < 0) {
                              dapps.push(dapp);
                            }
                          });

                          return res.json({ success: true, dapps: dapps });
                        });
                      }
                    }
                  });
                } else {
                  return res.json({ success: true, dapps: [] });
                }
              })
            }
          });
        }
      });
    });
  });

  router.post('/install', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        id: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: 'string',
          minLength: 1
        }
      },
      required: ["id"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (library.config.dapp.masterpassword && body.master !== library.config.dapp.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.id, function (err, dapp) {
        if (err) {
          return res.json({ success: false, error: err });
        }

        private.getInstalledIds(function (err, ids) {
          if (err) {
            return res.json({ success: false, error: err });
          }

          if (ids.indexOf(body.id) >= 0) {
            return res.json({ success: false, error: "This dapp already installed" });
          }

          if (private.removing[body.id] || private.loading[body.id]) {
            return res.json({ success: false, error: "This DApp already on downloading/removing" });
          }

          private.loading[body.id] = true;

          private.installDApp(dapp, function (err, dappPath) {
            if (err) {
              private.loading[body.id] = false;
              return res.json({ success: false, error: err });
            } else {
              if (dapp.type == 0) {
                // no need to install node dependencies
              } else {
              }

              library.network.io.sockets.emit('dapps/change', {});
              private.loading[body.id] = false;
              return res.json({ success: true, path: dappPath });
            }
          });
        });
      });
    });
  });

  router.get('/installed', function (req, res, next) {
    private.getInstalledIds(function (err, files) {
      if (err) {
        library.logger.error(err);
        return res.json({ success: false, error: "Can't get installed dapps id, see logs" });
      }

      if (files.length == 0) {
        return res.json({ success: true, dapps: [] });
      }

      private.getByIds(files, function (err, dapps) {
        if (err) {
          library.logger.error(err);
          return res.json({ success: false, error: "Can't get installed dapps, see logs" });
        }

        return res.json({ success: true, dapps: dapps });
      });
    });
  });

  router.get('/installedIds', function (req, res, next) {
    private.getInstalledIds(function (err, files) {
      if (err) {
        library.logger.error(err);
        return res.json({ success: false, error: "Can't get installed dapps ids, see logs" });
      }

      return res.json({ success: true, ids: files });
    })
  });

  router.get('/ismasterpasswordenabled', function (req, res, next) {
    return res.json({ success: true, enabled: !!library.config.dapp.masterpassword });
  });

  router.post('/uninstall', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        id: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: 'string',
          minLength: 1
        }
      },
      required: ["id"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (library.config.dapp.masterpassword && body.master !== library.config.dapp.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.id, function (err, dapp) {
        if (err) {
          return res.json({ success: false, error: err });
        }

        if (private.removing[body.id] || private.loading[body.id]) {
          return res.json({ success: true, error: "This DApp already on uninstall/loading" });
        }

        private.removing[body.id] = true;

        if (private.launched[body.id]) {
          // Stop dapp first
          private.stop(dapp, function (err) {
            if (err) {
              library.logger.error(err);
              return res.json({ success: false, error: "Can't stop dapp, check logs" });
            } else {
              private.launched[body.id] = false;
              private.removeDApp(dapp, function (err) {
                private.removing[body.id] = false;

                if (err) {
                  return res.json({ success: false, error: err });
                } else {
                  library.network.io.sockets.emit('dapps/change', {});

                  return res.json({ success: true });
                }
              });
            }
          });
        } else {
          private.removeDApp(dapp, function (err) {
            private.removing[body.id] = false;

            if (err) {
              return res.json({ success: false, error: err });
            } else {
              library.network.io.sockets.emit('dapps/change', {});

              return res.json({ success: true });
            }
          });
        }
      });
    });
  });

  router.post('/launch', function (req, res, next) {
    if (library.config.dapp.masterpassword && req.body.master !== library.config.dapp.masterpassword) {
      return res.json({ success: false, error: "Invalid master password" });
    }

    private.launch(req.body, function (err) {
      if (err) {
        return res.json({ "success": false, "error": err });
      }

      library.network.io.sockets.emit('dapps/change', {});
      res.json({ "success": true });
    });
  });

  router.get('/installing', function (req, res, next) {
    var ids = [];
    for (var i in private.loading) {
      if (private.loading[i]) {
        ids.push(i);
      }
    }

    return res.json({ success: true, installing: ids });
  });

  router.get('/removing', function (req, res, next) {
    var ids = [];
    for (var i in private.removing) {
      if (private.removing[i]) {
        ids.push(i);
      }
    }

    return res.json({ success: true, removing: ids });
  });

  router.get('/launched', function (req, res, next) {
    var ids = [];
    for (var i in private.launched) {
      if (private.launched[i]) {
        ids.push(i);
      }
    }

    return res.json({ success: true, launched: ids });
  });

  router.get('/categories', function (req, res, next) {
    return res.json({ success: true, categories: dappCategory });
  })

  router.post('/stop', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        id: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: "string",
          minLength: 1
        }
      },
      required: ["id"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (!private.launched[body.id]) {
        return res.json({ success: false, error: "DApp not launched" });
      }

      if (library.config.dapp.masterpassword && body.master !== library.config.dapp.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.id, function (err, dapp) {
        if (err) {
          library.logger.error(err);
          return res.json({ success: false, error: "Can't find dapp" });
        } else {
          private.stop(dapp, function (err) {
            if (err) {
              library.logger.error(err);
              return res.json({ success: false, error: "Can't stop dapp, check logs" });
            } else {

              library.network.io.sockets.emit('dapps/change', {});
              private.launched[body.id] = false;
              return res.json({ success: true });
            }
          });
        }
      });
    });
  });

  router.map(private, {
    "put /transaction": "addTransactions",
    "get /balances/:dappId/:currency": "getDAppBalance",
    "get /balances/:dappId": "getDAppBalances"
  });

  library.network.app.use('/api/dapps', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

// Private methods
private.get = function (id, cb) {
  library.model.getDAppById(id, cb)
}

private.getByIds = function (ids, cb) {
  library.model.getDAppsByIds(ids, cb)
}

private.getDAppBalance = function (req, cb) {
  if (!req.params) return cb('Invalid parameters')
  if (!req.params.dappId || req.params.dappId.length > 64) return cb('Invalid dapp id')
  if (!req.params.currency || req.params.currency.length > 22) return cb('Invalid currency')

  library.model.getDAppBalance(req.params.dappId, req.params.currency, function (err, balance) {
    if (err) return cb('Failed to get balance: ' + err)
    cb(null, { balance: balance })
  })
}

private.getDAppBalances = function (req, cb) {
  if (!req.params) return cb('Invalid parameters')
  if (!req.params.dappId || req.params.dappId.length > 64) return cb('Invalid dapp id')
  let filter = {
    offset: Number(req.offset) || 0,
    limit: Number(req.limit) || 100
  }
  library.model.getDAppBalances(req.params.dappId, filter, function (err, balances) {
    if (err) return cb('Failed to get dapp balances: ' + err)
    cb(null, { balances: balances })
  })
}

private.count = function (cb) {
  library.dbLite.query("SELECT count(*) FROM dapps", { "count": Number }, function (err, rows) {
    if (err) {
      return cb("Failed to count dapps");
    } else {
      return cb(null, { count: rows[0].count });
    }
  });
}

private.list = function (filter, cb) {
  var sortFields = ['type', 'name', 'category', 'link'];
  var params = {}, fields = [];

  if (filter.type >= 0) {
    fields.push('type = $type');
    params.type = filter.type;
  }

  if (filter.name) {
    fields.push('name = $name');
    params.name = filter.name;
  }
  if (filter.category) {
    var category = dappCategory[filter.category];

    if (category !== null && category !== undefined) {
      fields.push('category = $category');
      params.category = category;
    } else {
      return setImmediate(cb, "Invalid dapp category");
    }
  }
  if (filter.link) {
    fields.push('link = $link');
    params.link = filter.link;
  }

  if (!filter.limit && filter.limit != 0) {
    filter.limit = 100;
  }

  if (!filter.offset && filter.offset != 0) {
    filter.offset = 0;
  }

  if (filter.limit >= 0) {
    params.limit = filter.limit;
  }

  if (filter.offset >= 0) {
    params.offset = filter.offset;
  }

  if (filter.orderBy) {
    var sort = filter.orderBy.split(':');
    var sortBy = sort[0].replace(/[^\w_]/gi, '');
    if (sort.length == 2) {
      var sortMethod = sort[1] == 'desc' ? 'desc' : 'asc'
    } else {
      sortMethod = "desc";
    }
  }

  if (sortBy) {
    if (sortFields.indexOf(sortBy) < 0) {
      return cb("Invalid sort field");
    }
  }

  // Need to fix 'or' or 'and' in query
  library.dbLite.query("select name, description, tags, link, type, category, icon, delegates, unlockDelegates, transactionId " +
    "from dapps " +
    (fields.length ? "where " + fields.join(' or ') + " " : "") +
    (filter.orderBy ? 'order by ' + sortBy + ' ' + sortMethod : '') + " " +
    (filter.limit ? 'limit $limit' : '') + " " +
    (filter.offset ? 'offset $offset' : ''), params, {
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
    }, function (err, rows) {
      if (err) {
        return cb(err);
      }

      for (var i in rows) {
        rows[i].delegates = rows[i].delegates.split(',')
      }

      cb(null, rows);
    });
}

private.createBasePathes = function (cb) {
  async.series([
    // function (cb) {
    //   var iconsPath = path.join(library.config.publicDir, 'images', 'dapps');
    //   fs.exists(iconsPath, function (exists) {
    //     if (exists) {
    //       return setImmediate(cb);
    //     } else {
    //       fs.mkdir(iconsPath, cb);
    //     }
    //   });
    // },
    function (cb) {
      fs.exists(private.dappsPath, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.mkdir(private.dappsPath, cb);
        }
      });
    },
    function (cb) {
      var dappsPublic = path.join(private.appPath, 'public', 'dist', 'dapps');
      fs.exists(dappsPublic, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.mkdir(dappsPublic, cb);
        }
      });
    }
  ], function (err) {
    return setImmediate(cb, err);
  });
}

// private.installDependencies = function (dapp, cb) {
//   var dappPath = path.join(private.dappsPath, dapp.transactionId);

//   var packageJson = path.join(dappPath, "package.json");
//   var config = null;

//   try {
//     config = JSON.parse(fs.readFileSync(packageJson));
//   } catch (e) {
//     return setImmediate(cb, "Failed to open package.json file for: " + dapp.transactionId);
//   }

//   npm.load(config, function (err) {
//     if (err) {
//       return setImmediate(cb, err);
//     }

//     npm.root = path.join(dappPath, "node_modules");
//     npm.prefix = dappPath;

//     npm.commands.install(function (err, data) {
//       if (err) {
//         setImmediate(cb, err);
//       } else {
//         return setImmediate(cb, null);
//       }
//     });
//   });
// }

private.getInstalledIds = function (cb) {
  fs.readdir(private.dappsPath, function (err, files) {
    if (err) {
      return setImmediate(cb, err);
    }

    setImmediate(cb, null, files);
  });
}

private.removeDApp = function (dapp, cb) {
  var dappPath = path.join(private.dappsPath, dapp.transactionId);

  function done(err) {
    if (err) {
      library.logger.error("Failed to uninstall dapp: " + err);
    }

    rmdir(dappPath, function (err) {
      if (err) {
        return setImmediate(cb, "Failed to remove dapp folder: " + err);
      } else {
        return cb();
      }
    });
  }

  async.waterfall([
    function (next) {
      fs.exists(dappPath, function (exists) {
        next(exists ? null : "Dapp not found");
      });
    },
    async.apply(private.readJson, path.join(dappPath, "blockchain.json")),
    function (blockchain, next) {
      modules.sql.dropTables(dapp.transactionId, blockchain, next);
    }
  ], function (err) {
    done(err);
  });
}

private.downloadLink = function (dapp, dappPath, cb) {
  var tmpDir = "tmp";
  var tmpPath = path.join(private.appPath, tmpDir, dapp.transactionId + ".zip");

  async.series({
    makeDirectory: function (serialCb) {
      fs.exists(tmpDir, function (exists) {
        if (exists) {
          return serialCb(null);
        } else {
          fs.mkdir(tmpDir, function (err) {
            if (err) {
              return serialCb("Failed to make tmp directory");
            } else {
              return serialCb(null);
            }
          });
        }
      });
    },
    performDownload: function (serialCb) {
      var file = fs.createWriteStream(tmpPath);
      var download = request.get({
        url: dapp.link,
        timeout: 30000
      });

      var hasCallbacked = false;
      var callback = function (err) {
        if (!hasCallbacked) {
          hasCallbacked = true;
          if (err) {
            fs.exists(tmpPath, function (exists) {
              fs.unlink(tmpPath);
            });
          }
          serialCb(err);
        }
      }

      download.on("response", function (response) {
        if (response.statusCode !== 200) {
          return callback("Faile to download dapp " + dapp.link + " with err code: " + response.statusCode);
        }
      });

      download.on("error", function (err) {
        return callback("Failed to download dapp " + dapp.link + " with error: " + err.message);
      });

      download.pipe(file);

      file.on("finish", function () {
        file.close(callback);
      });
    },
    decompressZip: function (serialCb) {
      var unzipper = new DecompressZip(tmpPath)

      unzipper.on("error", function (err) {
        fs.exists(tmpPath, function (exists) {
          fs.unlink(tmpPath);
        });
        rmdir(dappPath, function () { });
        serialCb("Failed to decompress zip file: " + err);
      });

      unzipper.on("extract", function (log) {
        library.logger.info(dapp.transactionId + " Finished extracting");
        fs.exists(tmpPath, function (exists) {
          fs.unlink(tmpPath);
        });
        serialCb(null);
      });

      unzipper.on("progress", function (fileIndex, fileCount) {
        library.logger.info(dapp.transactionId + " Extracted file " + (fileIndex + 1) + " of " + fileCount);
      });

      unzipper.extract({
        path: dappPath,
        strip: 1
      });
    }
  },
    function (err) {
      return cb(err);
    });
}

private.installDApp = function (dapp, cb) {
  var dappPath = path.join(private.dappsPath, dapp.transactionId);

  async.series({
    checkInstalled: function (serialCb) {
      fs.exists(dappPath, function (exists) {
        if (exists) {
          return serialCb("Dapp is already installed");
        } else {
          return serialCb(null);
        }
      });
    },
    makeDirectory: function (serialCb) {
      fs.mkdir(dappPath, function (err) {
        if (err) {
          return serialCb("Failed to make dapp directory");
        } else {
          return serialCb(null);
        }
      });
    },
    performInstall: function (serialCb) {
      return private.downloadLink(dapp, dappPath, serialCb);
    }
  },
    function (err) {
      if (err) {
        rmdir(dappPath, function () { });
        return setImmediate(cb, dapp.transactionId + " Installation failed: " + err);
      } else {
        return setImmediate(cb, null, dappPath);
      }
    });
}

private.symlink = function (dapp, cb) {
  var dappPath = path.join(private.dappsPath, dapp.transactionId);
  var dappPublicPath = path.resolve(dappPath, "public");
  var dappPublicLink = path.resolve(private.appPath, "public", "dist", "dapps", dapp.transactionId);
  fs.exists(dappPublicPath, function (exists) {
    if (exists) {
      fs.exists(dappPublicLink, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.symlink(dappPublicPath, dappPublicLink, cb);
        }
      });
    } else {
      return setImmediate(cb);
    }
  });
}

private.apiHandler = function (message, callback) {
  // Get all modules
  try {
    var strs = message.call.split('#');
    var module = strs[0], call = strs[1];

    if (!modules[module]) {
      return setImmediate(callback, "Invalid module in call: " + message.call);
    }

    if (!modules[module].sandboxApi) {
      return setImmediate(callback, "This module doesn't have sandbox api");
    }

    modules[module].sandboxApi(call, { "body": message.args, "dappId": message.dappId }, callback);
  } catch (e) {
    return setImmediate(callback, "Invalid call " + e.toString());
  }
}

private.dappRoutes = function (dapp, cb) {
  var dappPath = path.join(private.dappsPath, dapp.transactionId);
  var dappRoutesPath = path.join(dappPath, "routes.json");

  var routes = Sandbox.routes

  private.routes[dapp.transactionId] = new Router();

  routes.forEach(function (router) {
    if (router.method == "get" || router.method == "post" || router.method == "put") {
      private.routes[dapp.transactionId][router.method](router.path, function (req, res) {
        var reqParams = {
          query: (router.method == "get") ? req.query : req.body,
          params: req.params
        }
        self.request(dapp.transactionId, router.method, router.path, reqParams, function (err, body) {
          if (!err && body.error) {
            err = body.error;
          }
          if (err) {
            body = { error: err.toString() }
          }
          body.success = !err
          res.json(body);
        });
      });
    }
  });
  if (!private.defaultRouteId) {
    private.defaultRouteId = dapp.transactionId;
    library.network.app.use('/api/dapps/default/', private.routes[dapp.transactionId]);
  }
  library.network.app.use('/api/dapps/' + dapp.transactionId + '/', private.routes[dapp.transactionId]);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
  return setImmediate(cb)
}

private.launch = function (body, cb) {
  library.scheme.validate(body, {
    type: "object",
    properties: {
      params: {
        type: "array",
        minLength: 1
      },
      id: {
        type: 'string',
        minLength: 1
      },
      master: {
        type: "string",
        minLength: 0
      }
    },
    required: ["id"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    if (private.launched[body.id]) {
      return cb("Dapp already launched");
    }

    body.params = body.params || [''];

    async.auto({
      dapp: async.apply(private.get, body.id),

      installedIds: async.apply(private.getInstalledIds),

      symlink: ['dapp', 'installedIds', function (next, results) {
        if (results.installedIds.indexOf(body.id) < 0) {
          return next('Dapp not installed');
        }
        private.symlink(results.dapp, next);
      }],

      launch: ['symlink', function (next, results) {
        private.launchApp(results.dapp, body.params, next);
      }],

      route: ['launch', function (next, results) {
        private.dappRoutes(results.dapp, function (err) {
          if (err) {
            return private.stop(results.dapp, next);
          }
          next();
        });
      }]
    }, function (err, results) {
      if (err) {
        library.logger.error('Failed to launch dapp ' + body.id + ': ' + err);
        cb('Failed to launch dapp');
      } else {
        private.launched[body.id] = true;
        cb();
      }
    });
  });
}

private.readJson = function (file, cb) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return cb(err);
    }
    try {
      return cb(null, JSON.parse(data));
    } catch (e) {
      return cb(e.toString());
    }
  });
}

private.launchApp = function (dapp, params, cb) {
  var dappPath = path.join(private.dappsPath, dapp.transactionId);

  private.readJson(path.join(dappPath, "config.json"), function (err, dappConfig) {
    if (err) {
      return setImmediate(cb, "Failed to read config.json file for: " + dapp.transactionId);
    }
    async.eachSeries(dappConfig.peers, function (peer, cb) {
      modules.peer.addDapp({
        ip: ip.toLong(peer.ip),
        port: peer.port,
        dappId: dapp.transactionId
      }, cb);
    }, function (err) {
      if (err) {
        return setImmediate(cb, err);
      }

      var sandbox = new Sandbox(dappPath, dapp.transactionId, params, private.apiHandler, true, library.logger);
      private.sandboxes[dapp.transactionId] = sandbox;

      sandbox.on("exit", function (code) {
        library.logger.info("Dapp " + dapp.transactionId + " exited with code " + code);
        private.stop(dapp, function (err) {
          if (err) {
            library.logger.error("Encountered error while stopping dapp: " + err);
          }
        });
      });

      sandbox.on("error", function (err) {
        library.logger.info("Encountered error in dapp " + dapp.transactionId + " " + err.toString());
        private.stop(dapp, function (err) {
          if (err) {
            library.logger.error("Encountered error while stopping dapp: " + err);
          }
        });
      });

      sandbox.run();
      return cb(null)
    });
  });
}

private.stop = function (dapp, cb) {
  var dappPublicLink = path.join(private.appPath, "public", "dapps", dapp.transactionId);

  async.series([
    function (cb) {
      fs.exists(dappPublicLink, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          setImmediate(cb);
        }
      });
    },
    function (cb) {
      if (private.sandboxes[dapp.transactionId]) {
        private.sandboxes[dapp.transactionId].exit();
      }

      delete private.sandboxes[dapp.transactionId];

      setImmediate(cb)
    },
    function (cb) {
      delete private.routes[dapp.transactionId];
      setImmediate(cb);
    }
  ], function (err) {
    return setImmediate(cb, err);
  });
}

private.addTransactions = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      amount: {
        type: "integer",
        minimum: 1,
        maximum: constants.totalAmount
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
      dappId: {
        type: "string",
        minLength: 1
      },
      multisigAccountPublicKey: {
        type: "string",
        format: "publicKey"
      }
    },
    required: ["secret", "amount", "dappId"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
    var keypair = ed.MakeKeypair(hash);

    if (body.publicKey) {
      if (keypair.publicKey.toString('hex') != body.publicKey) {
        return cb("Invalid passphrase");
      }
    }

    var query = {};

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
                type: TransactionTypes.IN_TRANSFER,
                amount: body.amount,
                sender: account,
                keypair: keypair,
                requester: keypair,
                secondKeypair: secondKeypair,
                dappId: body.dappId
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
              type: TransactionTypes.IN_TRANSFER,
              amount: body.amount,
              sender: account,
              keypair: keypair,
              secondKeypair: secondKeypair,
              dappId: body.dappId
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

// Public methods
DApps.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

DApps.prototype.message = function (dappId, body, cb) {
  self.request(dappId, "post", "/message", { query: body }, cb);
}

DApps.prototype.request = function (dappId, method, path, query, cb) {
  if (!private.sandboxes[dappId]) {
    return cb("Dapp not found");
  }
  if (!private.dappready[dappId]) {
    return cb("Dapp not ready");
  }
  private.sandboxes[dappId].sendMessage({
    method: method,
    path: path,
    query: query
  }, cb);
}

// Events
DApps.prototype.onBind = function (scope) {
  modules = scope;
}

DApps.prototype.cleanup = function (cb) {
  var keys = Object.keys(private.launched);

  async.eachSeries(keys, function (id, cb) {
    if (!private.launched[id]) {
      return setImmediate(cb);
    }
    private.stop({
      transactionId: id
    }, function (err) {
      cb(err);
    })
  }, function (err) {
    if (err) {
      library.logger.error('all dapps stopped with error', err);
    } else {
      library.logger.info('all dapps stopped successfully');
    }
    cb();
  });
}

DApps.prototype.onBlockchainReady = function () {
  private.getInstalledIds(function (err, dappIds) {
    if (err) {
      library.logger.error("Failed to get installed ids", err);
      return;
    }
    library.logger.info("start to launch " + dappIds.length + " installed dapps");
    async.eachSeries(dappIds, function (id, next) {
      var dappParams = library.config.dapp.params[id] || [];
      private.launch({ id: id, params: dappParams }, function (err) {
        if (err) {
          library.logger.error("Failed to launched dapp[" + id + "]", err);
        } else {
          library.logger.info("Launched dapp[" + id + "] successfully");
        }
        next();
      });
    }, function () {
      library.model.getDAppByName(WITNESS_CLUB_DAPP_NAME, function (err, clubInfo) {
        if (err) {
          library.logger.error('Failed to query asch witness club', err)
        } else if (!clubInfo) {
          library.logger.warn('Asch witness club dapp is not found')
        } else {
          global.state.clubInfo = clubInfo
        }
      })
    });
  });
}

DApps.prototype.onDeleteBlocksBefore = function (block) {
  Object.keys(private.sandboxes).forEach(function (dappId) {
    let req = {
      query: {
        topic: "rollback",
        message: { pointId: block.id, pointHeight: block.height }
      }
    }
    self.request(dappId, "post", "/message", req, function (err) {
      if (err) {
        library.logger.error("onDeleteBlocksBefore message", err)
      }
    });
  });
}

DApps.prototype.onNewBlock = function (block, votes, broadcast) {
  let req = {
    query: {
      topic: "point",
      message: { id: block.id, height: block.height }
    }
  }
  Object.keys(private.sandboxes).forEach(function (dappId) {
    broadcast && self.request(dappId, "post", "/message", req, function (err) {
      if (err) {
        library.logger.error("onNewBlock message", err)
      }
    });
  });
}

// Shared
shared.getGenesis = function (req, cb) {
  library.dbLite.query("SELECT b.height, b.id, GROUP_CONCAT(m.dependentId), t.senderId FROM trs t " +
    "inner join blocks b on t.blockId = b.id and t.id = $id " +
    "left outer join mem_accounts2multisignatures m on m.accountId = t.senderId and t.id = $id", { id: req.dappId }, {
      height: Number,
      id: String,
      multisignature: String,
      authorId: String
    }, function (err, rows) {
      if (err || rows.length == 0) {
        return cb("Database error");
      }

      cb(null, {
        pointId: rows[0].id,
        pointHeight: rows[0].height,
        authorId: rows[0].authorId,
        dappId: req.dappId,
        associate: rows[0].multisignature ? rows[0].multisignature.split(",") : []
      });
    });
}

shared.getDApp = function (req, cb) {
  library.model.getDAppById(req.dappId, cb)
}

shared.setReady = function (req, cb) {
  private.dappready[req.dappId] = true;
  library.bus.message('dappReady', req.dappId, true);
  cb(null, {});
}

shared.getCommonBlock = function (req, cb) {
  library.dbLite.query("SELECT b.height, t.id, t.senderId, t.amount FROM trs t " +
    "inner join blocks b on t.blockId = b.id and t.id = $id and t.type = $type" +
    "inner join intransfer dt on dt.transactionId = t.id and dt.dappId = $dappId", {
      dappId: req.dappId,
      type: TransactionTypes.IN_TRANSFER
    }, {
      height: Number,
      id: String,
      senderId: String,
      amount: String
    }, function (err, rows) {
      if (err) {
        return cb("Database error");
      }
      cb(null, rows);
    });
}

shared.sendWithdrawal = function (req, cb) {
  var body = req.body;
  library.scheme.validate(body, {
    type: "object",
    properties: {
      secret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      amount: {
        type: "integer",
        minimum: 1,
        maximum: constants.totalAmount
      },
      recipientId: {
        type: "string",
        minLength: 1,
        maxLength: 50
      },
      secondSecret: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      transactionId: {
        type: "string",
        minLength: 1,
        maxLength: 64
      },
      multisigAccountPublicKey: {
        type: "string",
        format: "publicKey"
      }
    },
    required: ["secret", 'recipientId', "amount", "transactionId"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
    var keypair = ed.MakeKeypair(hash);
    var query = {};

    if (!addressHelper.isAddress(body.recipientId)) {
      return cb("Invalid address");
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
                type: TransactionTypes.OUT_TRANSFER,
                amount: body.amount,
                sender: account,
                recipientId: body.recipientId,
                keypair: keypair,
                secondKeypair: secondKeypair,
                requester: keypair,
                dappId: req.dappId,
                transactionId: body.transactionId
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
              type: TransactionTypes.OUT_TRANSFER,
              amount: body.amount,
              sender: account,
              recipientId: body.recipientId,
              keypair: keypair,
              secondKeypair: secondKeypair,
              dappId: req.dappId,
              transactionId: body.transactionId
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

shared.getWithdrawalLastTransaction = function (req, cb) {
  library.dbLite.query("SELECT ot.outTransactionId FROM trs t " +
    "inner join blocks b on t.blockId = b.id and t.type = $type " +
    "inner join outtransfer ot on ot.transactionId = t.id and ot.dappId = $dappId " +
    "order by b.height desc limit 1", {
      dappId: req.dappId,
      type: TransactionTypes.OUT_TRANSFER
    }, {
      id: String
    }, function (err, rows) {
      if (err) {
        return cb("Database error");
      }
      cb(null, rows[0]);
    });
}

shared.getBalanceTransactions = function (req, cb) {
  library.dbLite.query("SELECT t.id, lower(hex(t.senderPublicKey)), t.amount, dt.currency, dt.amount as amount2 FROM trs t " +
    "inner join blocks b on t.blockId = b.id and t.type = $type " +
    "inner join intransfer dt on dt.transactionId = t.id and dt.dappId = $dappId " +
    (req.body.lastTransactionId ? "where b.height > (select height from blocks ib inner join trs it on ib.id = it.blockId and it.id = $lastId) " : "") +
    "order by b.height", {
      dappId: req.dappId,
      type: TransactionTypes.IN_TRANSFER,
      lastId: req.body.lastTransactionId
    }, {
      id: String,
      senderPublicKey: String,
      amount: String,
      currency: String,
      amount2: String
    }, function (err, rows) {
      if (err) {
        return cb("Database error");
      }
      cb(null, rows);
    });
}

shared.submitOutTransfer = function (req, cb) {
  let trs = req.body
  library.balancesSequence.add(function (cb) {
    if (modules.transactions.hasUnconfirmedTransaction(trs)) {
      return cb('Already exists');
    }
    library.logger.log('Submit outtransfer transaction ' + trs.id + ' from dapp ' + req.dappId);
    modules.transactions.receiveTransactions([trs], cb);
  }, cb);
}

shared.registerInterface = function (req, cb) {
  let dappId = req.dappId
  let method = req.body.method
  let path = req.body.path
  private.routes[dappId][method](path, function (req, res) {
    var reqParams = {
      query: (method == "get") ? req.query : req.body,
      params: req.params
    }
    self.request(dappId, method, path, reqParams, function (err, body) {
      if (!body) {
        body = {}
      }
      if (!err && body.error) {
        err = body.error;
      }
      if (err) {
        body = { error: err.toString() }
      }
      body.success = !err
      res.json(body);
    });
  });
  cb(null)
}

module.exports = DApps;
