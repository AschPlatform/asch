var assert = require('assert');
var crypto = require('crypto');
var program = require('commander');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Logger = require('./src/logger');
var init = require('./src/init');

function verifyGenesisBlock(scope, block) {
  try {
    var payloadHash = crypto.createHash('sha256');
    var payloadLength = 0;

    for (var i = 0; i < block.transactions.length; ++i) {
      var trs = block.transactions[i];
      var bytes = scope.base.transaction.getBytes(trs);
      payloadLength += bytes.length;
      payloadHash.update(bytes);
    }
    var id = scope.base.block.getId(block);
    assert.equal(payloadLength, block.payloadLength, 'Unexpected payloadLength');
    assert.equal(payloadHash.digest().toString('hex'), block.payloadHash, 'Unexpected payloadHash');
    assert.equal(id, block.id, 'Unexpected block id');
    assert.equal(id, '11839820784468442760', 'Block id is incorrect');
  } catch (e) {
    assert(false, 'Failed to verify genesis block: ' + e);
  }
}

function main() {
  process.stdin.resume();

  var version = '0.9.0';
  program
    .version(version)
    .option('-c, --config <path>', 'Config file path')
    .option('-p, --port <port>', 'Listening port number')
    .option('-a, --address <ip>', 'Listening host name or ip')
    .option('-b, --blockchain <path>', 'Blockchain db path')
    .option('-g, --genesisblock <path>', 'Genesisblock path')
    .option('-x, --peers [peers...]', 'Peers list')
    .option('-l, --log <level>', 'Log level')
    .option('-d, --daemon', 'Run asch node as daemon')
    .option('--base <dir>', 'Base directory')
    .parse(process.argv);

  var baseDir = program.base || './';
  var buildVersion = fs.readFileSync(path.join(baseDir, 'build-version'), 'utf8');

  var pidFile = path.join(baseDir, 'asch.pid');
  if (fs.existsSync(pidFile)) {
    console.log('Failed: asch server already started');
    process.exit(1);
    return;
  }
  if (program.daemon) {
    console.log('Asch server started as daemon ...');
    require('daemon')();
    fs.writeFileSync(pidFile, process.pid, 'utf8');
  }

  var appConfigFile = path.join(baseDir, 'config.json');
  if (program.config) {
    appConfigFile = path.resolve(process.cwd(), program.config);
  }
  var appConfig = JSON.parse(fs.readFileSync(appConfigFile, 'utf8'));

  appConfig.version = version;
  appConfig.baseDir = baseDir;

  var genesisblockFile = path.join(baseDir, 'genesisBlock.json');
  if (program.genesisblock) {
    genesisblockFile = path.resolve(process.cwd(), program.genesisblock);
  }
  var genesisblock = JSON.parse(fs.readFileSync(genesisblockFile, 'utf8'));

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
    appConfig.logLevel = program.log;
  }

  var logger = new Logger({
    filename: path.join(baseDir, 'debug.log'),
    echo: program.deamon ? null : appConfig.logLevel,
    errorLevel: appConfig.logLevel
  });

  var options = {
    dbFile: program.blockchain || path.join(baseDir, './blockchain.db'),
    appConfig: appConfig,
    genesisblock: genesisblock,
    logger: logger,
    buildVersion: buildVersion
  };

  var d = require('domain').create();
  d.on('error', function (err) {
    logger.fatal('Domain error', err);
    process.exit(0);
  });
  d.run(function () {
    init(options, function(err, scope) {
      if (err) {
        scope.logger.fatal(err)
        process.exit(1);
        return;
      }
      verifyGenesisBlock(scope, scope.genesisblock.block);

      scope.bus.message("bind", scope.modules);

      scope.logger.info("Modules ready and launched");
      if (!scope.config.publicIp) {
        scope.logger.warn("Failed to get public ip, block forging MAY not work!");
      }

      process.once('cleanup', function () {
        scope.logger.info("Cleaning up...");
        async.eachSeries(scope.modules, function (module, cb) {
          if (typeof (module.cleanup) == 'function') {
            module.cleanup(cb);
          } else {
            setImmediate(cb);
          }
        }, function (err) {
          if (err) {
              scope.logger.error(err);
          } else {
              scope.logger.info("Cleaned up successfully");
          }
          if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
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
