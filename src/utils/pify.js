module.exports = function (fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, result) => {
        return err ? reject(err) : resolve(result)
      }])
    })
  }
}