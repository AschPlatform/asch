var node = require("./../variables.js")

describe('utils', function () {
  it('block reward', function (done) {
    var BlockStatus = require('../../src/utils/blockStatus.js');
    var blockStatus = new BlockStatus();
    node.expect(blockStatus.calcMilestone(0)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60480)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60481)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60482)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60483)).to.equal(0);
    node.expect(blockStatus.calcMilestone(3060480)).to.equal(1);

    node.expect(blockStatus.calcReward(0)).to.equal(0);
    node.expect(blockStatus.calcReward(60480)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60481)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60482)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60483)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3060480)).to.equal(300000000);

    done();
  });
});