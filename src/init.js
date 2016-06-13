var path = require('path');
var fs = require('fs');
var https = require('https');
var async = require('async');
var z_schema = require('z-schema');
var Logger = require('./logger');
var Sequence = require('./utils/sequence.js');

var versionBuild = fs.readFileSync(path.join(__dirname, 'build-version'), 'utf8');

var moduleNames = [
  'server',
  'accounts',
  'transactions',
  'blocks',
  'signatures',
  'transport',
  'loader',
  'system',
  'peer',
  'delegates',
  'round',
  'multisignatures',
  'dapps',
  'sql',
];

module.exports = function(options, done) {
  var modules = [];
  var dbFile = options.dbFile || './blockchain.db';
  var appConfig = options.appConfig || require('../config.json');
  var genesisblock = options.genesisblock || require('../genesisBlock.json');
  var logger = new Logger({
    echo: appConfig.consoleLogLevel,
    errorLevel: appConfig.fileLogLevel
  });
  async.auto({
    config: function (cb) {
      if (appConfig.dapp.masterrequired && !appConfig.dapp.masterpassword) {
        var randomstring = require("randomstring");
        appConfig.dapp.masterpassword = randomstring.generate({
          length: 12,
          readable: true,
          charset: 'alphanumeric'
        });
        fs.writeFile("./config.json", JSON.stringify(appConfig, null, 4), "utf8", function (err) {
          cb(err, appConfig)
        });
      } else {
        cb(null, appConfig);
      }
    },

    logger: function (cb) {
      cb(null, logger);
    },

    build: function (cb) {
      cb(null, versionBuild);
    },

    genesisblock: function (cb) {
      cb(null, {
        block: genesisblock
      });
    },

    public: function (cb) {
      cb(null, path.join(__dirname, 'public'));
    },

    scheme: function (cb) {
      z_schema.registerFormat("hex", function (str) {
        try {
          new Buffer(str, "hex");
        } catch (e) {
          return false;
        }

        return true;
      });

      z_schema.registerFormat('publicKey', function (str) {
        if (str.length == 0) {
          return true;
        }

        try {
          var publicKey = new Buffer(str, "hex");

          return publicKey.length == 32;
        } catch (e) {
          return false;
        }
      });

      z_schema.registerFormat('splitarray', function (str) {
        try {
          var a = str.split(',');
          if (a.length > 0 && a.length <= 1000) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      });

      z_schema.registerFormat('signature', function (str) {
        if (str.length == 0) {
          return true;
        }

        try {
          var signature = new Buffer(str, "hex");
          return signature.length == 64;
        } catch (e) {
          return false;
        }
      })

      z_schema.registerFormat('listQuery', function (obj) {
        obj.limit = 100;
        return true;
      });

      z_schema.registerFormat('listDelegates', function (obj) {
        obj.limit = 101;
        return true;
      });

      z_schema.registerFormat('checkInt', function (value) {
        if (isNaN(value) || parseInt(value) != value || isNaN(parseInt(value, 10))) {
          return false;
        }

        value = parseInt(value);
        return true;
      });

      z_schema.registerFormat('ip', function (value) {

      });

      cb(null, new z_schema())
    },

    network: ['config', function (cb, scope) {
      var express = require('express');
      var compression = require("compression");
      var app = express();
      app.use(compression({ level: 6 }));

      var server = require('http').createServer(app);
      var io = require('socket.io')(server);

      if (scope.config.ssl.enabled) {
        var privateKey = fs.readFileSync(scope.config.ssl.options.key);
        var certificate = fs.readFileSync(scope.config.ssl.options.cert);

        var https = require('https').createServer({
          key: privateKey,
          cert: certificate,
          ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:"
                 + "ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:"
                 + "!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA"
        }, app);

        var https_io = require('socket.io')(https);
      }

      cb(null, {
        express: express,
        app: app,
        server: server,
        io: io,
        https: https,
        https_io: https_io
      });
    }],

    dbSequence: ["logger", function (cb, scope) {
      var sequence = new Sequence({
        onWarning: function (current, limit) {
          scope.logger.warn("DB queue", current)
        }
      });
      cb(null, sequence);
    }],

    sequence: ["logger", function (cb, scope) {
      var sequence = new Sequence({
        onWarning: function (current, limit) {
          scope.logger.warn("Main queue", current)
        }
      });
      cb(null, sequence);
    }],

    balancesSequence: ["logger", function (cb, scope) {
      var sequence = new Sequence({
        onWarning: function (current, limit) {
          scope.logger.warn("Balance queue", current)
        }
      });
      cb(null, sequence);
    }],

    connect: ['config', 'public', 'genesisblock', 'logger', 'build', 'network', function (cb, scope) {
      var bodyParser = require('body-parser');
      var methodOverride = require('method-override');
      var requestSanitizer = require('./utils/request-sanitizer');
      var queryParser = require('./express-query-int');

      scope.network.app.engine('html', require('ejs').renderFile);
      scope.network.app.use(require('express-domain-middleware'));
      scope.network.app.set('view engine', 'ejs');
      scope.network.app.set('views', path.join(__dirname, 'public'));
      scope.network.app.use(scope.network.express.static(path.join(__dirname, 'public')));
      scope.network.app.use(bodyParser.raw({limit: "2mb"}));
      scope.network.app.use(bodyParser.urlencoded({extended: true, limit: "2mb", parameterLimit: 5000}));
            scope.network.app.use(bodyParser.json({limit: "2mb"}));
      scope.network.app.use(methodOverride());

      var ignore = ['id', 'name', 'lastBlockId', 'blockId', 'transactionId', 'address', 'recipientId', 'senderId', 'previousBlock'];
      scope.network.app.use(queryParser({
        parser: function (value, radix, name) {
          if (ignore.indexOf(name) >= 0) {
            return value;
          }

          if (isNaN(value) || parseInt(value) != value || isNaN(parseInt(value, radix))) {
            return value;
          }

          return parseInt(value);
        }
      }));

      scope.network.app.use(require('./utils/zscheme-express.js')(scope.scheme));

      scope.network.app.use(function (req, res, next) {
        var parts = req.url.split('/');
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        logger.log(req.method + " " + req.url + " from " + ip);

        /* Instruct browser to deny display of <frame>, <iframe> regardless of origin.
         *
         * RFC -> https://tools.ietf.org/html/rfc7034
         */
        res.setHeader('X-Frame-Options', 'DENY');

        /* Set Content-Security-Policy headers.
         *
         * frame-ancestors - Defines valid sources for <frame>, <iframe>, <object>, <embed> or <applet>.
         *
         * W3C Candidate Recommendation -> https://www.w3.org/TR/CSP/
         */
        res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

        if (parts.length > 1) {
          if (parts[1] == 'api') {
            if (scope.config.api.access.whiteList.length > 0) {
              if (scope.config.api.access.whiteList.indexOf(ip) < 0) {
                res.sendStatus(403);
              } else {
                next();
              }
            } else {
              next();
            }
          } else if (parts[1] == 'peer') {
            if (scope.config.peers.blackList.length > 0) {
              if (scope.config.peers.blackList.indexOf(ip) >= 0) {
                res.sendStatus(403);
              } else {
                next();
              }
            } else {
              next();
            }
          } else {
            next();
          }
        } else {
          next();
        }
      });

      scope.network.server.listen(scope.config.port, scope.config.address, function (err) {
        scope.logger.log("Asch started: " + scope.config.address + ":" + scope.config.port);

        if (!err) {
          if (scope.config.ssl.enabled) {
            scope.network.https.listen(scope.config.ssl.options.port, scope.config.ssl.options.address, function (err) {
              scope.logger.log("Asch https started: " + scope.config.ssl.options.address + ":" + scope.config.ssl.options.port);

              cb(err, scope.network);
            });
          } else {
            cb(null, scope.network);
          }
        } else {
          cb(err, scope.network);
        }
      });

    }],

    bus: function (cb) {
      var changeCase = require('change-case');
      var bus = function () {
        this.message = function () {
          var args = [];
          Array.prototype.push.apply(args, arguments);
          var topic = args.shift();
          modules.forEach(function (module) {
            var eventName = 'on' + changeCase.pascalCase(topic);
            if (typeof(module[eventName]) == 'function') {
              module[eventName].apply(module[eventName], args);
            }
          })
        }
      }
      cb(null, new bus)
    },

    dbLite: function (cb) {
      var dbLite = require('./utils/dbLite.js');
      dbLite.connect(dbFile, cb);
    },

    base: ['dbLite', 'bus', 'scheme', 'genesisblock', function (cb, scope) {
      var Transaction = require('./base/transaction.js');
      var Block = require('./base/block.js');
      var Account = require('./base/account.js');

      async.auto({
        bus: function (cb) {
          cb(null, scope.bus);
        },
        dbLite: function (cb) {
          cb(null, scope.dbLite);
        },
        scheme: function (cb) {
          cb(null, scope.scheme);
        },
        genesisblock: function (cb) {
          cb(null, {
            block: genesisblock
          });
        },
        account: ["dbLite", "bus", "scheme", 'genesisblock', function (cb, scope) {
          new Account(scope, cb);
        }],
        transaction: ["dbLite", "bus", "scheme", 'genesisblock', "account", function (cb, scope) {
          new Transaction(scope, cb);
        }],
        block: ["dbLite", "bus", "scheme", 'genesisblock', "account", "transaction", function (cb, scope) {
          new Block(scope, cb);
        }]
      }, cb);
    }],

    modules: ['network', 'connect', 'config', 'logger', 'bus', 'sequence', 'dbSequence', 'balancesSequence', 'dbLite', 'base', function (cb, scope) {
      var tasks = {};
      moduleNames.forEach(function (name) {
        tasks[name] = function (cb) {
          var d = require('domain').create();

          d.on('error', function (err) {
            scope.logger.fatal('Domain ' + name, {message: err.message, stack: err.stack});
          });

          d.run(function () {
            logger.debug('Loading module', name)
            var Klass = require('./' + name);
            var obj = new Klass(cb, scope)
            modules.push(obj);
          });
        }
      });
      async.parallel(tasks, function (err, results) {
        cb(err, results);
      });
    }]
  }, done);
};
