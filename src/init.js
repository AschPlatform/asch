const fs = require('fs')
const path = require('path')
const os = require('os')
const domain = require('domain')
const { EventEmitter } = require('events')
const http = require('http')
const https = require('https')
const socketio = require('socket.io')
const async = require('async')
const ZSchema = require('z-schema')
const ip = require('ip')
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const changeCase = require('change-case')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const Sequence = require('./utils/sequence.js')
const slots = require('./utils/slots.js')
const queryParser = require('./utils/express-query-int')
const ZSchemaExpress = require('./utils/zscheme-express.js')
const Transaction = require('./base/transaction.js')
const Block = require('./base/block.js')
const Consensus = require('./base/consensus.js')
const protobuf = require('./utils/protobuf.js')

const moduleNames = [
  'server',
  'accounts',
  'transactions',
  'loader',
  'system',
  'peer',
  'transport',
  'delegates',
  'round',
  'uia',
  'chains',
  'blocks',
  'gateway',
]

const CIPHERS = `
  ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:
  ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:
  ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:
  DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:
  !aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA`

function getPublicIp() {
  let publicIp = null
  try {
    const ifaces = os.networkInterfaces()
    Object.keys(ifaces).forEach((ifname) => {
      ifaces[ifname].forEach((iface) => {
        if (iface.family !== 'IPv4' || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return
        }
        if (!ip.isPrivate(iface.address)) {
          publicIp = iface.address
        }
      })
    })
  } catch (e) {
    throw e
  }
  return publicIp
}

function isNumberOrNumberString(value) {
  return !(Number.isNaN(value) || Number.isNaN(parseInt(value, 10)) ||
    String(parseInt(value, 10)) !== String(value))
}

