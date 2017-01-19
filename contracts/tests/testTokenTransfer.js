var async = require('async');
var chaiAsPromised = require('chai-as-promised');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
chai.use(chaiAsPromised);
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var wa_1 = 1;
var wa_2 = 2;
var wa_3 = 3;
var wa_4 = 4;
var id_1 = 123456789;
var id_2 = 987654321;
var id_3 = 192837465;
var id_4 = 918273645;
var required_accounts = 2;
var accounts = web3.eth.accounts;

var identifiedMultiSigWallet;
var testToken;
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
        var _owners = [accounts[wa_1], accounts[wa_2], accounts[wa_3]];
        var _ids = [id_1, id_2, id_3];
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
            }
         });
      });
    });
    describe('Deploy TestToken.', function() {
      it('Contract address should not be undefined', function(done) {
        var testTokenABI = require('../abi/testTokenABI.js')
        var testTokenBytecode = require('../bytecode/testTokenBytecode.js');
        var testTokenContract = web3.eth.contract(testTokenABI);
        testToken = testTokenContract.new(
         {
           from: accounts[wa_1],
           data: testTokenBytecode,
           gas: '4700000'
         },
         function (e, contract){
            if (typeof contract.address !== 'undefined') {
              done();
            }
         });
      });
    });
    describe('Sending test tokens:', function() {
      it('Should be able to issue some tokens and send them to the multisig account', function(done) {
        testToken.issueTokens(identifiedMultiSigWallet.address, 1000,
         {
           from: accounts[wa_1],
           gas: '4700000'
         },
         function (e, contract){
            expect(parseInt(testToken.balanceOf(identifiedMultiSigWallet.address).toString())).to.equal(1000);
            done();
         });
      });
      it(accounts[wa_3] + ' should receive 100 test tokens', function() {
        let transactionData = testToken.transfer.getData(accounts[wa_3], 100);
        let nonce = identifiedMultiSigWallet.getNonce(testToken.address, 0, transactionData);
        identifiedMultiSigWallet.submitTransaction(testToken.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          value: 0,
          gas: '3000000'
        }, function(e, txHash) {
          expect(parseInt(testToken.balanceOf(accounts[wa_3]).toString())).to.equal(100);
          expect(parseInt(testToken.balanceOf(identifiedMultiSigWallet.address).toString())).to.equal(900);
          done();
          callback();
        });
      });
    });
  }
]);
