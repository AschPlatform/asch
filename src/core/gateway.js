var sandboxHelper = require('../utils/sandbox.js');
var slots = require('../utils/slots.js');
var Router = require('../utils/router.js');
var PIFY = require('../utils/pify.js')
var gatewayLib = require('gateway-lib')

const AschCore = require('../asch-smartdb').AschCore

var modules, library, self, private = {}, shared = {};

private.version, private.osName, private.port;

const GatewayLogType = {
  IMPORT_ADDRESS: 1,
  DEPOSIT: 2,
  WITHDRAWAL: 3,
  SEND_WITHDRAWAL: 4
}

function loopAsyncFunc(asyncFunc, interval) {
  setImmediate(function next() {
    (async function () {
      try {
        await asyncFunc()
      } catch (e) {
        library.logger.error('Failed to run ' + asyncFunc.name, e)
      }
      setTimeout(next, interval)
    })()
  })
}

async function getGatewayAccountByOutAddress(addresses, coldAccount) {
  let accountMap = {}
  for (let i of addresses) {
    let account
    if (coldAccount.address === i) {
      account = coldAccount.accountExtrsInfo.redeemScript
    } else {
      let gatewayAccount = await app.sdb.getBy('GatewayAccount', { outAddress: i } )
      if (!gatewayAccount) throw new Error('Input address have no gateway account')
      account = JSON.parse(gatewayAccount.attachment).redeemScript
    }
    accountMap[i] = account
  }
  return accountMap
}

function Gateway(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;

  setImmediate(cb, null, self);
}

Gateway.prototype.importAccounts = async function () {
  if (modules.loader.syncing()) {
    return
  }
  const GATEWAY = global.Config.gateway.name
  let lastImportAddressLog = await app.sdb.getBy('GatewayLog',  
    { gateway: GATEWAY,  type: GatewayLogType.IMPORT_ADDRESS } )

  library.logger.debug('find last import address log', lastImportAddressLog)
  let lastSeq = 0
  if (lastImportAddressLog) {
    lastSeq = lastImportAddressLog.seq
  } else {
    app.sdb.create('GatewayLog', GATEWAY ,{ gateway: GATEWAY, type: GatewayLogType.IMPORT_ADDRESS, seq: 0 })
  }
  //query( model, condition, fields, limit, offset, sort, join )
  let gatewayAccounts = await app.sdb.query('GatewayAccount', { gateway: GATEWAY, seq: { $gt: lastSeq } }, 100, { seq: 1 } )
  library.logger.debug('find gateway account', gatewayAccounts)
  let len = gatewayAccounts.length
  if (len > 0) {
    for (let a of gatewayAccounts) {
      await PIFY(gatewayLib.bitcoin.importAddress)(a.outAddress)
    }

    let key = app.sdb.getEntityKey('GatewayLog', { gateway : GATEWAY, type :GatewayLogType.IMPORT_ADDRESS })
    let log = await app.sdb.get( key )
    log.seq = gatewayAccounts[len - 1].seq 
  }
}