module.exports = function init(options, done) {
  const modules = []
  const { appConfig, genesisblock } = options

  if (!appConfig.publicIp) {
    appConfig.publicIp = getPublicIp()
  }

  async.auto({
    config(cb) {
      cb(null, appConfig)
    },

    logger(cb) {
      cb(null, options.logger)
    },

    genesisblock(cb) {
      cb(null, { block: genesisblock })
    },

    protobuf(cb) {
      const protoFile = path.join(__dirname, '..', 'proto', 'index.proto')
      if (!fs.existsSync(protoFile)) {
        console.log('Failed: proto file not exists!')
        return
      }
      protobuf(protoFile, cb)
    },

    scheme(cb) {
      ZSchema.registerFormat('hex', (str) => {
        let b
        try {
          b = Buffer.from(str, 'hex')
        } catch (e) {
          return false
        }

        return b && b.length > 0
      })

      ZSchema.registerFormat('publicKey', (str) => {
        if (str.length === 0) {
          return true
        }

        try {
          const publicKey = Buffer.from(str, 'hex')

          return publicKey.length === 32
        } catch (e) {
          return false
        }
      })

      ZSchema.registerFormat('splitarray', (str) => {
        try {
          const a = str.split(',')
          return a.length > 0 && a.length <= 1000
        } catch (e) {
          return false
        }
      })

      ZSchema.registerFormat('signature', (str) => {
        if (str.length === 0) {
          return true
        }

        try {
          const signature = Buffer.from(str, 'hex')
          return signature.length === 64
        } catch (e) {
          return false
        }
      })

      ZSchema.registerFormat('listQuery', (obj) => {
        obj.limit = 100
        return true
      })

      ZSchema.registerFormat('listDelegates', (obj) => {
        obj.limit = 101
        return true
      })

      ZSchema.registerFormat('checkInt', value => !isNumberOrNumberString(value))

      cb(null, new ZSchema())
    },

    network: ['config', (cb, scope) => {
      const app = express()

      app.use(compression({ level: 6 }))
      app.use(cors())
      app.options('*', cors())

      const server = http.createServer(app)
      const io = socketio(server)
      let sslio
      let sslserver

      if (scope.config.ssl.enabled) {
        const privateKey = fs.readFileSync(scope.config.ssl.options.key)
        const certificate = fs.readFileSync(scope.config.ssl.options.cert)

        sslserver = https.createServer({
          key: privateKey,
          cert: certificate,
          ciphers: CIPHERS,
        }, app)

        sslio = socketio(sslServer)
      }

      cb(null, {
        express,
        app,
        server,
        io,
        sslserver,
        sslio,
      })
    }],

    dbSequence: ['logger', (cb, scope) => {
      const sequence = new Sequence({
        name: 'db',
        onWarning: (current) => {
          scope.logger.warn('DB queue', current)
        },
      })
      cb(null, sequence)
    }],

    sequence: ['logger', (cb, scope) => {
      const sequence = new Sequence({
        name: 'normal',
        onWarning: (current) => {
          scope.logger.warn('Main queue', current)
        },
      })
      cb(null, sequence)
    }],

    balancesSequence: ['logger', (cb, scope) => {
      const sequence = new Sequence({
        name: 'balance',
        onWarning: (current) => {
          scope.logger.warn('Balance queue', current)
        },
      })
      cb(null, sequence)
    }],

    connect: ['config', 'genesisblock', 'logger', 'network', (cb, scope) => {
      const PAYLOAD_LIMIT_SIZE = '8mb'
      scope.network.app.engine('html', require('ejs').renderFile)
      scope.network.app.use(require('express-domain-middleware'))
      scope.network.app.set('view engine', 'ejs')
      scope.network.app.set('views', scope.config.publicDir)
      scope.network.app.use(scope.network.express.static(scope.config.publicDir))
      scope.network.app.use(bodyParser.raw({ limit: PAYLOAD_LIMIT_SIZE }))
      scope.network.app.use(bodyParser.urlencoded({
        extended: true,
        limit: PAYLOAD_LIMIT_SIZE,
        parameterLimit: 5000,
      }))
      scope.network.app.use(bodyParser.json({ limit: PAYLOAD_LIMIT_SIZE }))
      scope.network.app.use(methodOverride())

      const ignore = [
        'id', 'name', 'lastBlockId', 'blockId',
        'transactionId', 'address', 'recipientId',
        'senderId', 'previousBlock',
      ]
      scope.network.app.use(queryParser({
        parser(value, radix, name) {
          if (ignore.indexOf(name) >= 0) {
            return value
          }

          if (!isNumberOrNumberString(value)) {
            return value
          }

          return Number.parseInt(value, radix)
        },
      }))

      scope.network.app.use(ZSchemaExpress(scope.scheme))

      scope.network.app.use((req, res, next) => {
        const parts = req.url.split('/')
        const host = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const { port } = req.headers

        scope.logger.debug(`receive request: ${req.method} ${req.url} from ${host}:${port}`)

        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('Content-Security-Policy', 'frame-ancestors \'none\'')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Origin, Content-Length,  X-Requested-With, Content-Type, Accept, request-node-status',
        )
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD, PUT, DELETE')

        if (req.method === 'OPTIONS') {
          res.sendStatus(200)
          scope.logger.debug('Response pre-flight request')
          return
        }

        const URI_PREFIXS = ['api', 'api2', 'peer']
        const isApiOrPeer = parts.length > 1 && (URI_PREFIXS.indexOf(parts[1]) !== -1)
        const { whiteList } = scope.config.api.access
        const { blackList } = scope.config.peers

        const forbidden = isApiOrPeer && (
          (whiteList.length > 0 && whiteList.indexOf(ip) < 0) ||
          (blackList.length > 0 && blackList.indexOf(ip) >= 0))

        if (isApiOrPeer && forbidden) {
          res.sendStatus(403)
        } else if (isApiOrPeer && req.headers['request-node-status'] === 'yes') {
          // Add server status info to response header
          const lastBlock = scope.modules.blocks.getLastBlock()
          res.setHeader('Access-Control-Expose-Headers', 'node-status')
          res.setHeader('node-status', JSON.stringify({
            blockHeight: lastBlock.height,
            blockTime: slots.getRealTime(lastBlock.timestamp),
            blocksBehind: slots.getNextSlot() - (slots.getSlotNumber(lastBlock.timestamp) + 1),
            version: scope.modules.peer.getVersion(),
          }))
          next()
        } else {
          next()
        }
      })

      scope.network.server.listen(scope.config.port, scope.config.address, (err) => {
        scope.logger.log(`Asch started: ${scope.config.address}:${scope.config.port}`)

        if (!err) {
          if (scope.config.ssl.enabled) {
            scope.network.sslserver.listen(
              scope.config.ssl.options.port,
              scope.config.ssl.options.address,
              (sslError) => {
                const { address, port } = scope.config.ssl.options
                scope.logger.log(`Asch https started: ${address}:${port}`)
                cb(sslError, scope.network)
              },
            )
          } else {
            cb(null, scope.network)
          }
        } else {
          cb(err, scope.network)
        }
      })
    }],

    bus(cb) {
      class Bus extends EventEmitter {
        message(topic, ...restArgs) {
          modules.forEach((module) => {
            const eventName = `on${changeCase.pascalCase(topic)}`
            if (typeof (module[eventName]) === 'function') {
              module[eventName].apply(module[eventName], [...restArgs])
            }
          })
          this.emit(topic, ...restArgs)
        }
      }
      cb(null, new Bus())
    },

    base: ['bus', 'scheme', 'genesisblock',
      (outerCallback, outerScope) => {
        async.auto({
          bus(cb) {
            cb(null, outerScope.bus)
          },
          scheme(cb) {
            cb(null, outerScope.scheme)
          },
          genesisblock(cb) {
            cb(null, { block: genesisblock })
          },
          consensus: ['bus', 'scheme', 'genesisblock', (cb, scope) => {
            new Consensus(scope, cb)
          }],
          transaction: ['bus', 'scheme', 'genesisblock', (cb, scope) => {
            new Transaction(scope, cb)
          }],
          block: ['bus', 'scheme', 'genesisblock', 'transaction', (cb, scope) => {
            new Block(scope, cb)
          }],
        }, outerCallback)
      }],

    modules: [
      'network', 'connect', 'config', 'logger', 'bus',
      'sequence', 'dbSequence', 'balancesSequence', 'base',
      (outerCallback, scope) => {
        global.library = scope
        const tasks = {}
        moduleNames.forEach((name) => {
          tasks[name] = (cb) => {
            const d = domain.create()

            d.on('error', (err) => {
              scope.logger.fatal(`Domain ${name}`, { message: err.message, stack: err.stack })
            })

            d.run(() => {
              scope.logger.debug('Loading module', name)
              const Klass = require(`./core/${name}`)
              const obj = new Klass(cb, scope)
              modules.push(obj)
            })
          }
        })
        async.series(tasks, (err, results) => {
          outerCallback(err, results)
        })
      }],
  }, done)
}
