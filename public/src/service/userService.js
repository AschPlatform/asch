angular.module('asch').service('userService', function () {
    this.setData = function (secret, publicKey, account, latestBlock) {
        this.secret = secret;
        this.address = account.address;
        this.publicKey = publicKey;
        this.balance = account.balance;
        this.secondPublicKey = account.secondPublicKey;
        this.lockHeight = account.lockHeight

        this.latestBlockHeight = latestBlock.height
    }
    this.update = function (account, latestBlock) {
        this.balance = account.balance;
        this.secondPublicKey = account.secondPublicKey;
        this.lockHeight = account.lockHeight

        this.latestBlockHeight = latestBlock.height
    }
    this.saveTab = function (tab) {
        this.tab = tab;
    };
    this.isStatus = function (tab) {
        this.issuerStatus = tab;
    };
    this.isName = function (name) {
        this.name = name;
    };
});
