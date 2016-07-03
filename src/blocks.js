var crypto = require('crypto');
var ip = require('ip');
var ByteBuffer = require("bytebuffer");
var async = require('async');
var ed = require('ed25519');
var constants = require("./utils/constants.js");
var blockStatus = require("./utils/blockStatus.js");
var constants = require('./utils/constants.js');
var Router = require('./utils/router.js');
var slots = require('./utils/slots.js');
var bignum = require('./utils/bignum.js');
var TransactionTypes = require('./utils/transaction-types.js');
var sandboxHelper = require('./utils/sandbox.js');

require('array.prototype.findindex'); // Old node fix

var genesisblock = null;
// Private fields
var modules, library, self, private = {}, shared = {};

var pendingBlocks = {};
var confirmStats = {};
var confirmCache = {};

private.lastBlock = {};
private.blockStatus = new blockStatus();
// @formatter:off
private.blocksDataFields = {
  'b_id': String,
  'b_version': String,
  'b_timestamp': Number,
  'b_height': Number,
  'b_previousBlock': String,
  'b_numberOfTransactions': String,
  'b_totalAmount': String,
  'b_totalFee': String,
  'b_reward': String,
  'b_payloadLength': String,
  'b_payloadHash': String,
  'b_generatorPublicKey': String,
  'b_blockSignature': String,
  't_id': String,
  't_type': Number,
  't_timestamp': Number,
  't_senderPublicKey': String,
  't_senderId': String,
  't_recipientId': String,
  't_amount': String,
  't_fee': String,
  't_signature': String,
  't_signSignature': String,
  's_publicKey': String,
  'd_username': String,
  'v_votes': String,
  'm_min': Number,
  'm_lifetime': Number,
  'm_keysgroup': String,
  'dapp_name': String,
  'dapp_description': String,
  'dapp_tags': String,
  'dapp_type': Number,
  'dapp_link': String,
  'dapp_category': Number,
  'dapp_icon': String,
  'in_dappId': String,
  'ot_dappId': String,
  'ot_outTransactionId': String,
  't_requesterPublicKey': String,
  't_signatures': String
};
// @formatter:on
private.loaded = false;
private.isActive = false;

// Constructor
function Blocks(cb, scope) {
  library = scope;
  genesisblock = library.genesisblock;
  self = this;
  self.__private = private;
  private.attachApi();

  private.saveGenesisBlock(function (err) {
    setImmediate(cb, err, self);
  });
}

// Private methods
private.attachApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules) return next();
    res.status(500).send({success: false, error: "Blockchain is loading"});
  });

  router.map(shared, {
    "get /get": "getBlock",
    "get /": "getBlocks",
    "get /getHeight": "getHeight",
    "get /getFee": "getFee",
    "get /getMilestone": "getMilestone",
    "get /getReward": "getReward",
    "get /getSupply": "getSupply",
    "get /getStatus": "getStatus"
  });

  router.use(function (req, res, next) {
    res.status(500).send({success: false, error: "API endpoint not found"});
  });

  library.network.app.use('/api/blocks', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({success: false, error: err.toString()});
  });
}

private.saveGenesisBlock = function (cb) {
  library.dbLite.query("SELECT id FROM blocks WHERE id=$id", {id: genesisblock.block.id}, ['id'], function (err, rows) {
    if (err) {
      return cb(err)
    }
    var blockId = rows.length && rows[0].id;

    if (!blockId) {
      private.saveBlock(genesisblock.block, function (err) {
        if (err) {
          library.logger.error('saveBlock', err);
        }

        cb(err);
      });
    } else {
      cb()
    }
  });
}

private.deleteBlock = function (blockId, cb) {
  library.dbLite.query("DELETE FROM blocks WHERE id = $id", {id: blockId}, function (err, res) {
    cb(err, res);
  });
}

private.list = function (filter, cb) {
  var sortFields = ['b.id', 'b.timestamp', 'b.height', 'b.previousBlock', 'b.totalAmount', 'b.totalFee', 'b.reward', 'b.numberOfTransactions', 'b.generatorPublicKey'];
  var params = {}, fields = [], sortMethod = '', sortBy = '';
  if (filter.generatorPublicKey) {
    fields.push('lower(hex(generatorPublicKey)) = $generatorPublicKey')
    params.generatorPublicKey = filter.generatorPublicKey;
  }

  if (filter.numberOfTransactions) {
    fields.push('numberOfTransactions = $numberOfTransactions');
    params.numberOfTransactions = filter.numberOfTransactions;
  }

  if (filter.previousBlock) {
    fields.push('previousBlock = $previousBlock');
    params.previousBlock = filter.previousBlock;
  }

  if (filter.height === 0 || filter.height > 0) {
    fields.push('height = $height');
    params.height = filter.height;
  }

  if (filter.totalAmount >= 0) {
    fields.push('totalAmount = $totalAmount');
    params.totalAmount = filter.totalAmount;
  }

  if (filter.totalFee >= 0) {
    fields.push('totalFee = $totalFee');
    params.totalFee = filter.totalFee;
  }

  if (filter.reward >= 0) {
    fields.push('reward = $reward');
    params.reward = filter.reward;
  }

  if (filter.orderBy) {
    var sort = filter.orderBy.split(':');
    sortBy = sort[0].replace(/[^\w\s]/gi, '');
    sortBy = "b." + sortBy;
    if (sort.length == 2) {
      sortMethod = sort[1] == 'desc' ? 'desc' : 'asc'
    } else {
      sortMethod = 'desc';
    }
  }


  if (sortBy) {
    if (sortFields.indexOf(sortBy) < 0) {
      return cb("Invalid sort field");
    }
  }

  if (!filter.limit) {
    filter.limit = 100;
  }

  if (!filter.offset) {
    filter.offset = 0;
  }

  params.limit = filter.limit;
  params.offset = filter.offset;

  if (filter.limit > 100) {
    return cb("Invalid limit. Maximum is 100");
  }

  library.dbLite.query("select count(b.id) " +
    "from blocks b " +
    (fields.length ? "where " + fields.join(' and ') : ''), params, {count: Number}, function (err, rows) {
    if (err) {
      return cb(err);
    }

    var count = rows[0].count;

    library.dbLite.query("select b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength, lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), (select max(height) + 1 from blocks) - b.height " +
      "from blocks b " +
      (fields.length ? "where " + fields.join(' and ') : '') + " " +
      (filter.orderBy ? 'order by ' + sortBy + ' ' + sortMethod : '') + " limit $limit offset $offset ", params, ['b_id', 'b_version', 'b_timestamp', 'b_height', 'b_previousBlock', 'b_numberOfTransactions', 'b_totalAmount', 'b_totalFee', 'b_reward', 'b_payloadLength', 'b_payloadHash', 'b_generatorPublicKey', 'b_blockSignature', 'b_confirmations'], function (err, rows) {
      if (err) {
        library.logger.error(err);
        return cb(err);
      }

      var blocks = [];
      for (var i = 0; i < rows.length; i++) {
        blocks.push(library.base.block.dbRead(rows[i]));
      }

      var data = {
        blocks: blocks,
        count: count
      }

      cb(null, data);
    });
  });
}

