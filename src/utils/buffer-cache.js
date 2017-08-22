const TEN_MINUTES = 1000 * 60 * 10
const FOUR_HOURS = 1000 * 60 * 60 * 4
const DEFAULT_MAX_CACHE_NUMBER = 100000

class BufferCache  {
  constructor(options) {
    this.maxCacheNumber = options.maxCacheNumber || DEFAULT_MAX_CACHE_NUMBER
    this.refreshInterval = options.refreshInterval || TEN_MINUTES
    this.clearInterval = options.clearInterval || FOUR_HOURS
    this.buffer = new Map
    this.history = new Map
    this.lastRefreshTime = Date.now()
    this.lastClearTime = Date.now()
  }

  set(key, value) {
    if (this.buffer.size + this.history.size >= this.maxCacheNumber && !this.has(key)) {
      throw new Error('Cache limit exceeded')
    }
    this.buffer.set(key, value)
    this.refresh_()
  }

  has(key) {
    return this.buffer.has(key) || this.history.has(key)
  }

  remove(key) {
    this.buffer.delete(key)
    this.history.delete(key)
  }

  refresh_() {
    let elapsed1 = Date.now() - this.lastRefreshTime
    let elapsed2 = Date.now() - this.lastClearTime
    if (elapsed1 > this.refreshInterval) {
      if (elapsed2 > this.clearInterval) {
        this.history.clear()
        this.lastClearTime = Date.now()
      }
      for (let item of this.buffer) {
        this.history.set(item[0], item[1])
      }
      this.buffer.clear()
      this.lastRefreshTime = Date.now()
    }
  }
}

module.exports = BufferCache