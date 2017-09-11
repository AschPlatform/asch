var async = require('async');
var util = require('util');
var fs = require('fs');
var path = require('path');
var ip = require('ip');
var extend = require('extend');
var Router = require('../utils/router.js');
var sandboxHelper = require('../utils/sandbox.js');

require('array.prototype.find'); // Old node fix

// Private fields
var modules, library, self, private = {}, shared = {};

// Constructor
function Peer(cb, scope) {
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
    if (modules) return next();
    res.status(500).send({success: false, error: "Blockchain is loading"});
  });

  router.map(shared, {
    "get /": "getPeers",
    "get /version": "version",
    "get /get": "getPeer"
  });

  router.use(function (req, res) {
    res.status(500).send({success: false, error: "API endpoint not found"});
  });

  library.network.app.use('/api/peers', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({success: false, error: err.toString()});
  });
}

private.updatePeerList = function (cb) {
  modules.transport.getFromRandomPeer({
    api: '/list',
    method: 'GET'
  }, function (err, data) {
    if (err) {
      return cb();
    }

    var report = library.scheme.validate(data.body.peers, {type: "array", required: true, uniqueItems: true});
    library.scheme.validate(data.body, {
      type: "object",
      properties: {
        peers: {
          type: "array",
          uniqueItems: true
        }
      },
      required: ['peers']
    }, function (err) {
      if (err) {
        return cb();
      }

      var peers = data.body.peers;

      async.eachLimit(peers, 2, function (peer, cb) {
        library.scheme.validate(peer, {
          type: "object",
          properties: {
            ip: {
              type: "string"
            },
            port: {
              type: "integer",
              minimum: 1,
              maximum: 65535
            },
            state: {
              type: "integer",
              minimum: 0,
              maximum: 3
            },
            os: {
              type: "string"
            },
            version: {
              type: "string"
            },
            dappId: {
              type: "string",
              length: 64
            }
          },
          required: ['ip', 'port', 'state']
        }, function (err) {
          if (err) {
            return setImmediate(cb, "Invalid peer: " + err);
          }

          peer.ip = parseInt(peer.ip);

          if (isNaN(peer.ip)) {
            return setImmediate(cb);
          }

          if (ip.toLong("127.0.0.1") == peer.ip || peer.port == 0 || peer.port > 65535) {
            return setImmediate(cb);
          }

          if (!self.isCompatible(peer.version)) {
            library.logger.debug("Skip uncompatible peer " + peer.ip, peer.version);
            return setImmediate(cb);
          }

          self.update(peer, cb);
        });
      }, cb);
    });
  });
}

private.count = function (cb) {
  library.dbLite.query("select count(*) from peers", {"count": Number}, function (err, rows) {
    if (err) {
      library.logger.error('Peer#count', err);
      return cb(err);
    }
    var res = rows.length && rows[0].count;
    cb(null, res)
  })
}

private.banManager = function (cb) {
  library.dbLite.query("UPDATE peers SET state = 1, clock = null where (state = 0 and clock - $now < 0)", {now: Date.now()}, cb);
}

