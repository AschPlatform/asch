const async = require('async');
const util = require('util');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const extend = require('extend');
const crypto = require('crypto');
const kadence = require('kadence');
const { knuthShuffle } = require('knuth-shuffle');
const levelup = require('../..//node_modules/kadence/node_modules/levelup/lib/levelup.js');
const leveldown = require('../../node_modules/kadence/node_modules/leveldown/leveldown.js');
const encoding = require('../../node_modules/kadence/node_modules/encoding-down');
const Router = require('../utils/router.js');
const sandboxHelper = require('../utils/sandbox.js');
const loop = require('../utils/loop.js')

require('array.prototype.find'); // Old node fix

// Private fields
var modules, library, self, private = {}, shared = {};

private.protocol = 'http:'
private.mainNode = null

// Constructor
function Peer(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;
  private.attachApi();
  private.initNode();

  setImmediate(cb, null, self);
}

// Private methods
private.attachApi = function () {
  var router = new Router();

  router.use(function (req, res, next) {
    if (modules) return next();
    res.status(500).send({ success: false, error: "Blockchain is loading" });
  });

  router.map(shared, {
    "get /": "getPeers",
    "get /version": "version",
    "get /get": "getPeer"
  });

  router.use(function (req, res) {
    res.status(500).send({ success: false, error: "API endpoint not found" });
  });

  library.network.app.use('/api/peers', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.initNode = function () {
  const protocol = private.protocol
  const hostname = global.Config.publicIp || global.Config.address
  const port = global.Config.peerPort
  const contact = { hostname, port, protocol }
  const identity = self.getIdentity(contact)
  const transport = new kadence.HTTPTransport()
  const storageDir = path.resolve(global.Config.dataDir, 'dht')
  const storage = levelup(encoding(leveldown(storageDir)))
  private.mainNode = new kadence.KademliaNode({
    transport,
    storage,
    identity,
    contact
  })
  const node = private.mainNode
  const peerCacheDir = path.join(global.Config.dataDir, 'peer')
  node.rolodex = node.plugin(kadence.rolodex(peerCacheDir))
  node.plugin(kadence.quasar())
  node.listen(port)
}

private.count = function (cb) {
  app.db.rawQuery("select count(*) from peers", { "count": Number }, function (err, rows) {
    if (err) {
      library.logger.error('Peer#count', err);
      return cb(err);
    }
    var res = rows.length && rows[0].count;
    cb(null, res)
  })
}

// Public methods
Peer.prototype.list = function (options, cb) {
  options.limit = options.limit || 100;
  return cb(null, [])

  app.db.rawQuery("select p.ip, p.port, p.state, p.os, p.version from peers p " + (options.chain ? " inner join peer_chains pd on p.id = pd.peerId and pd.chain = $chain " : "") + " where p.state > 0 ORDER BY RANDOM() LIMIT $limit", options, {
    "ip": String,
    "port": Number,
    "state": Number,
    "os": String,
    "version": String
  }, function (err, rows) {
    cb(err, rows);
  });
}

Peer.prototype.listWithChain = function (options, cb) {
  options.limit = options.limit || 100;

  app.db.rawQuery("select p.ip, p.port, p.state, p.os, p.version, pd.chain from peers p inner join peer_chains pd on p.id = pd.peerId  where p.state > 0 ORDER BY RANDOM() LIMIT $limit", options, {
    "ip": String,
    "port": Number,
    "state": Number,
    "os": String,
    "version": String
  }, function (err, rows) {
    cb(err, rows);
  });
}

Peer.prototype.remove = function (pip, port, cb) {
  var isFrozenList = library.config.peers.list.find(function (peer) {
    return peer.ip == ip.fromLong(pip) && peer.port == port;
  });
  if (isFrozenList !== undefined) return cb && cb("Peer in white list");
  app.db.rawQuery("DELETE FROM peers WHERE ip = $ip and port = $port;", {
    ip: pip,
    port: port
  }, function (err) {
    err && library.logger.error('Peer#delete', err);

    cb && cb(err)
  });
}

Peer.prototype.addChain = function (config, cb) {
  app.db.rawQuery("SELECT id from peers where ip = $ip and port = $port", {
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

    app.db.rawQuery("INSERT OR IGNORE INTO peer_chains (peerId, chain) VALUES ($peerId, $chain);", {
      chain: config.chain,
      peerId: peerId
    }, cb);
  });
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

Peer.prototype.getIdentity = function (contact, isHex) {
  let address = contact.hostname + ':' + contact.port
  return crypto.createHash('ripemd160').update(address).digest()
}

Peer.prototype.handle = function (method, handler) {
  private.mainNode.use(method, handler)
}

Peer.prototype.subscribe = function (topic, handler) {
  private.mainNode.quasarSubscribe(topic, function (content) {
    handler(content)
  })
}

Peer.prototype.publish = function (topic, message) {
  private.mainNode.quasarPublish(topic, message)
}

Peer.prototype.request = function (method, params, contact, cb) {
  private.mainNode.send(method, params, contact, cb)
}

Peer.prototype.randomRequest = function (method, params, cb) {
  (async function () {
    const node = private.mainNode
    try {
      let peers = await node.rolodex.getBootstrapCandidates()
      if (peers && peers.length > 0) {
        peers = peers.map(url => kadence.utils.parseContactURL(url))
      }
      const randomContact = knuthShuffle(peers).shift();
      if (!randomContact) return cb('No contact')
      library.logger.debug('select random contract', randomContact)
      let isCallbacked = false
      setTimeout(function () {
        if (isCallbacked) return
        isCallbacked = true
        cb('Timeout', undefined, randomContact)
      }, 2000)
      node.send(method, params, randomContact, function (err, result) {
        if (isCallbacked) return
        isCallbacked = true
        cb(err, result, randomContact)
      })
    } catch (e) {
      library.logger.error('Random request exception', e)
      cb(e.toString())
    }
  })()
}

Peer.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Peer.prototype.onBind = function (scope) {
  modules = scope;
}

Peer.prototype.onBlockchainReady = function () {
  const node = private.mainNode
  for (let seed of global.Config.peers.list) {
    let contact = {
      hostname: seed.ip,
      port: seed.port,
      protocol: private.protocol
    }
    let identity = self.getIdentity(contact)
    node.join([identity, contact])
  }
  node.once('join', function () {
    library.logger.info(`connected to ${node.router.size} peers`)
    library.logger.debug('connected nodes', node.router.getClosestContactsToKey(node.identity).entries())
  })
  node.once('error', function (err) {
    library.logger.error('failed to join network', err)
  })
  library.bus.message('peerReady')
}

Peer.prototype.joinNetwork = async function () {
  const node = private.mainNode
  let peers = await node.rolodex.getBootstrapCandidates()
  if (peers && peers.length > 0) {
    peers = peers.map(url => kadence.utils.parseContactURL(url))
  }
  library.logger.debug('join network bootstrap candidates', peers)
  for (let p of peers) {
    node.join(p)
  }
}

Peer.prototype.onPeerReady = function () {
  loop.runAsync(self.joinNetwork.bind(this), 10000)
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
      app.db.rawQuery("select count(1) from peers", function (err, count) {
        if (err) {
          return cb("Can not get peers count");
        }
        cb(null, { peers: peers, count: Number(count[0][0]) });
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

      cb(null, { peer: peer || {} });
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
