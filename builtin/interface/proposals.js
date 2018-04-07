module.exports = function (router) {
  router.get('/', async function (req) {
    return {
      count: 2,
      proposals: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          title: '新增跨链网关理事会',
          desc: '跨链网关理事会是由7个节点组成的拥有链上跨链合约执行特权的组织机构',
          topic: 'council_register',
          content: '{name: "asch_gateway", desc: "Asch跨链网关，用于处理链外资产如BTC,ETH等资产的路由", updateInterval: 864000, members: ["bitmain", "viabtc"]}',
          activated: 0,
          expired: 0,
          height: 12321
        }
      ]
    }
  })

  router.get('/:pid', async function (req) {
    return {
      proposal: {
        tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
        title: '新增跨链网关理事会',
        desc: '跨链网关理事会是由7个节点组成的拥有链上跨链合约执行特权的组织机构',
        topic: 'council_register',
        content: '{name: "asch_gateway", desc: "Asch跨链网关，用于处理链外资产如BTC,ETH等资产的路由", updateInterval: 864000, members: ["bitmain", "viabtc"]}',
        activated: 0,
        expired: 0,
        height: 12321
      }
    }
  })

  router.get('/:pid/votes', async function (req) {
    return {
      count: 1,
      votes: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          pid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          voter: 'APPTVimZMfrgTB4o9egDxhv3ftNNev9y4L'
        }
      ]
    }
  })
}