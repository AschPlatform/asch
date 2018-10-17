const CONTRACT_ID_SEQUENCE = 'contract_sequence'
const CONTRACT_TRANSFER_ID_SEQUENCE = 'contract_transfer_sequence'
const GAS_CURRENCY = 'BCH'
const XAS_CURRENCY = 'XAS'
const CONTRACT_MODEL = 'Contract'
const CONTRACT_RESULT_MODEL = 'ContractResult'
const ACCOUNT_MODEL = 'Account'
const CONTRACT_TRANSFER_MODEL = 'ContractTransfer'
const GAS_BUY_BACK_ADDRESS = 'ARepurchaseAddr1234567890123456789'
const PAY_METHOD = 'onPay'
const MAX_GAS_LIMIT = 10000000 // 0.1BCH

function require(condition, error) {
  if (!condition) throw Error(error)
}

function makeContractAddress(transId, ownerAddress) {
  return app.util.address.generateContractAddress(`${transId}_${ownerAddress}`)
}

function makeContext(senderAddress, transaction, block) {
  return { senderAddress, transaction, block }
}

async function ensureBCHEnough(address, amount, gasOnly) {
  const bchAvalible = app.balances.get(address, GAS_CURRENCY)
  if (!gasOnly) {
    require(bchAvalible.gte(amount), `Avalible BCH( ${bchAvalible} ) is less than required( ${amount} ) `)
  } else {
    require(bchAvalible.gte(amount), `Avalible gas( ${bchAvalible} ) is less than gas limit( ${amount} ) `)
  }
}

function ensureContractNameValid(name) {
  require(name && name.length >= 3 && name.length <= 32, 'Invalid contract name, length should be between 3 and 32 ')
  require(name.match(/^[a-zA-Z]([-_a-zA-Z0-9]{3,32})+$/), 'Invalid contract name, please use letter, number or underscore ')
}

function ensureGasLimitValid(gasLimit) {
  require(gasLimit > 0 && gasLimit <= MAX_GAS_LIMIT, `gas limit must greater than 0 and less than ${MAX_GAS_LIMIT}`)
}

function createContractTransfer(senderId, recipientId, currency, amount, trans, height) {
  app.sdb.create(CONTRACT_TRANSFER_MODEL, {
    id: Number(app.autoID.increment(CONTRACT_TRANSFER_ID_SEQUENCE)),
    tid: trans.id,
    height,
    senderId,
    recipientId,
    currency,
    amount: String(amount),
    timestamp: trans.timestamp,
  })
}

async function transfer(currency, transferAmount, senderId, recipientId, trans, height) {
  const bigAmount = app.util.bignumber(transferAmount)
  if (currency !== XAS_CURRENCY) {
    const balance = app.balances.get(senderId, currency)
    require(balance !== undefined && balance.gte(bigAmount), 'Insuffient balance')

    app.balances.transfer(currency, bigAmount, senderId, recipientId)
    createContractTransfer(senderId, recipientId, currency, bigAmount.toString(), trans, height)
    return
  }

  const amount = Number.parseInt(bigAmount.toString(), 10)
  const senderAccount = await app.sdb.load(ACCOUNT_MODEL, { address: senderId })
  require(senderAccount !== undefined, 'Sender account not found')
  require(senderAccount.xas >= amount, 'Insuffient balance')

  app.sdb.increase(ACCOUNT_MODEL, { xas: -amount }, { address: senderId })
  recipientAccount = await app.sdb.load(ACCOUNT_MODEL, { address: recipientId })
  if (recipientAccount !== undefined) {
    app.sdb.increase(ACCOUNT_MODEL, { xas: amount }, { address: recipientId })
  } else {
    recipientAccount = app.sdb.create(ACCOUNT_MODEL, {
      address: recipientId,
      xas: amount,
      name: null,
    })
  }
  createContractTransfer(senderId, recipientId, currency, amount, trans, height)
}


async function handleContractResult(senderId, contractId, contractAddr, callResult, trans, height) {
  const {
    success, error, gas, stateChangesHash,
  } = callResult

  app.sdb.create(CONTRACT_RESULT_MODEL, {
    tid: trans.id,
    contractId,
    success: success ? 1 : 0,
    error,
    gas,
    stateChangesHash,
  })

  if (callResult.gas && callResult.gas > 0) {
    await transfer(GAS_CURRENCY, callResult.gas, senderId, GAS_BUY_BACK_ADDRESS, trans, height)
  }

  if (callResult.transfers && callResult.transfers.length > 0) {
    for (const t of callResult.transfers) {
      const bigAmount = app.util.bignumber(t.amount)
      await transfer(t.currency, bigAmount, contractAddr, t.recipientId, trans, height)
    }
  }
}