private.getByField = function (field, cb) {
  var condition = "b." + field.key + " = $" + field.key;
  var values = {};
  values[field.key] = field.value;
  console.log(field, values);
  library.dbLite.query("select b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength,  lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), (select max(height) + 1 from blocks) - b.height " +
    "from blocks b " +
    "where " + condition, values, ['b_id', 'b_version', 'b_timestamp', 'b_height', 'b_previousBlock', 'b_numberOfTransactions', 'b_totalAmount', 'b_totalFee', 'b_reward', 'b_payloadLength', 'b_payloadHash', 'b_generatorPublicKey', 'b_blockSignature', 'b_confirmations'], function (err, rows) {
    if (err || !rows.length) {
      return cb(err || "Block not found");
    }

    var block = library.base.block.dbRead(rows[0]);
    cb(null, block);
  });
}

private.saveBlock = function (block, cb) {
  library.dbLite.query('SAVEPOINT saveblock');

  library.base.block.dbSave(block, function (err) {
    if (err) {
      library.dbLite.query('ROLLBACK TO SAVEPOINT saveblock', function (rollbackErr) {
        cb(rollbackErr || err);
      });
      return;
    }

    async.eachSeries(block.transactions, function (transaction, cb) {
      transaction.blockId = block.id;
      library.base.transaction.dbSave(transaction, cb);
    }, function (err) {
      if (err) {
        library.dbLite.query('ROLLBACK to SAVEPOINT saveblock', function (rollbackErr) {
          cb(rollbackErr || err);
        });
        return;
      }

      library.dbLite.query('RELEASE SAVEPOINT saveblock', cb);
    });
  });
}

private.popLastBlock = function (oldLastBlock, callback) {
  library.balancesSequence.add(function (cb) {
    function done(err, previousBlock) {
      if (err) {
        var finalErr = 'popLastBlock err: ' + err;
        library.dbLite.query('ROLLBACK TO SAVEPOINT poplastblock', function(rollbackErr) {
          if (rollbackErr) {
            finalErr += ', rollback err: ' + rollbackErr;
          }
          cb(finalErr);
        });
      } else {
        library.dbLite.query('RELEASE SAVEPOINT poplastblock', function(releaseErr) {
          if (releaseErr) {
            cb('popLastBlock release savepoint error: ' + releaseErr);
          } else {
            cb(null, previousBlock);
          }
        });
      }
    }
  
    library.dbLite.query('SAVEPOINT poplastblock');
    self.loadBlocksPart({id: oldLastBlock.previousBlock}, function (err, previousBlock) {
      if (err || !previousBlock.length) {
        return done(err || 'previousBlock is null');
      }
      previousBlock = previousBlock[0];

      async.eachSeries(oldLastBlock.transactions.reverse(), function (transaction, nextTr) {
        async.series([
          function (next) {
            modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
              if (err) {
                return next(err);
              }
              modules.transactions.undo(transaction, oldLastBlock, sender, cb);
            });
          }, function (next) {
            modules.transactions.undoUnconfirmed(transaction, next);
          }, function (next) {
            modules.transactions.pushHiddenTransaction(transaction);
            setImmediate(next);
          }
        ], nextTr);
      }, function (err) {
        modules.round.backwardTick(oldLastBlock, previousBlock, function () {
          private.deleteBlock(oldLastBlock.id, function (err) {
            if (err) {
              return done(err);
            }

            done(null, previousBlock);
          });
        });
      });
    });
  }, callback);
}

private.getIdSequence = function (height, cb) {
  library.dbLite.query("SELECT s.height, group_concat(s.id) from ( " +
    'SELECT id, max(height) as height ' +
    'FROM blocks ' +
    'group by (cast(height / $delegates as integer) + (case when height % $delegates > 0 then 1 else 0 end)) having height <= $height ' +
    'union ' +
    'select id, 1 as height ' +
    'from blocks where height = 1 ' +
    'order by height desc ' +
    'limit $limit ' +
    ') s', {
    'height': height,
    'limit': 1000,
    'delegates': slots.delegates
  }, ['firstHeight', 'ids'], function (err, rows) {
    if (err || !rows.length) {
      cb(err ? err.toString() : "Can't get sequence before: " + height);
      return;
    }

    cb(null, rows[0]);
  })
}

