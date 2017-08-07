"use strict";

var node = require("./../variables.js"),
    crypto = require("crypto");

describe("POST /peer/blocks", function () {

    it("Using invalid magic in headers. Should fail", function (done) {
        node.peer.post("/blocks")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", "wrongmagic")
            .set("port",node.config.port)
            .send({
                dummy: "dummy"
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                // node.expect(res.body.expected).to.equal(node.config.magic);
                done();
            });
    });
});

describe("GET /peer/blocks", function () {

    it("Using correct magic in headers. Should be ok", function (done) {
        node.peer.get("/blocks")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body.blocks));
                node.expect(res.headers.magic).to.equal(node.config.magic);
                node.expect(res.body.blocks.length).to.be.greaterThan(1);
                done();
            });
    });
});
