module.exports = {
  runAsync: function (asyncFunc, interval) {
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
  run: function (func, interval) {
    setImmediate(function next() {
      func(function (err) {
        library.logger.error('Failed to run ' + func.name, err)
        setTimeout(next, interval)
      })
    })
  }
}