const CONTRACT_ID_SEQUENCE = 'contract_sequence'
const CONTRACT_TRANSFER_ID_SEQUENCE = 'contract_transfer_sequence'
const XAS_CURRENCY = 'XAS'
const CONTRACT_MODEL = 'Contract'
const CONTRACT_RESULT_MODEL = 'ContractResult'
const ACCOUNT_MODEL = 'Account'
const CONTRACT_TRANSFER_MODEL = 'ContractTransfer'
const MAX_GAS_LIMIT = 10 ** 7
const MAX_CODE_SIZE_K = 64
const MAX_ARGS_SIZE_K = 16

const pledge = app.util.pledges

function assert(condition, error) {
  if (!condition) throw Error(error)
}

function createContractAccount(transId, ownerAddress) {
  const address = app.util.address.generateContractAddress(`${transId}_${ownerAddress}`)
  app.sdb.create(ACCOUNT_MODEL, { address, xas: 0, name: null })
  return address
}

async function makeContext(senderAddress, transaction, account, block) {
  account = account || { address: senderAddress }
  const { address, name, secondPublicKey, role, lockHeight, weight } = account
  const xas = account.xas || 0
  const publicKey = account.publicKey || transaction.senderPublicKey
  const isLocked = !!account.isLocked
  const isAgent = !!account.isAgent
  const isDelegate = !!account.isDelegate
  const sender = {
    address, name, xas,
    publicKey, secondPublicKey,
    isLocked, isAgent, isDelegate,
    role, lockHeight, weight
  }

  const { id, height, delegate, prevBlockId, payloadHash, timestamp } = modules.blocks.getLastBlock()
  const lastBlock = { id, height, delegate, prevBlockId, payloadHash, timestamp }
  return { senderAddress, transaction, block, lastBlock, sender  }
}

async function gasToEnergy(gas) {
  const result = await pledge.getEnergyByGas(gas) 
  if (result === null) {
    throw `Cannot calculate energy amount for gas ${gas}`
  }
  return result
}

async function gasToXAS(gas) {
  const result = await pledge.getXASByGas(gas) 
  if (result === null) {
    throw `Cannot calculate XAS amount for gas ${gas}`
  }
  return result
}

async function checkGasPayment(preferredEnergyAddress, address, gasLimit, useXAS) {
  const blockHeight = modules.blocks.getLastBlock().height + 1

  if (preferredEnergyAddress !== undefined) {
    perferedEnergyEnough = await pledge.isEnergyCovered(gasLimit, preferredEnergyAddress, blockHeight)
    if (perferedEnergyEnough) {
      return { enough: true, energy: true, payer: preferredEnergyAddress}
    }
  }

  const energyEnough = await pledge.isEnergyCovered(gasLimit, address, blockHeight)
  if (energyEnough){
    return { enough: true, energy: true , payer: address}
  }

  if (!useXAS)  return { enough: false }

  const senderAccount = await app.sdb.load(ACCOUNT_MODEL, { address })
  if (!senderAccount || !senderAccount.xas) return { enough: false }

  const xas = await gasToXAS(gasLimit)
  const enough = xas <= senderAccount.xas
  return { enough, energy: false, xas, payer: address }  
}

async function payGas(gas, useEnergy, payer, tid) {
  const blockHeight = modules.blocks.getLastBlock().height + 1
  const payAmount = useEnergy ? await gasToEnergy(gas) : await gasToXAS(gas)

  if (useEnergy) {
    await pledge.consumeEnergy(payAmount, payer, blockHeight, tid)
    app.logger.debug(`consume ${payer} ${payAmount} energy for transaction '${tid}'`)
  } else {
    await pledge.consumeGasFee(payAmount, payer, blockHeight, tid)
    app.logger.debug(`consume ${payer} ${payAmount} XAS for transaction '${tid}'`)
  }
}

function ensureContractNameValid(name) {
  assert(name && name.length >= 3 && name.length <= 32, 'Invalid contract name, length should be between 3 and 32 ')
  assert(name.match(/^[a-zA-Z]([-_a-zA-Z0-9]{3,32})+$/), 'Invalid contract name, please use letter, number or underscore ')
}

