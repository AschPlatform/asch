const os = require('os')
const sandboxHelper = require('../utils/sandbox.js')
const slots = require('../utils/slots.js')
const Router = require('../utils/router.js')

let modules
let library
let self
const priv = {}
const shared = {}

function System(cb, scope) {
  library = scope
  self = this

  priv.version = library.config.version
  priv.port = library.config.port
  priv.magic = library.config.magic
  priv.osName = os.platform() + os.release()

  priv.attachApi()

  setImmediate(cb, null, self)
}

priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /': 'getSystemInfo',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/system', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

shared.getSystemInfo = (req, cb) => {
  const lastBlock = modules.blocks.getLastBlock()
  return cb(null, {
    os: `${os.platform()}_${os.release()}`,
    version: library.config.version,
    timestamp: Date.now(),

    lastBlock: {
      height: lastBlock.height,
      timestamp: slots.getRealTime(lastBlock.timestamp),
      behind: slots.getNextSlot() - (slots.getSlotNumber(lastBlock.timestamp) + 1),
    },

    // systemLoad:{
    //   cores : systemInfo.cpucore,
    //   loadAverage : systemInfo.loadavg,
    //   freeMem: systemInfo.memfreemb,
    //   totalMem: systemInfo.memtotalmb
    // }
  })
}

System.prototype.getOS = () => priv.osName

System.prototype.getVersion = () => priv.version

System.prototype.getPort = () => priv.port

System.prototype.getMagic = () => priv.magic

System.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

System.prototype.onBind = (scope) => {
  modules = scope
}

module.exports = System
