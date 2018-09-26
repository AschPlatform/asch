module.exports = {
  async exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, bancorInfo) {
    app.validate('amount', String(targetAmount))
    const bancor = new app.util.bancor.Bancor(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    const result = bancor.exchangeByTarget(sourceCurrency, targetCurrency, targetAmount, true)
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
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Buy',
      source: sourceCurrency,
      target: targetCurrency,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
  },

  async exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, bancorInfo) {
    app.validate('amount', String(sourceAmount))
    const bancor = new app.util.bancor.Bancor(bancorInfo.money, bancorInfo.stock, bancorInfo.owner)
    const result = bancor.exchangeBySource(sourceCurrency, targetCurrency, sourceAmount, true)
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
      address: this.sender.address,
      timestamp: app.util.slots.getTime(),
      type: 'Sell',
      source: sourceCurrency,
      target: targetCurrency,
      ratio: result.targetAmount / result.sourceAmount,
      buyed: result.targetAmount,
      used: result.sourceAmount,
    })
  },

  async burnXAS() {
    const bancor = new app.util.bancor.Bancor('BCH', 'XAS')
    const balance = app.balances.get('ARepurchaseAddr1234567890123456789', 'BCH')
    const result = bancor.exchangeBySource('BCH', 'XAS', balance, true)
    app.balances.decrease('ARepurchaseAddr1234567890123456789', 'BCH', result.sourceAmount)
    burningPoolAccount = await app.sdb.load('Account', 'ABuringPoolAddr1234567890123456789')
    if (burningPoolAccount) {
      app.sdb.increase('Account', { xas: result.targetAmount }, { address: burningPoolAccount.address })
    } else {
      burningPoolAccount = app.sdb.create('Account', {
        address: 'ABuringPoolAddr1234567890123456789',
        xas: result.targetAmount,
        name: null,
      })
    }
  },
}
