const fs = require('fs')
const path = require('path')
const util = require('util')
const { EventEmitter } = require('events')
const changeCase = require('change-case')
const validate = require('validate.js')
const extend = require('extend')
const gatewayLib = require('asch-gateway')
const { AschCore } = require('asch-smartdb')
const slots = require('./utils/slots')
const amountHelper = require('./utils/amount')
const Router = require('./utils/router.js')
const BalanceManager = require('./smartdb/balance-manager')
const AutoIncrement = require('./smartdb/auto-increment')
const AccountRole = require('./utils/account-role')

const PIFY = util.promisify

class RouteWrapper {
  constructor() {
    this.hands = []
    this.routePath = null
  }

  get(routePath, handler) {
    this.handlers.push({ path: routePath, method: 'get', handler })
  }

  put(routePath, handler) {
    this.handlers.push({ path: routePath, method: 'put', handler })
  }

  post(routePath, handler) {
    this.handlers.push({ path: routePath, method: 'post', handler })
  }

  set path(val) {
    this.routePath = val
  }

  get path() {
    return this.routePath
  }

  get handlers() {
    return this.hands
  }
}

async function loadModels(dir) {
  let modelFiles = []
  try {
    modelFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error(`models load error: ${e}`)
    return
  }
  app.logger.debug('models', modelFiles)

  const schemas = []
  modelFiles.forEach((modelFile) => {
    app.logger.info('loading model', modelFile)
    const basename = path.basename(modelFile, '.js')
    const modelName = changeCase.pascalCase(basename)
    const fullpath = path.join('../', dir, modelFile)
    const schema = require(fullpath)
    schemas.push(new AschCore.ModelSchema(schema, modelName))
  })
  app.sdb.lock = (name) => {
    app.sdb.lockInCurrentBlock(name)
  }
  await app.sdb.init(schemas)
}

async function loadContracts(dir) {
  let contractFiles
  try {
    contractFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error(`contracts load error: ${e}`)
    return
  }
  contractFiles.forEach((contractFile) => {
    app.logger.info('loading contract', contractFile)
    const basename = path.basename(contractFile, '.js')
    const contractName = changeCase.snakeCase(basename)
    const fullpath = path.join('../', dir, contractFile)
    const contract = require(fullpath)
    if (contractFile !== 'index.js') {
      app.contract[contractName] = contract
    }
  })
}

async function loadInterfaces(dir, routes) {
  let interfaceFiles
  try {
    interfaceFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error(`interfaces load error: ${e}`)
    return
  }
  for (const f of interfaceFiles) {
    app.logger.info('loading interface', f)
    const basename = path.basename(f, '.js')
    const rw = new RouteWrapper()
    require(path.join('../', dir, f))(rw)
    const router = new Router()
    for (const h of rw.handlers) {
      router[h.method](h.path, (req, res) => {
        (async () => {
          try {
            const result = await h.handler(req)
            let response = { success: true }
            if (util.isObject(result) && !Array.isArray(result)) {
              response = extend(response, result)
            } else if (!util.isNullOrUndefined(result)) {
              response.data = result
            }
            res.send(response)
          } catch (e) {
            res.status(500).send({ success: false, error: e.message })
          }
        })()
      })
    }
    if (!rw.path) {
      rw.path = `/api/v2/${basename}`
    }
    routes.use(rw.path, router)
  }
}

function adaptSmartDBLogger(logLevel) {
  const { LogLevel } = AschCore
  const levelMap = {
    trace: LogLevel.Trace,
    debug: LogLevel.Debug,
    log: LogLevel.Log,
    info: LogLevel.Info,
    warn: LogLevel.Warn,
    error: LogLevel.Error,
    fatal: LogLevel.Fatal,
  }

  AschCore.LogManager.logFactory = {
    level: levelMap[logLevel] || LogLevel.Info,
    format: false,
    create: () => app.logger,
  }
}

