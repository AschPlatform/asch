const assert = require('assert')
const crypto = require('crypto')
const program = require('commander')
const path = require('path')
const fs = require('fs')
const async = require('async')
const randomstring = require('randomstring')
const ip = require('ip')
const daemon = require('daemon')
const tracer = require('tracer')
const init = require('./src/init')
const initRuntime = require('./src/runtime')

function verifyGenesisBlock(scope, block) {
  try {
    const payloadHash = crypto.createHash('sha256')

    for (let i = 0; i < block.transactions.length; ++i) {
      const trs = block.transactions[i]
      const bytes = scope.base.transaction.getBytes(trs)
      payloadHash.update(bytes)
    }
    const id = scope.base.block.getId(block)
    assert.equal(
      payloadHash.digest().toString('hex'),
      block.payloadHash,
      'Unexpected payloadHash',
    )
    assert.equal(id, block.id, 'Unexpected block id')
  } catch (e) {
    throw e
  }
}

function main() {
  process.stdin.resume()

  const version = '1.4.0-beta'
  program
    .version(version)
    .option('-c, --config <path>', 'Config file path')
    .option('-p, --port <port>', 'Listening port number')
    .option('-a, --address <ip>', 'Listening host name or ip')
    .option('-g, --genesisblock <path>', 'Genesisblock path')
    .option('-x, --peers [peers...]', 'Peers list')
    .option('-l, --log <level>', 'Log level')
    .option('-d, --daemon', 'Run asch node as daemon')
    .option('-e, --execute <path>', 'exe')
    .option('--chains <dir>', 'Chains directory')
    .option('--base <dir>', 'Base directory')
    .option('--data <dir>', 'Data directory')
    .parse(process.argv)

  const baseDir = program.base || './'

  let appConfigFile = path.join(baseDir, 'config.json')
  if (program.config) {
    appConfigFile = path.resolve(process.cwd(), program.config)
  }
  const appConfig = JSON.parse(fs.readFileSync(appConfigFile, 'utf8'))

  const pidFile = appConfig.pidFile || path.join(baseDir, 'asch.pid')
  if (fs.existsSync(pidFile)) {
    console.log('Failed: asch server already started')
    return
  }

  if (!appConfig.chain.masterpassword) {
    appConfig.chain.masterpassword = randomstring.generate({
      length: 12,
      readable: true,
      charset: 'alphanumeric',
    })
    fs.writeFileSync(appConfigFile, JSON.stringify(appConfig, null, 2), 'utf8')
  }

  appConfig.version = version
  appConfig.baseDir = baseDir
  appConfig.dataDir = program.data || path.resolve(baseDir, 'data')
  appConfig.buildVersion = 'DEFAULT_BUILD_TIME'
  appConfig.netVersion = process.env.NET_VERSION || 'testnet'
  appConfig.publicDir = path.join(baseDir, 'public', 'dist')
  appConfig.chainDir = program.chains || path.join(baseDir, 'chains')

  global.Config = appConfig

  let genesisblockFile = path.join(baseDir, 'genesisBlock.json')
  if (program.genesisblock) {
    genesisblockFile = path.resolve(process.cwd(), program.genesisblock)
  }
  const genesisblock = JSON.parse(fs.readFileSync(genesisblockFile, 'utf8'))

  if (program.port) {
    appConfig.port = program.port
  }

  if (program.address) {
    appConfig.address = program.address
  }

  if (program.peers) {
    if (typeof program.peers === 'string') {
      appConfig.peers.list = program.peers.split(',').map((peer) => {
        const parts = peer.split(':')
        return {
          ip: parts.shift(),
          port: parts.shift() || appConfig.port,
        }
      })
    } else {
      appConfig.peers.list = []
    }
  }

  if (appConfig.netVersion === 'mainnet') {
    const seeds = [
      757137132,
      1815983436,
      759980934,
      759980683,
      1807690192,
      1758431015,
      1760474482,
      1760474149,
      759110497,
      757134616,
    ]
    for (let i = 0; i < seeds.length; ++i) {
      appConfig.peers.list.push({ ip: ip.fromLong(seeds[i]), port: 80 })
    }
  }

  if (program.log) {
    appConfig.logLevel = program.log
  }

  const protoFile = path.join(baseDir, 'proto', 'index.proto')
  if (!fs.existsSync(protoFile)) {
    console.log('Failed: proto file not exists!')
    return
  }

  if (program.daemon) {
    console.log('Asch server started as daemon ...')
    daemon({ cwd: process.cwd() })
    fs.writeFileSync(pidFile, process.pid, 'utf8')
  }

  let logger
  if (program.daemon) {
    logger = tracer.dailyfile({
      root: path.join(baseDir, 'logs'),
      maxLogFiles: 10,
      allLogsFileName: 'debug',
    })
  } else {
    logger = tracer.colorConsole()
  }
  tracer.setLevel(appConfig.logLevel)

  const options = {
    appConfig,
    genesisblock,
    logger,
    protoFile,
  }

  if (program.reindex) {
    appConfig.loading.verifyOnLoading = true
  }

  global.featureSwitch = {}
  global.state = {}

  init(options, (error, scope) => {
    if (error) {
      scope.logger.fatal(error)
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile)
      }
      process.exit(1)
      return
    }
    process.once('cleanup', () => {
      scope.logger.info('Cleaning up...')
      async.eachSeries(scope.modules, (module, cb) => {
        if (typeof (module.cleanup) === 'function') {
          module.cleanup(cb)
        } else {
          setImmediate(cb)
        }
      }, (err) => {
        if (err) {
          scope.logger.error('Error while cleaning up', err)
        } else {
          scope.logger.info('Cleaned up successfully')
        }
        (async () => {
          try {
            await global.app.sdb.close()
          } catch (e) {
            scope.logger.error('failed to close sdb', e)
          }
        })()

        if (fs.existsSync(pidFile)) {
          fs.unlinkSync(pidFile)
        }
        process.exit(1)
      })
    })

    process.once('SIGTERM', () => {
      process.emit('cleanup')
    })

    process.once('exit', () => {
      scope.logger.info('process exited')
    })

    process.once('SIGINT', () => {
      process.emit('cleanup')
    })

    process.on('uncaughtException', (err) => {
      // handle the error safely
      scope.logger.fatal('uncaughtException', { message: err.message, stack: err.stack })
      process.emit('cleanup')
    })
    process.on('unhandledRejection', (err) => {
      // handle the error safely
      scope.logger.error('unhandledRejection', err)
      process.emit('cleanup')
    })

    verifyGenesisBlock(scope, scope.genesisblock.block)

    options.library = scope;
    (async () => {
      try {
        await initRuntime(options)
      } catch (e) {
        logger.error('init runtime error: ', e)
        process.exit(1)
        return
      }
      if (program.execute) {
        // only for debug use
        // require(path.resolve(program.execute))(scope)
      }
      scope.bus.message('bind', scope.modules)
      global.modules = scope.modules
      global.library = scope

      scope.logger.info('Modules ready and launched')
      if (!scope.config.publicIp) {
        scope.logger.warn('Failed to get public ip, block forging MAY not work!')
      }
    })()
  })
}

main()
