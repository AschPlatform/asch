const lib = require('../lib')

function submitTransactions(trs) {
  return new Promise((resolve, reject) => {
    lib.api.put('/transactions/batch')
      .send({ transactions: trs })
      .end((err, res) => {
        if (err) return reject(err)
        if (!res.body.success) return reject(res.body.error)
        return resolve(res)
      })
  })
}

function buildTransactions(n) {
  const trs = []
  for (let i = 0; i < n; i++) {
    trs.push(lib.AschJS.transaction.createTransactionEx({
      secret: lib.GENESIS_ACCOUNT.secret,
      type: 1,
      fee: 10000000,
      args: [
        lib.randomCoin(),
        lib.getNormalAccount().address,
      ],
    }))
  }
  return trs
}

async function main() {
  const trs = buildTransactions(10)
  console.time('time usage')
  await submitTransactions(trs)
  console.timeEnd('time usage')
}

main().catch(console.error)
