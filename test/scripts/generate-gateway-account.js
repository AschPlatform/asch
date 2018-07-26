const gateway = require('asch-gateway')

const name = process.argv[2]
const netType = process.argv[3]

const utilClassMap = new Map()
utilClassMap.set('bitcoin', gateway.bitcoin.Utils)
utilClassMap.set('bitcoincash', gateway.bitcoincash.Utils)


const Klass = utilClassMap.get(name)
const instance = new Klass(netType)

console.log(instance.generateAccount())
