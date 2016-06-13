var crypto = require("crypto");
var assert = require("assert");
var ed25519 = require("../");
var data = {
  seed: "af9881fe34edfd3463cf3e14e22ad95a0608967e084d3ca1fc57be023040de59",
  privateKey:"af9881fe34edfd3463cf3e14e22ad95a0608967e084d3ca1fc57be023040de590c32c468980d40237f4e44a66dec3beb564b3e1394a4c6df1da2065e3afc1d81",
  publicKey: "0c32c468980d40237f4e44a66dec3beb564b3e1394a4c6df1da2065e3afc1d81",
  message: "test",
  signature: "98c8351675ade54b3aedc14f0b9c40b47569d9da191db066312ed6423d20dff8a52988f869fc3fbf4402971034b387ac7fbcfa704eb4c1e86e48e15de5e3d206",
  invalidSignature: "88c8351675ade54b3aedc14f0b9c40b47569d9da191db066312ed6423d20dff8a52988f869fc3fbf4402971034b387ac7fbcfa704eb4c1e86e48e15de5e3d205"
};

describe("ed25519", function() {
  describe("#MakeKeypair()", function () {
    it("returns a public and private key", function () {
      var seed = new Buffer(data.seed, "hex")
      var keyPair = ed25519.MakeKeypair(seed);

      assert.equal(
        keyPair.publicKey.toString("hex"),
        data.publicKey
      );

      assert.equal(
        keyPair.privateKey.toString("hex"),
        data.privateKey
      );
    });
  });

  describe("#Sign()", function () {
    it("Generates a valid signature using a seed", function(){
      var seed = new Buffer(data.seed, "hex")
      var message = new Buffer(data.message);
      var signature = ed25519.Sign(message, seed);

      assert.equal(signature.toString("hex"), data.signature)
    });

    it("Generates a valid signature using a keyPair", function(){
      var privateKey = new Buffer(data.privateKey, "hex")
      var publicKey = new Buffer(data.publicKey, "hex")
      var message = new Buffer(data.message);
      var signature = ed25519.Sign(
        message,
        {
          privateKey: privateKey,
          publicKey: publicKey
        }
      );

      assert.equal(signature.toString("hex"), data.signature)
    });
  });

  describe("#Verify", function() {
    it("returns true if the signature is valid", function(){
      var publicKey = new Buffer(data.publicKey, "hex")
      var signature = new Buffer(data.signature, "hex")
      var message = new Buffer(data.message);

      assert.ok(ed25519.Verify(message, signature, publicKey));
    });

    it("returns false if the signature is not valid", function(){
      var publicKey = new Buffer(data.publicKey, "hex")
      var signature = new Buffer(data.invalidSignature, "hex")
      var message = new Buffer(data.message);

      assert.ifError(ed25519.Verify(message, signature, publicKey));
    });
  })
});
