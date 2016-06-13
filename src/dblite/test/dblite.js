//remove:
var dblite = require('../build/dblite.node.js'),
    file = require('path').join(
      (require('os').tmpdir || function(){return '.'})(),
      'dblite.test.sqlite'
    ),
    db;

// dblite.bin = '/Users/agiammarchi/Downloads/sqlite3';

if (typeof wru === 'undefined') wru = require('wru');
//:remove
wru.log(file);
wru.test([
  {
    name: "main",
    test: function () {
      wru.assert(typeof dblite == "function");
      db = dblite(file);
    }
  },{
    name: 'create table if not exists',
    test: function () {
      db.query('CREATE TABLE IF NOT EXISTS `kvp` (id INTEGER PRIMARY KEY, key TEXT, value TEXT)');
      db.on('info', wru.async(function (data) {
        db.removeListener('table exists', arguments.callee);
        wru.assert('table exists', /^kvp\b/m.test('' + data));
      }));
      db.query('.tables');
    }
  },{
    name: '100 sequential inserts',
    test: function () {
      var timeout = wru.timeout;
      wru.timeout = 30000; // might be very slow
      var start = Date.now(), many = 0;
      db.on('error', wru.log);
      while(many++ < 100) {
        db.query('INSERT INTO kvp VALUES(null, "k' + many + '", "v' + many + '")');
      }
      db.lastRowID('kvp', wru.async(function(data){
        wru.log(data + ' records in ' + ((Date.now() - start) / 1000) + ' seconds');
        wru.assert(100 == data);
        wru.timeout = timeout;
      }));
    }
  },{
    name: '1 transaction with 100 inserts',
    test: function () {
      var start = Date.now(), many = 0;
      db.on('error', wru.log);
      db.query('BEGIN TRANSACTION');
      while(many++ < 100) {
        db.query('INSERT INTO kvp VALUES(null, "k' + many + '", "v' + many + '")');
      }
      db.query('COMMIT');
      db.lastRowID('kvp', wru.async(function(data){
        wru.log(data + ' records in ' + ((Date.now() - start) / 1000) + ' seconds');
        wru.assert(200 == data);
      }));
    }
  },{
    name: 'auto escape',
    test: function () {
      var uniqueKey = 'key' + Math.random();
      db.query('INSERT INTO kvp VALUES(?, ?, ?)', [null, uniqueKey, 'unique value']);
      db.query('SELECT * FROM kvp WHERE key = ?', [uniqueKey], wru.async(function (rows) {
        wru.assert('all good', rows.length === 1 && rows[0][2] === 'unique value' && rows[0][1] === uniqueKey);
      }));
    }
  },{
    name: 'auto field',
    test: function () {
      var start = Date.now();
      db.query('SELECT * FROM kvp', ['id', 'key', 'value'], wru.async(function (rows) {
        start = Date.now() - start;
        wru.log('fetched ' + rows.length + ' rows as objects in ' + (start / 1000) + ' seconds');
        wru.assert(
          'all good',
          rows[0].hasOwnProperty('id') &&
          rows[0].hasOwnProperty('key') &&
          rows[0].hasOwnProperty('value') &&
          rows[rows.length - 1].hasOwnProperty('id') &&
          rows[rows.length - 1].hasOwnProperty('key') &&
          rows[rows.length - 1].hasOwnProperty('value')
        );
      }));
    }
  },{
    name: 'auto parsing field',
    test: function () {
      var start = Date.now();
      db.query('SELECT * FROM kvp', {
        num: parseInt,
        whatsoever: String,
        whatever: String
      }, wru.async(function (rows) {
        start = Date.now() - start;
        wru.log('fetched ' + rows.length + ' rows as normalized objects in ' + (start / 1000) + ' seconds');
        wru.assert(
          'all good',
          rows[0].hasOwnProperty('num') && typeof rows[0].num === 'number' &&
          rows[0].hasOwnProperty('whatsoever') &&
          rows[0].hasOwnProperty('whatever') &&
          rows[rows.length - 1].hasOwnProperty('num') && typeof rows[rows.length - 1].num === 'number' &&
          rows[rows.length - 1].hasOwnProperty('whatsoever') &&
          rows[rows.length - 1].hasOwnProperty('whatever')
        );
      }));
    }
  },{
    name: 'many selects at once',
    test: function () {
      for(var
        start = Date.now(),
        length = 0xFF,
        done = wru.async(function() {
          wru.log(length + ' different selects in ' + ((Date.now() - start) / 1000) + ' seconds');
          wru.assert(true);
        }),
        f = function(j) {
          return function(r) {
            if (j != r[0][0]) {
              throw new Error(j + ':' + r[0][0]);
            } else if (i == length && j == i - 1) {
              done();
            }
          }
        },
        i = 0;
        i < length; i++
      ) {
        db.query('SELECT '+i,f(i));
      }
    }
  },{
    name: 'db.query() arguments',
    test: function () {
      db.query('SELECT 1', wru.async(function (data) {
        wru.assert('just one', data[0][0] == 1);
        db.query('SELECT ?', [2], wru.async(function (data) {
          wru.assert('just two', data[0][0] == 2);
          db.query('SELECT 1', {id:Number}, wru.async(function (data) {
            wru.assert('now one', data[0].id === 1);
            db.query('SELECT ?', [3], {id:Number}, wru.async(function (data) {
              wru.assert('now three', data[0].id === 3);
              // implicit output via bound console.log
              db.query('SELECT 1');
              db.query('SELECT ?', [2]);
              db.query('SELECT 1', {id:Number});
              db.query('SELECT ?', [2], {id:Number});
              setTimeout(wru.async(function(){
                wru.assert('check the output, should be like the following');

                // [ [ '1' ] ]
                // [ [ '2' ] ]
                // [ { id: 1 } ]
                // [ { id: 2 } ]

              }), 500);
            }));
          }));
        }));
      }));
    }
  },{
    name: 'utf-8',
    test: function () {
      var utf8 = '¥ · £ · € · $ · ¢ · ₡ · ₢ · ₣ · ₤ · ₥ · ₦ · ₧ · ₨ · ₩ · ₪ · ₫ · ₭ · ₮ · ₯ · ₹';
      db.query('INSERT INTO kvp VALUES(null, ?, ?)', [utf8, utf8]);
      db.query('SELECT value FROM kvp WHERE key = ? AND value = ?', [utf8, utf8], wru.async(function(rows){
        console.log(utf8);
        wru.assert(rows.length === 1 && rows[0][0] === utf8);
      }));
    }
  },{
    name: 'new lines and disturbing queries',
    test: function () {
      // beware SQLite converts \r\n into \n
      var wut = '"\'\n\'\'\\\\;\n;\'"\'";"\'\r\'"\n\r@\n--'; // \r\n
      db.query('INSERT INTO kvp VALUES(null, ?, ?)', [wut, wut]);
      db.query('SELECT value FROM kvp WHERE key = ? AND value = ?', [wut, wut], wru.async(function(rows){
        wru.assert(rows.length === 1 && rows[0][0] === wut);
      }));
    }
  },{
    name: 'erease file',
    test: function () {
      db.on('close', wru.async(function () {
        wru.assert('bye bye');
        require('fs').unlinkSync(file);
      })).close();
    }
  },{
    name: 'does not create :memory: file',
    test: function () {
      dblite(':memory:')
        .query('CREATE TABLE test (id INTEGER PRIMARY KEY)')
        .query('INSERT INTO test VALUES (null)')
        .query('SELECT * FROM test', wru.async(function () {
          this.close();
          wru.assert('file was NOT created', !(require('fs').existsSync || require('path').existsSync)(':memory:'));
        }))
        .on('close', Object) // silent operation: don't show "bye bye"
      ;
    }
  },{
    name: 'cannot close twice',
    test: function () {
      var times = 0;
      var db = dblite(':memory:');
      db.on('close', function () {
        times++;
      });
      db.close();
      db.close();
      setTimeout(wru.async(function () {
        wru.assert(times === 1);
      }), 500);
    }
  },{
    name: '-header flag',
    test: function () {
      dblite(':memory:', '-header')
        .query('CREATE TABLE test (a INTEGER PRIMARY KEY, b TEXT, c TEXT)')
        .query('INSERT INTO test VALUES (null, 1, 2)')
        .query('INSERT INTO test VALUES (null, 3, 4)')
        .query('SELECT * FROM test', wru.async(function (rows) {
          this.close();
          wru.assert('correct length', rows.length === 2);
          wru.assert('correct result',
            JSON.stringify({a: '1', b: '1', c: '2'}) === JSON.stringify(rows[0]) &&
            JSON.stringify({a: '2', b: '3', c: '4'}) === JSON.stringify(rows[1])
          );
        }))
        .on('close', Object) // silent operation: don't show "bye bye"
      ;
    }
  },{
    // fields have priority if specified
    name: '-header flag with fields too',
    test: function () {
      dblite(':memory:', '-header')
        .query('CREATE TABLE test (a INTEGER PRIMARY KEY, b TEXT, c TEXT)')
        .query('INSERT INTO test VALUES (null, 1, 2)')
        .query('INSERT INTO test VALUES (null, 3, 4)')
        // testing only one random item with a validation
        // to be sure b will be used as second validation property
        // headers are mandatory. Without headers b woul dbe used as `a`
        // because the parsing is based on fields order (supported in V8)
        .query('SELECT * FROM test', {b:Number}, wru.async(function (rows) {
          this.close();
          wru.assert('correct length', rows.length === 2);
          wru.assert('correct result',
            JSON.stringify({a: '1', b: 1, c: '2'}) === JSON.stringify(rows[0]) &&
            JSON.stringify({a: '2', b: 3, c: '4'}) === JSON.stringify(rows[1])
          );
        }))
        .on('close', Object) // silent operation: don't show "bye bye"
      ;
    }
  },{
    name: 'runtime headers',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE test (a INTEGER PRIMARY KEY, b TEXT, c TEXT)')
        .query('INSERT INTO test VALUES (null, 1, 2)')
        .query('INSERT INTO test VALUES (null, 3, 4)')
        .query('SELECT * FROM test', wru.async(function (rows) {
          this.close();
          wru.assert('correct length', rows.length === 2);
          wru.assert('correct result',
            JSON.stringify({a: '1', b: '1', c: '2'}) === JSON.stringify(rows[0]) &&
            JSON.stringify({a: '2', b: '3', c: '4'}) === JSON.stringify(rows[1])
          );
        }))
        .query('.headers OFF')
        .on('close', Object) // silent operation: don't show "bye bye"
      ;
    }
  },{
    name: 'runtime headers with fields too',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE test (a INTEGER PRIMARY KEY, b TEXT, c TEXT)')
        .query('INSERT INTO test VALUES (null, 1, 2)')
        .query('INSERT INTO test VALUES (null, 3, 4)')
        .query('SELECT * FROM test', {b:Number}, wru.async(function (rows) {
          this.close();
          wru.assert('correct length', rows.length === 2);
          wru.assert('correct result',
            JSON.stringify({a: '1', b: 1, c: '2'}) === JSON.stringify(rows[0]) &&
            JSON.stringify({a: '2', b: 3, c: '4'}) === JSON.stringify(rows[1])
          );
        }))
        .on('close', Object) // silent operation: don't show "bye bye"
      ;
    }
  },{
    name: 'single count on header',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE test (id INTEGER PRIMARY KEY)')
        .query('INSERT INTO test VALUES (null)')
        .query('SELECT COUNT(id) AS total FROM test', wru.async(function (rows) {
          this.close();
          wru.assert('right amount of rows', rows.length === 1 && rows[0].total == 1);
        }))
        .query('.headers OFF')
        .on('close', Object)
      ;
    }
  },{
    name: 'null value test',
    test: function () {
      dblite(':memory:')
        .query('CREATE TABLE test (v TEXT)')
        .query('INSERT INTO test VALUES (null)')
        .query('SELECT * FROM test', wru.async(function (rows) {
          wru.assert('as Array', rows[0][0] === '');
          this
            .query('.headers ON')
            .query('SELECT * FROM test', wru.async(function (rows) {
              this.close();
              wru.assert('as Object', rows[0].v === '');
            }))
          ;
        }))
        .on('close', Object)
      ;
    }
  },{
    name: 'right order of events',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE test (v TEXT)')
        .query('INSERT INTO test VALUES ("value")')
        .query('SELECT * FROM test', wru.async(function (rows) {
          wru.assert('as Object', rows[0].v === 'value');
          // now it should not have headers
          this
            .query('SELECT * FROM test', wru.async(function (rows) {
              this.close();
              wru.assert('as Array', rows[0][0] === 'value');
            }))
          ;
        }))
        .query('.headers OFF') // before the next query
        .on('close', Object)
      ;
    }
  },{
    name: 'combined fields and headers',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('SELECT 1 as one, 2 as two', {two:Number}, wru.async(function (rows) {
          this.close();
          wru.assert('right validation', rows[0].one === '1' && rows[0].two === 2);
        }))
        .on('close', Object)
      ;
    }
  },{
    name: 'selecting empty results with manual fields works as expected',
    test: function () {
      dblite(':memory:')
        .query('CREATE TABLE whatever (v TEXT)')
        .query('SELECT * FROM whatever', {v:String}, wru.async(function (rows) {
          wru.assert('invoked corectly', rows.length === 0);
          this.close();
        }))
        .on('close', Object)
      ;
    }
  },{
    name: 'selecting empty results with automatic fields works as expected',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE whatever (v TEXT)')
        .query('SELECT * FROM whatever', wru.async(function (rows) {
          wru.assert('invoked corectly', rows.length === 0);
          this.close();
        }))
        .on('close', Object)
      ;
    }
  },{
    name: 'notifies inserts or other operations too',
    test: function () {
      var many = 0, db = dblite(':memory:').on('close', Object);
      db.query('CREATE TABLE IF NOT EXISTS `kvp` (id INTEGER PRIMARY KEY, key TEXT, value TEXT)');
      db.query('BEGIN TRANSACTION');
      while(many++ < 100) {
        db.query('INSERT INTO kvp VALUES(null, "k' + many + '", "v' + many + '")');
      }
      db.query('COMMIT', wru.async(function () {
        wru.assert('so far, so good');
        db.query('SELECT COUNT(id) FROM kvp', wru.async(function (rows) {
          db.close();
          wru.assert('exact number of rows', +rows[0][0] === --many);
        }));
      }));
    }
  },{
    name: 'automagic serialization',
    test: function () {
      dblite(':memory:')
        .query('CREATE TABLE IF NOT EXISTS `kv` (id INTEGER PRIMARY KEY, value TEXT)')
        .query('INSERT INTO `kv` VALUES(?, ?)', [null, {some:'text'}])
        .query('SELECT * FROM `kv`', {
          id: Number,
          value: JSON.parse
        }, wru.async(function(rows) {
          this.close();
          wru.assert('it did JSON.parse correctly', rows[0].value.some === 'text');
        })).on('close', Object)
      ;
    }
  },{
    name: 'lastRowID with headers too',
    test: function () {
      dblite(':memory:')
        .query('.headers ON')
        .query('CREATE TABLE test (id INTEGER PRIMARY KEY)')
        .query('INSERT INTO test VALUES (null)')
        .lastRowID('test', wru.async(function (id) {
          this.close();
          wru.assert(id == 1);
        })).on('close', Object)
      ;
    }
  }, {
    name: 'dual arguments with error behavior',
    test: function () {
      var done = wru.async(function (err, data) {
        wru.assert('there is an error', err instanceof Error);
        wru.assert('there is no data', data === null);
      });
      dblite(':memory:').query('CAUSING ERROR', function(err, data){
        this.close();
        done(err, data);
      }).on('close', Object);
    }
  }, {
    name: 'dual arguments with data behavior',
    test: function () {
      var done = wru.async(function (err, data) {
        wru.assert('there is no error', !err);
        wru.assert('there is some data', data == 123);
      });
      dblite(':memory:').query('SELECT 123', function(err, data){
        this.close();
        done(err, data);
      }).on('close', Object);
    }
  }, {
    name: 'using unsafe .ignoreErrors property',
    test: function () {
      var done = wru.async(function (err, data) {
        wru.assert('there is no error', !err);
        wru.assert('there is some data', data.length === 2);
      });
      var q = 'SELECT * FROM album ORDER BY name asc';
      var db = dblite(':memory:');
      db.ignoreErrors = true;
      db
        .query(q, function result(err, data) {
          if (err) {
            this
              .query('CREATE TABLE album (id INTEGER PRIMARY KEY, name TEXT)')
              .query('INSERT INTO album VALUES (null, "a")')
              .query('INSERT INTO album VALUES (null, "b")')
              .query(q, result)
            ;
          } else {
            done(err, data);
          }
        })
        .on('close', Object)
      ;
    }
  },{
    name: 'no problems on ABORT',
    test: function () {

      var
        done = wru.async(function (message, test) {
          wru.assert(message, test);
          done = Object;
        }
      );

      db = dblite(file);
      db
        .query('CREATE TABLE users (id INTEGER PRIMARY KEY ON CONFLICT REPLACE, email TEXT UNIQUE ON CONFLICT ABORT)')
        .query('INSERT INTO users VALUES(?, ?)', [1, 'foo@example.com'])
        .query('INSERT INTO users VALUES(?, ?)', [2, 'bar@example.com'], function(err, data) {
          if (err) {
            return done('it failed to insert data', err);
          }
          db
            .query('INSERT INTO users VALUES(?, ?)', [1, 'bar@example.com'], function(err, data){
              setTimeout(done, 1000, 'should have produced an error', err);
            })
            .query('SELECT * FROM users WHERE id = ?', [1], function(err, data) {
              done('the error did not trigger', false);
            })
          ;
        })
        .on('close', Object)
      ;

    }
  },{
		name: "Buffer test",
		test: function () {
			var done = wru.async(function (message, test) {
				wru.assert(message, test);
				done = Object;
			});

			var buffer = new Buffer(120);
			buffer.fill(Math.floor((Math.random() * 1000) + 1));
			buffer = require('crypto').createHash('sha256').update(buffer).digest();

			var db = dblite(':memory:');
			db.query('CREATE TABLE blobtest (v BINARY(32))')
			  .query('INSERT INTO blobtest(v) VALUES($v)', {v: buffer}, function (err) {
					if (err) {
						return done('it failed to insert blob', err);
					}

					db.query("SELECT hex(v) FROM blobtest", {'v' : Buffer}, function (err, rows) {
						if (err) {
							return done('it faild to select buffer data', err);
						}

						if (!Buffer.isBuffer(rows[0].v)) {
							return done("this is not a buffer", rows[0].v);
						}

						return done("this is valid buffer", rows[0].v.toString('hex') == buffer.toString('hex'));
					});
				}).on('close', Object);
		}
	}
]);