private.readDbRows = function (rows) {
  var blocks = {};
  var order = [];
  for (var i = 0, length = rows.length; i < length; i++) {
    var __block = library.base.block.dbRead(rows[i]);
    if (__block) {
      if (!blocks[__block.id]) {
        if (__block.id == genesisblock.block.id) {
          __block.generationSignature = (new Array(65)).join('0');
        }

        order.push(__block.id);
        blocks[__block.id] = __block;
      }

      var __transaction = library.base.transaction.dbRead(rows[i]);
      blocks[__block.id].transactions = blocks[__block.id].transactions || {};
      if (__transaction) {
        if (!blocks[__block.id].transactions[__transaction.id]) {
          blocks[__block.id].transactions[__transaction.id] = __transaction;
        }
      }
    }
  }

  blocks = order.map(function (v) {
    blocks[v].transactions = Object.keys(blocks[v].transactions).map(function (t) {
      return blocks[v].transactions[t];
    });
    return blocks[v];
  });

  return blocks;
}

private.applyTransaction = function (block, transaction, sender, cb) {
  modules.transactions.applyUnconfirmed(transaction, sender, function (err) {
    if (err) {
      return setImmediate(cb, {
        message: 'Failed to applyUnconfirmed transaction: ' + err,
        transaction: transaction,
        block: block
      });
    }

    modules.transactions.apply(transaction, block, sender, function (err) {
      if (err) {
        return setImmediate(cb, {
          message: "Can't apply transaction: " + transaction.id,
          transaction: transaction,
          block: block
        });
      }
      setImmediate(cb);
    });
  });
}

// Public methods
Blocks.prototype.getCommonBlock = function (peer, height, cb) {
  var commonBlock = null;
  var lastBlockHeight = height;
  var count = 0;

  async.whilst(
    function () {
      return !commonBlock && count < 30 && lastBlockHeight > 1;
    },
    function (next) {
      count++;
      private.getIdSequence(lastBlockHeight, function (err, data) {
        if (err) {
          return next(err)
        }
        var max = lastBlockHeight;
        lastBlockHeight = data.firstHeight;
        modules.transport.getFromPeer(peer, {
          api: "/blocks/common?ids=" + data.ids + '&max=' + max + '&min=' + lastBlockHeight,
          method: "GET"
        }, function (err, data) {
          if (err || data.body.error) {
            return next(err || data.body.error.toString());
          }

          if (!data.body.common) {
            return next();
          }

          library.dbLite.query("select count(*) from blocks where id = $id " + (data.body.common.previousBlock ? "and previousBlock = $previousBlock" : "") + " and height = $height", {
            "id": data.body.common.id,
            "previousBlock": data.body.common.previousBlock,
            "height": data.body.common.height
          }, {
            "cnt": Number
          }, function (err, rows) {
            if (err || !rows.length) {
              return next(err || "Can't compare blocks");
            }

            if (rows[0].cnt) {
              commonBlock = data.body.common;
            }
            next();
          });
        });
      });
    },
    function (err) {
      setImmediate(cb, err, commonBlock);
    }
  )
}

Blocks.prototype.count = function (cb) {
  library.dbLite.query("select count(rowid) from blocks", {"count": Number}, function (err, rows) {
    if (err) {
      return cb(err);
    }

    var res = rows.length ? rows[0].count : 0;

    cb(null, res);
  });
}

Blocks.prototype.loadBlocksData = function (filter, options, cb) {
  if (arguments.length < 3) {
    cb = options;
    options = {};
  }

  options = options || {};

  if (filter.lastId && filter.id) {
    return cb("Invalid filter");
  }

  var params = {limit: filter.limit || 1};
  filter.lastId && (params['lastId'] = filter.lastId);
  filter.id && !filter.lastId && (params['id'] = filter.id);

  var fields = private.blocksDataFields;
  var method;

  if (options.plain) {
    method = 'plain';
    fields = false;
  } else {
    method = 'query';
  }

  library.dbSequence.add(function (cb) {
    // "FROM (select * from blocks " + (filter.id ? " where id = $id " : "") + (filter.lastId ? " where height > (SELECT height FROM blocks where id = $lastId) " : "") + " limit $limit) as b " +

    library.dbLite.query("SELECT height FROM blocks where id = $lastId", {
      lastId: filter.lastId || null
    }, {'height': Number}, function (err, rows) {
      if (err) {
        return cb(err);
      }

      // (filter.lastId? " where height > (SELECT height FROM blocks where id = $lastId)" : "") +

      var height = rows.length ? rows[0].height : 0;
      var realLimit = height + (parseInt(filter.limit) || 1);
      params.limit = realLimit;
      params.height = height;

      var limitPart = "";

      if (!filter.id && !filter.lastId) {
        limitPart = "where b.height < $limit ";
      }

      library.dbLite[method]("SELECT " +
        "b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength, lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), " +
        "t.id, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), " +
        "lower(hex(s.publicKey)), " +
        "d.username, " +
        "v.votes, " +
        "m.min, m.lifetime, m.keysgroup, " +
        "dapp.name, dapp.description, dapp.tags, dapp.type, dapp.link, dapp.category, dapp.icon, " +
        "it.dappId, " +
        "ot.dappId, ot.outTransactionId, " +
        "lower(hex(t.requesterPublicKey)), t.signatures " +
        "FROM blocks b " +
        "left outer join trs as t on t.blockId=b.id " +
        "left outer join delegates as d on d.transactionId=t.id " +
        "left outer join votes as v on v.transactionId=t.id " +
        "left outer join signatures as s on s.transactionId=t.id " +
        "left outer join multisignatures as m on m.transactionId=t.id " +
        "left outer join dapps as dapp on dapp.transactionId=t.id " +
        "left outer join intransfer it on it.transactionId=t.id " +
        "left outer join outtransfer ot on ot.transactionId=t.id " +
        (filter.id || filter.lastId ? "where " : "") + " " +
        (filter.id ? " b.id = $id " : "") + (filter.id && filter.lastId ? " and " : "") + (filter.lastId ? " b.height > $height and b.height < $limit " : "") +
        limitPart +
        "ORDER BY b.height, t.rowid" +
        "", params, fields, cb);
    });

  }, cb);
};

