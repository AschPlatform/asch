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
private.baseDir = '';
private.chainBaseDir = '';
private.sandboxes = {};
private.chainReady = {};
private.routes = {};
private.unconfirmedOutTansfers = {};
private.defaultRouteId = null;

// Constructor
function Chains(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;

  private.baseDir = library.config.baseDir;
  private.chainBaseDir = library.config.chainDir

  private.attachApi();

  fs.exists(path.join(library.config.publicDir, 'chains'), function (exists) {
    if (exists) {
      rmdir(path.join(library.config.publicDir, 'chains'), function (err) {
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

  router.post('/install', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        name: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: 'string',
          minLength: 1
        }
      },
      required: ["name"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (library.config.chain.masterpassword && body.master !== library.config.chain.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.name, function (err, chain) {
        if (err) {
          return res.json({ success: false, error: err });
        }

        private.getInstalledIds(function (err, ids) {
          if (err) {
            return res.json({ success: false, error: err });
          }

          if (ids.indexOf(body.name) >= 0) {
            return res.json({ success: false, error: "This chain already installed" });
          }

          if (private.removing[body.name] || private.loading[body.name]) {
            return res.json({ success: false, error: "This chain already on downloading/removing" });
          }

          private.loading[body.name] = true;

          private.installChain(chain, function (err, chainPath) {
            if (err) {
              private.loading[body.name] = false;
              return res.json({ success: false, error: err });
            } else {
              library.network.io.sockets.emit('chain/change', {});
              private.loading[body.name] = false;
              return res.json({ success: true, path: chainPath });
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
        return res.json({ success: false, error: "Can't get installed chain id, see logs" });
      }

      if (files.length == 0) {
        return res.json({ success: true, chain: [] });
      }

      private.getByNames(files, function (err, chains) {
        if (err) {
          library.logger.error(err);
          return res.json({ success: false, error: "Can't get installed chains, see logs" });
        }

        return res.json({ success: true, chains: chains });
      });
    });
  });

  router.get('/installedIds', function (req, res, next) {
    private.getInstalledIds(function (err, files) {
      if (err) {
        library.logger.error(err);
        return res.json({ success: false, error: "Can't get installed chains ids, see logs" });
      }

      return res.json({ success: true, ids: files });
    })
  });

  router.get('/ismasterpasswordenabled', function (req, res, next) {
    return res.json({ success: true, enabled: !!library.config.chain.masterpassword });
  });

  router.post('/uninstall', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        name: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: 'string',
          minLength: 1
        }
      },
      required: ["name"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (library.config.chain.masterpassword && body.master !== library.config.chain.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.name, function (err, chain) {
        if (err) {
          return res.json({ success: false, error: err });
        }

        if (private.removing[body.name] || private.loading[body.name]) {
          return res.json({ success: true, error: "This chain already on uninstall/loading" });
        }

        private.removing[body.name] = true;

        if (private.launched[body.name]) {
          private.stop(chain, function (err) {
            if (err) {
              library.logger.error(err);
              return res.json({ success: false, error: "Can't stop chain, check logs" });
            } else {
              private.launched[body.name] = false;
              private.removeChain(chain, function (err) {
                private.removing[body.name] = false;

                if (err) {
                  return res.json({ success: false, error: err });
                } else {
                  library.network.io.sockets.emit('chains/change', {});

                  return res.json({ success: true });
                }
              });
            }
          });
        } else {
          private.removeChain(chain, function (err) {
            private.removing[body.name] = false;

            if (err) {
              return res.json({ success: false, error: err });
            } else {
              library.network.io.sockets.emit('chains/change', {});

              return res.json({ success: true });
            }
          });
        }
      });
    });
  });

  router.post('/launch', function (req, res, next) {
    if (library.config.chain.masterpassword && req.body.master !== library.config.chain.masterpassword) {
      return res.json({ success: false, error: "Invalid master password" });
    }

    private.launch(req.body, function (err) {
      if (err) {
        return res.json({ "success": false, "error": err });
      }

      library.network.io.sockets.emit('chains/change', {});
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

  router.post('/stop', function (req, res, next) {
    req.sanitize(req.body, {
      type: "object",
      properties: {
        name: {
          type: 'string',
          minLength: 1
        },
        master: {
          type: "string",
          minLength: 1
        }
      },
      required: ["name"]
    }, function (err, report, body) {
      if (err) return next(err);
      if (!report.isValid) return res.json({ success: false, error: report.issues });

      if (!private.launched[body.name]) {
        return res.json({ success: false, error: "Chain not launched" });
      }

      if (library.config.chain.masterpassword && body.master !== library.config.chain.masterpassword) {
        return res.json({ success: false, error: "Invalid master password" });
      }

      private.get(body.name, function (err, chain) {
        if (err) {
          library.logger.error(err);
          return res.json({ success: false, error: "Can't find chain" });
        } else {
          private.stop(chain, function (err) {
            if (err) {
              library.logger.error(err);
              return res.json({ success: false, error: "Can't stop chain, check logs" });
            } else {

              library.network.io.sockets.emit('chains/change', {});
              private.launched[body.name] = false;
              return res.json({ success: true });
            }
          });
        }
      });
    });
  });

  library.network.app.use('/api/chains', router);
  library.network.app.use(function (err, req, res, next) {
    if (!err) return next();
    library.logger.error(req.url, err.toString());
    res.status(500).send({ success: false, error: err.toString() });
  });
}

private.get = function (name, cb) {
  (async function () {
    try {
      let chain = await private.getChainByName( name )
      if (!chain) return cb('Chain not found')
      cb(null, chain)
    } catch (e) {
      library.logger.error(e)
      cb('Failed to get chain: ' + e)
    }
  })()
}

private.getByNames = function (names, cb) {
  (async function () {
    try {
      let chains = app.sdb.getAllCached('Chain',  c => names.exists( n => n === c.name ) )
      cb(null, chains)
    } catch (e) {
      library.logger.error(e)
      cb('Server error')
    }
  })()
}

private.createBasePathes = function (cb) {
  async.series([
    function (cb) {
      fs.exists(private.chainBaseDir, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.mkdir(private.chainBaseDir, cb);
        }
      });
    },
    function (cb) {
      var chainPublic = path.join(private.baseDir, 'public', 'dist', 'chains');
      fs.exists(chainPublic, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.mkdir(chainPublic, cb);
        }
      });
    }
  ], function (err) {
    return setImmediate(cb, err);
  });
}

private.getInstalledIds = function (cb) {
  fs.readdir(private.chainBaseDir, function (err, files) {
    if (err) {
      return setImmediate(cb, err);
    }

    setImmediate(cb, null, files);
  });
}

private.removeChain = function (chain, cb) {
  var chainPath = path.join(private.chainBaseDir, chain.name);

  function done(err) {
    if (err) {
      library.logger.error("Failed to uninstall chain: " + err);
    }

    rmdir(chainPath, function (err) {
      if (err) {
        return setImmediate(cb, "Failed to remove chain folder: " + err);
      } else {
        return cb();
      }
    });
  }

  async.waterfall([
    function (next) {
      fs.exists(chainPath, function (exists) {
        next(exists ? null : "Chain not found");
      });
    },
    async.apply(private.readJson, path.join(chainPath, "blockchain.json")),
  ], function (err) {
    done(err);
  });
}

private.downloadLink = function (chain, chainPath, cb) {
  var tmpDir = "tmp";
  var tmpPath = path.join(private.baseDir, tmpDir, chain.name + ".zip");

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
        url: chain.link,
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
          return callback("Faile to download chain " + chain.link + " with err code: " + response.statusCode);
        }
      });

      download.on("error", function (err) {
        return callback("Failed to download chain " + chain.link + " with error: " + err.message);
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
        rmdir(chainPath, function () { });
        serialCb("Failed to decompress zip file: " + err);
      });

      unzipper.on("extract", function (log) {
        library.logger.info(chain.name + " Finished extracting");
        fs.exists(tmpPath, function (exists) {
          fs.unlink(tmpPath);
        });
        serialCb(null);
      });

      unzipper.on("progress", function (fileIndex, fileCount) {
        library.logger.info(chain.name + " Extracted file " + (fileIndex + 1) + " of " + fileCount);
      });

      unzipper.extract({
        path: chainPath,
        strip: 1
      });
    }
  },
    function (err) {
      return cb(err);
    });
}

