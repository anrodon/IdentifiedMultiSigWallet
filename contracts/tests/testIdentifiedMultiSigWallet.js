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
async.series([
  function(callback) {
    describe('Check identifiedMultiSigWallet not deploys with incorrect parameters.', function() {
      it('Contract should throw an error when two owners have the same address.', function(done) {
        var identifiedMultiSigWalletABI = require('../abi/identifiedMultiSigWalletABI.js')
        var identifiedMultiSigWalletBytecode = require('../bytecode/identifiedMultiSigWalletBytecode.js');
        var _owners = [accounts[wa_1], accounts[wa_1]];
        var _ids = [id_1, id_2];
        var _required = required_accounts;
        var identifiedMultiSigWalletContract = web3.eth.contract(identifiedMultiSigWalletABI);
        async.series([
          function(callback) {
            expect(function() {
              identifiedMultiSigWalletContract.new(
               _owners,
               _ids,
               _required,
               {
                 from: accounts[wa_1],
                 data: identifiedMultiSigWalletBytecode,
                 gas: '4700000'
               });
             }).to.throw(Error);
             callback();
          },
          function(cb) {
             done();
             cb();
          }
        ]);
      });
      it('Contract should throw an error when two owners have the same id.', function(done) {
        var identifiedMultiSigWalletABI = require('../abi/identifiedMultiSigWalletABI.js')
        var identifiedMultiSigWalletBytecode = require('../bytecode/identifiedMultiSigWalletBytecode.js');
        var _owners = [accounts[wa_1], accounts[wa_2]];
        var _ids = [id_1, id_1];
        var _required = required_accounts;
        var identifiedMultiSigWalletContract = web3.eth.contract(identifiedMultiSigWalletABI);
        async.series([
          function(callback) {
            expect(function() {
              identifiedMultiSigWalletContract.new(
               _owners,
               _ids,
               _required,
               {
                 from: accounts[wa_1],
                 data: identifiedMultiSigWalletBytecode,
                 gas: '4700000'
               });
             }).to.throw(Error);
             callback();
          },
          function(cb) {
             done();
             cb();
          }
        ]);
      });
      it('Contract should throw an error when less owners than required accounts are provided.', function(done) {
        var identifiedMultiSigWalletABI = require('../abi/identifiedMultiSigWalletABI.js')
        var identifiedMultiSigWalletBytecode = require('../bytecode/identifiedMultiSigWalletBytecode.js');
        var _owners = [accounts[wa_1], accounts[wa_2]];
        var _ids = [id_1, id_1];
        var _required = 10;
        var identifiedMultiSigWalletContract = web3.eth.contract(identifiedMultiSigWalletABI);
        async.series([
          function(cb) {
            expect(function() {
              identifiedMultiSigWalletContract.new(
               _owners,
               _ids,
               _required,
               {
                 from: accounts[wa_1],
                 data: identifiedMultiSigWalletBytecode,
                 gas: '4700000'
               });
             }).to.throw(Error);
             cb();
          },
          function(cb) {
             done();
             cb();
             callback();
          }
        ]);
      });
    });
  },
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
    describe('Initial configuration:', function() {
      it(accounts[wa_1] + ' should be an owner', function() {
        expect(identifiedMultiSigWallet.isOwner(accounts[wa_1])).to.equal(true);
      });
      it('Id' + id_1 + 'should have account equal to ' + accounts[wa_1], function() {
        expect(identifiedMultiSigWallet.ownerWithId(id_1)).to.equal(accounts[wa_1]);
      });
      it('owners(0) should be equal to ' + accounts[wa_1], function() {
        expect(identifiedMultiSigWallet.owners(0)).to.equal(accounts[wa_1]);
      });
      it('ids(0) should be equal to ' + id_1, function() {
        expect(parseInt(identifiedMultiSigWallet.ids(0).toString())).to.equal(id_1);
      });
      it(accounts[wa_2] + ' should be an owner', function() {
        expect(identifiedMultiSigWallet.isOwner(accounts[wa_2])).to.equal(true);
      });
      it('Id' + id_2 + 'should have account equal to ' + accounts[wa_2], function() {
        expect(identifiedMultiSigWallet.ownerWithId(id_2)).to.equal(accounts[wa_2]);
      });
      it('owners(1) should be equal to ' + accounts[wa_2], function() {
        expect(identifiedMultiSigWallet.owners(1)).to.equal(accounts[wa_2]);
      });
      it('ids(1) should be equal to ' + id_2, function() {
        expect(parseInt(identifiedMultiSigWallet.ids(1).toString())).to.equal(id_2);
      });
      it(accounts[wa_3] + ' should be an owner', function() {
        expect(identifiedMultiSigWallet.isOwner(accounts[wa_3])).to.equal(true);
      });
      it('Id' + id_3 + 'should have account equal to ' + accounts[wa_3], function() {
        expect(identifiedMultiSigWallet.ownerWithId(id_3)).to.equal(accounts[wa_3]);
      });
      it('owners(2) should be equal to ' + accounts[wa_3], function() {
        expect(identifiedMultiSigWallet.owners(2)).to.equal(accounts[wa_3]);
      });
      it('ids(2) should be equal to ' + id_3, function() {
        expect(parseInt(identifiedMultiSigWallet.ids(2).toString())).to.equal(id_3);
      });
      it('getOwners() should be equal to ' + [accounts[wa_1], accounts[wa_2], accounts[wa_3]], function() {
        expect(identifiedMultiSigWallet.getOwners()[0]).to.equal(accounts[wa_1]);
        expect(identifiedMultiSigWallet.getOwners()[1]).to.equal(accounts[wa_2]);
        expect(identifiedMultiSigWallet.getOwners()[2]).to.equal(accounts[wa_3]);
      });
      it('Required accounts should be equal to ' + required_accounts, function() {
        expect(parseInt(identifiedMultiSigWallet.required().toString())).to.equal(required_accounts);
      });
    });
    describe('Sending Transactions:', function() {
      it('A third party should not be able to submit transactions', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData);
        expect(function() {
          identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, parsenonce, {
          from: accounts[0],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
          });
        }).to.throw(Error);
        done();
      });
      it('A third party should not be able to confirm transactions', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWallet.transactionHashes(0);
          expect(function() {
            identifiedMultiSigWallet.confirmTransaction(hash,{
              from: accounts[0],
              to: identifiedMultiSigWallet.address,
              gas: '3000000'
            });
          }).to.throw(Error);
          done();
        });
      });
      it('A third party should not be able to revoke confirmations', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWallet.transactionHashes(0);
          expect(function() {
            identifiedMultiSigWallet.revokeConfirmation(hash,{
              from: accounts[0],
              to: identifiedMultiSigWallet.address,
              gas: '3000000'
            });
          }).to.throw(Error);
          done();
        });
      });
      it('An owner should be able to reconfirm a transaction.', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
            let hash = identifiedMultiSigWallet.transactionHashes(0);
            identifiedMultiSigWallet.revokeConfirmation(hash, {
              from: accounts[wa_1],
              to: identifiedMultiSigWallet.address,
              gas: '3000000'
            }, function(error, txHash) {
              identifiedMultiSigWallet.confirmTransaction(hash, {
                from: accounts[wa_1],
                to: identifiedMultiSigWallet.address,
                gas: '3000000'
              }, function(e, txHash) {
                expect(identifiedMultiSigWallet.getConfirmations(hash)[0]).to.equal(accounts[wa_1]);
                done();
              });
            });
          }
        );
      });
      it('Address 0 should not be able to receive transactions', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        expect(function() {
          identifiedMultiSigWallet.submitTransaction(0, 0, transactionData, nonce, {
            from: accounts[wa_1],
            to: identifiedMultiSigWallet.address,
            gas: '3000000'
          });
        }).to.throw(Error);
        done();
      });
      it('Submit with wrong nonce should fail', function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        expect(function() {
          identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet, 0, transactionData, nonce + 1, {
            from: accounts[wa_1],
            to: identifiedMultiSigWallet.address,
            gas: '3000000'
          });
        }).to.throw(Error);
        done();
      });
      it(accounts[wa_4] + ' should be added successfully as an owner with id ' + id_4, function(done) {
        let transactionData = identifiedMultiSigWallet.addOwner.getData(accounts[wa_4], id_4);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWallet.transactionHashes(0);
          identifiedMultiSigWallet.confirmTransaction(hash,{
            from: accounts[wa_2],
            to: identifiedMultiSigWallet.address,
            gas: '3000000'
          }, function(e, txHash) {
            expect(identifiedMultiSigWallet.transactions(identifiedMultiSigWallet.transactionHashes(0))[4]).to.equal(true);
            expect(identifiedMultiSigWallet.isOwner(accounts[wa_4])).to.equal(true);
            expect(identifiedMultiSigWallet.ownerWithId(id_4)).to.equal(accounts[wa_4]);
            expect(identifiedMultiSigWallet.owners(3)).to.equal(accounts[wa_4]);
            expect(parseInt(identifiedMultiSigWallet.ids(3).toString())).to.equal(id_4);
            done();
          });
        });
      });
      var excludePending = false;
      var includePending = true;
      var excludeExecuted = false;
      var includeExecuted = true;
      it('Slicing should be successfully done', function(done) {
        expect(identifiedMultiSigWallet.getTransactionHashes(0, 1, includePending, includeExecuted)[0]).to.equal(identifiedMultiSigWallet.transactionHashes(0));
        expect(identifiedMultiSigWallet.getTransactionHashes(0, 2, includePending, includeExecuted)[0]).to.equal(identifiedMultiSigWallet.transactionHashes(0), identifiedMultiSigWallet.transactionHashes(1));
        expect(identifiedMultiSigWallet.getTransactionHashes(1, 2, includePending, includeExecuted)[0]).to.equal(identifiedMultiSigWallet.transactionHashes(1));
        done();
      });
      it('Change requirement should be successfully done', function(done) {
        let transactionData = identifiedMultiSigWallet.changeRequirement.getData(3);
        let nonce = parseInt(identifiedMultiSigWallet.getNonce(identifiedMultiSigWallet.address, 0, transactionData).toString());
        identifiedMultiSigWallet.submitTransaction(identifiedMultiSigWallet.address, 0, transactionData, nonce, {
          from: accounts[wa_1],
          to: identifiedMultiSigWallet.address,
          gas: '3000000'
        }, function(e, txHash) {
          let hash = identifiedMultiSigWallet.getTransactionHashes(0, identifiedMultiSigWallet.getTransactionCount(includePending, includeExecuted), includePending, excludeExecuted)[3];
          identifiedMultiSigWallet.confirmTransaction(hash,{
            from: accounts[wa_2],
            to: identifiedMultiSigWallet.address,
            gas: '3000000'
          }, function(e, res) {
            expect(parseInt(identifiedMultiSigWallet.required().toString())).to.equal(3);
            done();
          });
        });
      });
    });
  }
]);
