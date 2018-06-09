var async = require('async');
var jsonSql = require('json-sql')();
jsonSql.setDialect("sqlite")
var constants = require('../utils/constants.js');
var genesisBlock = null;

var private = {};

// Constructor
function Account(scope, cb) {
  this.scope = scope;
  genesisBlock = this.scope.genesisblock.block;

  setImmediate(cb, null, this);
}

Account.prototype.objectNormalize = function (account) {
  var report = this.scope.scheme.validate(account, {
    type: 'object',
    properties: this.filter
  });

  if (!report) {
    throw Error(this.scope.scheme.getLastError());
  }

  return account;
}

Account.prototype.toDB = function (raw) {
  this.binary.forEach(function (field) {
    if (raw[field]) {
      raw[field] = new Buffer(raw[field], "hex");
    }
  });

  return raw;
}

Account.prototype.get = function (filter, fields, cb) {
  library.logger.trace('enter Account.prototype.get....')
  if (typeof(fields) == 'function') {
    cb = fields;
    fields = this.fields.map(function (field) {
      return field.alias || field.field;
    });
  }

  this.getAll(filter, fields, function (err, data) {
    library.logger.trace('enter Account.prototype.get.... callback' + err, data)
    cb(err, data && data.length ? data[0] : null)
  })
}

Account.prototype.getAll = function (filter, fields, cb) {
  if (typeof(fields) == 'function') {
    cb = fields;
    fields = this.fields.map(function (field) {
      return field.alias || field.field;
    });
  }

  var realFields = this.fields.filter(function (field) {
    return fields.indexOf(field.alias || field.field) != -1;
  });

  var realConv = {};
  Object.keys(this.conv).forEach(function (key) {
    if (fields.indexOf(key) != -1) {
      realConv[key] = this.conv[key];
    }
  }.bind(this));

  var limit, offset, sort;

  if (filter.limit > 0) {
    limit = filter.limit;
  }
  delete filter.limit;
  if (filter.offset > 0) {
    offset = filter.offset;
  }
  delete filter.offset;
  if (filter.sort) {
    sort = filter.sort;
  }
  delete filter.sort;

  var sql = jsonSql.build({
    type: 'select',
    table: this.table,
    limit: limit,
    offset: offset,
    sort: sort,
    alias: 'a',
    condition: filter,
    fields: realFields
  });

  this.scope.dbLite.query(sql.query, sql.values, realConv, function (err, data) {
    if (err) {
      return cb(err);
    }

    cb(null, data || []);
  }.bind(this));
}

Account.prototype.set = function (address, fields, cb) {
  var self = this;

  if (fields.publicKey !== undefined && !fields.publicKey){
    console.log("!!!!!!!!!!!!!!!!!!!!!!!", address, diff)
  }

  fields.address = address;
  var account = fields;
  var sqles = []

  var sql = jsonSql.build({
    type: 'insert',
    or: "ignore",
    table: this.table,
    values: this.toDB(account)
  });

  sqles.push(sql);

  var sql = jsonSql.build({
    type: 'update',
    table: this.table,
    modifier: this.toDB(account),
    condition: {
      address: address
    }
  });

  sqles.push(sql);

  async.eachSeries(sqles, function (sql, cb) {
    self.scope.dbLite.query(sql.query, sql.values, function (err, data) {
      if (err) {
        console.error('account set sql error:', err, sql);
      }
      cb(err, data);
    });
  }, cb);
}

// Export
module.exports = Account;
