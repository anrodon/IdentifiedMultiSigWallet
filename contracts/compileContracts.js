var solc = require('solc');
var fs = require('fs');
var async = require('async');

var compileContract = function(code, callback) {
  let input = code;
  let output = solc.compile(input, 1); // 1 activates the optimiser
  for (let contractName in output.contracts) {
      // code and ABI that are needed by web3
      fs.writeFile("abi/" + contractName + "ABI.js", "module.exports = " + output.contracts[contractName].interface, function(err) {
          if(err) {
              return console.log(err);
          }
          console.log(contractName + ' ABI created!');
      });
      fs.writeFile("bytecode/" + contractName + "Bytecode.js", "module.exports = '" + output.contracts[contractName].bytecode + "'", function(err) {
          if(err) {
              return console.log(err);
          }
          console.log(contractName + ' Bytecode created!');
      });
  }
  callback();
};

var identifiedMultiSigWalletCode;
async.series([
  function(callback) {
    fs.readFile('solidity/IdentifiedMultiSigWallet.sol', 'utf8', function(err, data) {
      if(err) {
          return console.log(err);
      }
      identifiedMultiSigWalletCode = data;
      callback();
    });
  },
  function(callback) {
    fs.readFile('solidity/IdentifiedMultiSigWalletWithDailyLimit.sol', 'utf8', function(err, data) {
      if(err) {
          return console.log(err);
      }
      compileContract({ sources: { 'IdentifiedMultiSigWallet.sol': identifiedMultiSigWalletCode,
                        contractName: data }}, callback);
    });
  },
  function(callback) {
    fs.readFile('solidity/IdentifiedMultiSigWalletWithPreSign.sol', 'utf8', function(err, data) {
      if(err) {
          return console.log(err);
      }
      compileContract({ sources: { 'IdentifiedMultiSigWallet.sol': identifiedMultiSigWalletCode,
                        contractName: data }}, callback);
    });
  },
  function(callback) {
    fs.readFile('solidity/TestToken.sol', 'utf8', function(err, data) {
      if(err) {
          return console.log(err);
      }
      compileContract(data, callback);
    });
  }],
  function(err) {
      if (err) return next(err);
  }
);
