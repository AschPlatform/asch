module.exports = {
  1: function (trs) {
    return 0.1
  },
  2: function (trs) {
    let len = trs.args[0].length
    if (len === 3) {
      return 100
    } else if (len === 4) {
      return 80
    } else if (len === 5) {
      return 40
    } else if (len <= 10) {
      return 10
    } else {
      return 1
    }
  },
  3: function (trs) {
    return 5
  },
  4: function (trs) {
    return 0.1
  },
  5: function (trs) {
    return 0
  },
  6: function (trs) {
    return 5
  },
  7: function (trs) {
    return 100
  },
  8: function (trs) {
    return 0.1
  },
  9: function (trs) {
    return 0
  },
  10: function (trs) {
    return 100
  },
  11: function (trs) {
    return 0.1
  },
  12: function (trs) {
    return 0.1
  },
  100: function (trs) {
    return 100
  },
  101: function (trs) {
    return 500
  },
  102: function (trs) {
    return 0.1
  },
  103: function (trs) {
    return 0.1
  },
  200: function (trs) {
    return 100
  },
  201: function (trs) {
    return 1
  },
  202: function (trs) {
    return 1
  },
  203: function (trs) {
    return 1
  },
  204: function (trs) {
    return 0.1
  },
  205: function (trs) {
    return 0.1
  },
  300: function (trs) {
    return 10
  },
  301: function (trs) {
    return 0.1
  },
  302: function (trs) {
    return 0
  },
  400: function (trs) {
    return 0.1
  },
  401: function (trs) {
    return 100
  },
  402: function (trs) {
    return 0.01
  },
  403: function (trs) {
    return 0.1
  },
  404: function (trs) {
    return 0.01
  },
  405: function (trs) {
    return 0.01
  },
}