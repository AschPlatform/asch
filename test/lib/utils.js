var node = require("./../variables.js")

describe('utils', function () {
  it('block reward', function (done) {
    var BlockStatus = require('../../src/utils/blockStatus.js');
    global.Config = {netVersion: 'testnet'};
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

    global.Config = {netVersion: 'mainnet'};
    blockStatus = new BlockStatus();
    node.expect(blockStatus.calcReward(0)).to.equal(0);
    node.expect(blockStatus.calcReward(464499)).to.equal(0);
    node.expect(blockStatus.calcReward(464500)).to.equal(350000000);
    node.expect(blockStatus.calcReward(464501)).to.equal(350000000);
    node.expect(blockStatus.calcReward(464502)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3464500)).to.equal(300000000);

    done();
  });

  it('transaction sort should be stable', function (done) {
    var sortBy = function (a, b) {
      if (a.type != b.type) {
        if (a.type == 1) {
          return 1;
        }
        if (b.type == 1) {
          return -1;
        }
        return a.type - b.type;
      }
      if (a.amount != b.amount) {
        return a.amount - b.amount;
      }
      return a.id.localeCompare(b.id);
    };
    function randNumber (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function randomTrs () {
      var trs = [];
      for (var i = 0; i < 100; ++i) {
        trs.push({
          type: randNumber(0, 8),
          amount: randNumber(0, 10000),
          id: node.randomUsername()
        });
      }
      return trs;
    }
    function clone(a) {
      var b  = [];
      for (var i in a) {
        b.push(a[i]);
      }
      return b;
    }
    var trs = randomTrs();
    var trs1 = clone(trs);
    trs1.sort(sortBy);
    var trs2 = clone(trs1);
    trs2.sort(sortBy);
    node.expect(trs1).to.eql(trs2);
    trs2.sort(sortBy);
    node.expect(trs1).to.eql(trs2);

    var fs = require('fs');
    var path = require('path');
    var trs21 = JSON.parse(fs.readFileSync(path.join(__dirname, './data/trs.21'), 'utf8'));
    var trs21_1 = clone(trs21);
    trs21_1.sort(sortBy);

    var trs21_2 = clone(trs21_1);
    trs21_2.sort(sortBy);
    node.expect(trs21_1).eql(trs21_2);

    var trs7694 = JSON.parse(fs.readFileSync(path.join(__dirname, './data/trs.7694'), 'utf8'));
    var trs7694_1 = clone(trs7694);
    trs7694_1.sort(sortBy);

    var trs7694_2 = clone(trs7694_1);
    trs7694_2.sort(sortBy);
    node.expect(trs7694_1).eql(trs7694_2);
    done();
  });
});