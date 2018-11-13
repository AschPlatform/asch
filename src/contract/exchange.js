async function doExchange(sourceCurrency, targetCurrency, bancor, result, context) {
  const senderId = context.sender.address
  const exchangeFee = result.targetAmount.times(0.001).round()
  const realTargetAmount = result.targetAmount.minus(exchangeFee)
  // decrease source, increase target
  if (sourceCurrency === 'XAS') {
    app.sdb.increase('Account', { xas: -result.sourceAmount.toNumber() }, { address: senderId })
    app.balances.increase(app.councilAddress, targetCurrency, exchangeFee.toString())
    app.balances.increase(senderId, targetCurrency, realTargetAmount.toString())
  } else if (targetCurrency === 'XAS') {
    app.balances.decrease(senderId, sourceCurrency, result.sourceAmount.toString())
    app.sdb.increase('Account', { xas: exchangeFee.toNumber() }, { address: app.councilAddress })
    app.sdb.increase('Account', { xas: realTargetAmount.toNumber() }, { address: senderId })
  } else {
    app.balances.decrease(senderId, sourceCurrency, result.sourceAmount.toString())
    app.balances.increase(app.councilAddress, targetCurrency, exchangeFee.toString())
    app.balances.increase(senderId, targetCurrency, realTargetAmount.toString())
  }
  let sourcePrecision = 0
  let targetPrecision = 0
  let type = ''
  let price = 0.0
  const bancorObj = bancor.getBancorInfo()
  if (sourceCurrency === bancorObj.money) {
    type = 'BUY'
    sourcePrecision = bancorObj.moneyPrecision
    targetPrecision = bancorObj.stockPrecision
    app.logger.debug(`====> exchange: BUY, price = ${result.targetAmount.toString()} / 10 ^ ${targetPrecision} / (${result.sourceAmount.toString()} / 10 ^ ${sourcePrecision})`)
    price = Number(result.targetAmount.div(10 ** Number(targetPrecision))
      .div(result.sourceAmount.div(10 ** Number(sourcePrecision)))
      .toFixed(sourcePrecision).toString())
  } else {
    type = 'SELL'
    sourcePrecision = bancorObj.stockPrecision
    targetPrecision = bancorObj.moneyPrecision
    app.logger.debug(`====> exchange: SELL, price = ${result.sourceAmount.toString()} / 10 ^ ${sourcePrecision} / (${result.targetAmount.toString()} / 10 ^ ${targetPrecision})`)
    price = Number(result.sourceAmount.div(10 ** Number(sourcePrecision))
      .div(result.targetAmount.div(10 ** Number(targetPrecision)))
      .toFixed(targetPrecision).toString())
  }
  // Record exchange transactions
  app.sdb.create('BancorExchange', {
    id: context.trs.id,
    address: senderId,
    timestamp: app.util.slots.getTime(),
    type,
    owner: bancorObj.owner,
    source: sourceCurrency,
    sourcePrecision,
    target: targetCurrency,
    targetPrecision,
    price,
    targetAmount: result.targetAmount.toString(),
    sourceAmount: result.sourceAmount.toString(),
  })
}

module.exports = {
  async exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, bancorInfo) {
    app.validate('amount', String(targetAmount))
    const senderId = this.sender.address
    const bancorSimulate = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    if (!bancorSimulate) return 'Bancor is not ready'
    const simulateResult = await bancorSimulate.exchangeByTarget(sourceCurrency,
      targetCurrency, targetAmount, false)

    // Check source account has sufficient balance to handle the exchange
    if (sourceCurrency === 'XAS') {
      if (simulateResult.sourceAmount.gt(String(this.sender.xas))) return 'Insufficient balance'
    } else {
      const balance = app.balances.get(senderId, sourceCurrency)
      if (balance.lt(simulateResult.sourceAmount)) return 'Insufficient balance'
    }
    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    const result = await bancor.exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, true)
    await doExchange(sourceCurrency, targetCurrency, bancor, result, this)
    return null
  },

  async exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, bancorInfo) {
    app.validate('amount', String(sourceAmount))
    const senderId = this.sender.address
    // Check source account has sufficient balance to handle the exchange
    if (sourceCurrency === 'XAS') {
      if (app.util.bignumber(sourceAmount).gt(String(this.sender.xas))) return 'Insufficient balance'
    } else {
      const balance = app.balances.get(senderId, sourceCurrency)
      if (balance.lt(sourceAmount)) return 'Insufficient balance'
    }

    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    if (!bancor) return 'Bancor is not ready'
    const result = await bancor.exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, true)
    await doExchange(sourceCurrency, targetCurrency, bancor, result, this)
    return null
  },

  async burnXAS() {
    const bancor = await app.util.bancor.create('BCH', 'XAS')
    if (!bancor) return 'Bancor is not ready'
    const balance = await app.balances.get(app.repurchaseAddr, 'BCH')
    const result = await bancor.exchangeBySource('BCH', 'XAS', balance, true)
    app.balances.decrease(app.repurchaseAddr, 'BCH', result.sourceAmount.toString())
    if (app.buringPoolAddr) {
      app.sdb.createOrLoad('Account', { xas: 0, address: app.buringPoolAddr, name: null })
      app.sdb.increase('Account', { xas: result.targetAmount.toNumber() }, { address: app.buringPoolAddr })
    }
    return null
  },
}
