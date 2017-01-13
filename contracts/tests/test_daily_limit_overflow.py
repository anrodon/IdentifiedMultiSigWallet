# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_daily_limit_overflow
    """

    HOMESTEAD_BLOCK = 1150000
    TWENTY_FOUR_HOURS = 86400  # 24h

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()

    def test(self):
        # Create wallet
        required_accounts = 2
        daily_limit = 2000
        wa_1 = 1
        wa_2 = 2
        id_1 = 123456789
        id_2 = 987654321
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2]],
            [id_1, id_2],
            required_accounts,
            daily_limit
        )
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('IdentifiedMultiSigWalletWithDailyLimit.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters,
            contract_name="IdentifiedMultiSigWalletWithDailyLimit"
        )
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit)
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit)
        # Withdraw daily limit
        value = 2000
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        tx_1 = self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        # Transaction succeeds
        self.assertTrue(self.multisig_wallet.transactions(tx_1)[4])
        # Try to overflow spentToday to reset it to 0.
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], 2**256 - value, "")
        tx_2 = self.multisig_wallet.submitTransaction(accounts[wa_1], 2**256 - value, "", nonce, sender=keys[wa_2])
        # Transaction cannot complete and spentToday is still == 2000.
        self.assertFalse(self.multisig_wallet.transactions(tx_2)[4])
        self.assertEqual(self.multisig_wallet.spentToday(), daily_limit)
        # User tries to withdraw daily limit again on same day. It fails as daily limit was withdrawn already.
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        tx_3 = self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        self.assertFalse(self.multisig_wallet.transactions(tx_3)[4])
