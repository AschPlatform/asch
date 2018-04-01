module.exports = function (router) {
  router.get('/', async function (req) {
    return {
      count: 1,
      proposals: [
        {
          tid: '2bfc06d4984a2e8d1a0d55513c29fadcd8dc535de753e4cd584dec38ae91686c',
          topic: 'council_register',
          content: 'asch_gateway,321321,321321,321321',
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
        topic: 'council_register',
        content: 'asch_gateway,321321,321321,321321',
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