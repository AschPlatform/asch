var async = require('async');
var request = require('request');
var ip = require('ip');
var util = require('util');
var extend = require('extend');
var crypto = require('crypto');
var bignum = require('bignumber');
var Router = require('../utils/router.js');
var slots = require('../utils/slots.js')
var sandboxHelper = require('../utils/sandbox.js');
var LimitCache = require('../utils/limit-cache.js');
var shell = require('../utils/shell.js');

// Private fields
var modules, library, self, private = {}, shared = {};

private.headers = {};
private.loaded = false;
private.chainMessageCache = {};
private.processedTrsCache = new LimitCache()

// Constructor
function Transport(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;
  private.attachApi();

  setImmediate(cb, null, self);
}

// Private methods
private.attachApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules && private.loaded && !modules.loader.syncing()) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.use(function (req, res, next) {
    var peerIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!peerIp) {
      return res.status(500).send({ success: false, error: "Wrong header data" });
    }

    req.headers['port'] = parseInt(req.headers['port']);

    req.sanitize(req.headers, {
      type: "object",
      properties: {
        os: {
          type: "string",
          maxLength: 64
        },
        'magic': {
          type: 'string',
          maxLength: 8
        },
        'version': {
          type: 'string',
          maxLength: 11
        }
      },
      required: ['magic', 'version']
    }, function (err, report, headers) {
      if (err) return next(err);
      if (!report.isValid) return res.status(500).send({ success: false, error: report.issues });

      if (req.headers['magic'] !== library.config.magic) {
        return res.status(500).send({
          success: false,
          error: "Request is made on the wrong network",
          expected: library.config.magic,
          received: req.headers['magic']
        });
      }
      // if (peerIp == "127.0.0.1") {
      //   return next();
      // }
      if (!req.headers.version) {
        return next();
      }
      var peer = {
        ip: ip.toLong(peerIp),
        port: headers.port,
        state: 2,
        os: headers.os,
        version: headers.version
      };

      if (req.body && req.body.chain) {
        peer.chain = req.body.chain;
      }

      if (peer.port && peer.port > 0 && peer.port <= 65535) {
        if (modules.peer.isCompatible(peer.version)) {
          peer.version && modules.peer.update(peer);
        } else {
          return res.status(500).send({
            success: false,
            error: "Version is not comtibleVersion"
          });
        }
      }

      next();
    });

  });

  modules.peer.handle('commonBlock', function (req, res, next) {
    const query = req.params.body
    if (!Number.isInteger(query.max)) return res.send({ error: 'Field max must be integer' })
    if (!Number.isInteger(query.min)) return res.send({ error: 'Field min must be integer' })
    // TODO validate query.ids
    const max = query.max;
    const min = query.min;
    const ids = query.ids
    (async () => {
      try {
        let blocks = await app.model.Block.findAll({
          condition: {
            id: {
              $in: ids
            },
            height: { $between: [query.min, query.max] }
          },
          sort: {
            height: 1
          },
        })
        app.logger.debug('find common blocks in database', blocks)
        if (!blocks || !blocks.length) {
          return res.send({ success: false, error: 'Common block not found' })
        }
        return res.send({ success: true, common: blocks[blocks.length - 1] });
      } catch (e) {
        app.logger.error('Failed to find common block: ' + e)
        return res.send({ success: false, error: 'Failed to find common block' })
      }
    })()
  });

  modules.peer.handle('blocks', function (req, res, next) {
    // TODO validate req.query.lastBlockId
    const query = req.params.body
    const blocksLimit = 200;
    if (query.limit) {
      blocksLimit = Math.min(blocksLimit, Number(query.limit))
    }

    (async function () {
      const lastBlockId = req.query.lastBlockId
      try {
        let lastBlock = await app.model.Block.findOne({ condition: { id: lastBlockId } })
        if (!lastBlock) throw new Error('Last block not found: ' + lastBlockId)

        let blocks = await app.model.Block.findAll({
          condition: {
            height: { $gt: lastBlock.height }
          },
          limit: blocksLimit,
          sort: { height: 1 }
        })
        if (!blocks || !blocks.length) return res.send({ blocks: [] })

        let maxHeight = blocks[blocks.length - 1].height
        let transactions = await app.model.Transaction.findAll({
          condition: {
            height: { $gt: lastBlock.height, $lte: maxHeight }
          }
        })
        app.logger.debug('Transport get blocks transactions', transactions)
        let firstHeight = blocks[0].height
        for (let i in transactions) {
          let t = transactions[i]
          let h = t.height
          let b = blocks[h - firstHeight]
          if (!!b) {
            if (!b.transactions) {
              b.transactions = []
            }
            b.transactions.push(t)
          }
        }
        res.send({ blocks: blocks });
      } catch (e) {
        app.logger.error('Failed to get blocks or transactions', e)
        return res.send({ blocks: [] });
      }
    })()
  })

  modules.peer.handle('votes', function (req, res, next) {
    // TODO validate req.params.query{height, id, signature}
    library.bus.message('receiveVotes', req.params.body.votes)
    res.send({})
  })

  modules.peer.handle('transactions', function (req, res, next) {
    res.send({ transactions: modules.transactions.getUnconfirmedTransactionList() });
  });

  modules.peer.handle('height', function (req, res, next) {
    res.send({
      height: modules.blocks.getLastBlock().height
    });
  });

  modules.peer.handle('chainRequest', function (req, res, next) {
    let params = req.params
    let query = req.params.body
    try {
      if (!params.chain) {
        return res.send({ success: false, error: "missed chain" });
      }
      if (!params.timestamp || !params.hash) {
        return res.status(200).json({
          success: false,
          error: "missed hash sum"
        });
      }
      var newHash = private.hashsum(query, params.timestamp);
      if (newHash !== params.hash) {
        return res.send({ success: false, error: "wrong hash sum" });
      }
    } catch (e) {
      library.logger.error('receive invalid chain request', { error: e.toString(), params: params })
      return res.send({ success: false, error: e.toString() });
    }

    modules.chains.request(params.chain, query.method, query.path, { query: params.query }, function (err, ret) {
      if (!err && ret.error) {
        err = ret.error;
      }

      if (err) {
        library.logger.error('failed to process chain request', err)
        return res.send({ success: false, error: err });
      }
      res.send(extend({}, { success: true }, ret));
    });
  });

  modules.peer.subscribe('block', function (message) {
    let block = message.body.block
    let votes = message.body.votes
    try {
      block = library.base.block.objectNormalize(block);
      votes = library.base.consensus.normalizeVotes(votes);
    } catch (e) {
      library.logger.log('normalize block or votes object error: ' + e.toString());
      library.logger.log('Block ' + (block ? block.id : 'null') + ' is not valid, ban 60 min', peerStr);
    }
    library.bus.message('receiveBlock', block, votes);
  })

  modules.peer.subscribe('propose', function (message) {
    if (typeof message.body.propose == 'string') {
      message.body.propose = library.protobuf.decodeBlockPropose(new Buffer(message.body.propose, 'base64'));
    }
    library.scheme.validate(message.body.propose, {
      type: "object",
      properties: {
        height: {
          type: "integer",
          minimum: 1
        },
        id: {
          type: "string",
          maxLength: 64,
        },
        timestamp: {
          type: "integer"
        },
        generatorPublicKey: {
          type: "string",
          format: "publicKey"
        },
        address: {
          type: "string"
        },
        hash: {
          type: "string",
          format: "hex"
        },
        signature: {
          type: "string",
          format: "signature"
        }
      },
      required: ["height", "id", "timestamp", "generatorPublicKey", "address", "hash", "signature"]
    }, function (err) {
      if (err) {
        library.logger.error('Received propose is invalid', { propose: message.body.propose, error: err })
        return
      }
      library.bus.message('receivePropose', req.body.propose);
    });
  });

  modules.peer.subscribe('transaction', function (message) {
    const lastBlock = modules.blocks.getLastBlock();
    const lastSlot = slots.getSlotNumber(lastBlock.timestamp);
    if (slots.getNextSlot() - lastSlot >= 12) {
      library.logger.error("OS INFO", shell.getInfo())
      library.logger.error("Blockchain is not ready", { getNextSlot: slots.getNextSlot(), lastSlot: lastSlot, lastBlockHeight: lastBlock.height })
      return
    }

    if (typeof message.body.transaction == 'string') {
      message.body.transaction = library.protobuf.decodeTransaction(new Buffer(message.body.transaction, 'base64'));
    }
    try {
      var transaction = library.base.transaction.objectNormalize(message.body.transaction);
      // transaction.asset = transaction.asset || {}
    } catch (e) {
      library.logger.error("transaction parse error", {
        message: message,
        trs: transaction,
        error: e.toString()
      });
      library.logger.log('Received transaction ' + (transaction ? transaction.id : 'null') + ' is not valid, ban 60 min', peerStr);
      return
    }

    if (private.processedTrsCache.has(transaction.id)) {
      return
    }

    library.sequence.add(function (cb) {
      if (modules.transactions.hasUnconfirmed(transaction)) {
        return cb('Already exists')
      }
      library.logger.log('Received transaction ' + transaction.id + ' from peer ' + peerStr)
      modules.transactions.receiveTransactions([transaction], cb)
    }, function (err, transactions) {
      private.processedTrsCache.set(transaction.id, true)
      if (err) {
        library.logger.warn('Receive invalid transaction,id is ' + transaction.id, err)
      } else {
        library.bus.message('unconfirmedTransaction', transaction, true)
      }
    })
  })

  modules.peer.subscribe('chainMessage', function (message) {
    try {
      if (!message.chain) {
        return
      }
      if (!message.timestamp || !message.hash) {
        return
      }
      var newHash = private.hashsum(message.body, message.timestamp);
      if (newHash !== message.hash) {
        return
      }
    } catch (e) {
      library.logger.error(e)
      library.logger.debug('receive invalid chain message', message)
      return
    }

    if (private.chainMessageCache[message.hash]) {
      return res.sendStatus(200);
    }

    private.chainMessageCache[message.hash] = true;
    modules.chains.message(message.chain, message.body, function (err, body) {
      if (!err && body.error) {
        err = body.error;
      }

      if (err) {
        library.logger.error('failed to process chain message', err)
        return
      }
      library.bus.message('message', req.body, true);
    });
  });
}

