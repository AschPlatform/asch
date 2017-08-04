"use strict";

var node = require("./../variables.js"),
    crypto = require("crypto");

var account = node.randomAccount();
var account2 = node.randomAccount();
var account3 = node.randomAccount();

describe("POST /peer/transactions", function () {

    describe("Enabling second passphrase", function () {

        it("When accounts has no funds. Should fail", function (done) {
            var transaction = node.asch.signature.createSignature(node.randomPassword(), node.randomPassword());
            node.peer.post("/transactions")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    transaction: transaction
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    // console.log(JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.false;
                    done();
                });
        });

        it("When accounts has funds. Should be ok.", function (done) {
            node.api.post("/accounts/open")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    secret: account.password
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    account.address = res.body.account.address;
                    node.api.put("/transactions")
                        .set("Accept", "application/json")
                        .set("version", node.version)
                        .set("magic", node.config.magic)
                        .set("port", node.config.port)
                        .send({
                            secret: node.Gaccount.password,
                            amount: node.Fees.secondPasswordFee + 100000000, // Testing 1 delegate registration + 1 transaction sending 1XAS
                            recipientId: account.address
                        })
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            // console.log(JSON.stringify(res.body));
                            node.expect(res.body).to.have.property("success").to.be.true;
                            node.onNewBlock(function (err) {
                                node.expect(err).to.be.not.ok;
                                var transaction = node.asch.signature.createSignature(account.password, account.secondPassword);
                                transaction.fee = node.Fees.secondPasswordFee;
                                node.peer.post("/transactions")
                                    .set("Accept", "application/json")
                                    .set("version", node.version)
                                    .set("magic", node.config.magic)
                                    .set("port", node.config.port)
                                    .send({
                                        transaction: transaction
                                    })
                                    .expect("Content-Type", /json/)
                                    .expect(200)
                                    .end(function (err, res) {
                                        // console.log(transaction.recipientId);
                                        // console.log(account.address);
                                        node.expect(res.body).to.have.property("success").to.be.true;
                                        node.onNewBlock(done);
                                    });
                            });
                        });
                });
        });

    });
});

describe("POST /peer/transactions", function () {

    describe("Sending normal transaction with second passphrase now enabled", function () {

        it("When account doesn't have a second passphrase. Should fail", function (done) {
            var transaction = node.asch.transaction.createTransaction("1", 1, node.Gaccount.password, account.secondPassword);
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
                    done();
                });
        });

        it("Using blank second signature. Should fail", function (done) {
            var transaction = node.asch.transaction.createTransaction("1", 1, account.password, ""); // Send 1 XAS to address 1L
            node.peer.post("/transactions")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    transaction: transaction
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    // console.log(JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.false;
                    done();
                });
        });

        it("Using fake second signature. Should fail", function (done) {
            var transaction = node.asch.transaction.createTransaction("1", 1, account.password, account2.secondPassword); // Send 1 XAS to address 1L
            transaction.signSignature = crypto.randomBytes(64).toString("hex");
            transaction.id = node.asch.crypto.getId(transaction);
            node.peer.post("/transactions")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    transaction: transaction
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    // console.log(JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.false;
                    done();
                });
        });

        it.skip("Using valid second signature. Should be ok", function (done) {
            var transaction = node.asch.transaction.createTransaction("1", 1, account.password, account.secondPassword); // Send 1 XAS to address 1L
            node.peer.post("/transactions")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    transaction: transaction
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    console.log(JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.true;
                    done();
                });
        });

    });
});
