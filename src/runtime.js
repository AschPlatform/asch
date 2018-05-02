var fs = require('fs')
var path = require('path')
var util = require('util')
var EventEmitter = require('events').EventEmitter
var changeCase = require('change-case')
var tracer = require('tracer')
var validate = require('validate.js')
var extend = require('extend')
var gatewayLib = require('gateway-lib')

var PIFY = require('./utils/pify')
var slots = require('./utils/slots')
var amountHelper = require('./utils/amount')
var Router = require('./utils/router.js');
var BalanceManager = require('./smartdb/balance-manager')
var AutoIncrement = require('./smartdb/auto-increment')
var FeePool = require('./smartdb/fee-pool')
<<<<<<< Updated upstream
var AccountRole = require('./utils/account-role')
=======
const AschCore = require('./asch-smartdb').AschCore
>>>>>>> Stashed changes

class RouteWrapper {
  constructor() {
    this.handlers_ = []
    this.path_ = null
  }
  get(path, handler) {
    this.handlers_.push({ path: path, method: 'get', handler: handler })
  }

  put(path, handler) {
    this.handlers_.push({ path: path, method: 'put', handler: handler })
  }

  post(path, handler) {
    this.handlers_.push({ path: path, method: 'post', handler: handler })
  }
  set path(val) {
    this.path_ = val
  }
  get path() {
    return this.path_
  }
  get handlers() {
    return this.handlers_
  }
}

async function loadModels(dir) {
  let modelFiles = []
  try {
    modelFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error('models load error: ' + e)
    return
  }
  app.logger.debug('models', modelFiles)

  let schemas = []
  for (let i in modelFiles) {
    var modelFile = modelFiles[i]
    app.logger.info('loading model', modelFile)
    let basename = path.basename(modelFile, '.js')
    let modelName = changeCase.pascalCase(basename)
    let fullpath = path.join('../', dir, modelFile)
    let schema = require(fullpath)
    schemas.push(new AschCore.ModelSchema(schema, modelName))
  }
  await app.sdb.init(schemas)
}

async function loadContracts(dir) {
  let contractFiles
  try {
    contractFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error('contracts load error: ' + e)
    return
  }
  for (let i in contractFiles) {
    var contractFile = contractFiles[i]
    app.logger.info('loading contract', contractFile)
    let basename = path.basename(contractFile, '.js')
    let contractName = changeCase.snakeCase(basename)
    let fullpath = path.join('../', dir, contractFile)
    let contract = require(fullpath)
    if (contractFile !== 'index.js') {
      app.contract[contractName] = contract
    }
  }
}

