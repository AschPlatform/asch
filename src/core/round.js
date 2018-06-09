var async = require('async');
var slots = require('../utils/slots.js');
var sandboxHelper = require('../utils/sandbox.js');
var constants = require('../utils/constants.js');

// Private fields
var modules, library, self, private = {}, shared = {};

private.loaded = false;

private.feesByRound = {};
private.rewardsByRound = {};
private.delegatesByRound = {};
private.unFeesByRound = {};
private.unRewardsByRound = {};
private.unDelegatesByRound = {};

const CLUB_BONUS_RATIO = 0.2

// Constructor
function Round(cb, scope) {
  library = scope;
  self = this;
  self.__private = private;
  setImmediate(cb, null, self);
}

Round.prototype.loaded = function () {
  return private.loaded;
}

// Public methods
Round.prototype.calc = function (height) {
  return Math.floor(height / slots.delegates) + (height % slots.delegates > 0 ? 1 : 0);
}

Round.prototype.sandboxApi = function (call, args, cb) {
  sandboxHelper.callMethod(shared, call, args, cb);
}

// Events
Round.prototype.onBind = function (scope) {
  modules = scope;
}

Round.prototype.onBlockchainReady = function () {
  private.loaded = true;
}

Round.prototype.onFinishRound = function (round) {
  library.network.io.sockets.emit('rounds/change', { number: round });
}

Round.prototype.cleanup = function (cb) {
  private.loaded = false;
  cb();
}

// Shared

// Export
module.exports = Round;