module.exports = async function runtime(options) {
  global.app = {
    db: null,
    sdb: null,
    balances: null,
    model: {},
    contract: {},
    contractTypeMapping: {},
    feeMapping: {},
    defaultFee: {
      currency: 'XAS',
      min: '10000000',
    },
    hooks: {},
    custom: {},
    logger: options.logger,
  }
  app.validators = {
    amount: value => amountHelper.validate(value),
    string: (value, constraints) => {
      if (constraints.length) {
        return JSON.stringify(validate({ data: value }, { data: { length: constraints.length } }))
      } if (constraints.isEmail) {
        return JSON.stringify(validate({ email: value }, { email: { email: true } }))
      } if (constraints.url) {
        return JSON.stringify(validate({ url: value }, { url: { url: constraints.url } }))
      } if (constraints.number) {
        return JSON.stringify(validate(
          { number: value },
          { number: { numericality: constraints.number } },
        ))
      }
      return null
    },
  }
  app.validate = (type, value, constraints) => {
    if (!app.validators[type]) throw new Error(`Validator not found: ${type}`)
    const error = app.validators[type](value, constraints)
    if (error) throw new Error(error)
  }
  app.registerContract = (type, name) => {
    // if (type < 1000) throw new Error('Contract types that small than 1000 are reserved')
    app.contractTypeMapping[type] = name
  }
  app.getContractName = type => app.contractTypeMapping[type]

  app.registerFee = (type, min, currency) => {
    app.feeMapping[type] = {
      currency: currency || app.defaultFee.currency,
      min,
    }
  }
  app.getFee = type => app.feeMapping[type]

  app.setDefaultFee = (min, currency) => {
    app.defaultFee.currency = currency
    app.defaultFee.min = min
  }

  app.getRealTime = epochTime => slots.getRealTime(epochTime)

  app.registerHook = (name, func) => {
    app.hooks[name] = func
  }

  app.verifyBytes = (bytes, pk, signature) => app.api.crypto.verify(pk, signature, bytes)

  app.checkMultiSignature = (bytes, allowedKeys, signatures, m) => {
    const keysigs = signatures.split(',')
    const publicKeys = []
    const sigs = []
    for (const ks of keysigs) {
      if (ks.length !== 192) throw new Error('Invalid public key or signature')
      publicKeys.push(ks.substr(0, 64))
      sigs.push(ks.substr(64, 192))
    }
    const uniqPublicKeySet = new Set()
    for (const pk of publicKeys) {
      uniqPublicKeySet.add(pk)
    }
    if (uniqPublicKeySet.size !== publicKeys.length) throw new Error('Duplicated public key')

    let sigCount = 0
    for (let i = 0; i < publicKeys.length; ++i) {
      const pk = publicKeys[i]
      const sig = sigs[i]
      if (allowedKeys.indexOf(pk) !== -1 && app.verifyBytes(bytes, pk, sig)) {
        sigCount++
      }
    }
    if (sigCount < m) throw new Error('Signatures not enough')
  }

  const bitcoinUtils = new gatewayLib.bitcoin.Utils('testnet')
  app.gateway = {
    createMultisigAddress: (gateway, m, accounts, isRaw) => {
      if (gateway === 'bitcoin') {
        const ma = bitcoinUtils.createMultisigAddress(m, accounts)
        if (!isRaw) {
          ma.accountExtrsInfo.redeemScript = ma.accountExtrsInfo.redeemScript.toString('hex')
          ma.accountExtrsInfo = JSON.stringify(ma.accountExtrsInfo)
        }
        return ma
      }
      throw new Error(`Unsupported gateway: ${gateway}`)
    },
    isValidAddress: (gateway, address) => {
      if (gateway === 'bitcoin') {
        return bitcoinUtils.isValidAddress(address)
      }
      throw new Error(`Unsupported gateway: ${gateway}`)
    },
  }

  app.isCurrentBookkeeper = addr => modules.delegates.getBookkeeperAddresses().has(addr)

  app.executeContract = async (context) => {
    const error = await library.base.transaction.apply(context)
    if (!error) {
      const trs = await app.sdb.get('Transaction', context.trs.id)
      trs.executed = 1
    }
    return error
  }

  app.AccountRole = AccountRole

  const { baseDir } = options.appConfig
  const { dataDir } = options.appConfig

  const BLOCK_HEADER_DIR = path.resolve(dataDir, 'blocks')
  const BLOCK_DB_PATH = path.resolve(dataDir, 'blockchain.db')

  adaptSmartDBLogger(options.appConfig.LogLevel)
  app.sdb = new AschCore.SmartDB(BLOCK_DB_PATH, BLOCK_HEADER_DIR)
  app.balances = new BalanceManager(app.sdb)
  app.autoID = new AutoIncrement(app.sdb)
  app.events = new EventEmitter()

  app.util = {
    address: require('./utils/address.js'),
  }

  const builtinModelDir = path.join(baseDir, 'builtin')
  await loadModels(path.join(builtinModelDir, 'model'))
  await loadContracts(path.join(builtinModelDir, 'contract'))
  await loadInterfaces(path.join(builtinModelDir, 'interface'), options.library.network.app)

  app.contractTypeMapping[1] = 'basic.transfer'
  app.contractTypeMapping[2] = 'basic.setName'
  app.contractTypeMapping[3] = 'basic.setPassword'
  app.contractTypeMapping[4] = 'basic.lock'
  app.contractTypeMapping[5] = 'basic.unlock'
  app.contractTypeMapping[6] = 'basic.registerGroup'
  app.contractTypeMapping[7] = 'basic.registerAgent'
  app.contractTypeMapping[8] = 'basic.setAgent'
  app.contractTypeMapping[9] = 'basic.cancelAgent'
  app.contractTypeMapping[10] = 'basic.registerDelegate'
  app.contractTypeMapping[11] = 'basic.vote'
  app.contractTypeMapping[12] = 'basic.unvote'

  app.contractTypeMapping[100] = 'uia.registerIssuer'
  app.contractTypeMapping[101] = 'uia.registerAsset'
  app.contractTypeMapping[102] = 'uia.issue'
  app.contractTypeMapping[103] = 'uia.transfer'

  app.contractTypeMapping[200] = 'chain.register'
  app.contractTypeMapping[201] = 'chain.replaceDelegate'
  app.contractTypeMapping[202] = 'chain.addDelegate'
  app.contractTypeMapping[203] = 'chain.removeDelegate'
  app.contractTypeMapping[204] = 'chain.deposit'
  app.contractTypeMapping[205] = 'chain.withdrawal'

  app.contractTypeMapping[300] = 'proposal.propose'
  app.contractTypeMapping[301] = 'proposal.vote'
  app.contractTypeMapping[302] = 'proposal.activate'

  app.contractTypeMapping[400] = 'gateway.openAccount'
  app.contractTypeMapping[401] = 'gateway.registerMember'
  app.contractTypeMapping[402] = 'gateway.deposit'
  app.contractTypeMapping[403] = 'gateway.withdrawal'
  app.contractTypeMapping[404] = 'gateway.submitWithdrawalTransaction'
  app.contractTypeMapping[405] = 'gateway.submitWithdrawalSignature'
  app.contractTypeMapping[406] = 'gateway.submitOutTransactionId'

  app.contractTypeMapping[500] = 'group.vote'
  app.contractTypeMapping[501] = 'group.activate'
  app.contractTypeMapping[502] = 'group.addMember'
  app.contractTypeMapping[503] = 'group.removeMember'
  app.contractTypeMapping[504] = 'group.replaceMember'
}
