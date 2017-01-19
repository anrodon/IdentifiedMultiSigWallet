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

var excludePending = false;
var includePending = true;
var excludeExecuted = false;
var includeExecuted = true;
async.series([
  function(callback) {
    describe('Deploy IdentifiedMultiSigWalletWithDailyLimit.', function() {
      it('Contract address should not be undefined', function(done) {
        var identifiedMultiSigWalletWithDailyLimitABI = require('../abi/IdentifiedMultiSigWalletWithDailyLimitABI.js')
        var identifiedMultiSigWalletWithDailyLimitBytecode = require('../bytecode/IdentifiedMultiSigWalletWithDailyLimitBytecode.js');
        var _owners = [accounts[wa_1], accounts[wa_2], accounts[wa_3]];
        var _ids = [id_1, id_2, id_3];
        var _required = required_accounts;
        var _dailyLimit = web3.toWei(10);
        var identifiedMultiSigWalletWithDailyLimitContract = web3.eth.contract(identifiedMultiSigWalletWithDailyLimitABI);
        identifiedMultiSigWalletWithDailyLimit = identifiedMultiSigWalletWithDailyLimitContract.new(
         _owners,
         _ids,
         _required,
         _dailyLimit,
         {
           from: accounts[wa_1],
           data: identifiedMultiSigWalletWithDailyLimitBytecode,
           gas: '4700000'
         },
         function (e, contract){
            if (typeof contract.address !== 'undefined') {
              expect(parseInt(identifiedMultiSigWalletWithDailyLimit.dailyLimit().toString())).to.equal(parseInt(web3.toWei(10).toString()));
              done();
              callback();
            }
         });
      });
    });
  },
  function(callback) {
    describe('Changing daily limit:', function () {
      it('Daily limit should be changed', function(done) {
        let nonce = identifiedMultiSigWalletWithDailyLimit.getNonce(web3.toWei(5));
        let transactionData = identifiedMultiSigWalletWithDailyLimit.changeDailyLimit.getData(web3.toWei(5));
        identifiedMultiSigWalletWithDailyLimit.submitTransaction(identifiedMultiSigWalletWithDailyLimit.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWalletWithDailyLimit.address,
          value: 0,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWalletWithDailyLimit.getTransactionHashes(0, identifiedMultiSigWalletWithDailyLimit.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[0];
          identifiedMultiSigWalletWithDailyLimit.confirmTransaction(hash,{
            from: accounts[wa_2],
            to: identifiedMultiSigWalletWithDailyLimit.address,
            gas: '3000000'
          }, function(e, res) {
            expect(parseInt(identifiedMultiSigWalletWithDailyLimit.dailyLimit().toString())).to.equal(parseInt(web3.toWei(5).toString()));
            done();
            callback();
          });
        });
      });
    });
  }, function(callback) {
    describe('Sending Money with daily limit:', function() {
      it('Money should be sent succesfully to the wallet', function(done) {
        web3.eth.sendTransaction({
          from: accounts[wa_1],
          to: identifiedMultiSigWalletWithDailyLimit.address,
          value: web3.toWei(10),
          gas: '3000000'
        });
        expect(parseInt(web3.eth.getBalance(identifiedMultiSigWalletWithDailyLimit.address).toString())).to.equal(parseInt(web3.toWei(10).toString()));
        done();
      });
      it('Money should be sent succesfully from the wallet', function(done) {
        let nonce = identifiedMultiSigWalletWithDailyLimit.getNonce(accounts[0], web3.toWei(5), "");
        identifiedMultiSigWalletWithDailyLimit.submitTransaction(accounts[0], web3.toWei(5), "", nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWalletWithDailyLimit.address,
          value: 0,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWalletWithDailyLimit.getTransactionHashes(0, identifiedMultiSigWalletWithDailyLimit.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[0];
          identifiedMultiSigWalletWithDailyLimit.confirmTransaction(hash,{
            from: accounts[wa_2],
            to: identifiedMultiSigWalletWithDailyLimit.address,
            gas: '3000000'
          }, function(e, res) {
            expect(parseInt(web3.eth.getBalance(identifiedMultiSigWalletWithDailyLimit.address).toString())).to.equal(parseInt(web3.toWei(5).toString()));
            done();
          });
        });
      });
      it('Money should not be sent succesfully from the wallet when the daily limit is reached', function() {
        let nonce = identifiedMultiSigWalletWithDailyLimit.getNonce(accounts[0], web3.toWei(5), "");
        identifiedMultiSigWalletWithDailyLimit.submitTransaction(accounts[0], web3.toWei(5), "", nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWalletWithDailyLimit.address,
          value: 0,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWalletWithDailyLimit.getTransactionHashes(0, identifiedMultiSigWalletWithDailyLimit.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[0];
          identifiedMultiSigWalletWithDailyLimit.confirmTransaction(hash,{
            from: accounts[wa_2],
            to: identifiedMultiSigWalletWithDailyLimit.address,
            gas: '3000000'
          }, function(e, res) {
            expect(parseInt(web3.eth.getBalance(identifiedMultiSigWalletWithDailyLimit.address).toString())).to.equal(5);
            callback();
          });
        });
      });
    });
  },
]);
