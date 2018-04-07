module.exports = function (router) {
  router.get('/', async function (req) {
    return {
      count: 1,
      councils: [
        {
          name: 'asch_gateway',
          desc: 'Description of asch gateway',
          updateInterval: 8640 * 30,
          lastUpdateHeight: 100,
          members: [
            'A9er4Gz1xnbXfr5qftuPhq3qyghtnM62rK',
            'A211511fePxUU49D73896Emh5QCEahVF7o',
            'A2175jmmQNp3Yz9rJGyFL9gq4RdijmeDoe',
            'A2B6wBuA8Hq35ddxMk8Pywdfk9s3sYvwdH',
            'A34mdHCYcJYhN5iSJ3ywLaA3PvzLmbZoDG'
          ],
          revoked: 0
        }
      ]
    }
  })

  router.get('/:name', async function (req) {
    return {
      council: {
        name: 'asch_gateway',
        desc: 'Description of asch gateway',
        updateInterval: 8640 * 30,
        lastUpdateHeight: 100,
        revoked: 0,
        members: [
          'A9er4Gz1xnbXfr5qftuPhq3qyghtnM62rK',
          'A211511fePxUU49D73896Emh5QCEahVF7o',
          'A2175jmmQNp3Yz9rJGyFL9gq4RdijmeDoe',
          'A2B6wBuA8Hq35ddxMk8Pywdfk9s3sYvwdH',
          'A34mdHCYcJYhN5iSJ3ywLaA3PvzLmbZoDG'
        ],
      }
    }
  })
}