module.exports = {
  async exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, bancorInfo) {
    app.validate('amount', String(targetAmount))
    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    const simulateResult = await bancor.exchangeByTarget(sourceCurrency,
      targetCurrency, targetAmount, false)
    // Check source account has sufficient balance to handle the exchange
    if (sourceCurrency === 'XAS') {
      const sourceAccount = await app.sdb.load('Account', this.sender.address)
      if (sourceAccount.xas < simulateResult.sourceAmount) return 'Insufficient balance'
    } else {
      const balance = app.balances.get(this.sender.address, sourceCurrency)
      if (balance.lt(simulateResult.sourceAmount)) return 'Insufficient balance'
    }
    if (!bancor) return 'Bancor is not ready'
    const result = await bancor.exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, true)
    const exchangeFee = Math.floor(result.targetAmount * 0.001)
    const realTargetAmount = result.targetAmount - exchangeFee
    // decrease source, increase target
    if (sourceCurrency === 'XAS') {
      app.sdb.increase('Account', { xas: -result.sourceAmount }, { address: this.sender.address })
      app.balances.increase(app.councilAddress, targetCurrency, exchangeFee)
      app.balances.increase(this.sender.address, targetCurrency, realTargetAmount)
    }
    if (targetCurrency === 'XAS') {
      app.balances.decrease(this.sender.address, sourceCurrency, result.sourceAmount)
      app.sdb.increase('Account', { xas: exchangeFee }, { address: app.councilAddress })
      app.sdb.increase('Account', { xas: realTargetAmount }, { address: this.sender.address })
    }
    let sourcePrecision
    let targetPrecision
    if (sourceCurrency === bancor.stock) {
      sourcePrecision = bancor.stokPrecision
      targetPrecision = bancor.moneyPrecision
    } else {
      sourcePrecision = bancor.moneyPrecision
      targetPrecision = bancor.stokPrecision
    }
    // Record exchange transactions
    app.sdb.create('BancorExchange', {
      id: this.trs.id,
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Buy',
      owner: bancorInfo.owner,
      source: sourceCurrency,
      sourcePrecision,
      target: targetCurrency,
      targetPrecision,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
    return null
  },

  async exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, bancorInfo) {
    app.validate('amount', String(sourceAmount))
    // Check source account has sufficient balance to handle the exchange
    if (sourceCurrency === 'XAS') {
      const sourceAccount = await app.sdb.load('Account', this.sender.address)
      if (sourceAccount.xas < sourceAmount) return 'Insufficient balance'
    } else {
      const balance = app.balances.get(this.sender.address, sourceCurrency)
      if (balance.lt(sourceAmount)) return 'Insufficient balance'
    }

    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    if (!bancor) return 'Bancor is not ready'
    const result = await bancor.exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, true)
    const exchangeFee = Math.floor(result.targetAmount * 0.001)
    const realTargetAmount = result.targetAmount - exchangeFee
    // decrease source, increase target
    if (sourceCurrency === 'XAS') {
      app.sdb.increase('Account', { xas: -result.sourceAmount }, { address: this.sender.address })
      app.balances.increase(app.councilAddress, targetCurrency, exchangeFee)
      app.balances.increase(this.sender.address, targetCurrency, realTargetAmount)
    }
    if (targetCurrency === 'XAS') {
      app.balances.decrease(this.sender.address, sourceCurrency, result.sourceAmount)
      app.sdb.increase('Account', { xas: exchangeFee }, { address: app.councilAddress })
      app.sdb.increase('Account', { xas: realTargetAmount }, { address: this.sender.address })
    }
    let sourcePrecision
    let targetPrecision
    if (sourceCurrency === bancor.stock) {
      sourcePrecision = bancor.stokPrecision
      targetPrecision = bancor.moneyPrecision
    } else {
      sourcePrecision = bancor.moneyPrecision
      targetPrecision = bancor.stokPrecision
    }
    // Record exchange transactions
    app.sdb.create('BancorExchange', {
      id: this.trs.id,
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Sell',
      owner: bancorInfo.owner,
      source: sourceCurrency,
      sourcePrecision,
      target: targetCurrency,
      targetPrecision,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
    return null
  },

  async burnXAS() {
    const bancor = await app.util.bancor.create('BCH', 'XAS')
    if (!bancor) return 'Bancor is not ready'
    const balance = await app.balances.get(app.repurchaseAddr, 'BCH')
    const result = await bancor.exchangeBySource('BCH', 'XAS', app.util.bignumber(balance).toNumber(), true)
    app.balances.decrease(app.repurchaseAddr, 'BCH', result.sourceAmount)
    if (app.buringPoolAddr) {
      app.sdb.createOrLoad('Account', { xas: 0, address: app.buringPoolAddr, name: null })
      app.sdb.increase('Account', { xas: result.targetAmount }, { address: app.buringPoolAddr })
    }
    // burningPoolAccount = await app.sdb.load('Account', app.buringPoolAddr)
    // if (burningPoolAccount) {
    //   app.sdb.increase('Account', { xas: result.targetAmount }, { address: burningPoolAccount.address })
    // } else {
    //   burningPoolAccount = app.sdb.create('Account', {
    //     address: app.buringPoolAddr,
    //     xas: result.targetAmount,
    //     name: null,
    //   })
    // }
    return null
  },
}
