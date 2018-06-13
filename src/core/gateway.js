const PIFY = require('util').promisify
const utils = require('../utils')
const gatewayLib = require('asch-gateway')

let modules
let library
let self
const priv = {}

const GatewayLogType = {
  IMPORT_ADDRESS: 1,
  DEPOSIT: 2,
  WITHDRAWAL: 3,
  SEND_WITHDRAWAL: 4,
}

async function getGatewayAccountByOutAddress(addresses, coldAccount) {
  const accountMap = {}
  for (const i of addresses) {
    let account
    if (coldAccount.address === i) {
      account = coldAccount.accountExtrsInfo.redeemScript
    } else {
      const gatewayAccount = await app.sdb.findOne('GatewayAccount', { condition: { outAddress: i } })
      if (!gatewayAccount) throw new Error('Input address have no gateway account')
      account = JSON.parse(gatewayAccount.attachment).redeemScript
    }
    accountMap[i] = account
  }
  return accountMap
}

function Gateway(cb, scope) {
  library = scope
  self = this

  const gatewayConfig = global.Config.gateway.rpc

  if (gatewayConfig.username) {
    self.client = new gatewayLib.bitcoin.Client(
      gatewayConfig.username,
      gatewayConfig.password,
      'testnet',
      gatewayConfig.port,
      gatewayConfig.host,
    )
    self.gatewayUtil = new gatewayLib.bitcoin.Utils('testnet')
  }

  setImmediate(cb, null, self)
}

priv.importAddress = address =>
  new Promise((resolve, reject) =>
    self.client.importAddress(address, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    }))