Blocks.prototype.loadBlocksPart = function (filter, cb) {
  self.loadBlocksData(filter, function (err, rows) {
    // Notes:
    // If while loading we encounter an error, for example, an invalid signature on a block & transaction, then we need to stop loading and remove all blocks after the last good block. We also need to process all transactions within the block.

    var blocks = [];

    if (!err) {
      blocks = private.readDbRows(rows);
    }

    cb(err, blocks);
  });
}

Blocks.prototype.loadBlocksOffset = function (limit, offset, verify, cb) {
  var newLimit = limit + (offset || 0);
  var params = {limit: newLimit, offset: offset || 0};

  library.logger.debug("loadBlockOffset limit: " + limit + ", offset: " + offset + ", verify: " + verify);
  library.dbSequence.add(function (cb) {
    library.dbLite.query("SELECT " +
      "b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength, lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), " +
      "t.id, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), " +
      "lower(hex(s.publicKey)), " +
      "d.username, " +
      "v.votes, " +
      "m.min, m.lifetime, m.keysgroup, " +
      "dapp.name, dapp.description, dapp.tags, dapp.type, dapp.link, dapp.category, dapp.icon, " +
      "it.dappId, " +
      "ot.dappId, ot.outTransactionId, " +
      "lower(hex(t.requesterPublicKey)), t.signatures " +
      "FROM blocks b " +
      "left outer join trs as t on t.blockId=b.id " +
      "left outer join delegates as d on d.transactionId=t.id " +
      "left outer join votes as v on v.transactionId=t.id " +
      "left outer join signatures as s on s.transactionId=t.id " +
      "left outer join multisignatures as m on m.transactionId=t.id " +
      "left outer join dapps as dapp on dapp.transactionId=t.id " +
      "left outer join intransfer it on it.transactionId=t.id " +
      "left outer join outtransfer ot on ot.transactionId=t.id " +
      "where b.height >= $offset and b.height < $limit " +
      "ORDER BY b.height, t.rowid" +
      "", params, private.blocksDataFields, function (err, rows) {
      // Notes:
      // If while loading we encounter an error, for example, an invalid signature on a block & transaction, then we need to stop loading and remove all blocks after the last good block. We also need to process all transactions within the block.
      if (err) {
        return cb("loadBlockOffset db error: " + err);
      }

      var blocks = private.readDbRows(rows);

      async.eachSeries(blocks, function (block, next) {
        library.logger.debug("loadBlocksOffset processing:", block.id);
        if (verify && block.id != genesisblock.block.id) {
          self.verifyBlock(block, function(err) {
            if (err) {
              return next("Failed to verify block " + block.id);
            }
            self.applyBlock(block, false, next, false);
          });
        } else {
          self.applyBlock(block, false, next, false);
        }
      }, function (err) {
        cb(err, private.lastBlock);
      });
    });
  }, cb);
}

Blocks.prototype.loadLastBlock = function (cb) {
  library.dbSequence.add(function (cb) {
    library.dbLite.query("SELECT " +
      "b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength, lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), " +
      "t.id, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), " +
      "lower(hex(s.publicKey)), " +
      "d.username, " +
      "v.votes, " +
      "m.min, m.lifetime, m.keysgroup, " +
      "dapp.name, dapp.description, dapp.tags, dapp.type, dapp.link, dapp.category, dapp.icon, " +
      "it.dappId, " +
      "ot.dappId, ot.outTransactionId, " +
      "lower(hex(t.requesterPublicKey)), t.signatures " +
      "FROM blocks b " +
      "left outer join trs as t on t.blockId=b.id " +
      "left outer join delegates as d on d.transactionId=t.id " +
      "left outer join votes as v on v.transactionId=t.id " +
      "left outer join signatures as s on s.transactionId=t.id " +
      "left outer join multisignatures as m on m.transactionId=t.id " +
      "left outer join dapps as dapp on dapp.transactionId=t.id " +
      "left outer join intransfer it on it.transactionId=t.id " +
      "left outer join outtransfer ot on ot.transactionId=t.id " +
      "where b.height = (select max(height) from blocks) " +
      "ORDER BY b.height, t.rowid" +
      "", {}, private.blocksDataFields, function (err, rows) {
      if (err) {
        return cb(err);
      }

      var block = private.readDbRows(rows)[0];

      block.transactions = block.transactions.sort(function (a, b) {
        if (block.id == genesisblock.block.id) {
          if (a.type == TransactionTypes.VOTE)
            return 1;
        }

        if (a.type == TransactionTypes.SIGNATURE) {
          return 1;
        }

        return 0;
      });

      cb(null, block);
    });
  }, cb);
}

Blocks.prototype.getLastBlock = function () {
  return private.lastBlock;
}

