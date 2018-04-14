module.exports = function (router) {
  router.get('/', async (req) => {
    let ownerId = req.query.ownerId
    let currency = req.query.currency
    let condition1 = null
    let condition2 = null
    let limit = Number(req.query.limit) || 10
    let offset = Number(req.query.offset) || 0
    if (ownerId && currency) {
      condition1 = [
        { senderId: ownerId },
        { currency: currency }
      ]
      condition2 = [
        { recipientId: ownerId },
        { currency: currency }
      ]
    } else if (ownerId) {
      condition1 = { senderId: ownerId }
      condition2 = { recipientId: ownerId }
    } else if (currency) {
      condition1 = condition2 = { currency: currency }
    } else {
      condition1 = condition2 = null
    }
    if (condition1 === null || condition1 === condition2) {
      let count = await app.model.Transfer.count(condition1)
      let transfers = await app.model.Transfer.findAll({
        condition: condition1,
        limit: limit,
        offset: offset,
      })
      return { count: count, transfers: transfers }
    } else {
      let count1 = await app.model.Transfer.count(condition1)
      let count2 = await app.model.Transfer.count(condition2)
      let t1 = await app.model.Transfer.findAll({
        condition: condition1,
        limit: limit,
        offset: offset,
        sort: { timestamp: -1 }
      })
      let t2 = await app.model.Transfer.findAll({
        condition: condition2,
        limit: limit,
        offset: offset,
        sort: { timestamp: -1 }
      })
      let transfers = t1.concat(t2).sort((l, r) => {
        return r.t_timestamp - l.t_timestamp
      }).slice(0, limit)
      return { count: count1 + count2, transfers: transfers }
    }
  })
}