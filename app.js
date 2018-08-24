const program = require('commander')
const path = require('path')
const fs = require('fs')
const randomstring = require('randomstring')
const ip = require('ip')
const daemon = require('daemon')
const tracer = require('tracer')
const asch = require('asch-core')

const Application = asch.Application

function main() {
  process.stdin.resume()

  const version = '1.5.0'
  program
    .version(version)
    .option('-c, --config <path>', 'Config file path')
    .option('-p, --port <port>', 'Listening port number')
    .option('-a, --address <ip>', 'Listening host name or ip')
    .option('-g, --genesisblock <path>', 'Genesisblock path')
    .option('-x, --peers [peers...]', 'Peers list')
    .option('-l, --log <level>', 'Log level')
    .option('-d, --daemon', 'Run asch node as daemon')
    .option('--app <dir>', 'App directory')
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

  appConfig.version = version
  appConfig.baseDir = baseDir
  appConfig.dataDir = program.data || path.resolve(baseDir, 'data')
  appConfig.appDir = program.app || path.resolve(baseDir, 'src')
  appConfig.buildVersion = 'DEFAULT_BUILD_TIME'
  appConfig.netVersion = process.env.NET_VERSION || 'testnet'
  appConfig.publicDir = path.join(baseDir, 'public', 'dist')

  global.Config = appConfig

  let genesisblockFile = path.join(baseDir, 'genesisBlock.json')
  if (program.genesisblock) {
    genesisblockFile = path.resolve(process.cwd(), program.genesisblock)
  }
  const genesisblock = JSON.parse(fs.readFileSync(genesisblockFile, 'utf8'))

  if (program.port) {
    appConfig.port = program.port
  }
  if (!appConfig.peerPort) {
    appConfig.peerPort = appConfig.port + 1
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
      appConfig.peers.list.push({ ip: ip.fromLong(seeds[i]), port: 81 })
    }
  }

  if (program.log) {
    appConfig.logLevel = program.log
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
    pidFile,
  }
  const app = new Application(options)
  app.run()
}

main()