function ensureGasLimitValid(gasLimit, trans) {
  const basicGas = app.contract.calcTransactionStorageGas(trans)
  assert(gasLimit > basicGas && gasLimit <= MAX_GAS_LIMIT, `gas limit must greater than ${basicGas} and less than ${MAX_GAS_LIMIT}`)
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
    assert(balance !== undefined && balance.gte(bigAmount), `Insufficient ${currency} to transfer `)

    app.balances.transfer(currency, bigAmount.toString(), senderId, recipientId)
    createContractTransfer(senderId, recipientId, currency, bigAmount.toString(), trans, height)
    return
  }

  const amount = Number.parseInt(bigAmount.toString(), 10)
  const senderAccount = await app.sdb.load(ACCOUNT_MODEL, { address: senderId })
  assert(!!senderAccount && senderAccount.xas >= amount, `Insufficient XAS to transfer`)

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

function convertBigintMemberToString(obj) {
  if (typeof obj !== 'object' || obj === null) return

  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const type = typeof value
    if (type === 'bigint') { 
      obj[key] = String(value)
    }
    else if (type === 'object') {
      convertBigintMemberToString(value)
    }
  })
}

async function handleContractResult(contractId, contractAddr, callResult, trans, height, useEnergy, payer) {
  const { success, error, gas, stateChangesHash, data } = callResult
  await payGas(gas || 0, useEnergy, payer, trans.id)

  const shortError = !error ? null : 
    ( error.length <= 120 ? error : (error).substr(0, 120) + '...' )
  app.sdb.create(CONTRACT_RESULT_MODEL, {
    tid: trans.id,
    contractId,
    success: success ? 1 : 0,
    error: shortError,
    gas,
    stateChangesHash,
    data
  })

  if (callResult.transfers && callResult.transfers.length > 0) {
    for (const t of callResult.transfers) {
      await transfer(t.currency, String(t.amount), contractAddr, t.recipientAddress, trans, height)
    }
  }

  callResult.transfers = undefined
  convertBigintMemberToString(callResult)
}


