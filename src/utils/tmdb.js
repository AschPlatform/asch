const LOG_ADD_PATH = 1
const LOG_SET_VALUE = 2

class Tmdb {
  constructor(map) {
    this.map = (map instanceof Map ? map : new Map)
    this.log = new Array
  }

  set(keys, value) {
    var parent = this.map
    var path = []
    for (let i = 0; i < keys.length - 1; ++i) {
      let k = keys[i]
      let m = parent.get(k)
      path.push(k)
      if (!m) {
        m = new Map
        this.log.push([path, LOG_ADD_PATH])
        parent.set(k, m)
      }
      parent = m
    }
    var lastKey = keys[keys.length - 1]
    this.log.push([keys, LOG_SET_VALUE, parent.get(lastKey)])
    parent.set(lastKey, value)
  }

  get(keys) {
    var m = this.map
    for (let i = 0; i < keys.length; ++i) {
      m = m.get(keys[i])
      if (!m) {
        return
      }
    }
    return m
  }

  remove_(keys) {
    var m = this.map
    for (let i = 0; i < keys.length-1; ++i) {
      m = m.get(keys[i])
      if (!m) {
        return
      }
    }
    m.delete(keys[keys.length - 1])
  }

  set_(keys, value) {
    var m = this.map
    for (let i = 0; i < keys.length-1; ++i) {
      m = m.get(keys[i])
      if (!m) {
        return
      }
    }
    var lastKey = keys[keys.length - 1]
    if (value === undefined) {
      m.delete(lastKey)
    } else {
      m.set(lastKey, value)
    }
  }

  rollback() {
    while (this.log.length !== 0) {
      let [keys, type, value] = this.log.pop()
      switch (type) {
        case 1:
          this.remove_(keys)
          break;
        case 2:
          this.set_(keys, value)
          break;
        default:
          throw new Error('unknow log type')
      }
    }
  }

  commit() {
    this.log = new Array
  }
}

module.exports = Tmdb