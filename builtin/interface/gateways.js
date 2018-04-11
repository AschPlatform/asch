module.exports = async function (router) {
  router.get('/currencies', async function (req) {
    return {
      count: 2,
      currencies: [
        {
          symbol: 'BTC',
          desc: 'Bitcoin is an innovative payment network and a new kind of money',
          quantity: 1000
        },
        {
          symbol: 'ETH',
          desc: 'Ethereum is a decentralized platform for applications that run exactly as programmed without any chance of fraud, censorship or third-party interference',
          quantity: 5000
        }
      ]
    }
  })

  router.get('/:name/currencies', async function (req) {
    return {
      count: 1,
      currency: [
        {
          symbol: 'BTC',
          desc: 'Bitcoin is an innovative payment network and a new kind of money',
          quantity: 1000
        }
      ]
    }
  })

  router.get('/:name/accounts/:address', async function (req) {
    return { address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC' }
  })

  router.get('/deposits', async function (req) {
    return {
      count: 1,
      deposits: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })

  router.get('/:name/deposits', async function (req) {
    return {
      count: 1,
      deposits: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })

  router.get('/deposits/my/:address', async function (req) {
    return {
      count: 1,
      deposits: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })

  router.get('/deposits/my/:address/:currency', async function (req) {
    return {
      count: 1,
      deposits: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          currency: 'BTC',
          amount: '10.5',
          address: 'mvGfGo9YfNiTJK6MDnfwDwr5jTdWR1ovdC',
          oid: '02195dfafc389e465efe8e5bfc2ad4d5aa7b248eb81700b76fa25d657536aafdfe',
        }
      ]
    }
  })

  router.get('/withdrawals', async function (req) {
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

  router.get('/withdrawals/:currency', async function (req) {
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

  router.get('/withdrawals/my/:address', async function (req) {
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

  router.get('/withdrawals/my/:address/:currency', async function (req) {
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