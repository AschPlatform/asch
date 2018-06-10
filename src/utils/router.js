const extend = require('extend')
const express = require('express')

function map(root, config) {
  const router = this
  Object.keys(config).forEach((params) => {
    const route = params.split(' ')
    if (route.length !== 2 || ['post', 'get', 'put'].indexOf(route[0]) === -1) {
      throw Error('wrong map config')
    }
    router[route[0]](route[1], (req, res) => {
      const reqParams = {
        body: route[0] === 'get' ? req.query : req.body,
        params: req.params,
      }
      root[config[params]](reqParams, (err, response) => {
        if (err) {
          return res.json({ success: false, error: err })
        }
        return res.json(extend({}, { success: true }, response))
      })
    })
  })
}

/**
 * @title Router
 * @overview Router stub
 * @returns {*}
 */
function Router() {
  const router = express.Router()

  // router.use(function (req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   next();
  // });

  router.map = map

  return router
}

module.exports = Router
