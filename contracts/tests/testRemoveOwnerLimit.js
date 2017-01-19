var async = require('async');
var chaiAsPromised = require('chai-as-promised');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
chai.use(chaiAsPromised);
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var wa_1 = 1;
var id_1 = 123456789;
var required_accounts = 1;
var accounts = web3.eth.accounts;

var identifiedMultiSigWallet;
var excludePending = false;
var includePending = true;
var excludeExecuted = false;
var includeExecuted = true;
async.series([
  function(callback) {
    describe('Deploy identifiedMultiSigWallet.', function() {
      it('Contract address should not be undefined', function(done) {
        var identifiedMultiSigWalletABI = require('../abi/identifiedMultiSigWalletABI.js')
        var identifiedMultiSigWalletBytecode = require('../bytecode/identifiedMultiSigWalletBytecode.js');
        var _owners = [accounts[wa_1]];
        var _ids = [id_1];
        var _required = required_accounts;
        var identifiedMultiSigWalletContract = web3.eth.contract(identifiedMultiSigWalletABI);
        identifiedMultiSigWallet = identifiedMultiSigWalletContract.new(
         _owners,
         _ids,
         _required,
         {
           from: accounts[wa_1],
           data: identifiedMultiSigWalletBytecode,
           gas: '4700000'
         },
         function (e, contract){
            if (typeof contract.address !== 'undefined') {
              done();
              callback();
            }
         });
      });
    });
  },
  function(callback) {
    describe('Test owner remove limit', function() {
      it('Remove only owner transaction should remain in pending state.', function(done) {
        let nonce = identifiedMultiSigWallet.getNonce(accounts[wa_1]);
        let transactionData = identifiedMultiSigWallet.removeOwner.getData(accounts[wa_1]);
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          value: 0,
          gas: '3000000'
        }, function(e, txHash) {
          expect(parseInt(identifiedMultiSigWallet.getTransactionHashes(0, identifiedMultiSigWallet.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[0].toString())).to.not.equal(0);
          done();
          callback();
        });
      });
    });
  }
]);