Blocks.prototype.verifyBlock = function (block, cb) {
  try {
    block.id = library.base.block.getId(block);
  } catch (e) {
    return cb("Failed to get block id: " + e.toString());
  }

  block.height = private.lastBlock.height + 1;
  
  library.logger.debug("verifyBlock, id: " + block.id + ", h: " + block.height);
  
  if (!block.previousBlock && block.height != 1) {
    return cb("Previous block should not be null");
  }
  
  var expectedReward = private.blockStatus.calcReward(block.height);

	if (block.height != 1 && expectedReward !== block.reward) {
		return cb("Invalid block reward");
	}
  
  try {
    if (!library.base.block.verifySignature(block)) {
      return cb("Failed to verify block signature");
    }
  } catch (e) {
    return cb("Got exception while verify block signature: " + e.toString());
  }
  
  if (block.previousBlock != private.lastBlock.id) {
    modules.delegates.fork(block, 1);
    return cb('Incorrect previous block hash');
  }
  
  if (block.version > 0) {
		return cb("Invalid block version: " + block.version + ", id: " + block.id);
	}
  
  var blockSlotNumber = slots.getSlotNumber(block.timestamp);
	var lastBlockSlotNumber = slots.getSlotNumber(private.lastBlock.timestamp);

	if (blockSlotNumber > slots.getSlotNumber() || blockSlotNumber <= lastBlockSlotNumber) {
		return cb("Can't verify block timestamp: " + block.id);
	}

	if (block.payloadLength > constants.maxPayloadLength) {
		return cb("Can't verify payload length of block: " + block.id);
	}

	if (block.transactions.length != block.numberOfTransactions || block.transactions.length > constants.maxTxsPerBlock) {
		return cb("Invalid amount of block assets: " + block.id);
	}

	var totalAmount = 0,
	    totalFee = 0,
	    payloadHash = crypto.createHash('sha256'),
	    appliedTransactions = {};

	for (var i in block.transactions) {
		var transaction = block.transactions[i];

		try {
			var bytes = library.base.transaction.getBytes(transaction);
		} catch (e) {
			return cb("Failed to get transaction bytes: " + e.toString());
		}

		if (appliedTransactions[transaction.id]) {
			return cb("Duplicate transaction id in block " + block.id);
		}

		appliedTransactions[transaction.id] = transaction;
		payloadHash.update(bytes);
		totalAmount += transaction.amount;
		totalFee += transaction.fee;
	}

	if (payloadHash.digest().toString('hex') !== block.payloadHash) {
		return cb("Invalid payload hash: " + block.id);
	}

	if (totalAmount != block.totalAmount) {
		return cb("Invalid total amount: " + block.id);
	}

	if (totalFee != block.totalFee) {
		return cb("Invalid total fee: " + block.id);
	}
  
  return cb();
}

Blocks.prototype.applyBlock = function(block, broadcast, cb, saveBlock) {
	private.isActive = true;

	library.balancesSequence.add(function (cb) {
    library.dbLite.query('SAVEPOINT processblock');
    
		modules.transactions.undoUnconfirmedList(function (err, unconfirmedTransactions) {
			if (err) {
				private.isActive = false;
				return process.exit(0);
			}

			function done(err) {
        modules.transactions.applyUnconfirmedList(unconfirmedTransactions, function (applyErr) {
          if (applyErr || err) {
            var finalErr = 'processBlock err: ' + (applyErr || err);
            library.dbLite.query('ROLLBACK TO SAVEPOINT processblock', function (rollbackErr) {
              if (finishErr) {
                finalErr += ', rollback err: ' + rollbackErr;
              }
              private.isActive = false;
              cb(finalErr);
            });
          } else {
            library.dbLite.query('RELEASE SAVEPOINT processblock', function (releaseErr) {
              private.isActive = false;
              if (releaseErr) {
                cb('processBlock release savepoint err: ' + releaseErr);
              } else {
                cb();
              }
            });
          }
        });
      }

			var appliedTransactions = {};

			async.eachSeries(block.transactions, function (transaction, cb) {
				modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, function (err, sender) {
					modules.transactions.applyUnconfirmed(transaction, sender, function (err) {
						if (err) {
							return setImmediate(cb, "Failed to apply transaction: " + transaction.id);
						}
						appliedTransactions[transaction.id] = transaction;

						var index = unconfirmedTransactions.indexOf(transaction.id);
						if (index >= 0) {
							unconfirmedTransactions.splice(index, 1);
						}

						setImmediate(cb);
					});
				});
			}, function (err) {
				if (err) {

					async.eachSeries(block.transactions, function (transaction, cb) {
						modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (sender,cb) {
							if (appliedTransactions[transaction.id]) {
								library.base.transactions.undoUnconfirmed(transaction, sender, cb);
							} else {
								setImmediate(cb);
							}
						});
					}, function () {
						done(err);
					});
				} else {
					async.eachSeries(block.transactions, function (transaction, cb) {
						modules.accounts.setAccountAndGet({publicKey: transaction.senderPublicKey}, function (err, sender) {
							if (err) {
								library.logger.error("Failed to apply transactions: " + transaction.id);
								process.exit(0);
							}
							// DATABASE: write
							modules.transactions.apply(transaction, block, sender, function (err) {
								if (err) {
									library.logger.error("Failed to apply transactions: " + transaction.id);
									process.exit(0);
								}
								modules.transactions.removeUnconfirmedTransaction(transaction.id);
								setImmediate(cb);
							});
						});
					}, function (err) {
						if (saveBlock) {
							private.saveBlock(block, function (err) {
							 if (err) {
								 library.logger.error("Failed to save block...");
								 process.exit(0);
							 }

							 library.logger.debug("Block applied corrrectly with " + block.transactions.length + " transactions");
							 library.bus.message('newBlock', block, broadcast);
							 private.lastBlock = block;

							 modules.round.tick(block, done);
						 });
						} else {
							library.bus.message('newBlock', block, broadcast);
							private.lastBlock = block;
							modules.round.tick(block, done);
						}
					});
				}
			});
		});
	}, cb);
}

