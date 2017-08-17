"use strict";

var node = require("./../variables.js"),
    crypto = require("crypto");

var genesisblock = require("../../genesisBlock.json");
var message="test"

describe("POST /peer/transactions", function () {
    it("Using valid transaction with wrong magic in headers. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("1", 1, message, node.Gaccount.password);
	// console.log("transaction",transaction)

        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", "wrongmag")
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body.expected).to.equal(node.config.magic);
                done();
            });
    });

    it("Using same valid transaction with correct magic in headers. Should be ok", function (done) {
        var transaction = node.asch.transaction.createTransaction("1", 1, message, node.Gaccount.password);

        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.true;
                done();
            });
    });

    it("Using transaction with undefined recipientId. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction(undefined, 1, message, node.Gaccount.password);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Using transaction with negative amount. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("1", -1, message, node.Gaccount.password);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Using invalid passphrase. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 1, message, node.Gaccount.password);
        transaction.recipientId = "1";
        transaction.id = node.asch.crypto.getId(transaction);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("When sender has no funds. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("1", 1, message, "randomstring");
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Usin fake signature. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 1, message, node.Gaccount.password);
        transaction.signature = crypto.randomBytes(64).toString("hex");
        transaction.id = node.asch.crypto.getId(transaction);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Using invalid publicKey and signature. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 1, message, node.Gaccount.password);
        transaction.signature = node.randomPassword();
        transaction.senderPublicKey = node.randomPassword();
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Using very large amount and genesis block id. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 10000000000000000, message, node.Gaccount.password);
        transaction.blockId = genesisblock.id;
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                setTimeout(done, 30000);
            });
    });

    it("Using overflown amount. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 184819291270000000012910218291201281920128129, message, node.Gaccount.password);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });

    it("Using float amount. Should fail", function (done) {
        var transaction = node.asch.transaction.createTransaction("12", 1.3, message, node.Gaccount.password);
        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                transaction: transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.false;
                node.expect(res.body).to.have.property("error");
                done();
            });
    });
});
