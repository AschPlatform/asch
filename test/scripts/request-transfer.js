const lib = require('../lib')

async function main() {
  const requestorSecret = process.argv[2]
  const senderId = process.argv[3]
  const amount = Number(process.argv[4])
  const recipientId = process.argv[5]
  const trs = {
    secret: requestorSecret,
    type: 1,
    fee: 20000000,
    senderId,
    args: [
      amount,
      recipientId,
    ],
  }
  await lib.transactionUnsignedAsync(trs)
  await lib.onNewBlockAsync()
}

main().catch(console.error)
