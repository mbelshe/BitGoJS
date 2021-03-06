//
// Keychains Object
// BitGo accessor to a user's keychain.
//
// Copyright 2014, BitGo, Inc.  All Rights Reserved.
//

var BIP32 = require('./bitcoin/bip32');
var SecureRandom = require('./bitcoin/jsbn/rng');
var Util = require('./bitcoin/util');

//
// Constructor
//
var Keychains = function(bitgo) {
  this.bitgo = bitgo;
};

//
// isValid
// Tests a xpub or xprv string to see if it is a valid keychain.
//
Keychains.prototype.isValid = function(string) {
  try {
    var bip32 = new BIP32(string);
    return true;
  } catch (e) {
    return false;
  }
};

//
// create
// Create a new keychain locally.
// Does not send the keychain to bitgo, only creates locally.
// If |seed| is provided, used to seed the keychain.  Otherwise,
// a random keychain is created.
//
Keychains.prototype.create = function(seed) {
  if (!seed) {
    seed = new Array(256);
    new SecureRandom().nextBytes(seed);
  } else {
    if (!Array.isArray(seed)) {
      throw new Error('invalid argument');
    }
  }
  var extendedKey = new BIP32().initFromSeed(Util.bytesToHex(seed));
  return {
    xpub: extendedKey.extended_public_key_string(),
    xprv: extendedKey.extended_private_key_string()
  };
};

//
// list
// List the user's keychains
//
Keychains.prototype.list = function(callback) {
  if (typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  this.bitgo.get(this.bitgo.url('/keychain'))
  .end(function(err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res.body.keychains);
  });
};

//
// add
// Add a new keychain
//
Keychains.prototype.add = function(options, callback) {
  if (typeof(options) != 'object' || typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  this.bitgo.post(this.bitgo.url('/keychain'))
  .send({
    xpub: options.xpub,
    encryptedXprv: options.encryptedXprv
  })
  .end(function(err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res.body);
  });
};

//
// addBitGo
// Add a new BitGo server keychain
//
Keychains.prototype.createBitGo = function(options, callback) {
  if (typeof(options) != 'object' || typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  this.bitgo.post(this.bitgo.url('/keychain/bitgo'))
  .send({})
  .end(function(err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res.body);
  });
};

//
// get
// Fetch an existing keychain
// Options include:
//   xpub:  the xpub of the key to lookup (required)
//
Keychains.prototype.get = function(options, callback) {
  if (typeof(options) != 'object' || typeof(options.xpub) != 'string' ||
      typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  var self = this;
  this.bitgo.post(this.bitgo.url('/keychain/' + options.xpub))
  .send({})
  .end(function(err, res) {
    if (self.bitgo.handleBitGoAPIError(err, res, callback)) {
      return;
    }
    callback(null, res.body);
  });
};

//
// update
// Update an existing keychain
// Options include:
//   xpub:  the xpub of the key to lookup (required)
//
Keychains.prototype.update = function(options, callback) {
  if (typeof(options) != 'object' || typeof(options.xpub) != 'string' ||
      typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  var self = this;
  this.bitgo.put(this.bitgo.url('/keychain/' + options.xpub))
  .send({
    encryptedXprv: options.encryptedXprv,
  })
  .end(function(err, res) {
    if (self.bitgo.handleBitGoAPIError(err, res, callback)) {
      return;
    }
    callback(null, res.body);
  });
};


module.exports = Keychains;