private.hashsum = function (obj) {
  var buf = new Buffer(JSON.stringify(obj), 'utf8');
  var hashdig = crypto.createHash('sha256').update(buf).digest();
  var temp = new Buffer(8);
  for (var i = 0; i < 8; i++) {
    temp[i] = hashdig[7 - i];
  }

  return bignum.fromBuffer(temp).toString();
}

Transport.prototype.broadcast = function (topic, message) {
  modules.peer.publish(topic, message)
}

Transport.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Transport.prototype.onBind = function (scope) {
  modules = scope;

  private.headers = {
    os: modules.system.getOS(),
    version: modules.system.getVersion(),
    port: modules.system.getPort(),
    magic: modules.system.getMagic()
  }
}

Transport.prototype.onBlockchainReady = function () {
  private.loaded = true;
}

Transport.prototype.onUnconfirmedTransaction = function (transaction) {
  let message = {
    body: {
      transaction: transaction
    }
  }
  self.broadcast('transactions', message);
}

Transport.prototype.onNewBlock = function (block, votes) {
  let message = {
    body: {
      block: block, votes: votes
    }
  }
  self.broadcast('block', message)
}

Transport.prototype.onNewPropose = function (propose) {
  let message = {
    body: {
      propose: library.protobuf.encodeBlockPropose(propose).toString('base64')
    }
  }
  self.broadcast('propose', message);
}

