const CONTRACT_ID_SEQUENCE = 'contract_sequence'
const CONTRACT_TRANSFER_ID_SEQUENCE = 'contract_transfer_sequence'
const XAS_CURRENCY = 'XAS'
const CONTRACT_MODEL = 'Contract'
const CONTRACT_RESULT_MODEL = 'ContractResult'
const ACCOUNT_MODEL = 'Account'
const CONTRACT_TRANSFER_MODEL = 'ContractTransfer'
const MAX_GAS_LIMIT = 10 ** 7
const MAX_TIMEOUT = 500            // 0.5s
const MIN_TIMEOUT = 100             // 0.1s
const INFINITE_TIMEOUT = 10 * 1000  // 10s
let pledge = app.util.pledges

function assert(condition, error) {
  if (!condition) throw Error(error)
}

function createContractAccount(transId, ownerAddress) {
  const address = app.util.address.generateContractAddress(`${transId}_${ownerAddress}`)
  app.sdb.create(ACCOUNT_MODEL, { address, xas: 0, name: null } )
}

function makeContext(senderAddress, transaction, block) {
  return { senderAddress, transaction, block }
}

async function gasToEnergy(gas) {
  return await pledge.getEnergyByGas(gas) 
}

async function gasToXAS(gas) {
  return await pledge.getXASByGas(gas) 
}


async function checkGasPayment( preferredEnergyAddress, address, gasLimit, useXAS) {
  const blockHeight = modules.blocks.getLastBlock().height + 1

  if (preferredEnergyAddress !== undefined) {
    perferedEnergyEnough = await pledge.isEnergyCovered(gasLimit, preferredEnergyAddress, blockHeight)
    if (perferedEnergyEnough) {
      return { enough: true, energy: true, payer: preferredEnergyAddress}
    }
  }

  const energyEnough = await pledge.isEnergyCovered(gasLimit, address, blockHeight)
  if (energyEnough ){
    return { enough: true, energy: true , payer: address}
  }

  if (!useXAS)  return { enough: false }

  const senderAccount = await app.sdb.load(ACCOUNT_MODEL, { address })
  if (!senderAccount || !senderAccount.xas ) return { enough: false }

  const xas = await gasToXAS(gasLimit)
  const enough = xas <= senderAccount.xas
  return { enough, energy: false, xas, payer: address }  
}

async function payGas( gas, useEnergy, payer, tid ) {
  const blockHeight = modules.blocks.getLastBlock().height + 1
  const payAmount = useEnergy ? await gasToEnergy(gas) : await gasToXAS(gas)

  if (useEnergy) {
    await pledge.consumeEnergy(payAmount, payer, blockHeight, tid)
  } else {
    await pledge.consumeGasFee(payAmount, payer, blockHeight, tid)
  }
}

function ensureContractNameValid(name) {
  assert(name && name.length >= 3 && name.length <= 32, 'Invalid contract name, length should be between 3 and 32 ')
  assert(name.match(/^[a-zA-Z]([-_a-zA-Z0-9]{3,32})+$/), 'Invalid contract name, please use letter, number or underscore ')
}

