function callMethod(shared, call, args, cb) {
  if (typeof shared[call] !== 'function') {
    return cb(`Function not found in module: ${call}`)
  }

  const callArgs = [args, cb]
  return shared[call].apply(null, callArgs)
}

module.exports = {
  callMethod,
}
