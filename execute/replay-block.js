var async = require('async');
var fs = require('fs');

module.exports = function (scope) {
  var modules = scope.modules;
  modules.delegates.disableForging();
  // return;
  // var lastId = '17309721836183487097';
  // var rollbackHeight = 737401;
  // var lastId = '6922743440970103151';
  // var rollbackHeight = 737300;
  var lastId = '7942079129579100910';
  var rollbackHeight = 730937;
  var filter = {
    limit: 100000,
    lastId: lastId
  };
  var delegates1;
  var delegates2;
  var delegates3;
  var blocks;
  async.waterfall([
    function (cb) {
      setTimeout(cb, 1000);
    },
    function (cb) {
      modules.blocks.loadBlocksData(filter, { plain: true }, cb);
    },
    function (blockData, cb) {
      blocks = modules.blocks.parseBlock(blockData);
      console.log('-----totally blocks num', blocks.length)
      cb();
    },
    function backward(cb) {
      console.log('backward')
      modules.round.directionSwap('backward', modules.blocks.getLastBlock(), cb);
    },
    function getList1(cb) {
      console.log('getList1')
      modules.delegates.getDelegates({}, cb);
    },
    function rollbackBlock(delegates, cb) {
      console.log('rollbackBlock')
      delegates1 = delegates.delegates;
      modules.blocks.deleteBlocksBefore({ height: rollbackHeight }, cb);
    },
    function getList2(_, cb) {
      console.log('getList2')
      modules.delegates.getDelegates({}, cb);
    },
    function forward(delegates, cb) {
      modules.round.directionSwap('forward', modules.blocks.getLastBlock(), function (err) {
        cb(err, delegates);
      });
    },
    function applyBlock1(delegates, cb) {
      delegates2 = delegates.delegates;
      console.log('applyBlock1 last height ' + modules.blocks.getLastBlock().height + ', cur ' + blocks[0].height);
      async.eachSeries(blocks, function (block, next) {
        if (block.height == 737478) {
          process.exit(1)
          return
        }
        modules.blocks.processBlock(block, null, false, true, next);
      }, cb);
    },
    function getList3(cb) {
      console.log('getList3 last height ' + modules.blocks.getLastBlock().height);
      modules.delegates.getDelegates({}, function (err, delegates) {
        delegates3 = delegates.delegates;
        cb(err);
      });
    }
  ], function (err) {
    fs.writeFileSync('/tmp/delegate1.json', JSON.stringify(delegates1, null, 2), 'utf8');
    fs.writeFileSync('/tmp/delegate2.json', JSON.stringify(delegates2, null, 2), 'utf8');
    fs.writeFileSync('/tmp/delegate3.json', JSON.stringify(delegates3, null, 2), 'utf8');
    if (err) {
      console.error('replay block error', err);
    } else {
      console.log('all done! last block = ', modules.blocks.getLastBlock());
    }
    process.exit(0);
  });
}