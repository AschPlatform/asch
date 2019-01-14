const assert = require('assert')

const CONTRACT_MODEL = 'Contract'
const CONTRACT_BASIC_FIELDS = ['id', 'name', 'tid', 'address', 'ownerId', 'vmVersion', 'consumeOwnerEnergy', 'desc', 'timestamp']
const CONTRACT_RESULT_MODEL = 'ContractResult'

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

/**
   * Query contract call result
   * @param tid ?action=getResult&tid='xxxx'
   * @returns query result { result : { tid, contractId, success, gas, error, stateChangesHash } }
   */
async function handleGetResult(req) {
  const tid = req.query.tid
  assert(tid !== undefined && tid !== null,`Invalid param 'tid', can not be null or undefined`)
  const results = await app.sdb.find(CONTRACT_RESULT_MODEL, { tid })
  if (results.length === 0) {
    throw new Error(`Result not found (tid = '${tid}')`)
  }
  const ret = results[0]
  return {
    success: ret.success > 0,
    gas: ret.gas || 0,
    error: ret.error || '',
    stateChangesHash: ret.stateChangesHash || '',
  }
}

async function handleActionRequest(req) {
  const action = req.query.action
  if (action === 'getResult') {
    const result = await handleGetResult(req)
    return result
  }
  // other actions ...
  throw new Error(`Invalid action, ${action}`)
}

function convertBigintMemberToString(obj) {
  Object.keys(obj).forEach(key=>{
    const value = obj[key]
    const type = typeof value
    if (type === 'bigint') 
      obj[key] = String(value)
    else if (type === 'object')
      convertBigintMemberToString(value)
  })
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
    if (req.query.action) {
      const result = await handleActionRequest(req)
      return result
    }

    const offset = req.query.offset ? Math.max(0, Number(req.query.offset)) : 0
    const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 20
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
   * @param name  name of contract
   * @returns contract detail { contract : { id, name, tid, address, owner, vmVersion,
   * desc, timestamp, metadata } }
   */
  router.get('/:name', async (req) => {
    const name = req.params.name
    const contracts = await app.sdb.find(CONTRACT_MODEL, { name })
    if (!contracts || contracts.length === 0) throw new Error('Not found')
    return { success: true, contract: contracts[0] }
  })

  /**
   * Get state of contract
   * @param name  name of contract
   * @param stateName  name of mapping state
   * @param key  key of mapping state
   * @returns state value
   */
  router.get('/:name/states/:stateName/:key', async (req) => {
    const { name, stateName, key } = req.params
    const result = await app.contract.queryState(name, stateName, key)
    convertBigintMemberToString(result)
    return result
  })

  /**
   * Get state of contract
   * @param name  name of contract
   * @param stateName  state name
   * @returns state value
   */
  router.get('/:name/states/:stateName', async (req) => {
    const { name, stateName } = req.params
    const result = await app.contract.queryState(name, stateName)
    convertBigintMemberToString(result)
    return result
  })


  /**
   * Get state of contract
   * @param name  name of contract
   * @param method  constant method name
   * @param args stringified arguments, eg: ["name", 323]
   * @returns constant method call result
   */
    router.get('/:name/constant/:method/:args', async (req) => {
      const { name, method, args } = req.params
      const methodArgs = JSON.parse(args)
      const result = await app.contract.getConstant(name, method, ...methodArgs)
      convertBigintMemberToString(result)
      return result
    })
}