Transport.prototype.sendVotes = function (votes, address) {
  let params = {
    body: {
      votes: votes
    }
  }
  const parts = address.split(':')
  const contact = {
    hostname: parts[0],
    port: parts[1]
  }
  const identity = modules.peer.getIdentity(contact)
  const target = [identity, contact]
  modules.peer.request('votes', params, contact, target, function (err) {
    if (err) {
      library.logger.error('send votes error', err)
    }
  })
}

Transport.prototype.onMessage = function (msg) {
  const message = {
    chain: msg.chain,
    body: msg
  }
  self.broadcast('chainMessage', message)
}

Transport.prototype.cleanup = function (cb) {
  private.loaded = false;
  cb();
}

// Shared
shared.message = function (msg, cb) {
  msg.timestamp = (new Date()).getTime();
  msg.hash = private.hashsum(msg.body, msg.timestamp);

  self.broadcast('chainMessage', msg);

  cb(null, {});
}

shared.request = function (req, cb) {
  req.timestamp = (new Date()).getTime();
  req.hash = private.hashsum(req.body, req.timestamp);

  if (req.body.peer) {
    modules.peer.request('chainRequest', req, req.body.peer, cb)
  } else {
    modules.peer.randomRequest('chainRequest', req, cb)
  }
  
}

// Export
module.exports = Transport;
