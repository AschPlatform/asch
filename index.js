const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const async = require('async')
const init = require('./src/init')
const initRuntime = require('./src/runtime')

function verifyGenesisBlock(scope, block) {
  try {
    const payloadHash = crypto.createHash('sha256')

    for (let i = 0; i < block.transactions.length; ++i) {
      const trs = block.transactions[i]
      const bytes = scope.base.transaction.getBytes(trs)
      payloadHash.update(bytes)
    }
    const id = scope.base.block.getId(block)
    assert.equal(
      payloadHash.digest().toString('hex'),
      block.payloadHash,
      'Unexpected payloadHash',
    )
    assert.equal(id, block.id, 'Unexpected block id')
  } catch (e) {
    throw e
  }
}

class Application {
  constructor(options) {
    this.options = options
  }
  run() {
    const options = this.options
    const pidFile = options.pidFile
    global.featureSwitch = {}
    global.state = {}
    init(options, (error, scope) => {
      if (error) {
        scope.logger.fatal(error)
        if (fs.existsSync(pidFile)) {
          fs.unlinkSync(pidFile)
        }
        process.exit(1)
        return
      }
      process.once('cleanup', () => {
        scope.logger.info('Cleaning up...')
        async.eachSeries(scope.modules, (module, cb) => {
          if (typeof (module.cleanup) === 'function') {
            module.cleanup(cb)
          } else {
            setImmediate(cb)
          }
        }, (err) => {
          if (err) {
            scope.logger.error('Error while cleaning up', err)
          } else {
            scope.logger.info('Cleaned up successfully')
          }
          (async () => {
            try {
              await global.app.sdb.close()
            } catch (e) {
              scope.logger.error('failed to close sdb', e)
            }
          })()

          if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile)
          }
          process.exit(1)
        })
      })

      process.once('SIGTERM', () => {
        process.emit('cleanup')
      })

      process.once('exit', () => {
        scope.logger.info('process exited')
      })

      process.once('SIGINT', () => {
        process.emit('cleanup')
      })

      process.on('uncaughtException', (err) => {
        // handle the error safely
        scope.logger.fatal('uncaughtException', { message: err.message, stack: err.stack })
        process.emit('cleanup')
      })
      process.on('unhandledRejection', (err) => {
        // handle the error safely
        scope.logger.error('unhandledRejection', err)
        process.emit('cleanup')
      })

      verifyGenesisBlock(scope, scope.genesisblock.block)

      options.library = scope;
      (async () => {
        try {
          await initRuntime(options)
        } catch (e) {
          logger.error('init runtime error: ', e)
          process.exit(1)
          return
        }
        scope.bus.message('bind', scope.modules)
        global.modules = scope.modules
        global.library = scope

        scope.logger.info('Modules ready and launched')
        if (!scope.config.publicIp) {
          scope.logger.warn('Failed to get public ip, block forging MAY not work!')
        }
      })()
    })
  }
}

module.exports = {
  Application,
}
