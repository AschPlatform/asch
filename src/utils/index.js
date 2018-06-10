module.exports = {
  sleep: function (ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms))
  },
  loopAsyncFunction: function (asyncFunc, interval) {
    setImmediate(function next() {
      (async function () {
        try {
          await asyncFunc()
        } catch (e) {
          library.logger.error('Failed to run ' + asyncFunc.name, e)
        }
        setTimeout(next, interval)
      })()
    })
  },
  loop: function (func, interval) {
    setImmediate(function next() {
      func(function (err) {
        library.logger.error('Failed to run ' + func.name, err)
        setTimeout(next, interval)
      })
    })
  },
  retryAsync: async function (worker, times, interval, errorHandler) {
    for (let i = 0; i < times; i++) {
      try {
        return await worker()
      } catch (e) {
        if (i === times - 1) {
          throw e
        }
        errorHandler && errorHandler(e)
        await this.sleep(interval)
      }
    }
  }
}