private.installChain = function (chain, cb) {
  var chainPath = path.join(private.chainBaseDir, chain.name);

  async.series({
    checkInstalled: function (serialCb) {
      fs.exists(chainPath, function (exists) {
        if (exists) {
          return serialCb("Chain is already installed");
        } else {
          return serialCb(null);
        }
      });
    },
    makeDirectory: function (serialCb) {
      fs.mkdir(chainPath, function (err) {
        if (err) {
          return serialCb("Failed to make chain directory");
        } else {
          return serialCb(null);
        }
      });
    },
    performInstall: function (serialCb) {
      return private.downloadLink(chain, chainPath, serialCb);
    }
  },
    function (err) {
      if (err) {
        rmdir(chainPath, function () { });
        return setImmediate(cb, chain.name + " Installation failed: " + err);
      } else {
        return setImmediate(cb, null, chainPath);
      }
    });
}

private.symlink = function (chain, cb) {
  var chainPath = path.join(private.chainBaseDir, chain.name);
  var chainPublicPath = path.resolve(chainPath, "public");
  var chainPublicLink = path.resolve(private.baseDir, "public", "dist", "chains", chain.name);
  fs.exists(chainPublicPath, function (exists) {
    if (exists) {
      fs.exists(chainPublicLink, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          fs.symlink(chainPublicPath, chainPublicLink, cb);
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

    modules[module].sandboxApi(call, { "body": message.args, "chain": message.chain }, callback);
  } catch (e) {
    return setImmediate(callback, "Invalid call " + e.toString());
  }
}

private.chainRoutes = function (chain, cb) {
  var chainPath = path.join(private.chainBaseDir, chain.name);
  var chainRoutesPath = path.join(chainPath, "routes.json");

  var routes = Sandbox.routes

  private.routes[chain.name] = new Router();

  routes.forEach(function (router) {
    if (router.method == "get" || router.method == "post" || router.method == "put") {
      private.routes[chain.name][router.method](router.path, function (req, res) {
        var reqParams = {
          query: (router.method == "get") ? req.query : req.body,
          params: req.params
        }
        self.request(chain.name, router.method, router.path, reqParams, function (err, body) {
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
    private.defaultRouteId = chain.name;
    library.network.app.use('/api/chains/default/', private.routes[chain.name]);
  }
  library.network.app.use('/api/chains/' + chain.name + '/', private.routes[chain.name]);
  library.network.app.use('/api/chains/' + chain.tid + '/', private.routes[chain.name]);
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
      name: {
        type: 'string',
        minLength: 1
      },
      master: {
        type: "string",
        minLength: 0
      }
    },
    required: ["name"]
  }, function (err) {
    if (err) {
      return cb(err[0].message);
    }

    if (private.launched[body.name]) {
      return cb("Chain already launched");
    }

    body.params = body.params || [''];

    async.auto({
      chain: async.apply(private.get, body.name),

      installedIds: async.apply(private.getInstalledIds),

      symlink: ['chain', 'installedIds', function (next, results) {
        if (results.installedIds.indexOf(body.name) < 0) {
          return next('Chain not installed');
        }
        private.symlink(results.chain, next);
      }],

      launch: ['symlink', function (next, results) {
        private.launchApp(results.chain, body.params, next);
      }],

      route: ['launch', function (next, results) {
        private.chainRoutes(results.chain, function (err) {
          if (err) {
            return private.stop(results.chain, next);
          }
          next();
        });
      }]
    }, function (err, results) {
      if (err) {
        library.logger.error('Failed to launch chain ' + body.name + ': ' + err);
        cb('Failed to launch chain');
      } else {
        private.launched[body.name] = true;
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

private.launchApp = function (chain, params, cb) {
  var chainPath = path.join(private.chainBaseDir, chain.name);

  private.readJson(path.join(chainPath, "config.json"), function (err, chainConfig) {
    if (err) {
      return setImmediate(cb, "Failed to read config.json file for: " + chain.name);
    }
    async.eachSeries(chainConfig.peers, function (peer, cb) {
      modules.peer.addChain({
        ip: ip.toLong(peer.ip),
        port: peer.port,
        chain: chain.name
      }, cb);
    }, function (err) {
      if (err) {
        return setImmediate(cb, err);
      }

      var sandbox = new Sandbox(chainPath, chain.name, params, private.apiHandler, true, library.logger);
      private.sandboxes[chain.name] = sandbox;

      sandbox.on("exit", function (code) {
        library.logger.info("Chain " + chain.name + " exited with code " + code);
        private.stop(chain, function (err) {
          if (err) {
            library.logger.error("Encountered error while stopping chain: " + err);
          }
        });
      });

      sandbox.on("error", function (err) {
        library.logger.info("Encountered error in chain " + chain.name + " " + err.toString());
        private.stop(chain, function (err) {
          if (err) {
            library.logger.error("Encountered error while stopping chain: " + err);
          }
        });
      });

      sandbox.run();
      return cb(null)
    });
  });
}

private.stop = function (chain, cb) {
  var chainPublicLink = path.join(private.baseDir, "public", "chains", chain.name);

  async.series([
    function (cb) {
      fs.exists(chainPublicLink, function (exists) {
        if (exists) {
          return setImmediate(cb);
        } else {
          setImmediate(cb);
        }
      });
    },
    function (cb) {
      if (private.sandboxes[chain.name]) {
        private.sandboxes[chain.name].exit();
      }

      delete private.sandboxes[chain.name];

      setImmediate(cb)
    },
    function (cb) {
      delete private.routes[chain.name];
      setImmediate(cb);
    }
  ], function (err) {
    return setImmediate(cb, err);
  });
}

// Public methods
Chains.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

Chains.prototype.message = function (chain, body, cb) {
  self.request(chain, "post", "/message", { query: body }, cb);
}

Chains.prototype.request = function (chain, method, path, query, cb) {
  if (!private.sandboxes[chain]) {
    return cb("Chain not found");
  }
  if (!private.chainReady[chain]) {
    return cb("Chain not ready");
  }
  private.sandboxes[chain].sendMessage({
    method: method,
    path: path,
    query: query
  }, cb);
}

// Events
Chains.prototype.onBind = function (scope) {
  modules = scope;
}

Chains.prototype.cleanup = function (cb) {
  var keys = Object.keys(private.launched);

  async.eachSeries(keys, function (name, cb) {
    if (!private.launched[name]) {
      return setImmediate(cb);
    }
    private.stop({
      name: name
    }, function (err) {
      cb(err);
    })
  }, function (err) {
    if (err) {
      library.logger.error('all chains stopped with error', err);
    } else {
      library.logger.info('all chains stopped successfully');
    }
    cb();
  });
}

Chains.prototype.onBlockchainReady = function () {
  private.getInstalledIds(function (err, chains) {
    library.logger.debug("find local installed chains", chains)
    if (err) {
      library.logger.error("Failed to get installed ids", err);
      return;
    }
    library.logger.info("start to launch " + chains.length + " installed chains");
    async.eachSeries(chains, function (chain, next) {
      var chainParams = library.config.chain.params[chain] || [];
      private.launch({ name: chain, params: chainParams }, function (err) {
        if (err) {
          library.logger.error("Failed to launched chain[" + chain + "]", err);
        } else {
          library.logger.info("Launched chain[" + chain + "] successfully");
        }
        next();
      });
    }, function () {
    });
  });
}

Chains.prototype.onDeleteBlocksBefore = function (block) {
  Object.keys(private.sandboxes).forEach(function (chain) {
    let req = {
      query: {
        topic: "rollback",
        message: { pointId: block.id, pointHeight: block.height }
      }
    }
    self.request(chain, "post", "/message", req, function (err) {
      if (err) {
        library.logger.error("onDeleteBlocksBefore message", err)
      }
    });
  });
}

Chains.prototype.onNewBlock = function (block, votes, broadcast) {
  let req = {
    query: {
      topic: "point",
      message: { id: block.id, height: block.height }
    }
  }
  Object.keys(private.sandboxes).forEach(function (chain) {
    broadcast && self.request(chain, "post", "/message", req, function (err) {
      if (err) {
        library.logger.error("onNewBlock message", err)
      }
    });
  });
}

private.getChainByName = async function ( name )  {
  let chains = await app.sdb.getAllCached('Chain',  c => c.name === name )
  return chains !== undefined ? chains[0] : undefined
}

shared.getChain = function (req, cb) {
  (async function () {
    try {
      let chain = await private.getChainByName( req.name )
      if (!chain) return cb('Not found')
      let delegates = await app.sdb.findMany('ChainDelegate', { chain: req.chain } )
      if (delegates && delegates.length) {
        chain.delegates = delegates.map((d) => d.delegate)
      }
      cb(null, chain)
    } catch (e) {
      library.logger.error(e)
      cb('Failed to find chain: ' + e)
    }
  })()
}

shared.setReady = function (req, cb) {
  private.chainReady[req.chain] = true;
  library.bus.message('chainReady', req.chain, true);
  cb(null, {});
}

shared.getLastWithdrawal = function (req, cb) {
  (async function () {
    try {      
      let withdrawals = await app.sdb.query('Withdrawal', { chain: req.chain }, null, 1, 0, { seq: -1 } )
      if (!withdrawals || !withdrawals.length) {
        return cb(null, null)
      } else {
        return cb(null, withdrawals[0])
      }
    } catch (e) {
      library.logger.error(e)
      cb('Failed to get last withdrawal transaction: ' + e)
    }
  })()
}

shared.getDeposits = function (req, cb) {
  (async function () {
    try {
      let deposits = await app.sdb.findMany('Deposit', { seq: { $gt: req.body.seq }, chain: req.chain }, 100 )
      return cb(null, deposits)
    } catch (e) {
      library.logger.error(e)
      cb('Failed to get deposit transactions: ' + e)
    }
  })()
}

shared.submitOutTransfer = function (req, cb) {
  let trs = req.body
  library.sequence.add(function (cb) {
    if (modules.transactions.hasUnconfirmed(trs)) {
      return cb('Already exists');
    }
    library.logger.log('Submit outtransfer transaction ' + trs.id + ' from chain ' + req.chain);
    modules.transactions.receiveTransactions([trs], cb);
  }, cb);
}

shared.registerInterface = function (req, cb) {
  let chain = req.chain
  let method = req.body.method
  let path = req.body.path
  private.routes[chain][method](path, function (req, res) {
    var reqParams = {
      query: (method == "get") ? req.query : req.body,
      params: req.params
    }
    self.request(chain, method, path, reqParams, function (err, body) {
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

module.exports = Chains;
