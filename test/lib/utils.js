var node = require("./../variables.js")

describe('utils', function () {
  it('test block reward', function (done) {
    var BlockStatus = require('../../src/utils/block-status.js');
    global.Config = {netVersion: 'testnet'};
    var blockStatus = new BlockStatus();
    node.expect(blockStatus.calcMilestone(1)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60480)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60481)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60482)).to.equal(0);
    node.expect(blockStatus.calcMilestone(60483)).to.equal(0);
    node.expect(blockStatus.calcMilestone(2999999)).to.equal(0);
    node.expect(blockStatus.calcMilestone(3000000)).to.equal(0);
    node.expect(blockStatus.calcMilestone(3000001)).to.equal(1);

    node.expect(blockStatus.calcReward(1)).to.equal(0);
    node.expect(blockStatus.calcReward(2)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60480)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60481)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60482)).to.equal(350000000);
    node.expect(blockStatus.calcReward(60483)).to.equal(350000000);
    node.expect(blockStatus.calcReward(2999999)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3000000)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3000001)).to.equal(300000000);

    node.expect(blockStatus.calcSupply(1)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(2)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(101)).to.equal(10000035000000000);
    node.expect(blockStatus.calcSupply(102)).to.equal(10000035000000000);
    node.expect(blockStatus.calcSupply(3000000)).to.equal(11049965350000000);
    node.expect(blockStatus.calcSupply(3000003)).to.equal(11050000550000000);

    global.Config = {netVersion: 'mainnet'};
    blockStatus = new BlockStatus();
    node.expect(blockStatus.calcReward(0)).to.equal(0);
    node.expect(blockStatus.calcReward(464499)).to.equal(0);
    node.expect(blockStatus.calcReward(464500)).to.equal(350000000);
    node.expect(blockStatus.calcReward(464501)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3464499)).to.equal(350000000);
    node.expect(blockStatus.calcReward(3464500)).to.equal(300000000);
    node.expect(blockStatus.calcReward(6464499)).to.equal(300000000);
    node.expect(blockStatus.calcReward(6464500)).to.equal(200000000);
    node.expect(blockStatus.calcReward(9464499)).to.equal(200000000);
    node.expect(blockStatus.calcReward(9464500)).to.equal(100000000);
    node.expect(blockStatus.calcReward(12464499)).to.equal(100000000);
    node.expect(blockStatus.calcReward(12464500)).to.equal(50000000);
    node.expect(blockStatus.calcReward(15464499)).to.equal(50000000);
    node.expect(blockStatus.calcReward(15464500)).to.equal(50000000);

    node.expect(blockStatus.calcSupply(0)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(464499)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(464500)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(464501)).to.equal(10000000000000000);
    node.expect(blockStatus.calcSupply(464600)).to.equal(10000035350000000);
    node.expect(blockStatus.calcSupply(464601)).to.equal(10000035350000000);
    node.expect(blockStatus.calcSupply(464700)).to.equal(10000035350000000);
    node.expect(blockStatus.calcSupply(464701)).to.equal(10000070700000000);
    node.expect(blockStatus.calcSupply(491077)).to.equal(10009297050000000);
    node.expect(blockStatus.calcSupply(513236)).to.equal(10017038700000000);
    node.expect(blockStatus.calcSupply(537943)).to.equal(10025699450000000);
    node.expect(blockStatus.calcSupply(587374)).to.equal(10042985600000000);
    node.expect(blockStatus.calcSupply(3464502)).to.equal(11050000900000000);
    node.expect(blockStatus.calcSupply(6464505)).to.equal(11950001200000000);
    node.expect(blockStatus.calcSupply(9464508)).to.equal(12550000900000000);
    node.expect(blockStatus.calcSupply(12464511)).to.equal(12850000600000000);
    node.expect(blockStatus.calcSupply(15464514)).to.equal(13000000750000000);
    node.expect(blockStatus.calcSupply(15464515)).to.equal(13000000750000000);
    node.expect(blockStatus.calcSupply(15464615)).to.equal(13000005800000000);
    node.expect(blockStatus.calcSupply(18464517)).to.equal(13150000900000000);

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