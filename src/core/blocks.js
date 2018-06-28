const assert = require('assert')
const crypto = require('crypto')
const async = require('async')
const PIFY = require('util').promisify
const isArray = require('util').isArray
const constants = require('../utils/constants.js')
const BlockStatus = require('../utils/block-status.js')
const Router = require('../utils/router.js')
const slots = require('../utils/slots.js')
const sandboxHelper = require('../utils/sandbox.js')
const addressHelper = require('../utils/address.js')

let genesisblock = null
let modules
let library
let self
const priv = {}
const shared = {}

priv.lastBlock = {}
priv.blockStatus = new BlockStatus()
priv.loaded = false
priv.isActive = false
priv.blockCache = {}
priv.proposeCache = {}
priv.lastPropose = null

// Constructor
function Blocks(cb, scope) {
  library = scope
  genesisblock = library.genesisblock
  self = this
  priv.attachApi()
  setImmediate(cb, null, self)
}

// priv methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'get /get': 'getBlock',
    'get /full': 'getFullBlock',
    'get /': 'getBlocks',
    'get /getHeight': 'getHeight',
    'get /getMilestone': 'getMilestone',
    'get /getReward': 'getReward',
    'get /getSupply': 'getSupply',
    'get /getStatus': 'getStatus',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/blocks', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })
}

priv.getIdSequence2 = (height, cb) => {
  (async () => {
    try {
      const maxHeight = Math.max(height, priv.lastBlock.height)
      const minHeight = Math.max(0, maxHeight - 4)
      let blocks = await app.sdb.getBlocksByHeightRange(minHeight, maxHeight)
      blocks = blocks.reverse()
      const ids = blocks.map(b => b.id)
      return cb(null, { ids, firstHeight: minHeight })
    } catch (e) {
      return cb(e)
    }
  })()
}

Blocks.prototype.toAPIV1Blocks = (blocks) => {
  if (blocks && isArray(blocks) && blocks.length > 0) {
    return blocks.map(b => Blocks.prototype.toAPIV1Block(b))
  }
  return []
}

Blocks.prototype.toAPIV1Block = (block) => {
  if (!block) return undefined
  return {
    id: block.id,
    version: block.version,
    timestamp: block.timestamp,
    height: block.height,
    payloadHash: block.payloadHash,
    previousBlock: block.prevBlockId,
    numberOfTransactions: block.count,
    totalFee: block.fees,
    generatorPublicKey: block.delegate,
    blockSignature: block.signature,
    confirmations: Blocks.prototype.getLastBlock().height - block.height,
    transactions: modules.transactions.toAPIV1Transactions(block.transactions, block),

    // "generatorId":  => missing
    // "totalAmount" => missing
    // "reward" => missing
    // "payloadLength" => missing
    // "totalForged" => missing
  }
}

Blocks.prototype.getCommonBlock = (peer, height, cb) => {
  const lastBlockHeight = height

  priv.getIdSequence2(lastBlockHeight, (err, data) => {
    if (err) {
      return cb(`Failed to get last block id sequence${err}`)
    }
    library.logger.trace('getIdSequence=========', data)
    const params = {
      body: {
        max: lastBlockHeight,
        min: data.firstHeight,
        ids: data.ids,
      },
    }
    return modules.peer.request('commonBlock', params, peer, (err2, ret) => {
      if (err2 || ret.error) {
        return cb(err2 || ret.error.toString())
      }

      if (!ret.common) {
        return cb('Common block not found')
      }
      return cb(null, ret.common)
    })
  })
}

Blocks.prototype.getBlock = (filter, cb) => {
  shared.getBlock({ body: filter }, cb)
}

