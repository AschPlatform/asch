var sandboxHelper = require('../utils/sandbox.js');
var slots = require('../utils/slots.js');
var Router = require('../utils/router.js');
var PIFY = require('../utils/pify.js')
var gatewayLib = require('gateway-lib')

var modules, library, self, private = {}, shared = {};

private.version, private.osName, private.port;

const GatewayLogType = {
  IMPORT_ADDRESS: 1,
  DEPOSIT: 2,
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

function Gateway(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;

  setImmediate(cb, null, self);
}

Gateway.prototype.importAccounts = async function () {
  const GATEWAY = 'BTC'
  let lastImportAddressLog = await app.model.GatewayLog.findOne({
    condition: {
      gateway: GATEWAY,
      type: GatewayLogType.IMPORT_ADDRESS
    }
  })
  library.logger.debug('find last import address log', lastImportAddressLog)
  let lastSeq = 0
  if (lastImportAddressLog) {
    lastSeq = lastImportAddressLog.seq
  } else {
    await app.model.GatewayLog.create({ gateway: GATEWAY, type: GatewayLogType.IMPORT_ADDRESS, seq: 0 })
  }
  let gatewayAccounts = await app.model.GatewayAccount.findAll({
    condition: {
      gateway: GATEWAY,
      seq: {
        $gt: lastSeq
      },
    },
    sort: {
      seq: 1
    },
    limit: 100
  })
  library.logger.debug('find gateway account', gatewayAccounts)
  let len = gatewayAccounts.length
  if (len > 0) {
    for (let a of gatewayAccounts) {
      await PIFY(gatewayLib.bitcoin.importAddress)(a.outAddress)
    }
    lastSeq = gatewayAccounts[len - 1].seq
    await app.model.GatewayLog.update({ seq: lastSeq }, { gateway: GATEWAY, type: GatewayLogType.IMPORT_ADDRESS})
  }
}

Gateway.prototype.processDeposits = async function () {
  const GATEWAY = 'BTC'
  let cond = {
    gateway: GATEWAY,
    type: GatewayLogType.DEPOSIT
  }
  let lastDepositLog = await app.model.GatewayLog.findOne({ condition: cond })
  library.logger.debug('find gateway deposit log', lastDepositLog)
  let lastSeq = 0
  if (lastDepositLog) {
    lastSeq = lastDepositLog.seq
  } else {
    await app.model.GatewayLog.create({
      gateway: GATEWAY, type: GatewayLogType.DEPOSIT, seq: 0
    })
  }
  let ret = await PIFY(gatewayLib.bitcoin.getTransactionsFromBlockHeight)(lastSeq)
  if (!ret || !ret.transactions) {
    library.logger.error('Failed to get gateway transactions')
    return
  }
  let outTransactions = ret.transactions.filter((ot) => {
    return ot.category === 'receive'
  }).sort((l, r) => {
    return l.height - r.height
  })
  library.logger.debug('get gateway transactions', outTransactions)
  let len = outTransactions.length
  if (len > 0) {
    for (let ot of outTransactions) {
      let isAccountOpened = await app.model.GatewayAccount.exists({outAddress: ot.address})
      if (!isAccountOpened) {
        library.logger.warn('unknow address', {address: ot.address, gateway: GATEWAY, t: ot})
        continue
      }
      try {
        await PIFY(modules.transactions.addTransactionUnsigned)({
          type: 402,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [ot.address, GATEWAY, String(ot.amount * 100000000), ot.txid]
        })
        library.logger.info('submit gateway transaction', {address: ot.address, amount: ot.amount, gateway: GATEWAY})
      } catch (e) {
        library.logger.warn('Failed to submit gateway deposit', e)
      }
    }
    lastSeq = outTransactions[len - 1].height
    await app.model.GatewayLog.update({ seq: lastSeq }, cond)
  }
}

Gateway.prototype.processWithdrawals = async function () {

}

Gateway.prototype.onBlockchainReady = function () {
  loopAsyncFunc(self.importAccounts.bind(self), 10 * 1000)
  loopAsyncFunc(self.processDeposits.bind(self), 10 * 1000)
}

Gateway.prototype.onBind = function (scope) {
  modules = scope;
}

module.exports = Gateway;