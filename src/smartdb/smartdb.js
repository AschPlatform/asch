let jsonSql = require('json-sql')({ separatedValues: false })
let changeCase = require('change-case')

function deconstruct(obj) {
  let i = 0
  let result = null
  for (let k in obj) {
    result = [k, obj[k]]
    if (++i > 1) throw new Error('Multi k-v deconstruct not supported')
  }
  if (!result) throw new Error('Empty condition not supported')
  return result
}

function fromMapToToken(obj) {
  let i = 0
  let result = []
  for (let k in obj) {
    result.push(k + ':' + obj[k])
  }
  if (!result) throw new Error('Empty condition not supported')
  return result.join(',')
}

function fromIndexSchemaToToken(i, values) {
  let key = ''
  if (typeof i === 'string') {
    if (typeof values[i] === 'undefined') throw new Error('Empty index not supported: ' + i)
    key = i + ':' + values[i]
  } else if (Array.isArray(i)) {
    let keyGroup = []
    for (let j in i) {
      let k = i[j]
      if (typeof values[k] === 'undefined') throw new Error('Empty index not supported: ' + k)
      keyGroup.push(k + ':' + values[k])
    }
    key = keyGroup.join(',')
  } else {
    throw new Error('Index format not supported')
  }
  return key
}

function fromModelToTable(model) {
  return changeCase.snakeCase(model) + 's'
}