Blocks.prototype.setLastBlock = (block) => {
  priv.lastBlock = block
  if (global.Config.netVersion === 'mainnet') {
    global.featureSwitch.enableLongId = priv.lastBlock.height >= 1700000
    global.featureSwitch.enable1_3_0 = priv.lastBlock.height >= 2920000
    global.featureSwitch.enableClubBonus = priv.lastBlock.height >= 3320000
    global.featureSwitch.enableMoreLockTypes = global.featureSwitch.enableClubBonus
    global.featureSwitch.enableLockReset = priv.lastBlock.height >= 4290000
  } else {
    global.featureSwitch.enableLongId = true
    global.featureSwitch.enable1_3_0 = true
    global.featureSwitch.enableClubBonus = (!!global.state.clubInfo)
    global.featureSwitch.enableMoreLockTypes = true
    global.featureSwitch.enableLockReset = true
  }
  global.featureSwitch.fixVoteNewAddressIssue = true
  if (global.Config.netVersion === 'mainnet' && priv.lastBlock.height < 1854000) {
    global.featureSwitch.fixVoteNewAddressIssue = false
  }
  global.featureSwitch.enableUIA = global.featureSwitch.enableLongId
}

Blocks.prototype.getLastBlock = () => priv.lastBlock

Blocks.prototype.verifyBlock = async (block, options) => {
  try {
    block.id = library.base.block.getId(block)
  } catch (e) {
    throw new Error(`Failed to get block id: ${e.toString()}`)
  }

  if (typeof block.height !== 'undefined' && !!priv.lastBlock.id) {
    block.height = priv.lastBlock.height + 1
  }

  library.logger.debug(`verifyBlock, id: ${block.id}, h: ${block.height}`)

  if (!block.prevBlockId && block.height !== 0) {
    throw new Error('Previous block should not be null')
  }

  try {
    if (!library.base.block.verifySignature(block)) {
      throw new Error('Failed to verify block signature')
    }
  } catch (e) {
    throw new Error(`Got exception while verify block signature: ${e.toString()}`)
  }

  if (block.prevBlockId !== priv.lastBlock.id) {
    throw new Error('Incorrect previous block hash')
  }

  if (block.height !== 0) {
    const blockSlotNumber = slots.getSlotNumber(block.timestamp)
    const lastBlockSlotNumber = slots.getSlotNumber(priv.lastBlock.timestamp)

    if (blockSlotNumber > slots.getSlotNumber() + 1 || blockSlotNumber <= lastBlockSlotNumber) {
      throw new Error(`Can't verify block timestamp: ${block.id}`)
    }
  }

  if (block.transactions.length > constants.maxTxsPerBlock) {
    throw new Error(`Invalid amount of block assets: ${block.id}`)
  }
  if (block.transactions.length !== block.count) {
    throw new Error('Invalid transaction count')
  }

  const payloadHash = crypto.createHash('sha256')
  const appliedTransactions = {}

  let totalFee = 0
  for (const transaction of block.transactions) {
    totalFee += transaction.fee

    let bytes
    try {
      bytes = library.base.transaction.getBytes(transaction)
    } catch (e) {
      throw new Error(`Failed to get transaction bytes: ${e.toString()}`)
    }

    if (appliedTransactions[transaction.id]) {
      throw new Error(`Duplicate transaction id in block ${block.id}`)
    }

    appliedTransactions[transaction.id] = transaction
    payloadHash.update(bytes)
  }

  if (totalFee !== block.fees) {
    throw new Error('Invalid total fees')
  }

  if (payloadHash.digest().toString('hex') !== block.payloadHash) {
    throw new Error(`Invalid payload hash: ${block.id}`)
  }

  if (options.votes) {
    const votes = options.votes
    if (block.height !== votes.height) {
      throw new Error('Votes height is not correct')
    }
    if (block.id !== votes.id) {
      throw new Error('Votes id is not correct')
    }
    if (!votes.signatures || !library.base.consensus.hasEnoughVotesRemote(votes)) {
      throw new Error('Votes signature is not correct')
    }
    await self.verifyBlockVotes(block, votes)
  }
}

Blocks.prototype.verifyBlockVotes = async (block, votes) => {
  const delegateList = await PIFY(modules.delegates.generateDelegateList)(block.height)
  const publicKeySet = new Set(delegateList)
  for (const item of votes.signatures) {
    if (!publicKeySet[item.key]) {
      throw new Error(`Votes key is not in the top list: ${item.key}`)
    }
    if (!library.base.consensus.verifyVote(votes.height, votes.id, item)) {
      throw new Error('Failed to verify vote signature')
    }
  }
}

