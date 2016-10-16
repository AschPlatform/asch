var async = require('async');
var fs = require('fs');

module.exports = function (scope) {
  var modules = scope.modules;
  modules.delegates.disableForging();
  // return;
  var lastId = '16776183461831224417';
  var filter = {
    limit: 102,
    lastId: lastId
  };
  var delegates1;
  var delegates2;
  var delegates3;
  modules.blocks.loadBlocksData(filter, { plain: true }, function (err, data) {
    if (err) {
      console.error('loadBlocksData error', err);
      return;
    }
    var blocks = modules.blocks.parseBlock(data);
    async.waterfall([
      function (cb) {
        setTimeout(cb, 1000);
      },
      function backword(cb) {
        modules.round.directionSwap('backward', modules.blocks.getLastBlock(), cb);
      },
      function getList1(cb) {
        modules.delegates.getDelegates({}, cb);
      },
      function rollbackBlock(delegates, cb) {
        delegates1 = delegates.delegates;
        modules.blocks.deleteBlocksBefore({ height: 1 }, cb);
      },
      function getList2(_, cb) {
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
  });
}