module.exports = {
  /**
   * Register contract,
   * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
   * @param {string} name 32 >= name.length >= 3 and name must be letter, number or '_'
   * @param {string} version contract version
   * @param {string} desc desc.length <= 255
   * @param {string} code contract source code
   * @param {boolean} consumeOwnerEnergy prefer to consume contract owner energy for gas
   */
  async register(gasLimit, name, version, desc, code, consumeOwnerEnergy) {
    ensureGasLimitValid(gasLimit, this.trs)
    ensureContractNameValid(name)
    assert(!desc || desc.length <= 255, 'Invalid description, can not be longer than 255')
    assert(!version || version.length <= 32, 'Invalid version, can not be longer than 32 ')
    assert(code && code.length <= MAX_CODE_SIZE_K * 1024, `Contract code size can not exceed ${MAX_CODE_SIZE_K}K`)
    
    const senderAddress = this.trs.senderId
    const checkResult = await checkGasPayment(undefined, senderAddress, gasLimit, true)
    assert( checkResult.enough, 'Insufficient energy')

    const contract = await app.sdb.load(CONTRACT_MODEL, { name })
    assert(contract === undefined, `Contract '${name}' exists already`)

    const contractId = Number(app.autoID.increment(CONTRACT_ID_SEQUENCE))
    const context = await makeContext(senderAddress, this.trs, this.sender, this.block)
    const registerResult = await app.contract.registerContract(gasLimit, context, contractId, name, code)
    const contractAddress = createContractAccount(this.trs.id, senderAddress)
    // do not save result data
    const resultData = registerResult.data
    registerResult.data = undefined
    
    await handleContractResult(
      contractId, contractAddress, registerResult, this.trs, 
      this.block.height, checkResult.energy, checkResult.payer
    )
    
    if (registerResult.success) {
      app.sdb.create(CONTRACT_MODEL, {
        id: contractId,
        tid: this.trs.id,
        name,
        ownerId: senderAddress,
        address: contractAddress,
        version,
        vmVersion: app.contract.vmVersion,
        desc,
        code,
        state: 0,
        consumeOwnerEnergy: consumeOwnerEnergy !== false ? 1 : 0,
        metadata: resultData,
        timestamp: this.trs.timestamp,
      })
    }
    return registerResult
  },

  /**
     * Call method of a registered contract
     * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
     * @param {boolean} enablePayGasInXAS pay gas in XAS if energy is insufficient  
     * @param {string} name contract name
     * @param {string} method method name of contract
     * @param {Array} args method arguments
     */
  async call(gasLimit, enablePayGasInXAS, name, method, args) {
    ensureGasLimitValid(gasLimit, this.trs)
    ensureContractNameValid(name)
    assert(method !== undefined && method !== null, 'method name can not be null or undefined')
    assert(Array.isArray(args), 'Invalid contract args, should be array')
    assert(JSON.stringify(args).length <= MAX_ARGS_SIZE_K * 1024, `stringified args length can not exceed ${MAX_ARGS_SIZE_K}K`)

    const senderAddress = this.trs.senderId
    const contractInfo = await app.sdb.load(CONTRACT_MODEL, { name })
    assert(contractInfo !== undefined, `Contract '${name}' not found`)
    const preferredEnergyAddress = contractInfo.consumeOwnerEnergy ? contractInfo.ownerId : undefined

    const checkResult = await checkGasPayment(preferredEnergyAddress, senderAddress, gasLimit, enablePayGasInXAS)
    assert(checkResult.enough, 'Insufficient Energy')

    const context = await makeContext(senderAddress, this.trs, this.sender, this.block)
    const callResult = await app.contract.callContract(gasLimit, context, name, method, ...args)

    await handleContractResult(
      contractInfo.id, contractInfo.address, callResult, this.trs, 
      this.block.height, checkResult.energy, checkResult.payer
    )
    return callResult
  },

  /**
     * Pay money to contract, behavior dependents on contract code.
     * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
     * @param {boolean} enablePayGasInXAS pay gas in XAS if energy is insufficient  
     * @param {string} nameOrAddress contract name or address 
     * @param {string} method payable method name, use undefined or null or '' for default payable method
     * @param {string|number} amount pay amount
     * @param {string} currency currency
     */
  async pay(gasLimit, enablePayGasInXAS, nameOrAddress, method, amount, currency, ...args) {
    ensureGasLimitValid(gasLimit, this.trs)
    const bigAmount = app.util.bignumber(amount)
    assert(!!nameOrAddress, 'Invalid contract name or address')
    assert(bigAmount.gt(0), 'Invalid amount, should be greater than 0')
    assert(JSON.stringify([...args]).length <= MAX_ARGS_SIZE_K * 1024, `stringified args length can not exceed ${MAX_ARGS_SIZE_K}K`)

    const condition = app.util.address.isContractAddress(nameOrAddress) ? 
      { address: nameOrAddress } : 
      { name: nameOrAddress }
    const contractInfo = await app.sdb.load(CONTRACT_MODEL, condition)
    assert(contractInfo !== undefined, `Contract name or address '${nameOrAddress}' not found`)

    const senderAddress = this.trs.senderId
    const preferredEnergyAddress = contractInfo.consumeOwnerEnergy ? contractInfo.ownerId : undefined
    const checkResult = await checkGasPayment(preferredEnergyAddress, senderAddress, gasLimit, enablePayGasInXAS)
    assert(checkResult.enough, 'Insufficient energy')

    if (checkResult.payer === senderAddress && currency === XAS_CURRENCY) {
      const account = await app.sdb.load(ACCOUNT_MODEL, { address: senderAddress })
      const xasEnought = app.util.bignumber(String(account.xas)).gte(bigAmount.plus(checkResult.xas || 0))
      assert(xasEnought, 'Insufficient XAS for transfer and gas')
    }

    const context = await makeContext(senderAddress, this.trs, this.sender, this.block)
    const payResult = await app.contract.payContract(
      gasLimit, context, contractInfo.name,
      method, bigAmount.toString(), currency, ...args
    )
    // Be careful !!! amount of sender and recipient are WRONG if get amount in contract !!!
    if (payResult.success) {
      await transfer(
        currency, bigAmount, senderAddress, contractInfo.address,
        this.trs, this.block.height,
      )
    }
    await handleContractResult(
      contractInfo.id, contractInfo.address, payResult, this.trs, 
      this.block.height, checkResult.energy, checkResult.payer
    )
    return payResult    
  }
}
