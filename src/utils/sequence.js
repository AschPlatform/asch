const util = require('util')
const async = require('async')

function tick(task, cb) {
  let args = [(err, res) => {
    if (task.done) {
      setImmediate(task.done, err, res)
    }
    setImmediate(cb)
  }];
  if (task.args) {
    args = args.concat(task.args)
  }
  task.worker.apply(task.worker, args)
}

class Sequence {
  constructor(config) {
    this.counter = 1
    this.name = config.name

    this.queue = async.queue(tick, 1)
  }

  add(worker, args, cb) {
    let done
    if (!cb && args && typeof args === 'function') {
      done = args
    } else {
      done = cb
    }
    if (worker && typeof worker === 'function') {
      const task = { worker, done }
      if (util.isArray(args)) {
        task.args = args
      }
      task.counter = this.counter++
      this.queue.push(task)
    }
  }

  count() {
    return this.sequence.length
  }
}

module.exports = Sequence