async function loadInterfaces(dir, routes) {
  let interfaceFiles
  try {
    interfaceFiles = await PIFY(fs.readdir)(dir)
  } catch (e) {
    app.logger.error('interfaces load error: ' + e)
    return
  }
  for (let f of interfaceFiles) {
    app.logger.info('loading interface', f)
    let basename = path.basename(f, '.js')
    let rw = new RouteWrapper()
    require(path.join('../', dir, f))(rw)
    let router = new Router()
    for (let h of rw.handlers) {
      router[h.method](h.path, function (req, res) {
        (async function () {
          try {
            let result = await h.handler(req)
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
      rw.path = '/api/v2/' + basename
    }
    routes.use(rw.path, router)
  }
}

module.exports = async function (options) {
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
      min: '10000000'
    },
    feePool: null,
    hooks: {},
    custom: {},
    logger: options.logger
  }
  app.validators = {
    amount: function (value) {
      return amountHelper.validate(value)
    },
    string: function (value, constraints) {
      if (constraints.length) return JSON.stringify(validate({ data: value }, { data: { length: constraints.length } }))
      if (constraints.isEmail) return JSON.stringify(validate({ email: value }, { email: { email: true } }))
      if (constraints.url) return JSON.stringify(validate({ url: value }, { url: { url: constraints.url } }))
      if (constraints.number) return JSON.stringify(validate({ number: value }, { number: { numericality: constraints.number } }))
    },
    array: function (value, constraints) {
      if (constraints.length) {
        if (!JSON.stringify(validate.isArray(value))) return 'Is not an array'
        if (JSON.stringify(validate({ data: value }, { data: { length: constraints.length } }))) return 'Arrary lentgh is incorrect,correct length is ' + JSON.stringify(constraints.length)
      }
    }
  }
  app.validate = function (type, value, constraints) {
    if (!app.validators[type]) throw new Error('Validator not found: ' + type)
    let error = app.validators[type](value, constraints)
    if (error) throw new Error(error)
  }
  app.registerContract = function (type, name) {
    if (type < 1000) throw new Error('Contract types that small than 1000 are reserved')
    app.contractTypeMapping[type] = name
  }
  app.getContractName = function (type) {
    return app.contractTypeMapping[type]
  }

  app.registerFee = function (type, min, currency) {
    app.feeMapping[type] = {
      currency: currency || app.defaultFee.currency,
      min: min
    }
  }
  app.getFee = function (type) {
    return app.feeMapping[type]
  }

  app.setDefaultFee = function (min, currency) {
    app.defaultFee.currency = currency
    app.defaultFee.min = min
  }

  app.getRealTime = function (epochTime) {
    return slots.getRealTime(epochTime)
  }

  app.registerHook = function (name, func) {
    app.hooks[name] = func
  }

  app.verifyBytes = function (bytes, publicKey, signature) {
    return app.api.crypto.verify(publicKey, signature, bytes)
  }

  app.checkMultiSignature = function (bytes, allowedKeys, signatures, m) {
    let keysigs = signatures.split(',')
    let publicKeys = []
    let sigs = []
    for (let ks of keysigs) {
      if (ks.length !== 192) throw new Error('Invalid public key or signature')
      publicKeys.push(ks.substr(0, 64))
      sigs.push(ks.substr(64, 192))
    }
    let uniqPublicKeySet = new Set()
    for (let pk of publicKeys) {
      uniqPublicKeySet.add(pk)
    }
    if (uniqPublicKeySet.size !== publicKeys.length) throw new Error('Duplicated public key')

    let sigCount = 0
    for (let i = 0; i < publicKeys.length; ++i) {
      let pk = publicKeys[i]
      let sig = sigs[i]
      if (allowedKeys.indexOf(pk) !== -1 && app.verifyBytes(bytes, pk, sig)) {
        sigCount++
      }
    }
    if (sigCount < m) throw new Error('Signatures not enough')
  }

  app.createMultisigAddress = function (gateway, m, accounts, isRaw) {
    if (gateway === 'bitcoin') {
      let ma = gatewayLib.bitcoin.createMultisigAddress(m, accounts)
      if (!isRaw) {
        ma.accountExtrsInfo.redeemScript = ma.accountExtrsInfo.redeemScript.toString('hex')
        ma.accountExtrsInfo = JSON.stringify(ma.accountExtrsInfo)
      }
      return ma
    } else {
      throw new Error('Unsupported gateway: ' + gateway)
    }
  }

  app.isCurrentBookkeeper = function (addr) {
    return modules.delegates.getBookkeeperAddresses().has(addr)
  }

  app.AccountRole = AccountRole
  

  const BLOCK_HEADER_DIR = path.get( __dirname , options.dbFile || 'block_db/blockHeader' )
  const BLOCK_DB_PATH = path.get( __dirname, options.blockHeaderDir || 'block_db/blockchain.db')

  app.sdb = new AschCore.SmartDB(BLOCK_DB_PATH, BLOCK_HEADER_DIR)
  app.balances = new BalanceManager(app.sdb)
  app.autoID = new AutoIncrement(app.sdb)
  app.feePool = new FeePool(app.sdb)
  app.events = new EventEmitter()

  app.util = {
    address: require('./utils/address.js')
  }

  let rootDir = options.appConfig.baseDir
  let builtinModelDir = path.join(rootDir, 'builtin')
  await loadModels(path.join(builtinModelDir, 'model'))
  await loadContracts(path.join(builtinModelDir, 'contract'))
  await loadInterfaces(path.join(builtinModelDir, 'interface'), options.library.network.app)

  // await app.sdb.load('Account', ['xas', 'name', 'address'], ['address'])
  // await app.sdb.load('Balance', app.model.Balance.fields(), [['address', 'currency']])
  // await app.sdb.load('Delegate', app.model.Delegate.fields(), [['name'], ['publicKey']])
  // await app.sdb.load('Variable', ['key', 'value'], ['key'])
  // await app.sdb.load('Round', app.model.Round.fields(), [['round']])
  // await app.sdb.load('GatewayDeposit', ['tid', 'currency', 'oid', 'confirmations'], [['currency', 'oid']])

  app.contractTypeMapping[1] = 'basic.transfer'
  app.contractTypeMapping[2] = 'basic.setName'
  app.contractTypeMapping[3] = 'basic.setPassword'
  app.contractTypeMapping[4] = 'basic.lock'
  app.contractTypeMapping[5] = 'basic.unlock'
  app.contractTypeMapping[6] = 'basic.setMultisignature'
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
}