Blocks.prototype.applyBlock = async (block) => {
  app.logger.trace('enter applyblock')
  const appliedTransactions = {}

  try {
    for (const transaction of block.transactions) {
      if (appliedTransactions[transaction.id]) {
        throw new Error(`Duplicate transaction in block: ${transaction.id}`)
      }
      await modules.transactions.applyUnconfirmedTransactionAsync(transaction)
      // TODO not just remove, should mark as applied
      // modules.blockchain.transactions.removeUnconfirmedTransaction(transaction.id)
      appliedTransactions[transaction.id] = transaction
    }
  } catch (e) {
    app.logger.error(e)
    await app.sdb.rollbackBlock()
    throw new Error(`Failed to apply block: ${e}`)
  }
}

Blocks.prototype.processBlock = async (b, options) => {
  if (!priv.loaded) throw new Error('Blockchain is loading')

  let block = b
  app.sdb.beginBlock(block)
  if (!block.transactions) block.transactions = []
  if (!options.local) {
    try {
      block = library.base.block.objectNormalize(block)
    } catch (e) {
      library.logger.error(`Failed to normalize block: ${e}`, block)
      throw e
    }

    // TODO sort transactions
    // block.transactions = library.base.block.sortTransactions(block)
    await self.verifyBlock(block, options)

    library.logger.debug('verify block ok')
    if (block.height !== 0) {
      const exists = (undefined !== await app.sdb.getBlockById(block.id))
      if (exists) throw new Error(`Block already exists: ${block.id}`)
    }

    if (block.height !== 0) {
      try {
        await PIFY(modules.delegates.validateBlockSlot)(block)
      } catch (e) {
        library.logger.error(e)
        throw new Error(`Can't verify slot: ${e}`)
      }
      library.logger.debug('verify block slot ok')
    }

    // TODO use bloomfilter
    for (const transaction of block.transactions) {
      library.base.transaction.objectNormalize(transaction)
    }
    const idList = block.transactions.map(t => t.id)
    if (await app.sdb.exists('Transaction', { id: { $in: idList } })) {
      throw new Error('Block contain already confirmed transaction')
    }

    app.logger.trace('before applyBlock')
    try {
      await self.applyBlock(block, options)
    } catch (e) {
      app.logger.error(`Failed to apply block: ${e}`)
      throw e
    }
  }

  try {
    self.saveBlockTransactions(block)
    await self.applyRound(block)
    await app.sdb.commitBlock()
    const trsCount = block.transactions.length
    app.logger.info(`Block applied correctly with ${trsCount} transactions`)
    self.setLastBlock(block)

    if (options.broadcast) {
      options.votes.signatures = options.votes.signatures.slice(0, 6)
      library.bus.message('newBlock', block, options.votes)
    }
  } catch (e) {
    app.logger.error('save block error: ', e)
    await app.sdb.rollbackBlock()
    throw new Error(`Failed to save block: ${e}`)
  } finally {
    priv.blockCache = {}
    priv.proposeCache = {}
    priv.lastVoteTime = null
    library.base.consensus.clearState()
  }
}

Blocks.prototype.saveBlockTransactions = (block) => {
  app.logger.trace('Blocks#saveBlockTransactions height', block.height)
  for (const trs of block.transactions) {
    trs.height = block.height
    app.sdb.create('Transaction', trs)
  }
  app.logger.trace('Blocks#save transactions')
}

// Blocks.prototype.processFee = function (block) {
//   if (!block || !block.transactions) return
//   for (let t of block.transactions) {
//     let feeInfo = app.getFee(t.type) || app.defaultFee
//     app.feePool.add(feeInfo.currency, t.fee)
//   }
// }

