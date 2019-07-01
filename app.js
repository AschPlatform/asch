const program = require('commander')
const path = require('path')
const fs = require('fs')
const ip = require('ip')
const daemon = require('daemon')
const tracer = require('tracer')
const asch = require('asch-core')

const Application = asch.Application

function main() {
  process.stdin.resume()

  const version = '1.5.2'
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
      {
        ip: '47.52.169.154',
        port: 8193,
        id: 'PAxFQA98nFUYbUceLpXviadKaCZvHcKC6P'
      },
      {
        ip: '47.244.132.54',
        port: 8193,
        id: 'PKRX44RfMbxAu2txUAMPtRCEjEJfDr8FVu'
      },
      {
        ip: '45.32.254.236',
        port: 81,
        id: 'PGb927r7CTmrGH1RWMh1Vf15ACDHB2v6mM'
      },
      {
        ip: '108.61.181.76',
        port: 81,
        id: 'PECZ4C9oxr4473ZP42nRfgi995QX9v9KnG'
      },
      {
        ip: '104.207.135.39',
        port: 81,
        id: 'PHnHEhUPMAgHL5eKyT6TkAKB1arKHUUvEu'
      },
      {
        ip: '45.76.99.134',
        port: 81,
        id: 'PDTNRtKNJkncb17gQiVHxdzVw7vwKgmpr7'
      },
      {
        ip: '104.238.181.114',
        port: 81,
        id: 'PMD3LUNZH8KVr5ZjXpXu7uCyTX4PaxMM86'
      },
      {
        ip: '107.191.41.208',
        port: 81,
        id: 'PtYpACnBydF9ee8U4C3NXpHVKEK4p2Rdn'
      },
      {
        ip: '104.238.180.37',
        port: 81,
        id: 'P5KiQADBEz4NiDSEt5o8xnwLjwDXw2qLn7'
      },
      {
        ip: '45.76.98.139',
        port: 81,
        id: 'PCbSyzhU7qLbJh2nBrdFB9wHk2rGJsg8WV'
      }
    ]
    for (let i = 0; i < seeds.length; ++i) {
      appConfig.peers.list.push(seeds[i])
    }
  }

  if (program.log) {
    appConfig.logLevel = program.log
  } else if (process.env.LOG_LEVEL) {
    appConfig.logLevel = program.log
  }
  appConfig.logLevel = program.log || process.env.LOG_LEVEL || appConfig.logLevel

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
      dateformat: 'yyyy-mm-dd HH:MM:ss.L'
    })
  } else {
    logger = tracer.colorConsole({ dateformat: 'yyyy-mm-dd HH:MM:ss.L' })
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
