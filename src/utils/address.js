var crypto = require('crypto')
var base58check = require('./base58check')

const NORMAL_PREFIX = 'A'
const CHAIN_PREFIX = 'C'
const MULTI_PREFIX = 'M'

const VALID_PREFIX = [
  NORMAL_PREFIX,
  CHAIN_PREFIX,
  MULTI_PREFIX
]

const TYPE = {
  NONE: 0,
  NORMAL: 1,
  CHAIN: 2,
  MULTISIG: 3
}

const PREFIX_MAP = {}
PREFIX_MAP[NORMAL_PREFIX] = TYPE.NORMAL
PREFIX_MAP[CHAIN_PREFIX] = TYPE.CHAIN
PREFIX_MAP[MULTI_PREFIX] = TYPE.MULTISIG

function generateRawBase58CheckAddress(publicKeys) {
  if (!publicKeys || !publicKeys.length) throw new Error('Invalid publickeys')
  let h1 = null
  for (let k of publicKeys) {
    if (typeof k === 'string') {
      k = Buffer.from(k, 'hex')
    }
    h1 = crypto.createHash('sha256').update(k)
  }
  let h2 = crypto.createHash('ripemd160').update(h1.digest()).digest()
  return base58check.encode(h2)
}

module.exports = {
  TYPE: TYPE,
  getType: function (address) {
    let prefix = address[0]
    if (PREFIX_MAP[prefix]) {
      return PREFIX_MAP[prefix]
    } else {
      return TYPE.NONE
    }
  },
  isAddress: function (address) {
    if (typeof address !== 'string') {
      return false
    }
    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (!base58check.decodeUnsafe(address.slice(1))) {
        return false
      }
      if (VALID_PREFIX.indexOf(address[0]) == -1) {
        return false
      }
    }
    return true
  },

  isBase58CheckAddress: function (address) {
    if (typeof address !== 'string') {
      return false
    }
    if (!base58check.decodeUnsafe(address.slice(1))) {
      return false
    }
    if (VALID_PREFIX.indexOf(address[0]) == -1) {
      return false
    }
    return true
  },

  isNormalAddress: function (address) {
    return this.isBase58CheckAddress(address) && address[0] === NORMAL_PREFIX
  },

  generateBase58CheckAddress: function (publicKey) {
    return NORMAL_PREFIX + generateRawBase58CheckAddress([publicKey])
  },

  generateChainAddress: function (publicKey) {
    return CHAIN_PREFIX + generateRawBase58CheckAddress([publicKey])
  },

  generateMultisigAddress: function (publicKeys) {
    return MULTI_PREFIX + generateRawBase58CheckAddress(publicKeys)
  }
}