Blocks.prototype.applyRound = async (block) => {
  if (block.height === 0) {
    modules.delegates.updateBookkeeper()
    return
  }

  const delegate = app.sdb.getCached('Delegate', addressHelper.generateNormalAddress(block.delegate))
  delegate.producedBlocks += 1

  const delegates = await PIFY(modules.delegates.generateDelegateList)(block.height)

  // process fee
  const roundNumber = Math.floor(((block.height + delegates.length) - 1) / delegates.length)

  const round = await app.sdb.get('Round', roundNumber)
    || app.sdb.create('Round', { fees: 0, rewards: 0, round: roundNumber })

  let transFee = 0
  for (const t of block.transactions) {
    transFee += t.fee
  }

  round.fees += transFee
  round.rewards += priv.blockStatus.calcReward(block.height)

  if (block.height % 101 !== 0) return

  app.logger.debug(`----------------------on round ${roundNumber} end-----------------------`)
  app.logger.debug('delegate length', delegates.length)

  const forgedBlocks = await app.sdb.getBlocksByHeightRange(block.height - 100, block.height - 1)
  const forgedDelegates = forgedBlocks.map(b => b.delegate)
  forgedDelegates.push(block.delegate)
  const missedDelegates = []
  for (const fd of forgedDelegates) {
    if (delegates.indexOf(fd) === -1) {
      missedDelegates.push(fd)
    }
  }
  for (const md of missedDelegates) {
    const addr = addressHelper.generateNormalAddress(md)
    app.sdb.getCached('Delegate', addr).missedBlocks += 1
  }

  async function updateDelegate(pk, fee, reward) {
    const addr = addressHelper.generateNormalAddress(pk)
    const d = app.sdb.getCached('Delegate', addr)
    d.fees += fee
    d.rewards += reward
    // TODO should account be all cached?
    const account = await app.sdb.get('Account', d.address)
    account.xas += (fee + reward)
  }

  const fees = round.fees
  const rewards = round.rewards
  const councilControl = 1
  if (councilControl) {
    const councilAddress = 'GADQ2bozmxjBfYHDQx3uwtpwXmdhafUdkN'
    const account = await app.sdb.get('Account', councilAddress)
      || app.sdb.create('Account', { xas: 0, address: councilAddress, name: '' })
    const totalIncome = fees + rewards
    account.xas += totalIncome
  } else {
    const ratio = 1

    const actualFees = Math.floor(fees * ratio)
    const feeAverage = Math.floor(actualFees / delegates.length)
    const feeRemainder = actualFees - (feeAverage * delegates.length)
    // let feeFounds = fees - actualFees

    const actualRewards = Math.floor(rewards * ratio)
    const rewardAverage = Math.floor(actualRewards / delegates.length)
    const rewardRemainder = actualRewards - (rewardAverage * delegates.length)
    // let rewardFounds = rewards - actualRewards

    for (const fd of forgedDelegates) {
      await updateDelegate(fd, feeAverage, rewardAverage)
    }
    await updateDelegate(block.delegate, feeRemainder, rewardRemainder)

    // let totalClubFounds = feeFounds + rewardFounds
    // app.logger.info('Asch witness club get new founds: ' + totalClubFounds)
    // // FIXME dapp id
    // app.balances.increase('club_dapp_id', 'XAS', totalClubFounds)
  }

  if (block.height % 101 === 0) {
    modules.delegates.updateBookkeeper()
  }
}

Blocks.prototype.loadBlocksFromPeer = (peer, id, cb) => {
  let loaded = false
  let count = 0
  let lastValidBlock = null
  let lastCommonBlockId = id
  async.whilst(
    () => !loaded && count < 30,
    (next) => {
      count++
      const params = {
        body: {
          lastBlockId: lastCommonBlockId,
          limit: 200,
        },
      }
      modules.peer.request('blocks', params, peer, (err, ret) => {
        if (err || ret.error) {
          return next(err || ret.error.toString())
        }
        const contact = peer[1]
        const peerStr = `${contact.hostname}:${contact.port}`
        const blocks = ret.blocks
        library.logger.log(`Loading ${blocks.length} blocks from`, peerStr)
        if (blocks.length === 0) {
          loaded = true
          return next()
        }
        return (async () => {
          try {
            for (const block of blocks) {
              await self.processBlock(block, { syncing: true })
              lastCommonBlockId = block.id
              lastValidBlock = block
              library.logger.log(`Block ${block.id} loaded from ${peerStr} at`, block.height)
            }
            return next()
          } catch (e) {
            library.logger.error('Failed to process synced block', e)
            return cb(e)
          }
        })()
      })
    },
    (err) => {
      setImmediate(cb, err, lastValidBlock)
    },
  )
}

