const DEFAULT_LIMIT = 10000

class LimitCache {
  constructor(opt) {
    const options = opt || {}
    this.limit = options.limit || DEFAULT_LIMIT
    this.index = []
    this.cache = new Map()
  }

  set(key, value) {
    if (this.cache.size >= this.limit && !this.cache.has(key)) {
      const dropKey = this.index.shift()
      this.cache.delete(dropKey)
    }
    this.cache.set(key, value)
    this.index.push(key)
  }

  has(key) {
    return this.cache.has(key)
  }
}

module.exports = LimitCache
