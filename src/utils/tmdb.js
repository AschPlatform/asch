class Tmdb {
  constructor(map) {
    this.map = (map instanceof Map ? map : new Map)
    this.log = new Array
  }

  set(key, value) {
    this.log.push([key, this.map.get(key)])
    this.map.set(key, value)
  }

  get(key) {
    return this.map.get(key)
  }

  rollback() {
    while (this.log.length !== 0) {
      let [key, value] = this.log.pop()
      if (value === undefined) {
        this.map.delete(key)
      } else {
        this.map.set(key, value)
      }
    }
  }

  commit() {
    this.log = new Array
  }
}

module.exports = Tmdb