Blocks.prototype.generateBlock = async (keypair, timestamp) => {
  const unconfirmedList = modules.transactions.getUnconfirmedTransactionList()
  const payloadHash = crypto.createHash('sha256')
  let payloadLength = 0
  let fees = 0
  for (const transaction of unconfirmedList) {
    fees += transaction.fee
    const bytes = library.base.transaction.getBytes(transaction)
    // TODO check payload length when process remote block
    if ((payloadLength + bytes.length) > 8 * 1024 * 1024) {
      throw new Error('Playload length outof range')
    }
    payloadHash.update(bytes)
    payloadLength += bytes.length
  }
  const block = {
    version: 0,
    delegate: keypair.publicKey.toString('hex'),
    height: priv.lastBlock.height + 1,
    prevBlockId: priv.lastBlock.id,
    timestamp,
    transactions: unconfirmedList,
    count: unconfirmedList.length,
    fees,
    payloadHash: payloadHash.digest().toString('hex'),
  }

  block.signature = library.base.block.sign(block, keypair)
  block.id = library.base.block.getId(block)

  let activeKeypairs
  try {
    activeKeypairs = await PIFY(modules.delegates.getActiveDelegateKeypairs)(block.height)
  } catch (e) {
    throw new Error(`Failed to get active delegate keypairs: ${e}`)
  }

  const height = block.height
  const id = block.id
  assert(activeKeypairs && activeKeypairs.length > 0, 'Active keypairs should not be empty')
  library.logger.info(`get active delegate keypairs len: ${activeKeypairs.length}`)
  const localVotes = library.base.consensus.createVotes(activeKeypairs, block)
  if (library.base.consensus.hasEnoughVotes(localVotes)) {
    modules.transactions.clearUnconfirmed()
    await self.processBlock(block, { local: true, broadcast: true, votes: localVotes })
    library.logger.log(`Forged new block id: ${id},
      height: ${height},
      round: ${modules.round.calc(height)},
      slot: ${slots.getSlotNumber(block.timestamp)},
      reward: ${priv.blockStatus.calcReward(block.height)}`)
    return null
  }
  if (!library.config.publicIp) {
    return next('No public ip')
  }
  const serverAddr = `${library.config.publicIp}:${library.config.port}`
  let propose
  try {
    propose = library.base.consensus.createPropose(keypair, block, serverAddr)
  } catch (e) {
    return next(`Failed to create propose: ${e.toString()}`)
  }
  library.base.consensus.setPendingBlock(block)
  library.base.consensus.addPendingVotes(localVotes)
  priv.proposeCache[propose.hash] = true
  library.bus.message('newPropose', propose, true)
  return null
}

Blocks.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

// Events
Blocks.prototype.onReceiveBlock = (block, votes) => {
  if (modules.loader.syncing() || !priv.loaded) {
    return
  }

  if (priv.blockCache[block.id]) {
    return
  }
  priv.blockCache[block.id] = true

  library.sequence.add((cb) => {
    if (block.prevBlockId === priv.lastBlock.id && priv.lastBlock.height + 1 === block.height) {
      library.logger.info(`Received new block id: ${block.id}
        height: ${block.height}
        round: ${modules.round.calc(modules.blocks.getLastBlock().height)}
        slot: ${slots.getSlotNumber(block.timestamp)}`)
      return (async () => {
        const pendingTrsMap = new Map()
        try {
          const pendingTrs = modules.transactions.getUnconfirmedTransactionList()
          for (const t of pendingTrs) {
            pendingTrsMap.set(t.id, t)
          }
          modules.transactions.clearUnconfirmed()
          await app.sdb.rollbackBlock()
          await self.processBlock(block, { votes, broadcast: true })
        } catch (e) {
          library.logger.error('Failed to process received block', e)
        } finally {
          for (const t of block.transactions) {
            pendingTrsMap.delete(t.id)
          }
          try {
            await modules.transactions.applyTransactionsAsync([...pendingTrsMap.values()])
          } catch (e) {
            library.logger.error('Failed to redo unconfirmed transactions', e)
          }
          cb()
        }
      })()
    } if (block.prevBlockId !== priv.lastBlock.id
      && priv.lastBlock.height + 1 === block.height) {
      modules.delegates.fork(block, 1)
      return cb('Fork')
    } if (block.prevBlockId === priv.lastBlock.prevBlockId
      && block.height === priv.lastBlock.height
      && block.id !== priv.lastBlock.id) {
      modules.delegates.fork(block, 5)
      return cb('Fork')
    } if (block.height > priv.lastBlock.height + 1) {
      library.logger.info(`receive discontinuous block height ${block.height}`)
      modules.loader.startSyncBlocks()
      return cb()
    }
    return cb()
  })
}

