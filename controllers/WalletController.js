const StellarSdk = require('stellar-sdk');
const Wallet = require('../models/Wallet');

const HORIZON_URL = process.env.HORIZON_URL;
const STELLAR_NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
// StellarSdk.Horizon.Network.use(new StellarSdk.Horizon.Network(STELLAR_NETWORK_PASSPHRASE));

exports.createWallet = async (req, res) => {
  const { userId } = req.user; // Retrieved from the JWT token

  try {
    const existingWallets = await Wallet.findByUserId(userId);
    if (existingWallets.length > 0) {
      return res.status(409).json({ error: 'User already has a wallet.' });
    }

    const pair = StellarSdk.Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
    await fetch(friendbotUrl);

    await Wallet.create(userId, publicKey, secretKey);

    console.log(`Wallet created and funded for user ${userId}: ${publicKey}`);

    res.status(201).json({
      message: 'Wallet created and funded successfully',
      publicKey: publicKey
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet.' });
  }
};

exports.getWalletBalance = async (req, res) => {
  const { publicKey } = req.params;

  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find((b) => b.asset_type === 'native');
    
    res.status(200).json({
      publicKey: account.accountId,
      balance: balance.balance
    });
  } catch (error) {
    console.error('Error loading account balance:', error);
    res.status(500).json({ error: 'Failed to retrieve account balance.' });
  }
};

exports.sendPayment = async (req, res) => {
  const { userId } = req.user;
  const { destinationPublicKey, amount } = req.body;

  if (!destinationPublicKey || !amount) {
    return res.status(400).json({ error: 'Missing destination and amount.' });
  }

  try {
    const userWallets = await Wallet.findByUserId(userId);
    if (userWallets.length === 0) {
      return res.status(404).json({ error: 'No wallet found for the current user.' });
    }

    const sourceWallet = userWallets[0]; // Assuming one wallet per user
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceWallet.secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);

    console.log(`Payment sent from user ${userId}. Hash: ${result.hash}`);
    
    res.status(200).json({
      message: 'Payment sent successfully.',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error('Error sending payment:', error);
    res.status(500).json({ error: 'Failed to send payment.' });
  }
};

exports.getTransactionHistory = async (req, res) => {
  const { userId } = req.user;

  try {
    const userWallets = await Wallet.findByUserId(userId);
    if (userWallets.length === 0) {
      return res.status(404).json({ error: 'No wallet found for the current user.' });
    }

    const sourcePublicKey = userWallets[0].publicKey;

    // Use Stellar SDK to query Horizon for payments
    const payments = await server.payments()
      .forAccount(sourcePublicKey)
      .order('desc') // Order by most recent first
      .limit(20)    // Limit to the 20 most recent transactions
      .call();
    
    // Process and format the payments data for a clean response
    const history = payments.records.map(record => ({
      id: record.id,
      type: record.type,
      from: record.from,
      to: record.to,
      assetType: record.asset_type,
      amount: record.amount,
      date: record.created_at
    }));

    res.status(200).json(history);

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history.' });
  }
};