function ensureGasLimitValid(gasLimit) {
  assert(gasLimit > 0 && gasLimit <= MAX_GAS_LIMIT, `gas limit must greater than 0 and less than ${MAX_GAS_LIMIT}`)
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

function getTimeout(gasLimit) {
  if ( modules.blocks.isApplyingBlock() ) {
    return INFINITE_TIMEOUT
  }

  const timeout = Math.round((gasLimit / MAX_GAS_LIMIT) * MAX_TIMEOUT)
  return Math.max(MIN_TIMEOUT, Math.min(MAX_TIMEOUT, timeout))
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

  Object.keys(obj).forEach( key => {
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
  const { success, error, gas, stateChangesHash } = callResult
  await payGas(gas || 0, useEnergy, payer, trans.id)

  const shortError = error ? String(error).substr(0, 120) + '...' : ''
  app.sdb.create(CONTRACT_RESULT_MODEL, {
    tid: trans.id,
    contractId,
    success: success ? 1 : 0,
    error: shortError,
    gas,
    stateChangesHash,
  })

  if (callResult.transfers && callResult.transfers.length > 0) {
    for (const t of callResult.transfers) {
      await transfer(t.currency, String(t.amount), contractAddr, t.recipientAddress, trans, height)
    }
  }

  callResult.transfers = undefined
  convertBigintMemberToString(callResult)
}

/**
 * Asch smart contract service code. All functions return transaction id by asch-core ,
 * but you can get result by api/v2/contracts/?action=getResult&tid={transactionId}
 */
module.exports = {
  /**
   * Register contract,
   * @param {number} gasLimit max gas avalible, 1000000 >= gasLimit >0
   * @param {string} name 32 >= name.length >= 3 and name must be letter, number or '_'
   * @param {string} version contract engine version
   * @param {string} desc desc.length <= 255
   * @param {string} code contract source code
   * @param {boolean} consumeOwnerEnergy prefer to consume contract owner energy for gas
   */
  async register(gasLimit, name, version, desc, code, consumeOwnerEnergy) {
    ensureGasLimitValid(gasLimit)
    ensureContractNameValid(name)
    assert(!desc || desc.length <= 255, 'Invalid description, can not be longer than 255')
    assert(!version || version.length <= 32, 'Invalid version, can not be longer than 32 ')

    const checkResult = await checkGasPayment(undefined, this.sender.address, gasLimit, true)
    assert( checkResult.enough, 'Insufficient energy')

    const contract = await app.sdb.load(CONTRACT_MODEL, { name })
    assert(contract === undefined, `Contract '${name}' exists already`)

    const contractId = Number(app.autoID.increment(CONTRACT_ID_SEQUENCE))
    const context = makeContext(this.sender.address, this.trs, this.block)
    const registerResult = await app.contract.registerContract(
      gasLimit, getTimeout(gasLimit), context, 
      contractId, name, code,
    )
    const contractAddress = createContractAccount(this.trs.id, this.sender.address)
    await handleContractResult(
      contractId, contractAddress, registerResult, this.trs, 
      this.block.height, checkResult.energy, checkResult.payer
    )

    if (registerResult.success) {
      app.sdb.create(CONTRACT_MODEL, {
        id: contractId,
        tid: this.trs.id,
        name,
        ownerId: this.sender.address,
        address: contractAddress,
        vmVersion: version,
        desc,
        code,
        consumeOwnerEnergy: consumeOwnerEnergy !== false ? 1 : 0,
        metadata: registerResult.data,
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
    ensureGasLimitValid(gasLimit)
    ensureContractNameValid(name)
    assert(method !== undefined && method !== null, 'method name can not be null or undefined')
    assert(Array.isArray(args), 'Invalid contract args, should be array')

    const contractInfo = await app.sdb.load(CONTRACT_MODEL, { name })
    assert(contractInfo !== undefined, `Contract '${name}' not found`)
    const preferredEnergyAddress = contractInfo.consumeOwnerEnergy ? contractInfo.ownerId : undefined

    const checkResult = await checkGasPayment(preferredEnergyAddress, this.sender.address, gasLimit, enablePayGasInXAS)
    assert(checkResult.enough, 'Insufficient Energy')

    const context = makeContext(this.sender.address, this.trs, this.block)
    const callResult = await app.contract.callContract(gasLimit, getTimeout(gasLimit), context, name, method, ...args)

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
  async pay(gasLimit, enablePayGasInXAS, nameOrAddress, method, amount, currency) {
    ensureGasLimitValid(gasLimit)
    const bigAmount = app.util.bignumber(amount)
    assert(!!nameOrAddress, 'Invalid contract name or address')
    assert(bigAmount.gt(0), 'Invalid amount, should be greater than 0 ')

    const condition = app.util.address.isContractAddress(nameOrAddress) ? 
      { address: nameOrAddress } : 
      { name: nameOrAddress }
    const contractInfo = await app.sdb.load(CONTRACT_MODEL, condition)
    assert(contractInfo !== undefined, `Contract name or address '${nameOrAddress}' not found`)

    const preferredEnergyAddress = contractInfo.consumeOwnerEnergy ? contractInfo.ownerId : undefined
    const checkResult = await checkGasPayment(preferredEnergyAddress, this.sender.address, gasLimit, enablePayGasInXAS)
    assert(checkResult.enough, 'Insufficient energy')

    if (checkResult.payer === this.sender.address && currency === XAS_CURRENCY) {
      const account = await app.sdb.load(ACCOUNT_MODEL, { address: this.sender.address })
      const xasEnought = app.util.bignumber(String(account.xas)).gte(bigAmount.plus(checkResult.xas || 0))
      assert(xasEnought, 'Insufficient XAS for transfer and gas')
    }

    const context = makeContext(this.sender.address, this.trs, this.block)
    const payResult = await app.contract.payContract(
      gasLimit, getTimeout(gasLimit), context, contractInfo.name,
      method, bigAmount.toString(), currency,
    )
    // Be careful !!! amount of sender and recipient are WRONG if get amount in contract !!!
    if (payResult.success) {
      await transfer(
        currency, bigAmount, this.sender.address, contractInfo.address,
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
