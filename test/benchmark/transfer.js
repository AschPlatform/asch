const lib = require('../lib')

const config = {
  secret: lib.GENESIS_ACCOUNT.secret,
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

const xasTransfer = async (address, amount, message) => {
  console.log(`transfer ${amount} to ${address}: ${message}`)
  const params = {
    secret: config.secret,
    type: 1,
    fee: 10000000,
    message,
    args: [amount, address],
  }
  const res = await lib.transactionUnsignedAsync(params)
  return res
}

async function main() {
  const accounts = config.toAddresses
  const startTime = process.uptime()

  for (let i = 0; i < 1000; i++) {
    const j = i % 10
    const amount = config.amount()
    const result = await xasTransfer(accounts[j], amount, i.toString())
    const res = result.body

    if (!res.success) {
      console.log('address:', accounts[i], ' error: ', res.error)
    }
  }
  console.log(process.uptime() - startTime)
}

main().catch(console.error)
