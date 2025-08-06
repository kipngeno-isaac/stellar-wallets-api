const express = require('express');
const router = express.Router();
const walletController = require('../controllers/WalletController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, walletController.createWallet);
router.post('/send-payment', authMiddleware, walletController.sendPayment);
router.get('/:publicKey/balance', authMiddleware, walletController.getWalletBalance);

module.exports = router;
