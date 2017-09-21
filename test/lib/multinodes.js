'use strict';

var DEBUG = require('debug')('accounts')
var node = require("./../variables.js");
var async = require('async');

// var reallheight = 0;
// reallheight = node._getheight("http://127.0.0.1:4096",
//     function (err, height) {
//         reallheight = height;
//         console.log('1', reallheight);
//     }
// )

var urls = [
    "http://127.0.0.1:4096",
    "http://127.0.0.1:4097",
    "http://127.0.0.1:4098",
    "http://127.0.0.1:4099"
]

// async.mapSeries(urls, function (url, cb) {
//     node._getheight(url, cb)
// }, function (err, results) {
//     console.log('2', results);
// });  


// async.mapSeries(urls, node._getheight, function (err, results) {
//     console.log('3', results);
// }); 

// async.mapSeries(urls, node._getheight, function (err, results) {
//     if (!err) {
//         console.log('4', results);
//         var items = new Set(results)
//         var size = items.size
//         console.log(size, items)
//         if (size === 1) {
//             console.log('All heights are the same!')
//         } else {

//         }
//     } else {
//         console.log(err)
//     }
// }); 


describe("GET /blocks/getHeight in multi nodes", function () {

    it("Should be same height", function (done) {
        async.mapSeries(urls, node._getheight, function (err, results) {
            console.log('heights', results);
            if (!err) {
                let items = new Set(results);
                node.expect(items.size).to.equal(1);
            } else {
                console.log('getHeight in multi nodes error')
            }
            done();
        });
    });
});



// 报错：提示找不到_getheight
// describe("GET /blocks/getHeight in multi nodes", function () {
    
//         it("Should be same height", async function () {
//             DEBUG('---')
//             console.log('---')
//             let results = await node.getHeightMultiNodes(urls);
//             console.log('5', results);
//             var items = new Set(results);
//             node.expect(items.size).to.equal(1);
    
//         });
//         console.log('---2')
//     });