Gateway.prototype.processDeposits = async function () {
  if (modules.loader.syncing()) {
    return
  }
  const GATEWAY = global.Config.gateway.name
  const CURRENCY = 'BTC'

  let validators = await app.sdb.getMany('GatewayMember', { gateway: GATEWAY,  elected: 1 })
  if (!validators || !validators.length) {
    library.logger.error('Validators not found')
    return
  }

  if (await app.sdb.count('GatewayAccount', { gateway: GATEWAY } ) == 0) {
    library.logger.error('No gateway accounts')
    return
  }

  const gatewayLogKey = app.sdb.getEntityKey( 'GatewayAccount', { gateway: GATEWAY, type:GatewayLogType.DEPOSIT } )
  let lastDepositLog = await app.sdb.get('GatewayLog', gatewayLogKey )
  library.logger.debug('find DEPOSIT log', lastDepositLog)

  lastDepositLog = lastDepositLog || 
    await app.sdb.create('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.DEPOSIT, seq: 0 } )
  
  let lastSeq = lastDepositLog.seq
  let ret = await PIFY(gatewayLib.bitcoin.getTransactionsFromBlockHeight)(lastSeq)
  if (!ret || !ret.transactions) {
    library.logger.error('Failed to get gateway transactions')
    return
  }

  let outTransactions = ret.transactions.filter( ot => ot.category === 'receive' && ot.confirmations >= 1 )
    .sort((l, r) =>   l.height - r.height )

  library.logger.debug('get gateway transactions', outTransactions)
  let len = outTransactions.length
  if (len > 0) {
    for (let ot of outTransactions) {
      let isAccountOpened = await app.sdb.exists('GatewayAccount', { outAddress: ot.address })
      if (!isAccountOpened) {
        library.logger.warn('unknow address', { address: ot.address, gateway: GATEWAY, t: ot })
        continue
      }
      try {
        await PIFY(modules.transactions.addTransactionUnsigned)({
          type: 402,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [GATEWAY, ot.address, CURRENCY, String(ot.amount * 100000000), ot.txid]
        })
        library.logger.info('submit gateway transaction', { address: ot.address, amount: ot.amount, gateway: GATEWAY })
      } catch (e) {
        library.logger.warn('Failed to submit gateway deposit', e)
      }
    }
    lastDepositLog.seq = outTransactions[len - 1].height
  }
}

Gateway.prototype.processWithdrawals = async function () {
  if (modules.loader.syncing()) {
    return
  }
  let GATEWAY = global.Config.gateway.name
  let PAGE_SIZE = 25
  let validators = await app.sdb.getMany('GatewayMember', { gateway: GATEWAY, elected: 1 } )
  if (!validators || !validators.length) {
    library.logger.error('Validators not found')
    return
  }
  library.logger.debug('find gateway validators', validators)

  let outPublicKeys = validators.map((v) => v.outPublicKey).sort((l, r) => l - r)
  let unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
  let multiAccount = app.createMultisigAddress(GATEWAY, unlockNumber, outPublicKeys, true)
  library.logger.debug('gateway validators cold account', multiAccount)

  let withdrawalLogKey = app.sdb.getEntityKey( 'GatewayLog', { gateway: GATEWAY, type: GatewayLogType.WITHDRAWAL } )
  let lastWithdrawalLog = await app.sdb.get('GatewayLog', withdrawalLogKey )
  library.logger.debug('find ==========WITHDRAWAL============ log', lastWithdrawalLog)

  lastWithdrawalLog = lastWithdrawalLog ||
    await app.sdb.create('GatewayLog', withdrawalLogKey, { gateway: GATEWAY, type: GatewayLogType.WITHDRAWAL, seq: 0 })
  
  let lastSeq = lastWithdrawalLog.seq

  let withdrawals = await app.sdb.query('GatewayWithdrawal', { gateway: GATEWAY, seq: { $gt: lastSeq }  }, PAGE_SIZE )
  library.logger.debug('get gateway withdrawals', withdrawals)
  if (!withdrawals || !withdrawals.length) {
    return
  }

  let account = {
    privateKey: global.Config.gateway.outSecret
  }
  for (let w of withdrawals) {
    let contractParams = null
    try {
      if (!w.outTransaction) {
        let output = [{ address: w.recipientId, value: Number(w.amount) }]
        let ot = await PIFY(gatewayLib.bitcoin.createNewTransaction)(multiAccount, output)
        library.logger.debug('create withdrawl out transaction', ot)

        let inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
        library.logger.debug('input account info', inputAccountInfo)

        let ots = gatewayLib.bitcoin.signTransaction(ot, account, inputAccountInfo)
        library.logger.debug('sign withdrawl out transaction', ots)

        contractParams = {
          type: 404,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [w.tid, JSON.stringify(ot), JSON.stringify(ots)]
        }
      } else {
        let ot = JSON.parse(w.outTransaction)
        let inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
        let ots = gatewayLib.bitcoin.signTransaction(ot, account, inputAccountInfo)
        contractParams = {
          type: 405,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [w.tid, JSON.stringify(ots)]
        }
      }
    } catch (e) {
      library.logger.error('generate contract params error', e)
      return
    }
    try {
      await PIFY(modules.transactions.addTransactionUnsigned)(contractParams)
    } catch (e) {
      library.logger.error('process withdrawal contract error', e)
      // if failed to invoke 404, should continue to invoke 405
      if (contractParams.type === 404) {
        return
      }
    }
  }
  lastWithdrawalLog.seq = withdrawals[withdrawals.length - 1].seq
  app.sdb.saveLocalChanges()
}

Gateway.prototype.sendWithdrawals = async function () {
  if (modules.loader.syncing()) {
    return
  }
  let GATEWAY = global.Config.gateway.name
  const PAGE_SIZE = 25
  let logCond = {
    gateway: GATEWAY,
    type: GatewayLogType.SEND_WITHDRAWAL
  }
  let lastSeq = 0
  let lastLog = await app.model.GatewayLog.findOne({ condition: logCond })
  library.logger.debug('find ======SEND_WITHDRAWAL====== log', lastLog)
  if (lastLog) {
    lastSeq = lastLog.seq
  } else {
    await app.model.GatewayLog.create({ gateway: GATEWAY, type: GatewayLogType.SEND_WITHDRAWAL, seq: 0 })
  }
  let withdrawals = await app.model.GatewayWithdrawal.findAll({
    condition: {
      gateway: GATEWAY,
      seq: { $gt: lastSeq }
    },
    limit: PAGE_SIZE
  })
  library.logger.debug('get gateway withdrawals', withdrawals)
  if (!withdrawals || !withdrawals.length) {
    return
  }
  let validators = await app.model.GatewayMember.findAll({
    condition: {
      gateway: GATEWAY,
      elected: 1
    }
  })
  if (!validators) {
    library.logger.error('Validators not found')
    return
  }
  library.logger.debug('find gateway validators', validators)

  let outPublicKeys = validators.map((v) => v.outPublicKey).sort((l, r) => l - r)
  let unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
  let multiAccount = app.createMultisigAddress(GATEWAY, unlockNumber, outPublicKeys, true)
  library.logger.debug('gateway validators cold account', multiAccount)

  for (let w of withdrawals) {
    if (!w.outTransaction) {
      library.logger.debug('out transaction not created')
      return
    }
    let preps = await app.model.GatewayWithdrawalPrep.findAll({ condition: { wid: w.tid } })
    if (preps.length < unlockNumber) {
      library.logger.debug('not enough signature')
      return
    }
    let ot = JSON.parse(w.outTransaction)
    let ots = []
    for (let i = 0; i < unlockNumber; i++) {
      ots.push(JSON.parse(preps[i].signature))
    }
    let inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
    library.logger.debug('before build transaction')
    let finalTransaction = gatewayLib.bitcoin.buildTransaction(ot, ots, inputAccountInfo)
    try {
      library.logger.debug('before send raw tarnsaction', finalTransaction)
      let response = await PIFY(gatewayLib.bitcoin.sendRawTransaction)(finalTransaction)
      library.logger.debug('after send raw transaction', response)
    } catch (e) {
      library.logger.error('send raw transaction error', e)
    }
  }
  let len = withdrawals.length
  await app.model.GatewayLog.update({ seq: withdrawals[len - 1].seq }, logCond)
}

Gateway.prototype.onBlockchainReady = function () {
  if (global.Config.gateway) {
    loopAsyncFunc(self.importAccounts.bind(self), 10 * 1000)
    loopAsyncFunc(self.processDeposits.bind(self), 10 * 1000)
    loopAsyncFunc(self.processWithdrawals.bind(self), 10 * 1000)
    if (global.Config.gateway.sendWithdrawal) {
      loopAsyncFunc(self.sendWithdrawals.bind(self), 10 * 1000)
    }
  }
}

Gateway.prototype.onBind = function (scope) {
  modules = scope;
}

module.exports = Gateway;