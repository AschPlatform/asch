var FLAGS_TYPE = {
  // ACL
  // 0: blacklist
  // 1: whitelist
  1: {
    name: 'acl',
    range: [0, 1]
  },

  // WRITEOFF
  // 0: normal
  // 1: writeoff
  2: {
    name: 'writeoff',
    range: [1, 1]
  }
}

var instance = {
  isValidFlagType: function (type) {
    return !!FLAGS_TYPE[type]
  },

  isValidFlag: function (type, flag) {
    var attr = FLAGS_TYPE[type]
    if (!attr) {
      return false
    }
    var range = attr.range
    return flag >= range[0] && flag <= range[1]
  },

  isSameFlag: function (type, flag, values) {
    return values[FLAGS_TYPE[type].name] == flag
  },

  getTypeName: function (type) {
    return FLAGS_TYPE[type].name;
  },

  getAclTable: function (flag) {
    return flag == '0' ? 'acl_black' : 'acl_white'
  }
}

module.exports = instance