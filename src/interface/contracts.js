const assert = require('assert')
const TRANSACTION_MODEL = 'Transaction'
const CONTRACT_MODEL = 'Contract'
const CONTRACT_RESULT_MODEL = 'ContractResult'
const CONTRACT_BASIC_FIELDS = ['id', 'name', 'tid', 'address', 'ownerId', 'vmVersion', 'consumeOwnerEnergy', 'desc', 'timestamp']
const REGISTER_CONTRACT_TYPE = 600

function parseSort(orderBy) {
  const sort = {}
  const [orderField, sortOrder] = orderBy.split(':')
  if (orderField !== undefined && sortOrder !== undefined) {
    sort[orderField] = sortOrder.toUpperCase()
  }
  return sort
}

function makeCondition(params) {
  const result = {}
  Object.keys(params).forEach((k) => {
    if (params[k] !== undefined) result[k] = params[k]
  })
  return result
}


// due to contract sandbox always return json object 
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

async function getContractByName(name, fields = undefined, throwIfNotFound = true) {
  assert(!!name, 'Invalid contract name')
  const contracts = await app.sdb.find(CONTRACT_MODEL, { name }, undefined, undefined, fields)
  if (throwIfNotFound) {
    assert(contracts.length > 0, `Contract '${name}' not found`)
  }

  return contracts.length > 0 ? contracts[0] : undefined
}

function convertResult(result) {
  convertBigintMemberToString(result)
  const { gas = 0, error, stateChangesHash, tid, contractId, data } = result
  return { gas, error, stateChangesHash, tid, data, contractId, success: !!result.success }
}

async function attachTransactions(results) {
  const condition = results.length === 1 ?
    { id: results[0].tid } :
    { id: { $in: results.map(r => r.tid) } }

  const transactions = await app.sdb.find(TRANSACTION_MODEL, condition)
  const transMap = new Map()
  transactions.forEach(t=> transMap.set(t.id, t))

  results.forEach(r=> r.transaction = transMap.get(r.tid))
  return results
}

module.exports = (router) => {
  /**
   * Query contracts
   * @param condition owner, address, name, orderBy = id:ASC, limit = 20, offset = 0,
   * orderBy = (timestamp | id | ownerId):(ASC|DESC)
   * @returns query result { count,
   * contracts : [ { id, name, tid, address, ownerId, vmVersion, desc, timestamp } ] }
   */
  router.get('/', async (req) => {
    const offset = req.query.offset ? Math.max(0, Number.parseInt(req.query.offset)) : 0
    const limit = req.query.limit ? Math.min(100, Number.parseInt(req.query.limit)) : 20
    const orderBy = req.query.orderBy ? req.query.orderBy : 'id:ASC'

    const sortOrder = parseSort(orderBy)
    const { name, ownerId, address } = req.query
    const condition = makeCondition({ name, ownerId, address })
    const fields = CONTRACT_BASIC_FIELDS

    const count = await app.sdb.count(CONTRACT_MODEL, condition)
    const range = { limit, offset }
    const contracts = await app.sdb.find(CONTRACT_MODEL, condition, range, sortOrder, fields)

    return { success: true, count, contracts }
  })


  /**
   * Get contract details
   * @param name  contract name
   * @returns contract detail { contract : { id, name, tid, address, owner, vmVersion,
   * desc, timestamp, metadata } }
   */
  router.get('/:name', async (req) => {
    const contract = await getContractByName(req.params.name)
    return { success: true, contract }
  })

  /**
   * Get contract metadata
   * @param name  contract name
   * @returns contract metadata 
   */
  router.get('/:name/metadata', async (req) => {
    const { metadata } = await getContractByName(req.params.name, ['id', 'metadata'])
    return { success: true, metadata }
  })

  /**
   * Get contract code
   * @param name  contract name
   * @returns contract code 
   */
  router.get('/:name/code', async (req) => {
    const { code } = await getContractByName(req.params.name, ['id', 'code'])
    return { success: true, code }
  })


   /**
   * Query contract call results, query: limit={limit}&offset={offset}
   * @param name contract name
   * @param limit max items count to return, default = 20
   * @param offset return items offset, default = 0
   * @returns query result { count, results: [{ tid, contractId, success, gas, error, stateChangesHash, transaction }...] }
   */
  router.get('/:name/results', async (req) => {
    const { params, query } = req
    const { id } = await getContractByName(params.name, ['id', 'name']) 
    const condition = { contractId: id }
    const offset = query.offset ? Math.max(0, Number.parseInt(query.offset)) : 0
    const limit = query.limit ? Math.min(100, Number.parseInt(query.limit)) : 20
    const order = query.order || 'ASC'
  
    const count = await app.sdb.count(CONTRACT_RESULT_MODEL, condition)
    const range = { limit, offset }
    const callResults = await app.sdb.find(CONTRACT_RESULT_MODEL, condition, range, { rowid: order })
    const results = await attachTransactions(callResults.map(r => (convertResult(r))))
  
    return { success: true, count, results }
  })

  /**
   * Query single call reult by transaction id, 
   * @param name contract name
   * @param tid transaction id 
   * @returns query result { result: { tid, contractId, success, gas, error, stateChangesHash, transaction } }
   */
  router.get('/:name/results/:tid', async (req) => {
    const { tid, name } = req.params
    assert(!!tid ,`Invalid transaction id`)
    const contract = await getContractByName(name, ['id', 'name'], false)
    const condition = { tid }

    const results = await app.sdb.find(CONTRACT_RESULT_MODEL, condition)
    assert(results.length > 0, `Call result not found (tid = ${tid})`)
    const resultsWithTransactions = await attachTransactions(results.map(r => (convertResult(r))))
    
    const result = resultsWithTransactions[0]
    const transaction = result.transaction
    if (transaction.type === REGISTER_CONTRACT_TYPE) {
      assert(name === transaction.args[1], `Invalid contract name ${name}`)
    } else {
      assert(contract && contract.id === result.contractId, `Invalid contract name ${name}`)
    }

    return { success: true, result }
  })

  /**
   * Get state of contract
   * @param name  contract name
   * @param statePath  path of state, separated by '.' , eg: 'holding.0' => contract['holding'][0]
   * @returns state value if primitive, else return count of children states 
   */
  router.get('/:name/states/:statePath', async (req) => {
    const { name, statePath } = req.params
    if (!statePath) throw new Error(`Invalid state path '${statePath}'`)

    const result = await app.contract.queryState(name,  String(statePath).split('.'))
    convertBigintMemberToString(result)
    return result
  })

  /**
   * Get state of contract
   * @param name  contract name
   * @param method  constant method name
   * @param request.body arguments of method
   * @returns constant method call result
   */
    router.post('/:name/constant/:method', async (req) => {
      const { name, method } = req.params
      const methodArgs = req.body || []
      if (!Array.isArray(methodArgs)) {
        throw new Error('Arguments should be array')
      }

      const result = await app.contract.getConstant(name, method, ...methodArgs)
      convertBigintMemberToString(result)
      return result
    })
}