Blocks.prototype.onReceivePropose = (propose) => {
  if (modules.loader.syncing() || !priv.loaded) {
    return
  }
  if (priv.proposeCache[propose.hash]) {
    return
  }
  priv.proposeCache[propose.hash] = true

  library.sequence.add((cb) => {
    if (priv.lastPropose && priv.lastPropose.height === propose.height
      && priv.lastPropose.generatorPublicKey === propose.generatorPublicKey
      && priv.lastPropose.id !== propose.id) {
      library.logger.warn(`generate different block with the same height, generator: ${propose.generatorPublicKey}`)
      return setImmediate(cb)
    }
    if (propose.height !== priv.lastBlock.height + 1) {
      library.logger.debug('invalid propose height', propose)
      if (propose.height > priv.lastBlock.height + 1) {
        library.logger.info(`receive discontinuous propose height ${propose.height}`)
        modules.loader.startSyncBlocks()
      }
      return setImmediate(cb)
    }
    if (priv.lastVoteTime && Date.now() - priv.lastVoteTime < 5 * 1000) {
      library.logger.debug('ignore the frequently propose')
      return setImmediate(cb)
    }
    library.logger.info(`receive propose height ${propose.height} bid ${propose.id}`)
    library.bus.message('newPropose', propose, true)
    return async.waterfall([
      (next) => {
        modules.delegates.validateProposeSlot(propose, (err) => {
          if (err) {
            next(`Failed to validate propose slot: ${err}`)
          } else {
            next()
          }
        })
      },
      (next) => {
        library.base.consensus.acceptPropose(propose, (err) => {
          if (err) {
            next(`Failed to accept propose: ${err}`)
          } else {
            next()
          }
        })
      },
      (next) => {
        modules.delegates.getActiveDelegateKeypairs(propose.height, (err, activeKeypairs) => {
          if (err) {
            next(`Failed to get active keypairs: ${err}`)
          } else {
            next(null, activeKeypairs)
          }
        })
      },
      (activeKeypairs, next) => {
        if (activeKeypairs && activeKeypairs.length > 0) {
          const votes = library.base.consensus.createVotes(activeKeypairs, propose)
          library.logger.debug(`send votes height ${votes.height} id ${votes.id} sigatures ${votes.signatures.length}`)
          modules.transport.sendVotes(votes, propose.address)
          priv.lastVoteTime = Date.now()
          priv.lastPropose = propose
        }
        setImmediate(next)
      },
    ], (err) => {
      if (err) {
        library.logger.error(`onReceivePropose error: ${err}`)
      }
      library.logger.debug('onReceivePropose finished')
      cb()
    })
  })
}

Blocks.prototype.onReceiveVotes = (votes) => {
  if (modules.loader.syncing() || !priv.loaded) {
    return
  }
  library.sequence.add((cb) => {
    const totalVotes = library.base.consensus.addPendingVotes(votes)
    if (totalVotes && totalVotes.signatures) {
      library.logger.debug(`receive new votes, total votes number ${totalVotes.signatures.length}`)
    }
    if (library.base.consensus.hasEnoughVotes(totalVotes)) {
      const block = library.base.consensus.getPendingBlock()
      const height = block.height
      const id = block.id
      return (async () => {
        try {
          modules.transactions.clearUnconfirmed()
          await self.processBlock(block, { votes: totalVotes, local: true, broadcast: true })
          library.logger.log(`Forged new block id: ${id},
            height: ${height},
            round: ${modules.round.calc(height)},
            slot: ${slots.getSlotNumber(block.timestamp)},
            reward: ${priv.blockStatus.calcReward(block.height)}`)
        } catch (e) {
          library.logger.error(`Failed to process confirmed block height: ${height} id: ${id} error: ${err}`)
        }
        cb()
      })()
    }
    return setImmediate(cb)
  })
}

Blocks.prototype.getSupply = () => {
  const height = priv.lastBlock.height
  return priv.blockStatus.calcSupply(height)
}

Blocks.prototype.getCirculatingSupply = () => {
  const height = priv.lastBlock.height
  return priv.blockStatus.calcSupply(height)
}

