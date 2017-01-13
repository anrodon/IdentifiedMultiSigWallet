# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_identified_multisig_wallet_with_daily_limit
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
        daily_limit = 1000
        wa_1 = 1
        wa_2 = 2
        wa_3 = 3
        id_1 = 123456789
        id_2 = 987654321
        id_3 = 192837465
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2], accounts[wa_3]],
            [id_1, id_2, id_3],
            required_accounts,
            daily_limit
        )
        gas = self.s.block.gas_used
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('IdentifiedMultiSigWalletWithDailyLimit.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters,
            contract_name="IdentifiedMultiSigWalletWithDailyLimit"
        )
        self.assertLess(self.s.block.gas_used - gas, 2000000)
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit)
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit)
        # Update daily limit
        daily_limit_updated = 2000
        update_daily_limit = multisig_abi.encode("changeDailyLimit", [daily_limit_updated])
        transaction_hash = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0,
                                                                  update_daily_limit, 0, sender=keys[wa_1])
        self.multisig_wallet.confirmTransaction(transaction_hash, sender=keys[wa_2])
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit_updated)
        # Withdraw daily limit
        value = 1000
        wa_1_balance = self.s.block.get_balance(accounts[wa_1])
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value)
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value*2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value*2)
        # Third time fails, because daily limit was reached
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value*2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value*2)
        # Let one day pass
        self.s.block.timestamp += self.TWENTY_FOUR_HOURS + 1
        # User wants to withdraw more than the daily limit. Withdraw is unsuccessful.
        value_2 = 3000
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value_2, "")
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_2, "", nonce, sender=keys[wa_2])
        # Wallet and user balance remain the same.
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value*2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value*2)
        # Daily withdraw is possible again
        nonce = self.multisig_wallet.getNonce(accounts[wa_1], value, "")
        self.multisig_wallet.submitTransaction(accounts[wa_1], value, "", nonce, sender=keys[wa_2])
        # Wallet balance decreases and user balance increases.
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value*3)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value*3)
