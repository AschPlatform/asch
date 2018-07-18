const lib = require('../lib')

const config = {
  secret: 'token exhibit rich scare arch devote trash scout element label room master',
  toAddresses: [
    'AomLjz8o6oPuDZh3JTnaRGGLb7DCfDeyv',
    'AAeGidJncxS2BQgyK284Hasga7965m5EaQ',
    'ALAyDSKuoghJM5A5pC15UrEVdKtCKgpvru',
    'A2jC8RkKfXv6tpURnfmPrWTpyPgLPv1FMa',
    'AKgc6Suhu45PbDgM6u1vQhWYE7BbVnMs1i',
    'AMZPtj9GD2bLehzB2S6GN8zdJSb7QAoD3D',
    'AGQcC35SwT1LYg5QAWXPTd6J1oXceeJQHV',
    'ADQ7R2phWtct434BcTqksFCPGJk84AE9SR',
    'AKAxcvcoGYr1v45sA3X8GQB3GJC2DwkkTt',
    'A4kEU4qePV4ro6baB4vxWAAD4swFNDVN6a'],
  amount: (() => Math.floor(10000 * Math.random())),
}

const xasTransfer = async (address, amount) => {
  const params = {
    secret: config.secret,
    type: 1,
    fee: 10000000,
    message: 'xas transfer test',
    args: [amount, address],
  }
  const res = await lib.transactionUnsignedAsync(params)
  return res
}

(async function main() {
  try {
    const accounts = config.toAddresses
    const startTime = process.uptime()

    for (let i = 0; i < 1000; i++) {
      const j = i % 10
      const amount = config.amount()
      const result = await xasTransfer(accounts[j], amount)
      const data = result.body

      if (data.success) {
        console.log(`${i} transfer to ${accounts[j]} ${amount}`)
      } else {
        console.log('address:', accounts[i], ' error: ', result.data)
      }
    }
    console.log(process.uptime() - startTime)
  } catch (e) {
    console.log(e)
  }
}())
