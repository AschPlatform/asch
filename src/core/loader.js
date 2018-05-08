var async = require('async');
var ip = require("ip");
var bignum = require('bignumber');
var Router = require('../utils/router.js');
var sandboxHelper = require('../utils/sandbox.js');
var slots = require('../utils/slots.js');

require('colors');

// Private fields
var modules, library, self, private = {}, shared = {};

private.loaded = false;
private.syncing = false;
private.loadingLastBlock = null;
private.genesisBlock = null;
private.total = 0;
private.blocksToSync = 0;
private.syncIntervalId = null;

// Constructor
function Loader(cb, scope) {
  library = scope;
  private.genesisBlock = private.loadingLastBlock = library.genesisblock;
  self = this;
  self.__private = private;
  private.attachApi();

  setImmediate(cb, null, self);
}

// Private methods
private.attachApi = function () {
  var router = new Router();

  router.map(shared, {
    "get /status": "status",
    "get /status/sync": "sync"
  });

  library.network.app.use('/api/loader', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.syncTrigger = function (turnOn) {
  if (turnOn === false && private.syncIntervalId) {
    clearTimeout(private.syncIntervalId);
    private.syncIntervalId = null;
  }
  if (turnOn === true && !private.syncIntervalId) {
    setImmediate(function nextSyncTrigger() {
      library.network.io.sockets.emit('loader/sync', {
        blocks: private.blocksToSync,
        height: modules.blocks.getLastBlock().height
      });
      private.syncIntervalId = setTimeout(nextSyncTrigger, 1000);
    });
  }
}

private.loadFullDb = function (peer, cb) {
  const contact = peer[1]
  const peerStr = contact.hostname + ':' + contact.port

  let commonBlockId = private.genesisBlock.block.id;

  library.logger.debug("Loading blocks from genesis from " + peerStr);

  modules.blocks.loadBlocksFromPeer(peer, commonBlockId, cb);
}

private.findUpdate = function (lastBlock, peer, cb) {
  const contact = peer[1]
  const peerStr = contact.hostname + ':' + contact.port

  library.logger.info("Looking for common block with " + peerStr);

  modules.blocks.getCommonBlock(peer, lastBlock.height, function (err, commonBlock) {
    if (err || !commonBlock) {
      library.logger.error("Failed to get common block:", err);
      return cb();
    }

    library.logger.info("Found common block " + commonBlock.id + " (at " + commonBlock.height + ")" + " with peer " + peerStr + ", last block height is " + lastBlock.height);
    var toRemove = lastBlock.height - commonBlock.height;

    if (toRemove >= 5) {
      library.logger.error("long fork with peer " + peerStr);
      return cb();
    }

    (async function () {
      try {
        // FIXME
        app.sdb.rollbackBlock()
        modules.transactions.clearUnconfirmed();
        if (toRemove > 0) {
          for (let h = lastBlock.height; h > commonBlock.height; h--) {
            library.logger.info('rollback block height: ' + h)
            await app.sdb.rollbackBlock(h)
          }
        }
      } catch (e) {
        library.logger.error('Failed to rollback block', e)
        return cb()
      }
      library.logger.debug("Loading blocks from peer " + peerStr);
      modules.blocks.loadBlocksFromPeer(peer, commonBlock.id, function (err, lastValidBlock) {
        if (err) {
          library.logger.error("Failed to load blocks, ban 60 min: " + peerStr, err);
        }
        cb();
      });
    })()
  });
}

private.loadBlocks = function (lastBlock, cb) {
  modules.peer.randomRequest('height', {}, function (err, ret, peer) {
    if (err) {
      library.logger.error("Failed to request form random peer", { err: err, peer: peer });
      return cb();
    }

    const contact = peer[1]
    const peerStr = contact.hostname + ':' + contact.port
    library.logger.info("Check blockchain on " + peerStr);

    ret.height = parseInt(ret.height);

    var report = library.scheme.validate(ret, {
      type: "object",
      properties: {
        "height": {
          type: "integer",
          minimum: 0
        }
      }, required: ['height']
    });

    if (!report) {
      library.logger.log("Failed to parse blockchain height: " + peerStr + "\n" + library.scheme.getLastError());
      return cb();
    }

    if (bignum(lastBlock.height).lt(ret.height)) {
      private.blocksToSync = ret.height;

      if (lastBlock.id != private.genesisBlock.block.id) {
        private.findUpdate(lastBlock, peer, cb);
      } else {
        private.loadFullDb(peer, cb);
      }
    } else {
      cb();
    }
  });
}

private.loadUnconfirmedTransactions = function (cb) {
  modules.peer.randomRequest('transactions', {}, function (err, data, peer) {
    if (err) {
      return cb()
    }

    var report = library.scheme.validate(data.body, {
      type: "object",
      properties: {
        transactions: {
          type: "array",
          uniqueItems: true
        }
      },
      required: ['transactions']
    });

    if (!report) {
      return cb();
    }

    var transactions = data.body.transactions;

    for (var i = 0; i < transactions.length; i++) {
      try {
        transactions[i] = library.base.transaction.objectNormalize(transactions[i]);
      } catch (e) {
        const contact = peer[1]
        var peerStr = contact.hostname + ':' + contact.port
        library.logger.log('Transaction ' + (transactions[i] ? transactions[i].id : 'null') + ' is not valid, ban 60 min', peerStr);
        return cb()
      }
    }

    var trs = [];
    for (var i = 0; i < transactions.length; ++i) {
      if (!modules.transactions.hasUnconfirmed(transactions[i])) {
        trs.push(transactions[i]);
      }
    }
    library.sequence.add(function (cb) {
      modules.transactions.receiveTransactions(trs, cb);
    }, cb);
  });
}

// Public methods
Loader.prototype.syncing = function () {
  return private.syncing;
}

Loader.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Loader.prototype.startSyncBlocks = function () {
  library.logger.debug('startSyncBlocks enter')
  if (!private.loaded || self.syncing()) {
    library.logger.debug('blockchain is already syncing')
    return
  }
  library.sequence.add(function syncBlocks(cb) {
    library.logger.debug('startSyncBlocks enter sequence')
    private.syncing = true
    var lastBlock = modules.blocks.getLastBlock()
    private.loadBlocks(lastBlock, cb)
  }, function (err) {
    err && library.logger.error('loadBlocks error:', err)
    private.syncing = false
    private.blocksToSync = 0
    library.logger.debug('startSyncBlocks end')
  });
}

// Events
Loader.prototype.onPeerReady = function () {
  setImmediate(function nextSync() {
    var lastBlock = modules.blocks.getLastBlock();
    var lastSlot = slots.getSlotNumber(lastBlock.timestamp);
    if (slots.getNextSlot() - lastSlot >= 3) {
      self.startSyncBlocks();
    }
    setTimeout(nextSync, 10 * 1000);
  });

  setImmediate(function nextLoadUnconfirmedTransactions() {
    if (!private.loaded || self.syncing()) return;
    private.loadUnconfirmedTransactions(function (err) {
      err && library.logger.error('loadUnconfirmedTransactions timer:', err);
      //setTimeout(nextLoadUnconfirmedTransactions, 14 * 1000)
    });

  });
}

Loader.prototype.onBind = function (scope) {
  modules = scope;
}

Loader.prototype.onBlockchainReady = function () {
  private.loaded = true;
}

Loader.prototype.cleanup = function (cb) {
  private.loaded = false;
  cb();
  // if (!private.isActive) {
  //   cb();
  // } else {
  //   setImmediate(function nextWatch() {
  //     if (private.isActive) {
  //       setTimeout(nextWatch, 1 * 1000)
  //     } else {
  //       cb();
  //     }
  //   });
  // }
}

// Shared
shared.status = function (req, cb) {
  cb(null, {
    loaded: private.loaded,
    now: private.loadingLastBlock.height,
    blocksCount: private.total
  });
}

shared.sync = function (req, cb) {
  cb(null, {
    syncing: self.syncing(),
    blocks: private.blocksToSync,
    height: modules.blocks.getLastBlock().height
  });
}

// Export
module.exports = Loader;
