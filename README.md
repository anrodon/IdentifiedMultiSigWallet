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
### Run tests:
```
cd /contracts/
mocha tests --recursive --watch
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
