
var assert = require('assert');
var crypto = require('crypto');
var ip = require('ip');
var ByteBuffer = require("bytebuffer");
var async = require('async');
var ed = require('../utils/ed.js');
var bignum = require('bignumber');
var constants = require("../utils/constants.js");
var BlockStatus = require("../utils/block-status.js");
var constants = require('../utils/constants.js');
var Router = require('../utils/router.js');
var slots = require('../utils/slots.js');
var TransactionTypes = require('../utils/transaction-types.js');
var sandboxHelper = require('../utils/sandbox.js');

require('array.prototype.findindex'); // Old node fix

var genesisblock = null;
// Private fields
var modules, library, self, private = {}, shared = {};

private.lastBlock = {};
private.blockStatus = new BlockStatus();
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
  't_args': String,
  't_message': String,
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
  'dapp_delegates': String,
  'dapp_unlockDelegates': Number,
  'it_dappId': String,
  'it_currency': String,
  'it_amount': String,
  'ot_dappId': String,
  'ot_outTransactionId': String,
  'ot_currency': String,
  'ot_amount': String,
  't_requesterPublicKey': String,
  't_signatures': String,
  'st_content': String,
  'issuers_name': String,
  'issuers_desc': String,
  'assets_name': String,
  'assets_desc': String,
  'assets_maximum': String,
  'assets_precision': Number,
  'assets_strategy': String,
  'assets_allowWriteoff': Number,
  'assets_allowWhitelist': Number,
  'assets_allowBlacklist': Number,
  'flags_currency': String,
  'flags_flag': Number,
  'flags_flagType': Number,
  'issues_currency': String,
  'issues_amount': String,
  'transfers_currency': String,
  'transfers_amount': String,
  'acls_currency': String,
  'acls_flag': Number,
  'acls_operator': String,
  'acls_list': String,
};
// @formatter:on
private.loaded = false;
private.isActive = false;

private.blockCache = {};
private.proposeCache = {};
private.lastPropose = null;