Blocks.prototype.processBlock = function (block, broadcast, cb) {
  if (!private.loaded) {
    return setImmediate(cb, "Blockchain is loading");
  }
  try {
		block = library.base.block.objectNormalize(block);
	} catch (e) {
		return setImmediate(cb, "Failed to normalize block: " + e.toString());
	}
  
  self.verifyBlock(block, function (err) {
    if (err) {
      return setImmediate(cb, "Failed to verify block: " + err);
    }
    
    library.dbLite.query("SELECT id FROM blocks WHERE id=$id", { id: block.id }, ['id'], function (err, rows) {
      if (err) {
        return setImmediate(cb, "Failed to query blocks from db: " + err);
      }
      var bId = rows.length && rows[0].id;
      if (bId) {
        return setImmediate(cb, "Block already exists: " + block.id);
      }
      modules.delegates.validateBlockSlot(block, function (err) {
        if (err) {
          modules.delegates.fork(block, 3);
          return setImmediate(cb, "Can't verify slot: " + err);
        }
        async.eachSeries(block.transactions, function (transaction, next) {
          async.waterfall([
            function (next) {
              try {
                transaction.id = library.base.transaction.getId(transaction);
              } catch (e) {
                return next(e.toString());
              }
              transaction.blockId = block.id;

              library.dbLite.query("SELECT id FROM trs WHERE id=$id", { id: transaction.id }, ['id'], function (err, rows) {
                if (err) {
                  next("Failed to query transaction from db: " + err);
                } else if (rows.length > 0) {
                  modules.delegates.fork(block, 2);
                  next("Transaction already exists: " + transaction.id);
                } else {
                  modules.accounts.getAccount({ publicKey: transaction.senderPublicKey }, next);
                }
              });
            },
            function (sender, next) {
              library.base.transaction.verify(transaction, sender, next);
            }
          ], next);
        }, function (err) {
          if (err) {
            return setImmediate(cb, "Failed to verify transaction: " + err);
          }
          self.applyBlock(block, broadcast, cb, true);
        });
      });
    });
  });
}

Blocks.prototype.simpleDeleteAfterBlock = function (blockId, cb) {
  library.dbLite.query("DELETE FROM blocks WHERE height >= (SELECT height FROM blocks where id = $id)", {id: blockId}, cb);
}

Blocks.prototype.loadBlocksFromPeer = function (peer, lastCommonBlockId, cb) {
  var loaded = false;
  var count = 0;
  var lastValidBlock = null;

  async.whilst(
    function () {
      return !loaded && count < 30;
    },
    function (next) {
      count++;
      modules.transport.getFromPeer(peer, {
        method: "GET",
        api: '/blocks?lastBlockId=' + lastCommonBlockId
      }, function (err, data) {
        if (err || data.body.error) {
          return next(err || data.body.error.toString());
        }

        var blocks = data.body.blocks;

        if (typeof blocks === "string") {
          blocks = library.dbLite.parseCSV(blocks);
        }

        var report = library.scheme.validate(blocks, {
          type: "array"
        });

        if (!report) {
          return next("Error, can't parse blocks...");
        }

        blocks = blocks.map(library.dbLite.row2parsed, library.dbLite.parseFields(private.blocksDataFields));
        blocks = private.readDbRows(blocks);

        if (blocks.length == 0) {
          loaded = true;
          next();
        } else {
          var peerStr = data.peer ? ip.fromLong(data.peer.ip) + ":" + data.peer.port : 'unknown';
          library.logger.log('Loading ' + blocks.length + ' blocks from', peerStr);

          async.eachSeries(blocks, function (block, cb) {
            try {
              block = library.base.block.objectNormalize(block);
            } catch (e) {
              library.logger.log('Block ' + (block ? block.id : 'null') + ' is not valid, ban 60 min', peerStr);
              modules.peer.state(peer.ip, peer.port, 0, 3600);
              return cb(e);
            }
            self.processBlock(block, false, function (err) {
              if (!err) {
                lastCommonBlockId = block.id;
                lastValidBlock = block;
                library.logger.log('Block ' + block.id + ' loaded from ' + peerStr + ' at', block.height);
              } else {
                library.logger.log('Block ' + (block ? block.id : 'null') + ' is not valid, ban 60 min', peerStr);
                modules.peer.state(peer.ip, peer.port, 0, 3600);
              }

              return cb(err);
            });
          }, next);
        }
      });
    },
    function (err) {
      setImmediate(cb, err, lastValidBlock);
    }
  )
}

Blocks.prototype.deleteBlocksBefore = function (block, cb) {
  var blocks = [];

  async.whilst(
    function () {
      return !(block.height >= private.lastBlock.height)
    },
    function (next) {
      blocks.unshift(private.lastBlock);
      private.popLastBlock(private.lastBlock, function (err, newLastBlock) {
        private.lastBlock = newLastBlock;
        next(err);
      });
    },
    function (err) {
      setImmediate(cb, err, blocks);
    }
  );
}

