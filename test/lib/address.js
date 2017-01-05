var node = require("./../variables.js")
var address = require('../../src/utils/address.js')

describe('address', function () {
  it('old 64bit address should be ok', function (done) {
    node.expect(address.isAddress('a')).to.be.false
    node.expect(address.isAddress('')).to.be.false
    node.expect(address.isAddress()).to.be.false
    node.expect(address.isAddress(1)).to.be.false
    node.expect(address.isAddress('1a')).to.be.false
    node.expect(address.isAddress('1234567890123456789012')).to.be.false

    node.expect(address.isAddress('1')).to.be.true
    node.expect(address.isAddress('12345')).to.be.true

    done()
  })

  it('bitcoin address should be invalid', function (done) {
    node.expect(address.isAddress('16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM')).to.be.false
    done()
  })

  it('normal address should be ok', function (done) {
    node.expect(address.isAddress('AKo7K2zkjZ45WP6PbzEU7iCVzXvDT3hUg1')).to.be.true

    var addr1 = address.generateBase58CheckAddress(node.genNormalAccount().publicKey)
    node.expect(address.isAddress(addr1)).to.be.true

    done()
  })
})