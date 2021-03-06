//
// Tests for Wallets
//
// Copyright 2014, BitGo, Inc.  All Rights Reserved.
//

var assert = require('assert');
var should = require('should');

var BitGoJS = require('../src/index');
var TestBitGo = require('./lib/test_bitgo');

describe('Wallets', function() {
  var bitgo;
  var wallets;
  var testWallet;      // Test will create this wallet
  var keychains = [];  // Test will create these keychains

  before(function(done) {
    bitgo = new TestBitGo();
    wallets = bitgo.wallets();
    bitgo.authenticateTestUser(bitgo.testUserOTP(), function(err, response) {
      if (err) {
        throw err;
      }
      done();
    });
  });

  describe('List', function() {
    it('arguments', function() {
      assert.throws(function() { wallets.list(); });
      assert.throws(function() { wallets.list('invalid'); });
    });

    it('all', function(done) {
      wallets.list(function(err, wallets) {
        assert.equal(err, null);
        assert.equal(typeof(wallets), 'object');
        done();
      });
    });
  });

  describe('Add', function() {
    before(function() {
      keychains.push(bitgo.keychains().create());
      keychains.push(bitgo.keychains().create());
    });

    it('arguments', function() {
      assert.throws(function() { wallets.add(); });
      assert.throws(function() { wallets.add('invalid'); });
      assert.throws(function() { wallets.add({}, 0); });
    });

    it('wallet', function(done) {
      var options = {
        xpub: keychains[0].xpub,
        encryptedXprv: keychains[0].xprv
      };
      bitgo.keychains().add(options, function(err, keychain) {
        assert.equal(err, null);
        assert.equal(keychain.xpub, keychains[0].xpub);
        assert.equal(keychain.encryptedXprv, keychains[0].xprv);

        var options = {
          xpub: keychains[1].xpub
        };
        bitgo.keychains().add(options, function(err, keychain) {
          assert.equal(err, null);
          assert.equal(keychain.xpub, keychains[1].xpub);

          bitgo.keychains().createBitGo({}, function(err, keychain) {
            assert(keychain.xpub);
            keychains.push(keychain);

            var options = {
              label: 'my wallet',
              m: 2,
              n: 3,
              keychains: keychains.map(function(k) { return {xpub: k.xpub}; })
            };
            wallets.add(options, function(err, wallet) {
              assert.equal(err, null);
              testWallet = wallet;

              assert.equal(wallet.balance(), 0);
              assert.equal(wallet.label(), 'my wallet');
              assert.equal(wallet.pendingBalance(), 0);
              assert.equal(wallet.availableBalance(), 0);
              assert.equal(wallet.keychains.length, 3);
              assert.equal(bitgo.keychains().isValid(wallet.keychains[0].xpub), true);
              assert.equal(bitgo.keychains().isValid(wallet.keychains[1].xpub), true);
              assert.equal(bitgo.keychains().isValid(wallet.keychains[2].xpub), true);
              assert.equal(wallet.keychains[0].xpub, keychains[0].xpub);
              assert.equal(wallet.keychains[1].xpub, keychains[1].xpub);
              done();
            });
          });
        });
      });
    });
  });

  describe('Get', function() {
    it('arguments', function() {
      assert.throws(function() { wallets.get(); });
      assert.throws(function() { wallets.get('invalid'); });
      assert.throws(function() { wallets.get({}, function() {}); });
    });

    it('non existent wallet', function(done) {
      var newKey = wallets.createKey();
      var options = {
        address: newKey.address.toString(),
      };
      wallets.get(options, function(err, wallet) {
        assert(!wallet);
        done();
      });
    });

    it('get', function(done) {
      var options = {
        address: testWallet.address()
      };
      wallets.get(options, function(err, wallet) {
        assert.equal(err, null);
        assert.equal(wallet.address(), options.address);
        assert.equal(wallet.balance(), 0);
        assert.equal(wallet.label(), 'my wallet');
        assert.equal(wallet.pendingBalance(), 0);
        assert.equal(wallet.availableBalance(), 0);
        assert.equal(wallet.keychains.length, 3);
        assert.equal(bitgo.keychains().isValid(wallet.keychains[0]), true);
        assert.equal(bitgo.keychains().isValid(wallet.keychains[1]), true);
        assert.equal(bitgo.keychains().isValid(wallet.keychains[2]), true);
        done();
      });
    });

  });

  describe('Delete', function() {
    it('arguments', function(done) {
      assert.throws(function() { testWallet.delete('invalid'); });
      done();
    });

    it('delete', function(done) {
      testWallet.delete(function(err, status) {
        assert.equal(err, null);
        done();
      });
    });
  });
});