priv.getTransactionsFromBlockHeight = height =>
  new Promise((resolve, reject) => {
    self.client.getTransactionsFromBlockHeight(height, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })

priv.createNewTransaction = (multiAccount, output, spentTids, fee) =>
  new Promise((resolve, reject) => {
    self.client.createNewTransaction(multiAccount, output, spentTids, fee, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })

priv.sendRawTransaction = t =>
  new Promise((resolve, reject) => {
    self.client.sendRawTransaction(t, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })

priv.getSpentTids = async (gateway) => {
  let spentTids = []
  const latestWithdrawals = await app.sdb.find('GatewayWithdrawal', { gateway }, 10, { seq: -1 })
  for (const w of latestWithdrawals) {
    if (w.outTransaction) {
      const ot = JSON.parse(w.outTransaction)
      const rawTransaction = ot.txhex
      const tids = self.gatewayUtil.getSpentTidsFromRawTransaction(rawTransaction)
      spentTids = spentTids.concat(tids)
    }
  }
  return spentTids
}

Gateway.prototype.importAccounts = async () => {
  const GATEWAY = global.Config.gateway.name
  if (modules.loader.syncing() || !GATEWAY || !self.client) {
    return
  }
  const key = app.sdb.getEntityKey('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.IMPORT_ADDRESS })
  let lastImportAddressLog = app.sdb.getCached('GatewayLog', key)

  library.logger.debug('find last import address log', lastImportAddressLog)
  let lastSeq = 0
  if (lastImportAddressLog) {
    lastSeq = lastImportAddressLog.seq
  } else {
    lastImportAddressLog = app.sdb.create('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.IMPORT_ADDRESS, seq: 0 })
  }
  // query( model, condition, fields, limit, offset, sort, join )
  const gatewayAccounts = await app.sdb.find('GatewayAccount', { gateway: GATEWAY, seq: { $gt: lastSeq } }, 100, { seq: 1 })
  library.logger.debug('find gateway account', gatewayAccounts)
  const len = gatewayAccounts.length
  if (len > 0) {
    for (const a of gatewayAccounts) {
      await priv.importAddress(a.outAddress)
    }

    lastImportAddressLog.seq = gatewayAccounts[len - 1].seq
    app.sdb.saveLocalChanges()
  }
}

Gateway.prototype.processDeposits = async () => {
  const GATEWAY = global.Config.gateway.name
  if (modules.loader.syncing() || !GATEWAY || !self.client) {
    return
  }
  const CURRENCY = 'BTC'

  const validators = await app.sdb.findAll('GatewayMember', { gateway: GATEWAY, elected: 1 })
  if (!validators || !validators.length) {
    library.logger.error('Validators not found')
    return
  }

  if (await app.sdb.count('GatewayAccount', { gateway: GATEWAY }) == 0) {
    library.logger.error('No gateway accounts')
    return
  }

  const gatewayLogKey = app.sdb.getEntityKey('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.DEPOSIT })
  let lastDepositLog = app.sdb.getCached('GatewayLog', gatewayLogKey)
  library.logger.debug('==========find DEPOSIT log============', lastDepositLog)

  lastDepositLog = lastDepositLog ||
    app.sdb.create('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.DEPOSIT, seq: 0 })

  const lastSeq = lastDepositLog.seq
  const ret = await priv.getTransactionsFromBlockHeight(lastSeq)
  if (!ret || !ret.transactions) {
    library.logger.error('Failed to get gateway transactions')
    return
  }

  const outTransactions = ret.transactions.filter(ot => ot.category === 'receive' && ot.confirmations >= 1)
    .sort((l, r) => l.height - r.height)

  library.logger.debug('get gateway transactions', outTransactions)
  const len = outTransactions.length
  if (len > 0) {
    for (const ot of outTransactions) {
      const isAccountOpened = await app.sdb.exists('GatewayAccount', { outAddress: ot.address })
      if (!isAccountOpened) {
        library.logger.warn('unknow address', { address: ot.address, gateway: GATEWAY, t: ot })
        continue
      }
      if (await app.sdb.exists('GatewayDeposit', { gateway: GATEWAY, oid: ot.txid })) {
        library.logger.info('already processed deposit', { gateway: GATEWAY, oid: ot.txid })
        continue
      }

      async function processDeposit() {
        const params = {
          type: 402,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [GATEWAY, ot.address, CURRENCY, String(ot.amount * 100000000), ot.txid],
        }
        await PIFY(modules.transactions.addTransactionUnsigned)(params)
      }
      const onError = (err) => {
        library.logger.error('process gateway deposit error, will retry...', err)
      }
      try {
        await utils.retryAsync(processDeposit, 3, 10 * 1000, onError)
        library.logger.info('Gateway deposit processed', { address: ot.address, amount: ot.amount, gateway: GATEWAY })
      } catch (e) {
        library.logger.warn('Failed to process gateway deposit', { error: e, outTransaction: ot })
      }
    }
    lastDepositLog.seq = outTransactions[len - 1].height
    app.sdb.saveLocalChanges()
  }
}

Gateway.prototype.processWithdrawals = async () => {
  const GATEWAY = global.Config.gateway.name
  if (modules.loader.syncing() || !GATEWAY || !self.client) {
    return
  }
  const PAGE_SIZE = 25
  const validators = await app.sdb.findAll('GatewayMember', { gateway: GATEWAY, elected: 1 })
  if (!validators || !validators.length) {
    library.logger.error('Validators not found')
    return
  }
  library.logger.debug('find gateway validators', validators)

  const outPublicKeys = validators.map(v => v.outPublicKey).sort((l, r) => l - r)
  const unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
  const multiAccount = app.gateway.createMultisigAddress(GATEWAY, unlockNumber, outPublicKeys, true)
  library.logger.debug('gateway validators cold account', multiAccount)

  const withdrawalLogKey = app.sdb.getEntityKey('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.WITHDRAWAL })
  let lastWithdrawalLog = await app.sdb.get('GatewayLog', withdrawalLogKey)
  library.logger.debug('find ==========WITHDRAWAL============ log', lastWithdrawalLog)

  lastWithdrawalLog = lastWithdrawalLog ||
    app.sdb.create('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.WITHDRAWAL, seq: 0 })

  const lastSeq = lastWithdrawalLog.seq

  const withdrawals = await app.sdb.find('GatewayWithdrawal', { gateway: GATEWAY, seq: { $gt: lastSeq } }, PAGE_SIZE)
  library.logger.debug('get gateway withdrawals', withdrawals)
  if (!withdrawals || !withdrawals.length) {
    return
  }

  const account = {
    privateKey: global.Config.gateway.outSecret,
  }
  let spentTids = await priv.getSpentTids(GATEWAY)
  for (let w of withdrawals) {
    if (w.ready) continue
    async function processWithdrawal() {
      let contractParams = null
      w = await app.sdb.get('GatewayWithdrawal', w.tid)
      if (!w.outTransaction) {
        const output = [{ address: w.recipientId, value: Number(w.amount) }]
        library.logger.debug('gateway spent tids', spentTids)
        const ot = await priv.createNewTransaction(multiAccount, output, spentTids, Number(w.fee))
        spentTids = spentTids.concat(self.gatewayUtil.getSpentTidsFromRawTransaction(ot.txhex))
        library.logger.debug('create withdrawl out transaction', ot)

        const inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
        library.logger.debug('input account info', inputAccountInfo)

        const ots = self.gatewayUtil.signTransaction(ot, account, inputAccountInfo)
        library.logger.debug('sign withdrawl out transaction', ots)

        contractParams = {
          type: 404,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [w.tid, JSON.stringify(ot), JSON.stringify(ots)],
        }
      } else {
        const ot = JSON.parse(w.outTransaction)
        const inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
        const ots = self.gatewayUtil.signTransaction(ot, account, inputAccountInfo)
        contractParams = {
          type: 405,
          secret: global.Config.gateway.secret,
          fee: 10000000,
          args: [w.tid, JSON.stringify(ots)],
        }
      }
      await PIFY(modules.transactions.addTransactionUnsigned)(contractParams)
    }
    const onError = function (err) {
      library.logger.error('Process gateway withdrawal error, will retry', err)
    }
    try {
      await utils.retryAsync(processWithdrawal, 3, 10 * 1000, onError)
      library.logger.info('Gateway withdrawal processed', w.tid)
    } catch (e) {
      library.logger.warn('Failed to process gateway withdrawal', { error: e, transaction: w })
    }
  }
  lastWithdrawalLog.seq = withdrawals[withdrawals.length - 1].seq
  app.sdb.saveLocalChanges()
}

Gateway.prototype.sendWithdrawals = async () => {
  const GATEWAY = global.Config.gateway.name
  if (modules.loader.syncing() || !GATEWAY || !self.client) {
    return
  }
  const PAGE_SIZE = 25
  let lastSeq = 0
  const logKey = app.sdb.getEntityKey('GatewayLog', {
    gateway: GATEWAY,
    type: GatewayLogType.SEND_WITHDRAWAL,
  })
  let lastLog = app.sdb.getCached('GatewayLog', logKey)
  library.logger.debug('find ======SEND_WITHDRAWAL====== log', lastLog)
  if (lastLog) {
    lastSeq = lastLog.seq
  } else {
    lastLog = app.sdb.create('GatewayLog', { gateway: GATEWAY, type: GatewayLogType.SEND_WITHDRAWAL, seq: 0 })
  }
  const withdrawals = await app.sdb.findAll('GatewayWithdrawal', {
    condition: {
      gateway: GATEWAY,
      seq: { $gt: lastSeq },
    },
    limit: PAGE_SIZE,
    sort: {
      seq: 1,
    },
  })
  library.logger.debug('get gateway withdrawals', withdrawals)
  if (!withdrawals || !withdrawals.length) {
    return
  }
  const validators = await app.sdb.findAll('GatewayMember', {
    condition: {
      gateway: GATEWAY,
      elected: 1,
    },
  })
  if (!validators) {
    library.logger.error('Validators not found')
    return
  }
  library.logger.debug('find gateway validators', validators)

  const outPublicKeys = validators.map(v => v.outPublicKey).sort((l, r) => l - r)
  const unlockNumber = Math.floor(outPublicKeys.length / 2) + 1
  const multiAccount = app.gateway.createMultisigAddress(GATEWAY, unlockNumber, outPublicKeys, true)
  library.logger.debug('gateway validators cold account', multiAccount)

  for (const w of withdrawals) {
    if (!w.outTransaction) {
      library.logger.debug('out transaction not created')
      return
    }
    const preps = await app.sdb.findAll('GatewayWithdrawalPrep', { condition: { wid: w.tid } })
    if (preps.length < unlockNumber) {
      library.logger.debug('not enough signature')
      return
    }
    const ot = JSON.parse(w.outTransaction)
    const ots = []
    for (let i = 0; i < unlockNumber; i++) {
      ots.push(JSON.parse(preps[i].signature))
    }

    async function sendWithdrawal() {
      const inputAccountInfo = await getGatewayAccountByOutAddress(ot.input, multiAccount)
      library.logger.debug('before build transaction')
      const finalTransaction = self.gatewayUtil.buildTransaction(ot, ots, inputAccountInfo)
      library.logger.debug('before send raw tarnsaction', finalTransaction)
      const tid = await priv.sendRawTransaction(finalTransaction)
      return tid
    }
    const onError = function (err) {
      library.logger.error('Send withdrawal error, will retry...', err)
    }
    try {
      const tid = await utils.retryAsync(sendWithdrawal, 3, 10 * 1000, onError)
      library.logger.info('Send withdrawal transaction to out chain success', tid)
      const submitOidParams = {
        type: 406,
        secret: global.Config.gateway.secret,
        fee: 1000000,
        args: [w.tid, tid],
      }
      await PIFY(modules.transactions.addTransactionUnsigned)(submitOidParams)
    } catch (e) {
      library.logger.error('Failed to send gateway withdrawal', { error: e, transaction: w })
    }
    lastLog.seq = w.seq
    app.sdb.saveLocalChanges()
  }
}

Gateway.prototype.onBlockchainReady = () => {
  if (global.Config.gateway) {
    utils.loopAsyncFunction(self.importAccounts.bind(self), 10 * 1000)
    utils.loopAsyncFunction(self.processDeposits.bind(self), 60 * 1000)
    utils.loopAsyncFunction(self.processWithdrawals.bind(self), 10 * 1000)
    if (global.Config.gateway.sendWithdrawal) {
      utils.loopAsyncFunction(self.sendWithdrawals.bind(self), 30 * 1000)
    }
  }
}

Gateway.prototype.onBind = (scope) => {
  modules = scope
}

module.exports = Gateway
