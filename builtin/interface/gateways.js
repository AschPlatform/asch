module.exports = async function (router) {
  router.get('/', async function (req) {
    return {
      count: 2,
      gateways: [
        {
          name: 'bitcoin',
          desc: 'Bitcoin is an innovative payment network and a new kind of money',
          updateInterval: 86400,
          minimumMembers: 5,
          lastUpdateHeight: 100,
          revoked: 0,
          version: 1
        },
        {
          name: 'ethereum',
          desc: 'Ethereum is a decentralized platform for applications that run exactly as programmed without any chance of fraud, censorship or third-party interference',
          updateInterval: 86400,
          minimumMembers: 5,
          lastUpdateHeight: 100,
          revoked: 0,
          version: 1
        }
      ]
    }
  })
  router.get('/:name/validators', async function (req) {
    return {
      count: 3,
      validators: [
        {
          address: 'A5eTVn2Mz5p2j6SjGKdgvmUc2vMsSvKzuy',
          gateway: 'bitcoin',
          desc: 'bitmain',
          outPublicKey: '03729f44c98f73a3f6ddc98d4870aeb63413059229252424fa4743a96e086a00c1',
          elected: 1
        },
        {
          address: 'A3SmW61ZwxmNc26BbfKLbHkaNbmUQzexuj',
          gateway: 'bitcoin',
          desc: 'viabtc',
          outPublicKey: '0295925ebd0a122df74dbce4b6e5185bb46e0f2deaa4a95dc62715d422c864ba1a',
          elected: 1
        },
        {
          address: 'A4ncaYtKRrD8YS2Mi82HbwGEE9DxqsbEr9',
          gateway: 'bitcoin',
          desc: 'antpool',
          outPublicKey: '0371595356796bdd46a1b87d240d8543ad0541a4e98fc14443a194215c0a4624da',
          elected: 1
        }
      ]
    }
  })
  router.get('/currencies', async function (req) {
    return {
      count: 2,
      currencies: [
        {
          gateway: 'bitcoin',
          symbol: 'BTC',
          desc: 'Bitcoin is an innovative payment network and a new kind of money',
          precision: 8,
          revoked: 0
        },
        {
          gateway: 'ethereum',
          symbol: 'ETH',
          desc: 'Ethereum is a decentralized platform for applications that run exactly as programmed without any chance of fraud, censorship or third-party interference',
          precision: 8,
          revoked: 0
        }
      ]
    }
  })

  router.get('/:name/currencies', async function (req) {
    return {
      count: 1,
      currency: [
        {
          gateway: 'bitcoin',
          symbol: 'BTC',
          desc: 'Bitcoin is an innovative payment network and a new kind of money',
          precision: 8,
          revoked: 0
        }
      ]
    }
  })

  router.get('/:name/accounts/:address', async function (req) {
    let account = {
      address: 'AGw5h2cYK2iYGwp8czhn59Dbr8LMz2BaUC',
      seq: 1,
      gateway: 'bitcoin',
      outAddress: '2N8qAZHVsG8yaAyQHCdbry6iHYxCxyMDd6W',
      attachment: '522103729f44c98f73a3f6ddc98d4870aeb63413059229252424fa4743a96e086a00c1210295925ebd0a122df74dbce4b6e5185bb46e0f2deaa4a95dc62715d422c864ba1a210371595356796bdd46a1b87d240d8543ad0541a4e98fc14443a194215c0a4624da53ae',
      version: 1
    }
    return { account: account }
  })

  router.get('/accounts/:address', async function (req) {
    return {
      count: 1,
      accounts: [
        {
          address: 'AGw5h2cYK2iYGwp8czhn59Dbr8LMz2BaUC',
          seq: 1,
          gateway: 'bitcoin',
          outAddress: '2N8qAZHVsG8yaAyQHCdbry6iHYxCxyMDd6W',
          attachment: '522103729f44c98f73a3f6ddc98d4870aeb63413059229252424fa4743a96e086a00c1210295925ebd0a122df74dbce4b6e5185bb46e0f2deaa4a95dc62715d422c864ba1a210371595356796bdd46a1b87d240d8543ad0541a4e98fc14443a194215c0a4624da53ae',
          version: 1
        }
      ]
    }
  })

  router.get('/deposits/:address/:currency', async function (req) {
    return {
      count: 1,
      deposits: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          confirmations: 1,
          processed: 0,
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })

  router.get('/withdrawals/:address/:currency', async function (req) {
    return {
      count: 1,
      withdrawals: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          processed: 1,
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })
}