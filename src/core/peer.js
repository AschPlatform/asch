const path = require('path')
const ip = require('ip')
const crypto = require('crypto')
const kadence = require('@kadenceproject/kadence')
const { knuthShuffle } = require('knuth-shuffle')
const Router = require('../utils/router.js')
const sandboxHelper = require('../utils/sandbox.js')
const utils = require('../utils')

let modules
let library
let self
const priv = {}
const shared = {}

priv.protocol = 'http:'
priv.mainNode = null

// Constructor
function Peer(cb, scope) {
  library = scope
  self = this
  priv.attachApi()
  priv.initNode()

  setImmediate(cb, null, self)
}

// priv methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return es.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /': 'getPeers',
    'get /version': 'version',
    'get /get': 'getPeer',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/peers', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.initNode = () => {
  const protocol = priv.protocol
  const hostname = global.Config.publicIp || global.Config.address
  const port = global.Config.peerPort
  const contact = { hostname, port, protocol }
  const identity = self.getIdentity(contact)
  const transport = new kadence.HTTPTransport()
  const storageDir = path.resolve(global.Config.dataDir, 'dht')
  const storage = new kadence.LevelKademliaStorage(storageDir)
  priv.mainNode = new kadence.KademliaNode({
    logger: library.logger,
    transport,
    storage,
    identity,
    contact,
  })
  const node = priv.mainNode
  const peerCacheDir = path.join(global.Config.dataDir, 'peer')
  node.rolodex = node.plugin(kadence.rolodex(peerCacheDir))
  node.plugin(kadence.quasar())
  node.listen(port)
}

Peer.prototype.list = (options, cb) => {
  // FIXME
  options.limit = options.limit || 100
  return cb(null, [])
}

Peer.prototype.remove = (pip, port, cb) => {
  const isFrozenList = library.config.peers.list.find(peer =>
    peer.ip === ip.fromLong(pip) && peer.port === port)
  if (isFrozenList !== undefined) return cb && cb('Peer in white list')
  // FIXME
  return cb()
}

Peer.prototype.addChain = (config, cb) => {
  // FIXME
  cb()
}

Peer.prototype.getVersion = () => ({
  version: library.config.version,
  build: library.config.buildVersion,
  net: library.config.netVersion,
})

Peer.prototype.isCompatible = (version) => {
  const nums = version.split('.').map(Number)
  if (nums.length !== 3) {
    return true
  }
  let compatibleVersion = '0.0.0'
  if (library.config.netVersion === 'testnet') {
    compatibleVersion = '1.2.3'
  } else if (library.config.netVersion === 'mainnet') {
    compatibleVersion = '1.3.1'
  }
  const numsCompatible = compatibleVersion.split('.').map(Number)
  for (let i = 0; i < nums.length; ++i) {
    if (nums[i] < numsCompatible[i]) {
      return false
    } else if (nums[i] > numsCompatible[i]) {
      return true
    }
  }
  return true
}

Peer.prototype.getIdentity = (contact) => {
  const address = `${contact.hostname}:${contact.port}`
  return crypto.createHash('ripemd160').update(address).digest()
}

Peer.prototype.handle = (method, handler) => {
  priv.mainNode.use(method, handler)
}

Peer.prototype.subscribe = (topic, handler) => {
  priv.mainNode.quasarSubscribe(topic, (content) => {
    handler(content)
  })
}

Peer.prototype.publish = (topic, message) => {
  priv.mainNode.quasarPublish(topic, message)
}

Peer.prototype.request = (method, params, contact, cb) => {
  priv.mainNode.send(method, params, contact, cb)
}

Peer.prototype.randomRequest = (method, params, cb) => {
  const node = priv.mainNode
  const randomContact = knuthShuffle([...node.router.getClosestContactsToKey(
    node.identity.toString('hex'),
    node.router.size,
  ).entries()]).shift()
  if (!randomContact) return cb('No contact')
  library.logger.debug('select random contract', randomContact)
  let isCallbacked = false
  setTimeout(() => {
    if (isCallbacked) return
    isCallbacked = true
    cb('Timeout', undefined, randomContact)
  }, 2000)
  return node.send(method, params, randomContact, (err, result) => {
    if (isCallbacked) return
    isCallbacked = true
    cb(err, result, randomContact)
  })
}

Peer.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
Peer.prototype.onBind = (scope) => {
  modules = scope
}

Peer.prototype.onBlockchainReady = () => {
  const node = priv.mainNode
  for (const seed of global.Config.peers.list) {
    const contact = {
      hostname: seed.ip,
      port: seed.port,
      protocol: priv.protocol,
    }
    const identity = self.getIdentity(contact)
    node.join([identity, contact])
  }
  node.once('join', () => {
    library.logger.info(`connected to ${node.router.size} peers`)
    library.logger.debug('connected nodes', node.router.getClosestContactsToKey(node.identity).entries())
  })
  node.once('error', (err) => {
    library.logger.error('failed to join network', err)
  })
  library.bus.message('peerReady')
}

Peer.prototype.joinNetwork = async () => {
  const node = priv.mainNode
  let peers = await node.rolodex.getBootstrapCandidates()
  if (peers && peers.length > 0) {
    peers = peers.map(url => kadence.utils.parseContactURL(url))
  }
  library.logger.debug('join network bootstrap candidates', peers)
  for (const p of peers) {
    node.join(p)
  }
}

Peer.prototype.onPeerReady = () => {
  utils.loopAsyncFunction(self.joinNetwork.bind(this), 60 * 1000)
}

shared.getPeers = (req, cb) => {
  // FIXME
  cb(null, [])
}

shared.getPeer = (req, cb) => {
  cb(null, {})
}

shared.version = (req, cb) => {
  cb(null, {
    version: library.config.version,
    build: library.config.buildVersion,
    net: library.config.netVersion,
  })
}

module.exports = Peer
