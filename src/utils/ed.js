var sodium = require('sodium').api;

module.exports = {
  MakeKeypair: function (hash) {
    var keypair = sodium.crypto_sign_seed_keypair(hash);
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.secretKey
    };
  },

  Sign: function (hash, keypair) {
    return sodium.crypto_sign_detached(hash, Buffer.from(keypair.privateKey, 'hex'));
  },

  Verify: function (hash, signatureBuffer, publicKeyBuffer) {
    return sodium.crypto_sign_verify_detached(signatureBuffer, hash, publicKeyBuffer);
  }
}