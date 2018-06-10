module.exports = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  loopAsyncFunction(asyncFunc, interval) {
    setImmediate(function next() {
      (async () => {
        try {
          await asyncFunc()
        } catch (e) {
          library.logger.error(`Failed to run ${asyncFunc.name}`, e)
        }
        setTimeout(next, interval)
      })()
    })
  },
  loop(func, interval) {
    setImmediate(function next() {
      func((err) => {
        library.logger.error(`Failed to run ${func.name}`, err)
        setTimeout(next, interval)
      })
    })
  },
  retryAsync: async (worker, times, interval, errorHandler) => {
    for (let i = 0; i < times; i++) {
      try {
        return await worker()
      } catch (e) {
        if (i === times - 1) {
          throw e
        }
        if (errorHandler) {
          errorHandler(e)
        }
        await this.sleep(interval)
      }
    }
    return null
  },
}
