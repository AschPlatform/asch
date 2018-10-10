module.exports = {
  async exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, bancorInfo) {
    app.validate('amount', String(targetAmount))
    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    if (!bancor) return 'Bancor is not ready'
    const result = await bancor.exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, true)
    // decrease source, increase target
    if (sourceCurrency === 'XAS') {
      app.sdb.increase('Account', { xas: -result.sourceAmount }, { address: this.sender.address })
      app.balances.increase(this.sender.address, targetCurrency, result.targetAmount)
    }
    if (targetCurrency === 'XAS') {
      app.balances.decrease(this.sender.address, sourceCurrency, result.sourceAmount)
      app.sdb.increase('Account', { xas: result.targetAmount }, { address: this.sender.address })
    }
    // Record exchange transactions
    app.sdb.create('BancorExchange', {
      id: this.trs.id,
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Buy',
      owner: bancorInfo.owner,
      source: sourceCurrency,
      target: targetCurrency,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
    return null
  },

  async exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, bancorInfo) {
    app.validate('amount', String(sourceAmount))
    const bancor = await app.util.bancor
      .create(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    if (!bancor) return 'Bancor is not ready'
    const result = await bancor.exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, true)
    // decrease source, increase target
    if (sourceCurrency === 'XAS') {
      app.sdb.increase('Account', { xas: -result.sourceAmount }, { address: this.sender.address })
      app.balances.increase(this.sender.address, targetCurrency, result.targetAmount)
    }
    if (targetCurrency === 'XAS') {
      app.balances.decrease(this.sender.address, sourceCurrency, result.sourceAmount)
      app.sdb.increase('Account', { xas: result.targetAmount }, { address: this.sender.address })
    }
    // Record exchange transactions
    app.sdb.create('BancorExchange', {
      id: this.trs.id,
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Sell',
      owner: bancorInfo.owner,
      source: sourceCurrency,
      target: targetCurrency,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
    return null
  },

  async burnXAS() {
    const repurchaseAddr = 'ARepurchaseAddr1234567890123456789'
    const buringPoolAddr = 'ABuringPoolAddr1234567890123456789'
    const bancor = await app.util.bancor.create('BCH', 'XAS')
    if (!bancor) return 'Bancor is not ready'
    const balance = await app.balances.get(repurchaseAddr, 'BCH')
    const result = await bancor.exchangeBySource('BCH', 'XAS', app.util.bignumber(balance).toNumber(), true)
    app.balances.decrease(repurchaseAddr, 'BCH', result.sourceAmount)
    burningPoolAccount = await app.sdb.load('Account', buringPoolAddr)
    if (burningPoolAccount) {
      app.sdb.increase('Account', { xas: result.targetAmount }, { address: burningPoolAccount.address })
    } else {
      burningPoolAccount = app.sdb.create('Account', {
        address: buringPoolAddr,
        xas: result.targetAmount,
        name: null,
      })
    }
    return null
  },
}