private.getByFilter = function (filter, cb) {
  var sortFields = ["ip", "port", "state", "os", "version"];
  var sortMethod = '', sortBy = ''
  var limit = filter.limit || null;
  var offset = filter.offset || null;
  delete filter.limit;
  delete filter.offset;

  var where = [];
  var params = {};

  if (filter.hasOwnProperty('state') && filter.state !== null) {
    where.push("state = $state");
    params.state = filter.state;
  }

  if (filter.hasOwnProperty('os') && filter.os !== null) {
    where.push("os = $os");
    params.os = filter.os;
  }

  if (filter.hasOwnProperty('version') && filter.version !== null) {
    where.push("version = $version");
    params.version = filter.version;
  }

  if (filter.hasOwnProperty('ip') && filter.ip !== null) {
    where.push("ip = $ip");
    params.ip = filter.ip;
  }

  if (filter.hasOwnProperty('port') && filter.port !== null) {
    where.push("port = $port");
    params.port = filter.port;
  }

  if (filter.hasOwnProperty('orderBy')) {
    var sort = filter.orderBy.split(':');
    sortBy = sort[0].replace(/[^\w\s]/gi, '');
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

  if (limit !== null) {
    if (limit > 100) {
      return cb("Invalid limit. Maximum is 100");
    }
    params['limit'] = limit;
  }

  if (offset !== null) {
    params['offset'] = offset;
  }

  library.dbLite.query("select ip, port, state, os, version from peers" +
    (where.length ? (' where ' + where.join(' and ')) : '') +
    (sortBy ? ' order by ' + sortBy + ' ' + sortMethod : '') + " " +
    (limit ? ' limit $limit' : '') +
    (offset ? ' offset $offset ' : ''),
    params, {
      "ip": String,
      "port": Number,
      "state": Number,
      "os": String,
      "version": String
    }, function (err, rows) {
      cb(err, rows);
    });
}

// Public methods
Peer.prototype.list = function (options, cb) {
  options.limit = options.limit || 100;

  library.dbLite.query("select p.ip, p.port, p.state, p.os, p.version from peers p " + (options.dappId ? " inner join peers_dapp pd on p.id = pd.peerId and pd.dappId = $dappId " : "") + " where p.state > 0 ORDER BY RANDOM() LIMIT $limit", options, {
    "ip": String,
    "port": Number,
    "state": Number,
    "os": String,
    "version": String
  }, function (err, rows) {
    cb(err, rows);
  });
}

Peer.prototype.listWithDApp = function (options, cb) {
  options.limit = options.limit || 100;

  library.dbLite.query("select p.ip, p.port, p.state, p.os, p.version, pd.dappId from peers p inner join peers_dapp pd on p.id = pd.peerId  where p.state > 0 ORDER BY RANDOM() LIMIT $limit", options, {
    "ip": String,
    "port": Number,
    "state": Number,
    "os": String,
    "version": String
  }, function (err, rows) {
    cb(err, rows);
  });
}

Peer.prototype.reset = function (cb) {
  library.dbLite.query('update peers set state = 2', function (err) {
    if (cb) return cb(err)
    if (err) {
      library.logger.error('Failed to reset peers: ' + e)
    }
  })
}

Peer.prototype.state = function (pip, port, state, timeoutSeconds, cb) {
  var isFrozenList = library.config.peers.list.find(function (peer) {
    return peer.ip == ip.fromLong(pip) && peer.port == port;
  });
  if (isFrozenList !== undefined) return cb && cb("Peer in white list");
  if (state == 0) {
    var clock = (timeoutSeconds || 1) * 1000;
    clock = Date.now() + clock;
  } else {
    clock = null;
  }
  library.dbLite.query("UPDATE peers SET state = $state, clock = $clock WHERE ip = $ip and port = $port;", {
    state: state,
    clock: clock,
    ip: pip,
    port: port
  }, function (err) {
    err && library.logger.error('Peer#state', err);

    cb && cb()
  });
}

Peer.prototype.remove = function (pip, port, cb) {
  var isFrozenList = library.config.peers.list.find(function (peer) {
    return peer.ip == ip.fromLong(pip) && peer.port == port;
  });
  if (isFrozenList !== undefined) return cb && cb("Peer in white list");
  library.dbLite.query("DELETE FROM peers WHERE ip = $ip and port = $port;", {
    ip: pip,
    port: port
  }, function (err) {
    err && library.logger.error('Peer#delete', err);

    cb && cb(err)
  });
}

Peer.prototype.addDapp = function (config, cb) {
  library.dbLite.query("SELECT id from peers where ip = $ip and port = $port", {
    ip: config.ip,
    port: config.port
  }, ["id"], function (err, data) {
    if (err) {
      return cb(err);
    }
    if (!data.length) {
      return cb();
    }
    var peerId = data[0].id;

    library.dbLite.query("INSERT OR IGNORE INTO peers_dapp (peerId, dappId) VALUES ($peerId, $dappId);", {
      dappId: config.dappId,
      peerId: peerId
    }, cb);
  });
}

Peer.prototype.update = function (peer, cb) {
  if (!peer.ip || !peer.port) {
    cb && cb();
    return;
  }
  var dappId = peer.dappId;
  var params = {
    ip: peer.ip,
    port: peer.port,
    os: peer.os || null,
    version: peer.version || null
  }
  async.series([
    function (cb) {
      library.dbLite.query("INSERT OR IGNORE INTO peers (ip, port, state, os, version) VALUES ($ip, $port, $state, $os, $version);", extend({}, params, {state: 1}), cb);
    },
    function (cb) {
      if (peer.state !== undefined) {
        params.state = peer.state;
      }
      library.dbLite.query("UPDATE peers SET os = $os, version = $version" + (peer.state !== undefined ? ", state = CASE WHEN state = 0 THEN state ELSE $state END " : "") + " WHERE ip = $ip and port = $port;", params, cb);
    },
    function (cb) {
      if (dappId) {
        self.addDapp({dappId: dappId, ip: peer.ip, port: peer.port}, cb);
      } else {
        setImmediate(cb);
      }

    }
  ], function (err) {
    err && library.logger.error('Peer#update', err);
    cb && cb()
  })
}

Peer.prototype.getVersion = function () {
  return {
    version: library.config.version,
    build: library.config.buildVersion,
    net: library.config.netVersion
  };
}

Peer.prototype.isCompatible = function (version) {
  var nums = version.split('.').map(Number);
  if (nums.length != 3) {
    return true;
  }
  var compatibleVersion = '0.0.0';
  if (library.config.netVersion == 'testnet') {
    compatibleVersion = '1.2.3';
  } else if (library.config.netVersion == 'mainnet') {
    compatibleVersion = '1.3.1';
  }
  var numsCompatible = compatibleVersion.split('.').map(Number);
  for (var i = 0; i < nums.length; ++i) {
    if (nums[i] < numsCompatible[i]) {
      return false;
    } else if (nums[i] > numsCompatible[i]) {
      return true;
    }
  }
  return true;
}

Peer.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Peer.prototype.onBind = function (scope) {
  modules = scope;
}

Peer.prototype.onBlockchainReady = function () {
  async.eachSeries(library.config.peers.list, function (peer, cb) {
    library.dbLite.query("INSERT OR IGNORE INTO peers(ip, port, state) VALUES($ip, $port, $state)", {
      ip: ip.toLong(peer.ip),
      port: peer.port,
      state: 2
    }, cb);
  }, function (err) {
    if (err) {
      library.logger.error('onBlockchainReady', err);
    }

    private.count(function (err, count) {
      if (count) {
        private.updatePeerList(function (err) {
          err && library.logger.error('updatePeerList', err);
          library.bus.message('peerReady');
        })
        library.logger.info('Peers ready, stored ' + count);
      } else {
        library.logger.warn('Peers list is empty');
      }
    });
  });
}

Peer.prototype.onPeerReady = function () {
  setImmediate(function nextUpdatePeerList() {
    private.updatePeerList(function (err) {
      err && library.logger.error('updatePeerList timer', err);
      setTimeout(nextUpdatePeerList, 60 * 1000);
    })
  });

  setImmediate(function nextBanManager() {
    private.banManager(function (err) {
      err && library.logger.error('banManager timer', err);
      setTimeout(nextBanManager, 65 * 1000)
    });
  });
}

// Shared
shared.getPeers = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      state: {
        type: "integer",
        minimum: 0,
        maximum: 3
      },
      os: {
        type: "string"
      },
      version: {
        type: "string"
      },
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
      port: {
        type: "integer",
        minimum: 1,
        maximum: 65535
      }
    }
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    if (query.limit < 0 || query.limit > 100) {
      return cb("Invalid limit. Maximum is 100");
    }

    private.getByFilter(query, function (err, peers) {
      if (err) {
        return cb("Peer not found");
      }

      for (var i = 0; i < peers.length; i++) {
        peers[i].ip = ip.fromLong(peers[i].ip);
      }
      library.dbLite.query("select count(1) from peers", function (err, count) {
        if (err) {
          return cb("Can not get peers count");
        }
        cb(null, {peers: peers, totalCount: count[0]});
      });
    });
  });
}

shared.getPeer = function (req, cb) {
  var query = req.body;
  library.scheme.validate(query, {
    type: "object",
    properties: {
      ip: {
        type: "string",
        minLength: 1
      },
      port: {
        type: "integer",
        minimum: 0,
        maximum: 65535
      }
    },
    required: ['ip', 'port']
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    private.getByFilter({
      ip: query.ip,
      port: query.port
    }, function (err, peers) {
      if (err) {
        return cb("Peer not found");
      }

      var peer = peers.length ? peers[0] : null;

      if (peer) {
        peer.ip = ip.fromLong(peer.ip);
      }

      cb(null, {peer: peer || {}});
    });
  });
}

shared.version = function (req, cb) {
  cb(null, {
    version: library.config.version,
    build: library.config.buildVersion,
    net: library.config.netVersion
  });
}

// Export
module.exports = Peer;
