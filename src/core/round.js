const slots = require('../utils/slots.js')
const sandboxHelper = require('../utils/sandbox.js')

let library
let self
const priv = {}
const shared = {}

priv.loaded = false

priv.feesByRound = {}
priv.rewardsByRound = {}
priv.delegatesByRound = {}
priv.unFeesByRound = {}
priv.unRewardsByRound = {}
priv.unDelegatesByRound = {}

function Round(cb, scope) {
  library = scope
  self = this
  setImmediate(cb, null, self)
}

Round.prototype.loaded = () => priv.loaded

Round.prototype.calc = (height) => {
  const round = Math.floor(height / slots.delegates) + (height % slots.delegates > 0 ? 1 : 0)
  return round
}

Round.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
Round.prototype.onBind = (scope) => {
  modules = scope
}

Round.prototype.onBlockchainReady = () => {
  priv.loaded = true
}

Round.prototype.onFinishRound = (round) => {
  library.network.io.sockets.emit('rounds/change', { number: round })
}

Round.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
}

module.exports = Round
