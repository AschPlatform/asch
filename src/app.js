var assert = require('assert');
var crypto = require('crypto');
var program = require('commander');
var path = require('path');
var fs = require('fs');
var async = require('async');
var packageJson = require('../package.json');
var appConfig = require('../config.json');
var init = require('./init');

function verifyGenesisBlock(scope, block) {
  var payloadHash = crypto.createHash('sha256');
  var payloadLength = 0;
  var transactions = block.transactions.sort(function compare(a, b) {
    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;
    if (a.amount < b.amount) return -1;
    if (a.amount > b.amount) return 1;
    return 0;
  });
  for (var i = 0; i < transactions.length; ++i) {
    var trs = transactions[i];
    var bytes = scope.base.transaction.getBytes(trs);
    payloadLength += bytes.length;
    payloadHash.update(bytes);
  }
  var id = scope.base.block.getId(block);
  assert.equal(payloadLength, block.payloadLength);
  assert.equal(payloadHash.digest().toString('hex'), block.payloadHash);
  assert.equal(id, block.id);
  assert.equal(id, '8593810399212843182');
}

function main() {
  process.stdin.resume();

  program
    .version(packageJson.version)
    .option('-c, --config <path>', 'Config file path')
    .option('-p, --port <port>', 'Listening port number')
    .option('-a, --address <ip>', 'Listening host name or ip')
    .option('-b, --blockchain <path>', 'Blockchain db path')
    .option('-g, --genesisblock <path>', 'Genesisblock path')
    .option('-x, --peers [peers...]', 'Peers list')
    .option('-l, --log <level>', 'Log level')
    .parse(process.argv);

  if (program.config) {
    appConfig = require(path.resolve(process.cwd(), program.config));
  }

  var genesisblock = require('../genesisBlock.json');
  if (program.genesisblock) {
    genesisblock = require(path.resolve(process.cwd(), program.genesisblock));
  }

  if (program.port) {
    appConfig.port = program.port;
  }

  if (program.address) {
    appConfig.address = program.address;
  }

  if (program.peers) {
    if (typeof program.peers === 'string') {
      appConfig.peers.list = program.peers.split(',').map(function (peer) {
        peer = peer.split(":");
        return {
          ip: peer.shift(),
          port: peer.shift() || appConfig.port
        };
      });
    } else {
      appConfig.peers.list = [];
    }
  }

  if (program.log) {
    appConfig.consoleLogLevel = program.log;
  }

  var options = {
    dbFile: program.blockchain,
    appConfig: appConfig,
    genesisblock: genesisblock
  };
  var logger;
  var d = require('domain').create();
  d.on('error', function (err) {
    if (logger) {
      logger.fatal('Domain error', err);
    } else {
      console.error('Domain error', err);
    }
    process.exit(0);
  });
  d.run(function () {
    init(options, function(err, scope) {
      if (err) {
        scope.logger.fatal(err)
        process.exit(1);
        return;
      }
      logger = scope.logger;
      if (process.NODE_ENV === 'production') {
        verifyGenesisBlock(scope, scope.genesisblock.block);
      }
      scope.bus.message("bind", scope.modules);

      scope.logger.info("Modules ready and launched");

      process.once('cleanup', function () {
        scope.logger.info("Cleaning up...");
        async.eachSeries(scope.modules, function (module, cb) {
          if (typeof(module.cleanup) == 'function'){
            module.cleanup(cb);
          }else{
            setImmediate(cb);
          }
        }, function (err) {
          if (err) {
              scope.logger.error(err);
          } else {
              scope.logger.info("Cleaned up successfully");
          }
          process.exit(1);
        });
      });

      process.once('SIGTERM', function () {
        process.emit('cleanup');
      })

      process.once('exit', function () {
        process.emit('cleanup');
      });

      process.once('SIGINT', function () {
        process.emit('cleanup');
      });

      process.on('uncaughtException', function (err) {
        // handle the error safely
        scope.logger.fatal('uncaughtException', { message: err.message, stack: err.stack });
        process.emit('cleanup');
      });

      if (typeof gc !== 'undefined') {
        setInterval(function () {
          gc();
        }, 60000);
      }
    });
  });
}

main();
