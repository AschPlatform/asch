let bignum = require('bignumber')

class AutoIncrement {
  constructor(sdb) {
    this.sdb = sdb
  }

  get(key) {
    let item = this.sdb.get('Variable', {
      key: key
    })
    let value = item ? item.value : '0'
    return value
  }

  increment(key) {
    let item = this.sdb.get('Variable', {
      key: key
    })
    if (!item) {
      let value = '1'
      this.sdb.create('Variable', { key: key, value: value })
      return value
    } else {
      let newValue = bignum(item.value).plus(1).toString()
      this.sdb.update('Variable', { value: newValue }, { key: key })
      return newValue
    }
  }
}

module.exports = AutoIncrement