/**
 * Asch smart contract service code. All functions return transaction id by asch-core ,
 * you can get result by api/v2/contracts/?action=getResult&tid={transactionId}
 */
module.exports = {
  /**
     * Register contract,
     * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
     * @param {string} name 32 >= name.length > 3 and name must be letter, number or _
     * @param {string} version contract engine version
     * @param {string} desc desc.length <= 255
     * @param {string} code hex encoded source code
     */
  async register(gasLimit, name, version, desc, code) {
    ensureGasLimitValid(gasLimit)
    ensureContractNameValid(name)
    require(!desc || desc.length <= 255, 'Invalid description, can not be longer than 255')
    require(!version || version.length <= 32, 'Invalid version, can not be longer than 32 ')

    await ensureBCHEnough(this.sender.address, gasLimit, true)
    const contract = await app.sdb.load(CONTRACT_MODEL, { name })
    require(contract === undefined, `Contract '${name}' exists already`)

    const contractId = Number(app.autoID.increment(CONTRACT_ID_SEQUENCE))
    const context = makeContext(this.sender.address, this.trs, this.block)
    const decodedCode = Buffer.from(code, 'hex').toString('utf8')
    const registerResult = await app.contract.registerContract(
      gasLimit, context,
      contractId, name, decodedCode,
    )
    const contractAddress = makeContractAddress(this.trs.id, this.sender.address)
    handleContractResult(
      this.sender.address, contractId, contractAddress, registerResult,
      this.trs, this.block.height,
    )

    if (registerResult.success) {
      app.sdb.create(CONTRACT_MODEL, {
        id: contractId,
        tid: this.trs.id,
        name,
        owner: this.sender.address,
        address: contractAddress,
        vmVersion: version,
        desc,
        code,
        metadata: registerResult.metadata,
        timestamp: this.trs.timestamp,
      })
    }
  },

  /**
     * Call method of a registered contract
     * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
     * @param {string} name contract name
     * @param {string} method method name of contract
     * @param {Array} args method arguments
     */
  async call(gasLimit, name, method, args) {
    ensureGasLimitValid(gasLimit)
    ensureContractNameValid(name)
    require(method !== undefined && method !== null, 'method name can not be null or undefined')
    require(Array.isArray(args), 'Invalid contract args, should be array')

    const contractInfo = await app.sdb.get(CONTRACT_MODEL, { name })
    require(contractInfo !== undefined, `Contract '${name}' not found`)
    await ensureBCHEnough(this.sender.address, gasLimit, true)

    const context = makeContext(this.sender.address, this.trs, this.block)
    const callResult = await app.contract.callContract(gasLimit, context, name, method, ...args)

    handleContractResult(
      this.sender.address, contractInfo.id, contractInfo.address, callResult,
      this.trs, this.block.height,
    )
  },

  /**
     * Pay money to contract, behavior dependents on contract code.
     * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
     * @param {string} nameOrAddress contract name or address
     * @param {string|number} amount pay amout
     * @param {string} currency currency
     */
  async pay(gasLimit, nameOrAddress, amount, currency) {
    ensureGasLimitValid(gasLimit)
    const bigAmount = app.util.bignumber(amount)
    require(bigAmount.gt(0), 'Invalid amount, should be greater than 0 ')

    const condition = app.util.address.isContractAddress(nameOrAddress) ?
      { address: nameOrAddress } : { name: nameOrAddress }

    const contractInfo = await app.sdb.load(CONTRACT_MODEL, condition)
    require(contractInfo !== undefined, `Contract name/address '${nameOrAddress}' not found`)

    const isBCH = (currency === GAS_CURRENCY)
    const miniAmount = app.util.bignumber(gasLimit).plus(isBCH ? bigAmount : 0)
    await ensureBCHEnough(this.sender.address, miniAmount, isBCH)

    await transfer(
      currency, bigAmount, this.sender.address, contractInfo.address,
      this.trs, this.block.height,
    )

    const context = makeContext(this.sender.address, this.trs, this.block)
    const payResult = await app.contract.callContract(
      gasLimit, context, contractInfo.name,
      PAY_METHOD, bigAmount.toString(), currency,
    )
    handleContractResult(
      this.sender.address, contractInfo.id, contractInfo.address, payResult,
      this.trs, this.block.height,
    )
  },
}

