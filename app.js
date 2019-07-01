const program = require('commander')
const path = require('path')
const fs = require('fs')
const ip = require('ip')
const daemon = require('daemon')
const tracer = require('tracer')
const asch = require('asch-core')
const { promisify } = require('util')
const https = require('https')

const Application = asch.Application

function request(url, cb) {
  const isDone = false
  function done(err, data) {
    if (!isDone) cb(err, data)
  }
  https.get(url, (res) => {
    const { statusCode } = res

    if (statusCode !== 200) {
      return done(`Invalid status code: ${statusCode}`)
    }

    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', (chunk) => { rawData += chunk })
    res.on('end', () => {
      try {
        const json = JSON.parse(rawData)
        done(null, json)
      } catch (e) {
        done(e)
      }
    })
    return null
  }).on('error', (e) => {
    done(e)
  })
}

class Task {
  constructor(name, interval) {
    this.name = name
    this.interval = interval
  }
  start() {
    this.loopAsyncFunction(this.run.bind(this), this.interval)
  }
  loopAsyncFunction(asyncFunc, interval) {
    const self = this
    setImmediate(function next() {
      (async () => {
        try {
          await asyncFunc()
        } catch (e) {
          app.logger.error(`Failed to run task ${this.name}`, e)
        }
        if (!self.stopped) {
          setTimeout(next, interval)
        }
      })()
    })
  }
}

class BlockIndexTask extends Task {
  constructor(name, interval) {
    super(name, interval)
    this.lastIndexHeight = 1
    this.stopped = false
    this.delegateMap = new Map()
  }

  async run() {
    const latestHeightIndex = await app.sdb.findAll('BlockIndex', {
      limit: 1,
      sort: {
        blockHeight: -1,
      },
    })
    app.logger.info('found latest block index', latestHeightIndex)
    if (latestHeightIndex && latestHeightIndex.length !== 0) {
      this.lastIndexHeight = latestHeightIndex[0].blockHeight + 1
    }
    app.logger.info(`start to build block index from height: ${this.lastIndexHeight}`)
    let counter = 0
    while (true) {
      const block = await app.sdb.getBlockByHeight(this.lastIndexHeight)
      if (!block) {
        app.logger.info('block index building completed')
        break
      }
      let producerName = await this.getProducerNameByPublicKey(block.delegate)
      if (!producerName) {
        app.logger.error(`block producer name not found: ${block.delegate}`)
        producerName = 'nobody'
      }
      this.lastIndexHeight++
      app.sdb.create('BlockIndex', {
        blockHeight: block.height,
        producerName,
      })
      counter++
      if (counter === 10000) {
        app.logger.info('10000 block index created')
        counter = 0
        app.sdb.saveLocalChanges()
      }
    }
    app.sdb.saveLocalChanges()
  }
  async getProducerNameByPublicKey(pk) {
    const name = this.delegateMap.get(pk)
    if (name) {
      return name
    }
    const delegate = app.sdb.getAll('Delegate').filter(d => d.publicKey === pk).pop()
    if (!delegate) {
      return null
    }
    this.delegateMap.set(pk, delegate.name)
    return delegate.name
  }
}

class AsyncCallbackTask extends Task {
  constructor(name, interval, callback) {
    super(name, interval)
    this.callback = callback
  }
  async run() {
    await this.callback()
  }
}

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

  setTimeout(() => {
    const blockIndexTask = new BlockIndexTask('BuildIndex', 13 * 1000)
    blockIndexTask.start()

    const getMarketInfoTask = new AsyncCallbackTask('GetMarketInfo', 10 * 1000, async () => {
      const requestAsync = promisify(request)
      const results = await Promise.all([
        requestAsync('https://www.okex.com/api/v1/ticker.do?symbol=xas_usdt'),
        requestAsync('https://www.okex.com/api/v1/ticker.do?symbol=xas_btc'),
      ])
      global.app.logger.debug('get market info results', results)
      if (results.length !== 2 || !results[0].ticker || !results[1].ticker) {
        global.app.logger.warn('invalid market info result', results)
        return
      }
      global.marketInfo = {
        priceUsdt: results[0].ticker.last,
        priceBtc: results[1].ticker.last,
      }
    })
    getMarketInfoTask.start()
  }, 10000)
}

main()