Blocks.prototype.generateBlock = function (keypair, timestamp, cb) {
  var transactions = modules.transactions.getUnconfirmedTransactionList(false, constants.maxTxsPerBlock);
  var ready = [];

  async.eachSeries(transactions, function (transaction, next) {
    modules.accounts.getAccount({publicKey: transaction.senderPublicKey}, function (err, sender) {
      if (err || !sender) {
        return next("Invalid sender");
      }

      if (library.base.transaction.ready(transaction, sender)) {
        library.base.transaction.verify(transaction, sender, function (err) {
          ready.push(transaction);
          next();
        });
      } else {
        setImmediate(next);
      }
    });
  }, function () {
    try {
      var block = library.base.block.create({
        keypair: keypair,
        timestamp: timestamp,
        previousBlock: private.lastBlock,
        transactions: ready
      });
    } catch (e) {
      return setImmediate(cb, e);
    }

    // self.processBlock(block, true, cb);
    
    library.logger.info("Generate new block at height " + (private.lastBlock.height + 1));
    // TODO sequence need?
    self.prepareBlock(block, function (err) {
      if (err) {
        library.logger.error("Failed to generate block: " + err); 
      }
      cb(err);
    });
  });
}

Blocks.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Blocks.prototype.prepareBlock = function (block, cb) {
  self.verifyBlock(block, function (err) {
    if (err) {
      cb("Can't verify block when prepare block: " + err);
      return;
    }
    self.addPendingBlock(block);
    library.bus.message('newBlock', block, true);

    modules.delegates.getActiveDelegateKeypairs(block.height, function (err, keypairs) {
      if (err) {
        cb("Failed to get active delegate keyparis: " + err);
        return;
      }
      if (keypairs.length == 0) {
        cb();
        return;
      }
      library.logger.debug("getActiveDelegateKeypairs length: " + keypairs.length);
      var confirm = { height: block.height, id: block.id, signatures: [] };
      var hash = self.getConfirmHash(block.height, block.id);
      keypairs.forEach(function (el) {
        confirm.signatures.push({
          key: el.publicKey.toString('hex'),
          sig: ed.Sign(hash, el).toString('hex')
        });
      });
      self.onReceiveConfirm(confirm);
      cb();
    });
  });
}

Blocks.prototype.addPendingBlock = function (block) {
  var blocksOfHeight = pendingBlocks[block.height];
  if (!blocksOfHeight) {
    blocksOfHeight = pendingBlocks[block.height] = {};
  }
  if (!blocksOfHeight[block.id]) {
    blocksOfHeight[block.id] = block;
  }
}

Blocks.prototype.getPendingBlock = function (height, id) {
  return pendingBlocks[height] && pendingBlocks[height][id];
}

Blocks.prototype.addBlockConfirm = function (height, id, key) {
  var statsOfHeight = confirmStats[height];
  if (!statsOfHeight) {
    statsOfHeight = confirmStats[height] = {};
  }
  var statsOfId = statsOfHeight[id];
  if (!statsOfId) {
    statsOfId = statsOfHeight[id] = { votes: 0 };
  }
  if (!statsOfId[key]) {
    statsOfId[key] = true;
    statsOfId.votes++;
  }
  return statsOfId;
}

Blocks.prototype.getBlockConfirm = function (height, id) {
  return confirmStats[height] && confirmStats[height][id];
}

Blocks.prototype.checkBlockConfirms = function (block, cb) {
  var height = block.height;
  var id = block.id;
  var confirmDetail = self.getBlockConfirm(height, id);
  if (!confirmDetail) {
    return setImmediate(cb);
  }
  library.logger.debug("votes for block id " + id + " and height " + height + ": " + confirmDetail.votes);
  if (confirmDetail.votes > slots.delegates * 2 / 3 + 1) {
    self.processBlock(block, false, function (err) {
      if (err) {
        return cb("Failed to process confirmed block height: " + height + " id: " + id + " error: " + err);
      }
      delete pendingBlocks[height];
      delete confirmStats[height];
      confirmCache = {};
      library.logger.log('Forged new block id: ' + id +
        ' height: ' + height +
        ' round: ' + modules.round.calc(height) +
        ' slot: ' + slots.getSlotNumber(block.timestamp) +
        ' reward: ' + block.reward);
      library.bus.message('confirmBlock', block, true);
      return cb();
    });
  } else {
    return setImmediate(cb);
  }
}

Blocks.prototype.getConfirmHash = function (height, id) {
  var bytes = new ByteBuffer();
  bytes.writeLong(height);
  var idBytes = bignum(id).toBuffer({ size: 8 });
  for (var j = 0; j < 8; j++) {
    bytes.writeByte(idBytes[j]);
  }
  bytes.flip();
  return crypto.createHash('sha256').update(bytes.toBuffer()).digest();
}

// Events
Blocks.prototype.onReceiveBlock = function (block) {
  if (modules.loader.syncing() || !private.loaded) {
    return;
  }
  
  if (self.getPendingBlock(block.height, block.id)) {
    return;
  }

  if (block.previousBlock == private.lastBlock.id && private.lastBlock.height + 1 == block.height) {
    library.logger.log('Received new block id: ' + block.id + ' height: ' + block.height + ' slot: ' + slots.getSlotNumber(block.timestamp) + ' reward: ' + modules.blocks.getLastBlock().reward)
    self.prepareBlock(block, function (err) {
      if (err) {
        library.logger.error("Failed to prepare block: " + err);
      }
      // cb(err);
    })
  } else if (block.previousBlock != private.lastBlock.id && private.lastBlock.height + 1 == block.height) {
    // Fork right height and different previous block
    modules.delegates.fork(block, 1);
    // cb("Fork");
  } else if (block.previousBlock == private.lastBlock.previousBlock && block.height == private.lastBlock.height && block.id != private.lastBlock.id) {
    // Fork same height and same previous block, but different block id
    modules.delegates.fork(block, 5);
    // cb("Fork");
  } else {
    // cb();
  }
}

