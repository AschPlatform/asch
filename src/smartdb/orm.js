let extend = require('util')._extend
let jsonSql = require('json-sql')({ separatedValues: false })
let dblite = require('../dblite')
let PIFY = require('../utils/pify')

const JOIN_TRS_FIELDS = ['t.timestamp', 't.type', 't.height']
const JOIN_FIELDS_TYPE = {
  't.timestamp': Number,
  't.type': Number,
  't.height': Number
}

class Model {
  constructor(schema, db) {
    this.schema = schema
    this.db = db
    this.fieldsType = {}
    this.allFields = []
    this.index = ['_deleted_']
    if (!schema.tableFields && schema.fields) {
      schema.tableFields = schema.fields
    }
    if (!schema.table && schema.name) {
      schema.table = schema.name
    }
    for (let i in schema.tableFields) {
      let field = schema.tableFields[i]
      this.allFields.push(field.name)
      switch (field.type) {
        case 'Number':
        case 'BigInt':
          this.fieldsType[field.name] = Number
          break
        default:
          this.fieldsType[field.name] = String
          break
      }
      if (field.index) {
        this.index.push(field.name)
      }
    }
  }

  fields() {
    return this.allFields
  }

  sync() {
    app.logger.debug('sync schema', this.schema)
    let sqls = []
    this.schema.tableFields.push({
      name: '_deleted_',
      type: 'Number',
      default: 0
    })
    sqls.push(jsonSql.build(this.schema).query)
    for (let field of this.index) {
      sqls.push(jsonSql.build({
        type: 'index',
        table: this.schema.table,
        name: this.schema.table + '_' + field,
        indexOn: field
      }).query)
    }

    return this.db.query(sqls.join(';'))
  }

  parseRows(fields, rows) {
    return rows.map((row) => {
      let newItem = {}
      for (let i = 0; i < row.length; ++i) {
        let fieldName = fields[i]
        if (JOIN_FIELDS_TYPE[fieldName]) {
          newItem[fieldName.split('.').join('_')] = JOIN_FIELDS_TYPE[fieldName](row[i])
        } else {
          fieldName = fieldName.split('.')[1]
          newItem[fieldName] = this.fieldsType[fieldName](row[i])
        }
      }
      return newItem
    })
  }

  async findAll(options) {
    options = options || {}
    let fields = options.fields || this.allFields
    fields = fields.map((f) => { return this.schema.table + '.' + f })
    let sort = options.sort
    if (typeof sort === 'string') {
      sort = this.schema.table + '.' + sort
    } else if (typeof sort === 'object') {
      for (let k in sort) {
        sort[this.schema.table + '.' + k] = sort[k]
        delete sort[k]
      }
    }
    let condition = {}
    if (Array.isArray(options.condition)) {
      condition = options.condition.slice()
      for (let i in condition) {
        for (let k in condition[i]) {
          condition[i][this.schema.table + '.' + k] = condition[i][k]
          delete condition[i][k]
        }
      }
    } else if (typeof options.condition === 'object') {
      condition = extend({}, options.condition)
      for (let k in condition) {
        condition[this.schema.table + '.' + k] = condition[k]
        delete condition[k]
      }
    }
    condition[this.schema.table + '._deleted_'] = 0

    let queryOptions = {
      type: 'select',
      table: this.schema.table,
      condition: condition,
      fields: fields,
      limit: options.limit,
      offset: options.offset,
      sort: sort
    }
    if (this.allFields.indexOf('tid') !== -1) {
      queryOptions.fields = fields.concat(JOIN_TRS_FIELDS)
      let joinCondition = {}
      joinCondition[this.schema.table + '.tid'] = 't.id'
      queryOptions.join = [
        {
          type: 'inner',
          table: 'transactions',
          alias: 't',
          on: joinCondition
        }
      ]
    }
    let sql = jsonSql.build(queryOptions).query
    let results = await this.db.query(sql)
    app.logger.trace('Model#findAll', sql)
    return this.parseRows(queryOptions.fields, results)
  }

  async findOne(options) {
    let fields = options.fields || this.allFields
    fields = fields.map((f) => { return this.schema.table + '.' + f })

    let condition = {}
    if (Array.isArray(options.condition)) {
      condition = options.condition.slice()
      for (let i in condition) {
        for (let k in condition[i]) {
          condition[i][this.schema.table + '.' + k] = condition[i][k]
          delete condition[i][k]
        }
      }
    } else if (typeof options.condition === 'object') {
      condition = extend({}, options.condition)
      for (let k in condition) {
        condition[this.schema.table + '.' + k] = condition[k]
        delete condition[k]
      }
    }
    condition[this.schema.table + '._deleted_'] = 0

    let queryOptions = {
      type: 'select',
      table: this.schema.table,
      fields: fields,
      condition: condition
    }
    if (this.allFields.indexOf('tid') !== -1) {
      queryOptions.fields = fields.concat(JOIN_TRS_FIELDS)
      let joinCondition = {}
      joinCondition[this.schema.table + '.tid'] = 't.id'
      queryOptions.join = [
        {
          type: 'inner',
          table: 'transactions',
          alias: 't',
          on: joinCondition
        }
      ]
    }
    let sql = jsonSql.build(queryOptions).query
    let results = await this.db.query(sql)
    app.logger.trace('Model#findOne', sql, results)
    if (!results || results.length === 0) return null
    return this.parseRows(queryOptions.fields, results)[0]
  }

  create(values) {
    let sql = jsonSql.build({
      type: 'insert',
      table: this.schema.table,
      values: values
    }).query
    return this.db.query(sql)
  }

  async exists(condition) {
    if (condition && typeof condition === 'object') {
      condition._deleted_ = 0
    }
    let count = await this.count(condition)
    return count > 0
  }

  async count(condition) {
    if (condition && typeof condition === 'object') {
      condition._deleted_ = 0
    }
    var sql = jsonSql.build({
      type: 'select',
      table: this.schema.table,
      fields: ['count(*)'],
      condition: condition
    }).query
    sql = sql.replace(/"/g, '')
    let results = await this.db.query(sql)
    return Number(results[0][0])
  }

  async update(modifier, cond) {
    let sql = jsonSql.build({
      type: 'update',
      table: this.schema.table,
      modifier: modifier,
      condition: cond
    }).query
    return await this.db.query(sql)
  }

  async del(cond) {
    let sql = jsonSql.build({
      type: 'remove',
      table: this.schema.table,
      condition: cond
    }).query
    return await this.db.query(sql)
  }
}

class Transaction {
  constructor(db) {
    this.db = db
  }

  commit() {
    return this.db.query('commit')
  }

  rollback() {
    return this.db.query('rollback')
  }
}


class Orm {
  constructor(database, user, password, options) {
    this.options = options
    this.dblite = dblite(options.storage)
  }

  define(_arg1_, schema) {
    schema.type = 'create'
    return new Model(schema, this)
  }

  query(sql) {
    return PIFY(this.dblite.query)(sql)
  }
  
  rawQuery() {
    this.dblite.query.apply(this.dblite, arguments)
  }

  async transaction() {
    await this.query('begin transaction')
    return new Transaction(this)
  }

  async close() {
    this.dblite.close()
    await PIFY(function (cb) {
      setTimeout(cb, 1000)
    })()
  }

}

module.exports = Orm