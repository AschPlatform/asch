var node = require("./../variables.js")
var Tmdb = require('../../src/utils/tmdb.js')

describe('tmdb', function () {
  it('normal test', function (done) {
    var data = new Map
    data.set(1, 1)
    var db = new Tmdb(data)
    db.set(2, 2)
    node.expect(db.log.length).to.equal(1)
    db.set(3, 3)
    node.expect(db.log.length).to.equal(2)
    db.rollback()
    node.expect(db.log.length).to.equal(0)
    node.expect(db.map.size).to.equal(1)

    node.expect(db.get(2)).to.not.exist
    node.expect(db.get(3)).to.not.exist
    db.set(4, 4)
    node.expect(db.get(4)).to.equal(4)
    node.expect(db.map.size).to.equal(2)
    db.commit()
    node.expect(db.get(4)).to.equal(4)
    node.expect(db.map.size).to.equal(2)

    db.set(1, 10)
    db.set(1, 11)
    db.rollback()
    node.expect(db.get(1)).to.equal(1)

    done()
  })
})