Blocks.prototype.hasConfirmCache = function (confirm) {
  var key = confirm.height + ":" + confirm.id + ":" + confirm.signatures[0].key;
  return !!confirmCache[key];
}

Blocks.prototype.setConfirmCache = function (confirm) {
  var key = confirm.height + ":" + confirm.id + ":" + confirm.signatures[0].key;
  confirmCache[key] = true;
}

Blocks.prototype.isUsefullConfirm = function (confirm) {
  var height = confirm.height;
  var id = confirm.id;
  
  if (!confirm.signatures || confirm.signatures.length <= 0) {
    return false;
  }
  var currentBlockConfirm = self.getBlockConfirm(height, id);
  if (currentBlockConfirm && currentBlockConfirm[confirm.signatures[0].key]) {
    return false;
  }
  return true;
}

Blocks.prototype.onReceiveConfirm = function (confirm) {
  var height = confirm.height;
  var id = confirm.id;
  
  if (!self.isUsefullConfirm(confirm)) {
    return;
  }
  
  if (self.hasConfirmCache(confirm)) {
    return;
  }
  
  self.setConfirmCache(confirm);

  library.logger.debug("onReceiveConfirm height: " + height + ", id: " + id + ", count: " + confirm.signatures.length);
  library.bus.message('confirm', confirm, true);
  
  library.sequence.add(function (cb) {
    var block = self.getPendingBlock(height, id);
    if (!block) {
      library.logger.debug("no pending block before check confirms on id " + id + " height " + height);
      return cb();
    }
    modules.delegates.generateDelegateList(height, function (err, delegatesList) {
      if (err) {
        library.logger.error("Failed to get delegate list while verifying confirms");
        process.exit(-1);
        return;
      }
      var publicKeySet = {};
      delegatesList.forEach(function (item) {
        publicKeySet[item] = true;
      });
      for (var i = 0; i < confirm.signatures.length; ++i) {
        var item = confirm.signatures[i];
        if (!publicKeySet[item.key]) {
          library.logger.debug("generator publickey is not in the top list: " + item.key);
          continue;
        }
        try {
          var signature = new Buffer(item.sig, "hex");
          var publicKey = new Buffer(item.key, "hex");
          var hash = self.getConfirmHash(height, id);
          if (ed.Verify(hash, signature, publicKey)) {
            self.addBlockConfirm(height, id, item.key);
          } else {
            library.logger.error("Failed to verify confirm signature");
          }
        } catch (e) {
          library.logger.error("Verify confirm signature exception: " + e);
        }
      }
      self.checkBlockConfirms(block, function (err) {
        if (err) {
          library.logger.error("checkBlockConfirms error: " + err);
        }
        cb(err);
      });
    });
  });
}

Blocks.prototype.onBind = function (scope) {
  modules = scope;

  private.loaded = true;
}

Blocks.prototype.cleanup = function (cb) {
  private.loaded = false;
  if (!private.isActive) {
    cb();
  } else {
    setImmediate(function nextWatch() {
      if (private.isActive) {
        setTimeout(nextWatch, 1 * 1000)
      } else {
        cb();
      }
    });
  }
}

// Shared
shared.getBlock = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      id: {
        type: 'string',
        minLength: 1
      },
      height: {
        type: 'integer',
        minimum: 1
      },
      hash: {
        type: 'string',
        minLength: 1
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    library.dbSequence.add(function (cb) {
      var field;
      var keys = ['id', 'height', 'hash'];
      for (var i in keys) {
        var key = keys[i];
        if (query[key]) {
          field = {key: key, value: query[key]};
          break;
        }
      }
      if (!field) {
        return cb("Invalid params");
      }
      private.getByField(field, function (err, block) {
        if (!block || err) {
          return cb("Block not found");
        }
        cb(null, {block: block});
      });
    }, cb);
  });
}

shared.getBlocks = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      limit: {
        type: "integer",
        minimum: 0,
        maximum: 100
      },
      orderBy: {
        type: "string"
      },
      offset: {
        type: "integer",
        minimum: 0
      },
      generatorPublicKey: {
        type: "string",
        format: "publicKey"
      },
      totalAmount: {
        type: "integer",
        minimum: 0,
        maximum: constants.totalAmount
      },
      totalFee: {
        type: "integer",
        minimum: 0,
        maximum: constants.totalAmount
      },
      reward: {
        type: "integer",
        minimum: 0
      },
      previousBlock: {
        type: "string"
      },
      height: {
        type: "integer"
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    library.dbSequence.add(function (cb) {
      private.list(query, function (err, data) {
        if (err) {
          return cb("Database error");
        }
        cb(null, {blocks: data.blocks, count: data.count});
      });
    }, cb);
  });
}

shared.getHeight = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body;
  cb(null, {height: private.lastBlock.height});
}

shared.getFee = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body;
  cb(null, {fee: library.base.block.calculateFee()});
}

shared.getMilestone = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, {milestone: private.blockStatus.calcMilestone(height)});
}

shared.getReward = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, {reward: private.blockStatus.calcReward(height)});
}

shared.getSupply = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, {supply: private.blockStatus.calcSupply(height)});
}

shared.getStatus = function (req, cb) {
  if (!private.loaded) {
    cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, {
    height:    height,
    fee:       library.base.block.calculateFee(),
    milestone: private.blockStatus.calcMilestone(height),
    reward:    private.blockStatus.calcReward(height),
    supply:    private.blockStatus.calcSupply(height)
  });
}

// Export
module.exports = Blocks;
