IdentifiedMultisignature Wallet
===================

Allows multiple identified parties to agree on transactions before execution. Allows to add and remove owners and update the number of required confirmations.

Install
-------------
```
git clone https://github.com/anrodon/IdentifiedMultiSigWallet.git
cd IdentifiedMultiSigWallet
vagrant up
```

Test
-------------
### Run single test:
```
cd /vagrant/contracts/
python -m unittest tests.test_identified_multisig_wallet
```
### Run all tests:
```
cd /vagrant/contracts/
python -m unittest discover tests
```

Deploy
-------------
**Remember to change owner addresses in the respective JSON file before deployment!**
### Deploy identified multisig wallet:
```
cd /vagrant/contracts/
python deploy.py -f deploy/IdentifiedMultiSig.json
```
### Deploy multisig wallet with daily limit:
```
cd /vagrant/contracts/
python deploy.py -f deploy/MultiSigWithDailyLimit.json
```
### Deploy multisig wallet with pre-signed transactions:
```
cd /vagrant/contracts/
python deploy.py -f deploy/MultiSigWithPreSign.json
```

Limitations
-------------
This implementation does not allow the creation of smart contracts via multisignature transactions.
Transactions to address 0 cannot be done. Any other transaction can be done.

Security
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

Acknowledgment of authorship
-------------
Some code in this repository was written by [ConsenSys](https://github.com/ConsenSys). This repository is a fork of the [ConsenSys MultiSignature Wallet](https://github.com/ConsenSys/MultiSigWallet).

License
-------------
[GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt)
