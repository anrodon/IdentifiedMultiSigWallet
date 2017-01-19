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
              callback();
            }
         });
      });
    });
  },
  function(callback) {
    describe('Sending Money:', function() {
      it('Money should be sent succesfully to the wallet', function() {
        web3.eth.sendTransaction({
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          value: web3.toWei(1),
          gas: '3000000'
        });
        expect(parseInt(web3.eth.getBalance(identifiedMultiSigWallet.address).toString())).to.equal(parseInt(web3.toWei(1)));
        callback();
      });
    });
  },
  function(callback) {
    describe('Sending Transactions with requirement changes:', function() {
      it(accounts[wa_4] + ' should be added successfully as an owner with id ' + id_4 + ' after changing requirement', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
          expect(parseInt(identifiedMultiSigWallet.getTransactionHashes(0, identifiedMultiSigWallet.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[0].toString())).to.not.equal(0);
          transactionData = identifiedMultiSigWallet.changeRequirement.getData(1);
          nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
          identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
            from: accounts[wa_1],
            to: identifiedMultiSigWallet.address,
            gas: '3000000'
          }, function(e, txHash) {
            let hash = identifiedMultiSigWallet.transactionHashes(1);
            identifiedMultiSigWallet.confirmTransaction(hash,{
              from: accounts[wa_2],
              to: identifiedMultiSigWallet.address,
              gas: '3000000'
            }, function(e, txHash) {
              hash = identifiedMultiSigWallet.transactionHashes(0);
              identifiedMultiSigWallet.executeTransaction(hash,{
                from: accounts[wa_2],
                to: identifiedMultiSigWallet.address,
                gas: '3000000'
              }, function(e, txHash) {
                expect(parseInt(identifiedMultiSigWallet.required().toString())).to.equal(1);
                expect(identifiedMultiSigWallet.transactions(identifiedMultiSigWallet.transactionHashes(0))[4]).to.equal(true);
                expect(identifiedMultiSigWallet.isOwner(accounts[wa_4])).to.equal(true);
                expect(identifiedMultiSigWallet.ownerWithId(id_4)).to.equal(accounts[wa_4]);
                expect(identifiedMultiSigWallet.owners(3)).to.equal(accounts[wa_4]);
                expect(parseInt(identifiedMultiSigWallet.ids(3).toString())).to.equal(id_4);
                done();
              });
            });
          });
        });
      });
    });
  }
]);
