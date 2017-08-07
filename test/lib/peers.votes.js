"use strict";

var node = require("./../variables.js"),
    crypto = require("crypto");

var account = node.randomAccount();
var voterAccount = node.randomAccount();

var delegate1;
var delegate2;
node.chai.config.includeStack = true;

describe("POST /peer/transactions", function () {
    
    before(function (done) {
        node.api.post("/accounts/open")
            .set("Accept", "application/json")
            .send({
                secret: voterAccount.password
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                // console.log(JSON.stringify(res.body));
                node.expect(res.body).to.have.property("success").to.be.true;
                if (res.body.success == true && res.body.account != null) {
                    voterAccount.address = res.body.account.address;
                    voterAccount.publicKey = res.body.account.publicKey;
                    voterAccount.balance = res.body.account.balance;
                } else {
                    console.log("Unable to open voterAccount, tests will fail");
                    console.log("Data sent: secret: " + voterAccount.password + " , secondSecret: " + voterAccount.secondPassword);
                    node.expect("TEST").to.equal("FAILED");
                }
                
                // Send random XAS amount from genesis account to Random account
                node.api.put("/transactions")
                    .set("Accept", "application/json")
                    .send({
                        secret: node.Gaccount.password,
                        amount: node.RANDOM_COIN,
                        recipientId: voterAccount.address
                    })
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        console.log(JSON.stringify(res.body));
                        node.expect(res.body).to.have.property("success").to.be.true;
                        node.expect(res.body).to.have.property("transactionId");
                        if (res.body.success == true && res.body.transactionId != null) {
                            // node.expect(res.body.transactionId).to.be.above(1);
                            node.expect(res.body.transactionId).to.be.a('string');
                            voterAccount.amount += node.RANDOM_COIN;
                        } else {
                            // console.log("Transaction failed or transactionId is null");
                            // console.log("Sent: secret: " + node.Gaccount.password + ", amount: " + node.RANDOM_COIN + ", recipientId: " + voterAccount.address);
                            node.expect("TEST").to.equal("FAILED");
                        }
                        node.onNewBlock(done);
                    });
            });
    });

    before(function (done) {
        node.api.get("/delegates/")
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                node.expect(res.body).to.have.property("success").to.be.true;
                delegate1 = res.body.delegates[0].publicKey;
                delegate2 = res.body.delegates[1].publicKey;
                var votes = [];
                votes.push("+" + delegate1);
                votes.push("+" + delegate2);
                var transaction = node.asch.vote.createVote(votes, voterAccount.password);
                // console.log('createVote transaction', transaction);
                if (transaction !== null) {
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
                            console.log("Sent vote fix for delegates");
                            console.log("Sent: " + JSON.stringify(transaction) + " Got reply: " + JSON.stringify(res.body));
                            node.expect(res.body).to.have.property("success").to.be.true;
                            done();
                        });
                } else {
                    done();
                }
            });
    });

    it("Voting twice for a delegate. Should fail", function (done) {
        node.onNewBlock(function (err) {
            var transaction = node.asch.vote.createVote(["+"+delegate1], voterAccount.password);
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
                    // console.log("Sending POST /transactions with data: " + JSON.stringify(transaction) + " Got reply: " + JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.false;
                    done();
                });
        });
    });

    it("Removing votes from a delegate. Should be ok", function (done) {
        var transaction = node.asch.vote.createVote(["-"+delegate1], voterAccount.password);
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

    it("Removing votes from a delegate and then voting again. Should fail", function (done) {
        node.onNewBlock(function (err) {
            var transaction = node.asch.vote.createVote(["-"+delegate2], voterAccount.password);
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
                    // console.log("Sent POST /transactions with data:" + JSON.stringify(transaction) + "! Got reply:" + JSON.stringify(res.body));
                    node.expect(res.body).to.have.property("success").to.be.true;
                    var transaction2 = node.asch.vote.createVote(["+"+delegate2], voterAccount.password);
                    node.peer.post("/transactions")
                        .set("Accept", "application/json")
                        .set("version", node.version)
                        .set("magic", node.config.magic)
                        .set("port", node.config.port)
                        .send({
                            transaction: transaction2
                        })
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            // console.log("Sent POST /transactions with data: " + JSON.stringify(transaction2) + "!. Got reply: " + res.body);
                            node.expect(res.body).to.have.property("success").to.be.false;
                            done();
                        });
                });
        });
    });

    // Not right test, because sometimes new block comes and we don't have time to vote
    it("Registering a new delegate. Should be ok", function (done) {
        node.api.post("/accounts/open")
            .set("Accept", "application/json")
            .set("version",node.version)
            .set("magic", node.config.magic)
            .set("port",node.config.port)
            .send({
                secret: account.password
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                if (res.body.success == true && res.body.account != null){
                    account.address = res.body.account.address;
                    account.publicKey = res.body.account.publicKey;
                } else {
                    // console.log("Open account failed or account object is null");
                    node.expect(true).to.equal(false);
                    done();
                }
                node.api.put("/transactions")
                    .set("Accept", "application/json")
                    .set("version",node.version)
                    .set("magic", node.config.magic)
                    .set("port",node.config.port)
                    .send({
                        secret: node.Gaccount.password,
                        amount: node.Fees.delegateRegistrationFee+node.Fees.voteFee,
                        recipientId: account.address
                    })
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        node.onNewBlock(function (err) {
                            node.expect(err).to.be.not.ok;
                            account.username = node.randomDelegateName().toLowerCase();
                            var transaction = node.asch.delegate.createDelegate(account.username, account.password);
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
                                    node.expect(res.body).to.have.property("success").to.be.true;
                                    done();
                                });
                        });
                    });
            });
    });

    it("Voting for a delegate. Should be ok", function (done) {
        var transaction = node.asch.vote.createVote(["+" + account.publicKey], account.password);
        node.onNewBlock(function (err) {
            node.expect(err).to.be.not.ok;
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
                    node.expect(res.body).to.have.property("success").to.be.true;
                    done();
                });
        });
    });
});
