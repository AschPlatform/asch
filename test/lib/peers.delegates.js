"use strict";

var node = require("./../variables.js"),
    crypto = require("crypto");

var account = node.randomAccount();
var account2 = node.randomAccount();

describe("POST /peer/transactions", function () {

    describe("Registering a delegate", function () {

        it("Using invalid username. Should fail", function (done) {
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
                            amount: node.Fees.delegateRegistrationFee,
                            recipientId: account.address
                        })
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            node.onNewBlock(function (err) {
                                node.expect(err).to.be.not.ok;
                                var transaction = node.asch.delegate.createDelegate(crypto.randomBytes(64).toString("hex"), account.password);
                                transaction.fee = node.Fees.delegateRegistrationFee;

                                node.peer.post("/transactions")
                                    .set("Accept", "application/json")
                                    .set("version",node.version)
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
                        });
                });
        });

        it("When account has no funds. Should fail", function (done) {
            var transaction = node.asch.delegate.createDelegate(node.randomDelegateName().toLowerCase(), node.randomPassword());
            transaction.fee = node.Fees.delegateRegistrationFee;

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

        it("When account has funds. Username is uppercase, Lowercase username already registered. Should fail", function (done) {
            var transaction = node.asch.delegate.createDelegate(account.username.toUpperCase(), account2.password);

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
                    node.expect(res.body).to.have.property("success").to.be.false;
                    done();
                });
        });

        it("When account has funds. Username is lowercase. Should be ok", function (done) {
            account.username = node.randomDelegateName().toLowerCase();
            var transaction = node.asch.delegate.createDelegate(account.username, account.password);

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
                    node.expect(res.body).to.have.property("success").to.be.true;
                    done();
                });
        });

        it("Twice within the same block. Should fail", function (done) {
            node.api.post("/accounts/open")
                .set("Accept", "application/json")
                .set("version", node.version)
                .set("magic", node.config.magic)
                .set("port", node.config.port)
                .send({
                    secret: account2.password
                })
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    account2.address = res.body.account.address;
                    // console.log(account2);
                    node.api.put("/transactions")
                        .set("Accept", "application/json")
                        .set("version", node.version)
                        .set("magic", node.config.magic)
                        .set("port", node.config.port)
                        .send({
                            secret: node.Gaccount.password,
                            amount: node.Fees.delegateRegistrationFee,
                            recipientId: account2.address
                        })
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            // console.log(res.body);
                            node.onNewBlock(function (err) {
                                node.expect(err).to.be.not.ok;
                                account2.username = node.randomDelegateName().toLowerCase();
                                var transaction = node.asch.delegate.createDelegate(account2.username, account2.password);
                                // console.log(transaction);

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
                                        // console.log(res.body);
                                        node.expect(res.body).to.have.property("success").to.be.true;

                                        account2.username = node.randomDelegateName().toLowerCase();
                                        var transaction2 = node.asch.delegate.createDelegate(account2.username, account2.password);

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
                                                // console.log(JSON.stringify(res.body));
                                                node.expect(res.body).to.have.property("success").to.be.false;
                                                done();
                                            });
                                    });
                            });
                        });
                    });
                });

    });
});
