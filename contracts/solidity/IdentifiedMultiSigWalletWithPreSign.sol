pragma solidity ^0.4.4;
import "IdentifiedMultiSigWallet.sol";


/// @title Multisignature wallet with pre-sign functionality - Allows multiple parties to pre-sign transactions.
/// @author Andreu Rodríguez i Donaire - <andreu@atraura.com>
contract IdentifiedMultiSigWalletWithPreSign is IdentifiedMultiSigWallet {

    modifier signaturesFromOwners(bytes32 transactionHash, uint8[] v, bytes32[] rs) {
        for (uint i=0; i<v.length; i++)
            if (!isOwner[ecrecover(transactionHash, v[i], rs[i], rs[v.length + i])])
                throw;
        _;
    }

    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _ids List of the ids of initial owners.
    /// @param _required Number of required confirmations.
    function IdentifiedMultiSigWalletWithPreSign(address[] _owners, uint[] _ids, uint _required)
        public
        IdentifiedMultiSigWallet(_owners, _ids, _required)
    {
        // Nothing to do here
    }

    /// @dev Allows to submit a transaction with multiple owner signatures.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @param nonce Internal transaction nonce to identify transactions with identical arguments.
    /// @param v List of v parameters of owner signatures.
    /// @param rs List of r and s parameters of owner signatures.
    /// @return Returns hash identifying a transaction.
    function submitTransactionPreSigned(address destination, uint value, bytes data, uint nonce, uint8[] v, bytes32[] rs)
        public
        returns (bytes32 transactionHash)
    {
        transactionHash = addTransaction(destination, value, data, nonce);
        confirmTransactionPreSigned(transactionHash, v, rs);
    }

    /// @dev Allows to confirm a transaction with multiple owner signatures.
    /// @param transactionHash Hash identifying a transaction.
    /// @param v List of v parameters of owner signatures.
    /// @param rs List of r and s parameters of owner signatures.
    function confirmTransactionPreSigned(bytes32 transactionHash, uint8[] v, bytes32[] rs)
        public
        signaturesFromOwners(transactionHash, v, rs)
    {
        for (uint i=0; i<v.length; i++)
            addConfirmation(transactionHash, ecrecover(transactionHash, v[i], rs[i], rs[i + v.length]));
        executeTransaction(transactionHash);
    }

    /// @dev Allows to calculate the transaction hash for given transaction arguments.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @param nonce Internal transaction nonce to identify transactions with identical arguments.
    /// @return Returns hash identifying a transaction.
    function calcTransactionHash(address destination, uint value, bytes data, uint nonce)
        public
        constant
        returns (bytes32)
    {
        return keccak256(destination, value, data, nonce);
    }
}
