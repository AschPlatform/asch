module.exports = {
  isAddress: function(address) {
    return typeof address === 'string' && /^[0-9]{1,21}$/g.test(address)
  }
}