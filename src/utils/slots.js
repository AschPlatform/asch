function beginEpochTime() {
  return new Date(Date.UTC(2016, 5, 27, 20, 0, 0, 0))
}

function getEpochTime(time) {
  let t = time
  if (t === undefined) {
    t = (new Date()).getTime()
  }
  const t0 = beginEpochTime().getTime()
  return Math.floor((t - t0) / 1000)
}

module.exports = {

  interval: 10,

  delegates: 101,

  getTime(time) {
    return getEpochTime(time)
  },

  getRealTime(epochTime) {
    let et = epochTime
    if (et === undefined) {
      et = this.getTime()
    }
    const d = beginEpochTime()
    const t = Math.floor(d.getTime() / 1000) * 1000
    return t + (et * 1000)
  },

  getSlotNumber(epochTime) {
    let et = epochTime
    if (et === undefined) {
      et = this.getTime()
    }
    return Math.floor(et / this.interval)
  },

  getSlotTime(slot) {
    return slot * this.interval
  },

  getNextSlot() {
    return this.getSlotNumber() + 1
  },

  getLastSlot(nextSlot) {
    return nextSlot + this.delegates
  },

  roundTime(date) {
    return Math.floor(date.getTime() / 1000) * 1000
  },
}