Blocks.prototype.onBind = (scope) => {
  modules = scope

  priv.loaded = true
  return (async () => {
    try {
      const count = app.sdb.blocksCount
      app.logger.info('Blocks found:', count)
      if (!count) {
        self.setLastBlock({ height: -1 })
        await self.processBlock(genesisblock.block, {})
      } else {
        const block = await app.sdb.getBlockByHeight(count - 1)
        self.setLastBlock(block)
      }
      library.bus.message('blockchainReady')
    } catch (e) {
      app.logger.error('Failed to prepare local blockchain', e)
      process.exit(0)
    }
  })()
}

Blocks.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
}

// Shared
shared.getBlock = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const query = req.body
  return library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
      },
      height: {
        type: 'integer',
        minimum: 0,
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        let block
        if (query.id) {
          block = await app.sdb.getBlockById(query.id)
        } else if (query.height !== undefined) {
          block = await app.sdb.getBlockByHeight(query.height)
        }

        if (!block) {
          return cb('Block not found')
        }
        block.reward = priv.blockStatus.calcReward(block.height)
        return cb(null, { block: Blocks.prototype.toAPIV1Block(block) })
      } catch (e) {
        library.logger.error(e)
        return cb('Server error')
      }
    })()
  })
}

shared.getFullBlock = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const query = req.body
  return library.scheme.validate(query, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
      },
      height: {
        type: 'integer',
        minimum: 0,
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        let block
        if (query.id) {
          block = await app.sdb.getBlockById(query.id, true)
        } else if (query.height !== undefined) {
          block = await app.sdb.getBlockByHeight(query.height, true)
        }

        if (!block) return cb('Block not found')
        return cb(null, { block: Blocks.prototype.toAPIV1Block(block) })
      } catch (e) {
        library.logger.error('Failed to find block', e)
        return cb('Server error')
      }
    })()
  })
}

shared.getBlocks = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const query = req.body
  return library.scheme.validate(query, {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
      offset: {
        type: 'integer',
        minimum: 0,
      },
      generatorPublicKey: {
        type: 'string',
        format: 'publicKey',
      },
    },
  }, (err) => {
    if (err) {
      return cb(err[0].message)
    }

    return (async () => {
      try {
        const offset = query.offset ? Number(query.offset) : 0
        const limit = query.limit ? Number(query.limit) : 20
        let minHeight
        let maxHeight
        if (query.orderBy === 'height:desc') {
          maxHeight = priv.lastBlock.height - offset
          minHeight = (maxHeight - limit) + 1
        } else {
          minHeight = offset
          maxHeight = (offset + limit) - 1
        }

        // TODO: get by delegate ??
        // if (query.generatorPublicKey) {
        //   condition.delegate = query.generatorPublicKey
        // }
        const count = app.sdb.blocksCount
        if (!count) throw new Error('Failed to get blocks count')

        const blocks = await app.sdb.getBlocksByHeightRange(minHeight, maxHeight)
        if (!blocks || !blocks.length) return cb('No blocks')
        return cb(null, { count, blocks: Blocks.prototype.toAPIV1Blocks(blocks) })
      } catch (e) {
        library.logger.error('Failed to find blocks', e)
        return cb('Server error')
      }
    })()
  })
}

shared.getHeight = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  return cb(null, { height: priv.lastBlock.height })
}

shared.getMilestone = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const height = priv.lastBlock.height
  return cb(null, { milestone: priv.blockStatus.calcMilestone(height) })
}

shared.getReward = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const height = priv.lastBlock.height
  return cb(null, { reward: priv.blockStatus.calcReward(height) })
}

shared.getSupply = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const height = priv.lastBlock.height
  return cb(null, { supply: priv.blockStatus.calcSupply(height) })
}

shared.getStatus = (req, cb) => {
  if (!priv.loaded) {
    return cb('Blockchain is loading')
  }
  const height = priv.lastBlock.height
  return cb(null, {
    height,
    fee: library.base.block.calculateFee(),
    milestone: priv.blockStatus.calcMilestone(height),
    reward: priv.blockStatus.calcReward(height),
    supply: priv.blockStatus.calcSupply(height),
  })
}

module.exports = Blocks