function escapeSingleQuote(obj) {
  for (let k in obj) {
    if (typeof obj[k] === 'string') {
      obj[k] = obj[k].replace(/'/g, "''")
    }
  }
}

class SmartDB {
  constructor(app) {
    this.app = app
    this.trsLogs = new Array
    this.blockLogs = new Array
    this.lockCache = new Set
    this.indexes = new Map
    this.indexSchema = new Map
  }

  undoLogs(logs) {
    while (logs.length > 0) {
      let [action, ...params] = logs.pop()
      this['undo' + action].apply(this, params)
    }
  }

  beginBlock() {

  }

  rollbackBlock() {
    this.lockCache.clear()
    this.rollbackTransaction()
    this.undoLogs(this.blockLogs)
  }

  async commitBlock(options) {
    options = options || {}

    if (this.trsLogs.length > 0) {
      this.commitTransaction()
    }
    app.logger.trace('enter commitBlock')
    const BATCH_SIZE = 100
    let batchs = []
    let sqls = []
    let i = 0
    this.blockLogs.forEach((log) => {
      if (i % BATCH_SIZE === 0 && sqls.length !== 0) {
        batchs.push(sqls)
        sqls = []
      }
      let [action, ...params] = log
      if (action !== 'Lock') {
        sqls.push(this['build' + action].apply(this, params).query)
        i++
      }
    })
    if (sqls.length !== 0) {
      batchs.push(sqls)
    }

    if (batchs.length === 0) {
      return true
    }
    app.logger.debug('sql batchs size', batchs.length)
    try {
      if (!options.noTransaction) {
        var t = await this.app.db.transaction()
      }

      for (let i in batchs) {
        let sql = batchs[i].join('')
        app.logger.trace('execute sql:', sql)
        await this.app.db.query(sql)
      }
      if (!options.noTransaction) {
        await t.commit()
      }
      this.blockLogs = new Array
      this.lockCache.clear()
    } catch (e) {
      app.logger.error('-!!!!!!!!!!!!!!!!!!!!!!commit error', e)
      if (!options.noTransaction) {
        await t.rollback()
      }
      throw new Error('Failed to commit block: ' + e)
    }
    app.logger.trace('after commit transaction')
  }

  beginTransaction() {

  }

  rollbackTransaction() {
    this.undoLogs(this.trsLogs)
  }

  commitTransaction() {
    this.blockLogs = this.blockLogs.concat(this.trsLogs)
    this.trsLogs = new Array
  }

  async load(model, fields, indexes) {
    let app = this.app
    let results = await app.model[model].findAll({ fields: fields })
    let invertedList = new Map
    results.forEach((item) => {
      indexes.forEach((i) => {
        let key = fromIndexSchemaToToken(i, item)
        if (invertedList.get(key) != undefined) throw Error('Ununique index not supported: ' + key)
        let cacheItem = {}
        fields.forEach((f) => {
          cacheItem[f] = item[f]
        })
        invertedList.set(key, cacheItem)
      })
    })
    this.indexes.set(model, invertedList)
    this.indexSchema.set(model, {
      fields: fields,
      indexes: indexes
    })
  }

  get(model, cond) {
    if (!model || !cond) throw new Error('Invalid params')
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) throw new Error('Model not found in cache: ' + model)
    let token = fromMapToToken(cond)
    let value = invertedList.get(token)
    return value || null
  }

  keys(model) {
    if (!model) throw new Error('Invalid params')
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) throw new Error('Model not found in cache: ' + model)
    return invertedList.keys()
  }

  entries(model) {
    if (!model) throw new Error('Invalid params')
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) throw new Error('Model not found in cache: ' + model)
    return invertedList.entries()
  }

  lock(key) {
    if (this.lockCache.has(key)) throw new Error('Key is locked in this block: ' + key)
    this.trsLogs.push(['Lock', key])
    this.lockCache.add(key)
  }

  undoLock(key) {
    this.lockCache.delete(key)
  }

  create(model, values) {
    this.trsLogs.push(['Create', model, values])
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) return

    let cacheValues = {}
    for (let k in values) {
      if (schema.fields.indexOf(k) !== -1) {
        cacheValues[k] = values[k]
      }
    }

    schema.indexes.forEach(function (i) {
      let key = fromIndexSchemaToToken(i, values)
      if (!!invertedList.get(key)) throw Error('Ununique index not supported: ' + key)
      invertedList.set(key, cacheValues)
    })
    return cacheValues
  }

  undoCreate(model, values) {
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) return

    for (let k in values) {
      schema.indexes.forEach(function (i) {
        let key = fromIndexSchemaToToken(i, values)
        invertedList.delete(key)
      })
    }
  }

  buildCreate(model, values) {
    escapeSingleQuote(values)
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'insert',
      table: table,
      values: values
    })
  }

  rollbackCreate(model, values) {
    let table = fromModelToTable(model)
    let primaryKey = this.app.model[model].getPrimaryKey()
    if (!primaryKey) throw new Error('Primary key not found for model: ' + model)

    let primaryValue = values[primaryKey]
    if (typeof primaryValue === 'undefined') throw new Error('Primary value not found for model: ' + model)

    return jsonSql.build({
      type: 'remove',
      table: table,
      condition: {
        primaryKey: primaryValue
      }
    })
  }

  replace(model, values) {
    this.trsLogs.push(['Replace', model, values])
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) return

    let cacheValues = {}
    for (let k in values) {
      if (schema.fields.indexOf(k) !== -1) {
        cacheValues[k] = values[k]
      }
    }

    if (schema.indexes.length > 1) throw new Error('Model have more than one index')
    let key = fromIndexSchemaToToken(schema.indexes[0], values)
    let old = invertedList.get(key)
    if (old) {
      this.trsLogs[this.trsLogs.length - 1].push(old)
    }
    invertedList.set(key, values)
  }

  undoReplace(model, values, oldValue) {
    let invertedList = this.indexes.get(model)
    let schema = this.indexSchema.get(model)
    if (!invertedList || !schema) return

    let key = fromIndexSchemaToToken(schema.indexes[0], values)
    if (oldValue) {
      invertedList.set(key, oldValue)
    } else {
      invertedList.delete(key)
    }
  }

  buildReplace(model, values) {
    escapeSingleQuote(values)
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'insert',
      or: 'replace',
      table: table,
      values: values
    })
  }

  rollbackReplace(model, values, oldValue) {
    let table = fromModelToTable(model)
    let primaryKey = this.app.model[model].getPrimaryKey()
    if (!primaryKey) throw new Error('Primary key not found for model: ' + model)

    let primaryValue = values[primaryKey]
    if (typeof primaryValue === 'undefined') throw new Error('Primary value not found for model: ' + model)

    let sql = null

    if (oldValue) {
      sql = jsonSql.build({
        type: 'update',
        table: table,
        condition: {
          primaryKey: primaryValue
        },
        modifier: oldValue
      })
    } else {
      sql = jsonSql.build({
        type: 'remove',
        table: table,
        condition: {
          primaryKey: primaryValue
        }
      })
    }
    return sql
  }

  update(model, modifier, cond) {
    if (!model || !modifier || !cond) throw new Error('Invalid params')
    let m = deconstruct(modifier)

    this.trsLogs.push(['Update', model, modifier, cond])
    let invertedList = this.indexes.get(model)
    if (!invertedList) return

    let token = fromMapToToken(cond)
    let item = invertedList.get(token)
    if (!item) return
    this.trsLogs[this.trsLogs.length - 1].push(item[m[0]])
    item[m[0]] = m[1]
  }

  undoUpdate(model, modifier, cond, oldValue) {
    let invertedList = this.indexes.get(model)
    if (!invertedList) return

    let m = deconstruct(modifier)
    let token = fromMapToToken(cond)

    let item = invertedList.get(token)
    if (!item) return

    if (!oldValue) throw new Error('Old value should exists')
    item[m[0]] = oldValue
  }

  buildUpdate(model, modifier, cond) {
    escapeSingleQuote(modifier)
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'update',
      table: table,
      modifier: modifier,
      condition: cond
    })
  }

  rollbackUpdate(model, values, oldValue) {
    let table = fromModelToTable(model)
    let primaryKey = this.app.model[model].getPrimaryKey()
    if (!primaryKey) throw new Error('Primary key not found for model: ' + model)

    let primaryValue = values[primaryKey]
    if (typeof primaryValue === 'undefined') throw new Error('Primary value not found for model: ' + model)

    return jsonSql.build({
      type: 'update',
      table: table,
      condition: {
        primaryKey: primaryValue
      },
      modifier: oldValue
    })
  }


  increment(model, modifier, cond) {
    if (!model || !modifier || !cond) throw new Error('Invalid params')

    this.trsLogs.push(['Increment', model, modifier, cond])
    let invertedList = this.indexes.get(model)
    if (!invertedList) return

    let token = fromMapToToken(cond)
    let item = invertedList.get(token)
    if (!item) return
    for (let field in modifier) {
      item[field] += modifier[field]
    }
  }

  undoIncrement(model, modifier, cond) {
    let invertedList = this.indexes.get(model)
    if (!invertedList) return

    let token = fromMapToToken(cond)

    let item = invertedList.get(token)
    if (!item) return

    for (let field in modifier) {
      item[field] -= modifier[field]
    }
  }

  buildIncrement(model, modifier, cond) {
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'update',
      table: table,
      modifier: {
        $inc: modifier
      },
      condition: cond
    })
  }

  rollbackIncrement(model, modifier, cond) {
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'update',
      table: table,
      modifier: {
        $dec: modifier
      },
      condition: cond
    })
  }

  del(model, cond) {
    if (!model || !cond) throw new Error('Invalid params')
    this.trsLogs.push(['Del', model, cond])
  }

  undoDel(model, cond, oldItem) {
    let c = deconstruct(cond)
    let invertedList = this.indexes.get(model)
    if (!invertedList) return

    let schema = this.indexSchema.get(model)
    schema.indexes.forEach(function (i) {
      let indexKey = i + ':' + oldItem[i]
      if (!!invertedList.get(indexKey)) throw Error('Index should have been deleted')
      invertedList.set(indexKey, oldItem)
    })
  }

  buildDel(model, cond) {
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'remove',
      table: table,
      condition: cond,
    })
  }

  rollbackDel(model, cond) {
    let table = fromModelToTable(model)
    return jsonSql.build({
      type: 'update',
      table: table,
      condition: cond,
      modifier: {
        _deleted_: 0
      }
    })
  }
}

module.exports = SmartDB