const FULL_BLOCK_QUERY = "SELECT " +
  "b.id, b.version, b.timestamp, b.height, b.previousBlock, b.numberOfTransactions, b.totalAmount, b.totalFee, b.reward, b.payloadLength, lower(hex(b.payloadHash)), lower(hex(b.generatorPublicKey)), lower(hex(b.blockSignature)), " +
  "t.id, t.type, t.timestamp, lower(hex(t.senderPublicKey)), t.senderId, t.recipientId, t.amount, t.fee, lower(hex(t.signature)), lower(hex(t.signSignature)), t.args, t.message, " +
  "lower(hex(s.publicKey)), " +
  "d.username, " +
  "v.votes, " +
  "m.min, m.lifetime, m.keysgroup, " +
  "dapp.name, dapp.description, dapp.tags, dapp.type, dapp.link, dapp.category, dapp.icon, dapp.delegates, dapp.unlockDelegates, " +
  "it.dappId, it.currency, it.amount, " +
  "ot.dappId, ot.outTransactionId, ot.currency, ot.amount, " +
  "lower(hex(t.requesterPublicKey)), t.signatures, " +
  "lower(hex(st.content)), " +
  "issuers.name, issuers.desc, " +
  "assets.name, assets.desc, assets.maximum, assets.precision, assets.strategy, assets.allowWriteoff, assets.allowWhitelist, assets.allowBlacklist, " +
  "flags.currency, flags.flag, flags.flagType, " +
  "issues.currency, issues.amount, " +
  "transfers.currency, transfers.amount, " +
  "acls.currency, acls.flag, acls.operator, acls.list " +
  "FROM blocks b " +
  "left outer join trs as t on t.blockId=b.id " +
  "left outer join delegates as d on d.transactionId=t.id " +
  "left outer join votes as v on v.transactionId=t.id " +
  "left outer join signatures as s on s.transactionId=t.id " +
  "left outer join multisignatures as m on m.transactionId=t.id " +
  "left outer join dapps as dapp on dapp.transactionId=t.id " +
  "left outer join intransfer it on it.transactionId=t.id " +
  "left outer join outtransfer ot on ot.transactionId=t.id " +
  "left outer join storages st on st.transactionId=t.id " +
  "left outer join issuers on issuers.transactionId=t.id " +
  "left outer join assets on assets.transactionId=t.id " +
  "left outer join flags on flags.transactionId=t.id " +
  "left outer join issues on issues.transactionId=t.id " +
  "left outer join transfers on transfers.transactionId=t.id " +
  "left outer join acls on acls.transactionId=t.id ";

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
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.map(shared, {
    "get /get": "getBlock",
    "get /full": "getFullBlock",
    "get /": "getBlocks",
    "get /getHeight": "getHeight",
    "get /getFee": "getFee",
    "get /getMilestone": "getMilestone",
    "get /getReward": "getReward",
    "get /getSupply": "getSupply",
    "get /getStatus": "getStatus"
  });

  router.use(function (req, res, next) {
    res.status(500).send({ success: false, error: "API endpoint not found" });
  });

  library.network.app.use('/api/blocks', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.saveGenesisBlock = function (cb) {
  library.dbLite.query("SELECT id FROM blocks WHERE id=$id", { id: genesisblock.block.id }, ['id'], function (err, rows) {
    if (err) {
      return cb(err)
    }
    var blockId = rows.length && rows[0].id;

    if (!blockId) {
      library.dbLite.query("SAVEPOINT savegenesisblock");
      private.saveBlock(genesisblock.block, function (err) {
        if (err) {
          library.logger.error('saveGenesisBlock error', err);
          library.dbLite.query("ROLLBACK TO SAVEPOINT savegenesisblock", function (rollbackErr) {
            if (rollbackErr) {
              library.logger.error("Failed to rollback savegenesisblock: " + rollBackErr);
            }
            process.exit(1);
          });
        } else {
          library.dbLite.query("RELEASE SAVEPOINT savegenesisblock", function (releaseErr) {
            if (releaseErr) {
              library.logger.error("Failed to commit genesis block: " + releaseErr);
              process.exit(1);
            } else {
              cb();
            }
          });
        }
      });
    } else {
      cb()
    }
  });
}

private.deleteBlock = function (blockId, cb) {
  library.dbLite.query("DELETE FROM blocks WHERE id = $id", { id: blockId }, function (err, res) {
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
    (fields.length ? "where " + fields.join(' and ') : ''), params, { count: Number }, function (err, rows) {
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
  library.base.block.dbSave(block, function (err) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(block.transactions, function (transaction, cb) {
      transaction.blockId = block.id;
      library.base.transaction.dbSave(transaction, cb);
    }, cb);
  });
}

private.popLastBlock = function (oldLastBlock, callback) {
  library.balancesSequence.add(function (cb) {
    function done(err, previousBlock) {
      if (err) {
        var finalErr = 'popLastBlock err: ' + err;
        library.dbLite.query('ROLLBACK TO SAVEPOINT poplastblock', function (rollbackErr) {
          if (rollbackErr) {
            finalErr += ', rollback err: ' + rollbackErr;
          }
          cb(finalErr);
        });
      } else {
        library.dbLite.query('RELEASE SAVEPOINT poplastblock', function (releaseErr) {
          if (releaseErr) {
            cb('popLastBlock release savepoint error: ' + releaseErr);
          } else {
            cb(null, previousBlock);
          }
        });
      }
    }
    library.logger.info('begin to pop block ' + oldLastBlock.height + ' ' + oldLastBlock.id);

    library.dbLite.query('SAVEPOINT poplastblock');
    self.loadBlocksPart({ id: oldLastBlock.previousBlock }, function (err, previousBlock) {
      if (err || !previousBlock.length) {
        return done(err || 'previousBlock is null');
      }
      previousBlock = previousBlock[0];
      var transactions = library.base.block.sortTransactions(oldLastBlock);
      async.eachSeries(transactions.reverse(), function (transaction, nextTr) {
        async.series([
          function (next) {
            modules.accounts.getAccount({ publicKey: transaction.senderPublicKey }, function (err, sender) {
              if (err) {
                return next(err);
              }
              library.logger.info('undo transacton', JSON.stringify(transaction));
              modules.transactions.undo(transaction, oldLastBlock, sender, next);
            });
          }, function (next) {
            modules.transactions.undoUnconfirmed(transaction, next);
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
  }, function (err, previousBlock) {
    callback(err, previousBlock);
  });
}

// deprecated
private.getIdSequence = function (height, cb) {
  library.dbLite.query('SELECT s.height, group_concat(s.id) from ( ' +
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
      'limit': 2,
      'delegates': slots.delegates
    }, ['firstHeight', 'ids'], function (err, rows) {
      if (err || !rows.length) {
        cb(err ? err.toString() : "Can't get sequence before: " + height);
        return;
      }

      cb(null, rows[0]);
    })
}

private.getIdSequence2 = function (height, cb) {
  library.dbLite.query('SELECT s.height, group_concat(s.id) from ' +
    '(SELECT id, height from blocks order by height desc limit 5) s',
    { 'height': height },
    ['firstHeight', 'ids'],
    function (err, rows) {
      if (err || !rows.length) {
        cb(err ? err.toString() : "Can't get sequence before: " + height);
        return;
      }
      cb(null, rows[0]);
    });
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
      private.getIdSequence2(lastBlockHeight, function (err, data) {
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

          library.dbLite.query("select previousBlock from blocks where id = $id " + " and height = $height", {
            "id": data.body.common.id,
            "height": data.body.common.height
          }, {
              "previousBlock": String
            }, function (err, rows) {
              if (err || !rows.length) {
                return next(err || "Can't compare blocks");
              }

              if (data.body.common.previousBlock === rows[0].previousBlock) {
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
  library.dbLite.query("select count(rowid) from blocks", { "count": Number }, function (err, rows) {
    if (err) {
      return cb(err);
    }

    var res = rows.length ? rows[0].count : 0;

    cb(null, res);
  });
}

Blocks.prototype.getBlock = function (filter, cb) {
  shared.getBlock({ body: filter }, cb);
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

  var params = { limit: filter.limit || 1 };
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
    }, { 'height': Number }, function (err, rows) {
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

      library.dbLite[method](FULL_BLOCK_QUERY +
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
  var params = { limit: newLimit, offset: offset || 0 };

  library.logger.debug("loadBlockOffset limit: " + limit + ", offset: " + offset + ", verify: " + verify);
  library.dbSequence.add(function (cb) {
    library.dbLite.query(FULL_BLOCK_QUERY +
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
          block.transactions = library.base.block.sortTransactions(block);
          if (verify) {
            if (!private.lastBlock || !private.lastBlock.id) {
              // apply genesis block
              self.applyBlock(block, null, false, false, next);
            } else {
              self.verifyBlock(block, null, function (err) {
                if (err) {
                  return next(err);
                }
                self.applyBlock(block, null, false, false, next);
              });
            }
          } else {
            self.setLastBlock(block);
            setImmediate(next);
          }
        }, function (err) {
          cb(err, private.lastBlock);
        });
      });
  }, cb);
}

Blocks.prototype.setLastBlock = function (block) {
  private.lastBlock = block
  if (global.Config.netVersion === 'mainnet') {
    global.featureSwitch.enableLongId = private.lastBlock.height >= 1700000
    global.featureSwitch.enable1_3_0 = private.lastBlock.height >= 2920000
    global.featureSwitch.enableClubBonus = private.lastBlock.height >= 3320000
    global.featureSwitch.enableMoreLockTypes = global.featureSwitch.enableClubBonus
    global.featureSwitch.enableLockReset = private.lastBlock.height >= 4290000
  } else {
    global.featureSwitch.enableLongId = true
    global.featureSwitch.enable1_3_0 = true
    global.featureSwitch.enableClubBonus = (!!global.state.clubInfo)
    global.featureSwitch.enableMoreLockTypes = true
    global.featureSwitch.enableLockReset = true
  }
  global.featureSwitch.fixVoteNewAddressIssue = true
  if (global.Config.netVersion === 'mainnet' && private.lastBlock.height < 1854000) {
    global.featureSwitch.fixVoteNewAddressIssue = false
  }
  global.featureSwitch.enableUIA = global.featureSwitch.enableLongId
}

Blocks.prototype.getLastBlock = function () {
  return private.lastBlock;
}

Blocks.prototype.verifyBlock = function (block, votes, cb) {
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

  if (blockSlotNumber > slots.getSlotNumber() + 1 || blockSlotNumber <= lastBlockSlotNumber) {
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

  if (votes) {
    if (block.height != votes.height) {
      return cb("Votes height is not correct");
    }
    if (block.id != votes.id) {
      return cb("Votes id is not correct");
    }
    if (!votes.signatures || !library.base.consensus.hasEnoughVotesRemote(votes)) {
      return cb("Votes signature is not correct");
    }
    self.verifyBlockVotes(block, votes, cb);
  } else {
    cb();
  }
}

Blocks.prototype.verifyBlockVotes = function (block, votes, cb) {
  modules.delegates.generateDelegateList(block.height, function (err, delegatesList) {
    if (err) {
      library.logger.error("Failed to get delegate list while verifying block votes");
      process.exit(-1);
      return;
    }
    var publicKeySet = {};
    delegatesList.forEach(function (item) {
      publicKeySet[item] = true;
    });
    for (var i = 0; i < votes.signatures.length; ++i) {
      var item = votes.signatures[i];
      if (!publicKeySet[item.key]) {
        return cb("Votes key is not in the top list: " + item.key);
      }
      if (!library.base.consensus.verifyVote(votes.height, votes.id, item)) {
        return cb("Failed to verify vote");
      }
    }
    cb();
  });
}

Blocks.prototype.applyBlock = function (block, votes, broadcast, saveBlock, callback) {
  private.isActive = true;
  var applyedTrsIdSet = new Set
  function doApplyBlock(cb) {
    library.dbLite.query('SAVEPOINT applyblock');

    function done(err) {
      if (err) {
        library.balanceCache.rollback()
        var finalErr = 'applyBlock err: ' + err;
        library.dbLite.query('ROLLBACK TO SAVEPOINT applyblock', function (rollbackErr) {
          if (rollbackErr) {
            library.logger.error('Failed to rollback to savepoint applyblock: ' + rollbackErr)
            process.exit(1)
            return
          }
          private.isActive = false;
          cb(err);
        });
      } else {
        library.dbLite.query('RELEASE SAVEPOINT applyblock', function (releaseErr) {
          private.isActive = false;
          if (releaseErr) {
            library.logger.error('Failed to commit savepoint applyblock: ' + releaseErr)
            process.exit(1)
            return
          } else {
            self.setLastBlock(block);
            library.oneoff.clear()
            library.balanceCache.commit()
            private.blockCache = {};
            private.proposeCache = {};
            private.lastVoteTime = null;
            library.base.consensus.clearState();
            if (broadcast) {
              library.logger.info("Block applied correctly with " + block.transactions.length + " transactions");
              votes.signatures = votes.signatures.slice(0, 6);
              library.bus.message('newBlock', block, votes, true);
            }
            cb();
          }
        });
      }
    }
    var sortedTrs = block.transactions.sort(function (a, b) {
      if (a.type == 1) {
        return 1;
      }
      return 0;
    });
    async.eachSeries(sortedTrs, function (transaction, nextTr) {
      async.waterfall([
        function (next) {
          modules.accounts.setAccountAndGet({ publicKey: transaction.senderPublicKey, isGenesis: block.height == 1 }, next);
        },
        function (sender, next) {
          // if (modules.transactions.hasUnconfirmedTransaction(transaction)) {
          //   return next(null, sender);
          // }
          modules.transactions.applyUnconfirmed(transaction, sender, function (err) {
            if (err && global.Config.netVersion === 'mainnet' &&
              (block.height == 4659 || block.height == 7091 || block.height == 11920)) {
              next(null, sender);
            } else {
              next(err, sender);
            }
          });
        },
        function (sender, next) {
          modules.transactions.apply(transaction, block, sender, next);
        }
      ], function (err) {
        modules.transactions.removeUnconfirmedTransaction(transaction.id);
        if (err) {
          var errorContext = {
            transaction: transaction,
            block: block,
            error: err
          };
          library.logger.error("Failed to apply transaction", errorContext);
          nextTr(err);
          return;
        }
        applyedTrsIdSet.add(transaction.id)
        nextTr();
      });
    }, function (err) {
      if (err) {
        return done(err);
      }
      library.logger.debug("apply block ok");
      if (saveBlock) {
        private.saveBlock(block, function (err) {
          if (err) {
            library.logger.error("Failed to save block: " + err);
            process.exit(1);
            return;
          }
          library.logger.debug("save block ok");
          modules.round.tick(block, done);
        });
      } else {
        modules.round.tick(block, done);
      }
    });
  }

  library.balancesSequence.add(function (cb) {
    var unconfirmedTrs = modules.transactions.getUnconfirmedTransactionList(true);
    modules.transactions.undoUnconfirmedList(function (err) {
      if (err) {
        library.logger.error('Failed to undo uncomfirmed transactions', err);
        return process.exit(0);
      }
      library.oneoff.clear()
      doApplyBlock(function (err) {
        if (err) {
          library.logger.error('Failed to apply block: ' + err)
        }
        var redoTrs = unconfirmedTrs.filter((item) => !applyedTrsIdSet.has(item.id))
        modules.transactions.receiveTransactions(redoTrs, function (err) {
          if (err) {
            library.logger.error('Failed to redo unconfirmed transactions', err);
          }
          cb()
        });
      })
    });
  }, callback);
}

Blocks.prototype.processBlock = function (block, votes, broadcast, save, verifyTrs, cb) {
  if (!private.loaded) {
    return setImmediate(cb, "Blockchain is loading");
  }
  try {
    block = library.base.block.objectNormalize(block);
  } catch (e) {
    return setImmediate(cb, "Failed to normalize block: " + e.toString());
  }
  block.transactions = library.base.block.sortTransactions(block);
  self.verifyBlock(block, votes, function (err) {
    if (err) {
      return setImmediate(cb, "Failed to verify block: " + err);
    }
    library.logger.debug("verify block ok");
    library.dbLite.query("SELECT id FROM blocks WHERE id=$id", { id: block.id }, ['id'], function (err, rows) {
      if (err) {
        return setImmediate(cb, "Failed to query blocks from db: " + err);
      }
      var bId = rows.length && rows[0].id;
      if (bId && save) {
        return setImmediate(cb, "Block already exists: " + block.id);
      }
      modules.delegates.validateBlockSlot(block, function (err) {
        if (err) {
          modules.delegates.fork(block, 3);
          return setImmediate(cb, "Can't verify slot: " + err);
        }
        library.logger.debug("verify block slot ok");
        async.eachSeries(block.transactions, function (transaction, next) {
          async.waterfall([
            function (next) {
              modules.accounts.setAccountAndGet({ publicKey: transaction.senderPublicKey }, next)
            },
            function (sender, next) {
              try {
                transaction.id = library.base.transaction.getId(transaction);
              } catch (e) {
                return next(e.toString());
              }
              transaction.blockId = block.id;

              // library.dbLite.query("SELECT id FROM trs WHERE id=$id; SELECT id FROM trs WHERE (senderId=$address and timestamp=$timestamp) limit 1;",
              library.dbLite.query("SELECT id FROM trs WHERE id=$id",
                {
                  id: transaction.id,
                  // address: sender.address,
                  // timestamp: transaction.timestamp
                },
                function (err, rows) {
                  if (err) {
                    next("Failed to query transaction from db: " + err);
                  } else if (rows.length > 0) {
                    modules.transactions.removeUnconfirmedTransaction(transaction.id);
                    next("Transaction already exists: " + transaction.id);
                  } else {
                    next(null, sender);
                  }
                }
              );
            },
            function (sender, next) {
              if (verifyTrs) {
                library.base.transaction.verify(transaction, sender, next);
              } else {
                next();
              }
            }
          ], next);
        }, function (err) {
          if (err) {
            return setImmediate(cb, "Failed to verify transaction: " + err);
          }
          library.logger.debug("verify block transactions ok");
          self.applyBlock(block, votes, broadcast, save, cb);
        });
      });
    });
  });
}

Blocks.prototype.simpleDeleteAfterBlock = function (blockId, cb) {
  library.dbLite.query("DELETE FROM blocks WHERE height >= (SELECT height FROM blocks where id = $id)", { id: blockId }, cb);
}

Blocks.prototype.parseBlock = function (data) {
  var blocks;
  if (typeof data === "string") {
    blocks = library.dbLite.parseCSV(data);
  } else {
    blocks = data;
  }
  blocks = blocks.map(library.dbLite.row2parsed, library.dbLite.parseFields(private.blocksDataFields));
  blocks = private.readDbRows(blocks);
  return blocks;
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
        api: '/blocks?lastBlockId=' + lastCommonBlockId + '&limit=200'
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

        // add two new field: trs.args and trs.message
        // This code is for compatible with old nodes
        if (blocks[0] && blocks[0].length == 63) {
          blocks.forEach(function (b) {
            for (var i = 80; i >= 25; --i) {
              b[i] = b[i - 2]
            }
            b[23] = ''
            b[24] = ''
            if (b[14] >= 8 && b[14] <= 14) {
              for (var i = 80; i >= 48; --i) {
                b[i] = b[i - 6]
              }
              b[42] = ''
              b[43] = ''
              b[44] = ''
              b[45] = ''
              b[46] = ''
              b[47] = ''
            }
          })
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
              library.logger.error('Failed to normalize block: ' + e, block)
              library.logger.error('Block ' + (block ? block.id : 'null') + ' is not valid, ban 60 min', peerStr);
              modules.peer.state(peer.ip, peer.port, 0, 3600);
              return cb(e);
            }
            self.processBlock(block, null, false, true, true, function (err) {
              if (!err) {
                lastCommonBlockId = block.id;
                lastValidBlock = block;
                library.logger.log('Block ' + block.id + ' loaded from ' + peerStr + ' at', block.height);
              } else {
                library.logger.error('Failed to process block: ' + err, block)
                library.logger.error('Block ' + (block ? block.id : 'null') + ' is not valid, ban 60 min', peerStr);
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
      return block.height < private.lastBlock.height
    },
    function (next) {
      blocks.unshift(private.lastBlock);
      private.popLastBlock(private.lastBlock, function (err, newLastBlock) {
        self.setLastBlock(newLastBlock);
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
  if (library.base.consensus.hasPendingBlock(timestamp)) {
    return setImmediate(cb);
  }
  library.logger.info("generateBlock enter");
  async.eachSeries(transactions, function (transaction, next) {
    modules.accounts.getAccount({ publicKey: transaction.senderPublicKey }, function (err, sender) {
      if (err || !sender) {
        return next("Invalid sender");
      }

      if (library.base.transaction.ready(transaction, sender)) {
        library.base.transaction.verify(transaction, sender, function (err) {
          if (err) {
            library.logger.error("Failed to verify transaction " + transaction.id, err);
            modules.transactions.removeUnconfirmedTransaction(transaction.id);
          } else {
            ready.push(transaction);
          }
          next();
        });
      } else {
        next();
      }
    });
  }, function () {
    library.logger.debug("All unconfirmed transactions ready");
    var block;
    try {
      block = library.base.block.create({
        keypair: keypair,
        timestamp: timestamp,
        previousBlock: private.lastBlock,
        transactions: ready
      });
    } catch (e) {
      return setImmediate(cb, e);
    }

    library.logger.info("Generate new block at height " + (private.lastBlock.height + 1));
    async.waterfall([
      function (next) {
        self.verifyBlock(block, null, function (err) {
          if (err) {
            next("Can't verify generated block: " + err);
          } else {
            next();
          }
        });
      },
      function (next) {
        modules.delegates.getActiveDelegateKeypairs(block.height, function (err, activeKeypairs) {
          if (err) {
            next("Failed to get active delegate keypairs: " + err);
          } else {
            next(null, activeKeypairs);
          }
        });
      },
      function (activeKeypairs, next) {
        var height = block.height;
        var id = block.id;
        assert(activeKeypairs && activeKeypairs.length > 0, "Active keypairs should not be empty");
        library.logger.info("get active delegate keypairs len: " + activeKeypairs.length);
        var localVotes = library.base.consensus.createVotes(activeKeypairs, block);
        if (library.base.consensus.hasEnoughVotes(localVotes)) {
          self.processBlock(block, localVotes, true, true, false, function (err) {
            if (err) {
              return next("Failed to process confirmed block height: " + height + " id: " + id + " error: " + err);
            }
            library.logger.log('Forged new block id: ' + id +
              ' height: ' + height +
              ' round: ' + modules.round.calc(height) +
              ' slot: ' + slots.getSlotNumber(block.timestamp) +
              ' reward: ' + block.reward);
            return next();
          });
        } else {
          if (!library.config.publicIp) {
            return next("No public ip");
          }
          var serverAddr = library.config.publicIp + ':' + library.config.port;
          var propose;
          try {
            propose = library.base.consensus.createPropose(keypair, block, serverAddr);
          } catch (e) {
            return next("Failed to create propose: " + e.toString());
          }
          library.base.consensus.setPendingBlock(block);
          library.base.consensus.addPendingVotes(localVotes);
          private.proposeCache[propose.hash] = true;
          library.bus.message("newPropose", propose, true);
          return next();
        }
      },
    ], cb);
  });
}

Blocks.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Blocks.prototype.onReceiveBlock = function (block, votes) {
  if (modules.loader.syncing() || !private.loaded) {
    return;
  }

  if (private.blockCache[block.id]) {
    return;
  }
  private.blockCache[block.id] = true;

  library.sequence.add(function receiveBlock(cb) {
    if (block.previousBlock == private.lastBlock.id && private.lastBlock.height + 1 == block.height) {
      library.logger.info('Received new block id: ' + block.id + ' height: ' + block.height + ' round: ' + modules.round.calc(modules.blocks.getLastBlock().height) + ' slot: ' + slots.getSlotNumber(block.timestamp) + ' reward: ' + modules.blocks.getLastBlock().reward)
      self.processBlock(block, votes, true, true, true, cb);
    } else if (block.previousBlock != private.lastBlock.id && private.lastBlock.height + 1 == block.height) {
      // Fork: Same height but different previous block id
      modules.delegates.fork(block, 1);
      cb("Fork");
    } else if (block.previousBlock == private.lastBlock.previousBlock && block.height == private.lastBlock.height && block.id != private.lastBlock.id) {
      // Fork: Same height and previous block id, but different block id
      modules.delegates.fork(block, 5);
      cb("Fork");
    } else if (block.height > private.lastBlock.height + 1) {
      library.logger.info("receive discontinuous block height " + block.height);
      modules.loader.startSyncBlocks();
      cb();
    } else {
      cb();
    }
  });
}

Blocks.prototype.onReceivePropose = function (propose) {
  if (modules.loader.syncing() || !private.loaded) {
    return;
  }
  if (private.proposeCache[propose.hash]) {
    return;
  }
  private.proposeCache[propose.hash] = true;

  library.sequence.add(function receivePropose(cb) {
    if (private.lastPropose && private.lastPropose.height == propose.height &&
      private.lastPropose.generatorPublicKey == propose.generatorPublicKey &&
      private.lastPropose.id != propose.id) {
      library.logger.warn("generate different block with the same height, generator: " + propose.generatorPublicKey);
      return setImmediate(cb);
    }
    if (propose.height != private.lastBlock.height + 1) {
      library.logger.debug("invalid propose height", propose);
      if (propose.height > private.lastBlock.height + 1) {
        library.logger.info("receive discontinuous propose height " + propose.height);
        modules.loader.startSyncBlocks();
      }
      return setImmediate(cb);
    }
    if (private.lastVoteTime && Date.now() - private.lastVoteTime < 5 * 1000) {
      library.logger.debug("ignore the frequently propose");
      return setImmediate(cb);
    }
    library.logger.info("receive propose height " + propose.height + " bid " + propose.id);
    library.bus.message("newPropose", propose, true);
    async.waterfall([
      function (next) {
        modules.delegates.validateProposeSlot(propose, function (err) {
          if (err) {
            next("Failed to validate propose slot: " + err);
          } else {
            next();
          }
        });
      },
      function (next) {
        library.base.consensus.acceptPropose(propose, function (err) {
          if (err) {
            next("Failed to accept propose: " + err);
          } else {
            next();
          }
        });
      },
      function (next) {
        modules.delegates.getActiveDelegateKeypairs(propose.height, function (err, activeKeypairs) {
          if (err) {
            next("Failed to get active keypairs: " + err);
          } else {
            next(null, activeKeypairs);
          }
        });
      },
      function (activeKeypairs, next) {
        if (activeKeypairs && activeKeypairs.length > 0) {
          var votes = library.base.consensus.createVotes(activeKeypairs, propose);
          library.logger.debug("send votes height " + votes.height + " id " + votes.id + " sigatures " + votes.signatures.length);
          modules.transport.sendVotes(votes, propose.address);
          private.lastVoteTime = Date.now();
          private.lastPropose = propose;
        }
        setImmediate(next);
      }
    ], function (err) {
      if (err) {
        library.logger.error("onReceivePropose error: " + err);
      }
      library.logger.debug("onReceivePropose finished");
      cb();
    });
  });
}

Blocks.prototype.onReceiveVotes = function (votes) {
  if (modules.loader.syncing() || !private.loaded) {
    return;
  }
  library.sequence.add(function receiveVotes(cb) {
    var totalVotes = library.base.consensus.addPendingVotes(votes);
    if (totalVotes && totalVotes.signatures) {
      library.logger.debug("receive new votes, total votes number " + totalVotes.signatures.length);
    }
    if (library.base.consensus.hasEnoughVotes(totalVotes)) {
      var block = library.base.consensus.getPendingBlock();
      var height = block.height;
      var id = block.id;
      self.processBlock(block, totalVotes, true, true, false, function (err) {
        if (err) {
          library.logger.error("Failed to process confirmed block height: " + height + " id: " + id + " error: " + err);
          return cb();
        }
        library.logger.log('Forged new block id: ' + id +
          ' height: ' + height +
          ' round: ' + modules.round.calc(height) +
          ' slot: ' + slots.getSlotNumber(block.timestamp) +
          ' reward: ' + block.reward);
        cb();
      });
    } else {
      setImmediate(cb);
    }
  });
}

Blocks.prototype.getSupply = function () {
  let height = private.lastBlock.height
  return private.blockStatus.calcSupply(height)
}

Blocks.prototype.getCirculatingSupply = function () {
  let height = private.lastBlock.height
  return private.blockStatus.calcSupply(height)
}

Blocks.prototype.onBind = function (scope) {
  modules = scope;

  private.loaded = true;
}

Blocks.prototype.cleanup = function (cb) {
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
shared.getBlock = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
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
          field = { key: key, value: query[key] };
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
        cb(null, { block: block });
      });
    }, cb);
  });
}

shared.getFullBlock = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
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
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    library.dbSequence.add(function (cb) {
      var condition = ''
      if (query.id) {
        condition = 'where b.id = "' + query.id + '"'
      } else if (query.height) {
        condition = 'where b.height = ' + query.height
      } else {
        return cb('Invalid params')
      }
      library.dbLite.query(FULL_BLOCK_QUERY + condition, {}, private.blocksDataFields, function (err, rows) {
        if (err) return cb('Database error: ' + err)
        if (!rows || !rows.length) return cb('Block not found')
        var blocks = private.readDbRows(rows)
        return cb(null, { block: blocks[0] })
      })
    }, cb);
  });
}

shared.getBlocks = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
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
        cb(null, { blocks: data.blocks, count: data.count });
      });
    }, cb);
  });
}

shared.getHeight = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body;
  cb(null, { height: private.lastBlock.height });
}

shared.getFee = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body;
  cb(null, { fee: library.base.block.calculateFee() });
}

shared.getMilestone = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, { milestone: private.blockStatus.calcMilestone(height) });
}

shared.getReward = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, { reward: private.blockStatus.calcReward(height) });
}

shared.getSupply = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, { supply: private.blockStatus.calcSupply(height) });
}

shared.getStatus = function (req, cb) {
  if (!private.loaded) {
    return cb("Blockchain is loading")
  }
  var query = req.body, height = private.lastBlock.height;
  cb(null, {
    height: height,
    fee: library.base.block.calculateFee(),
    milestone: private.blockStatus.calcMilestone(height),
    reward: private.blockStatus.calcReward(height),
    supply: private.blockStatus.calcSupply(height)
  });
}

// Export
module.exports = Blocks;
