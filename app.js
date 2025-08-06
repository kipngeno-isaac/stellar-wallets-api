const express = require("express");
const bodyParser = require("body-parser");
const StellarSdk = require("stellar-sdk");
require("dotenv").config();
const { pool, checkDbConnectionAndMigrate } = require("./db");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "TESTNET"; // or 'PUBLIC'
const STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015";

// Initialize Stellar server
// const server = new StellarSdk.Server(
//   STELLAR_NETWORK === 'TESTNET'
//     ? 'https://horizon-testnet.stellar.org'
//     : 'https://horizon.stellar.org'
// );
const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

// app.post('/api/wallet/create', (req, res) => {
//   try {
//     const pair = StellarSdk.Keypair.random();

//     const wallet = {
//       publicKey: pair.publicKey(),
//       secret: pair.secret(),
//       status: 'new'
//     };

//     res.json(wallet);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// In a real application, this would be a database or a secure storage
// for user accounts. For this example, we'll use a simple in-memory object.
let userWallets = {};

/**
 * Endpoint to create a new user wallet.
 * This abstracts the key generation and initial funding.
 */
app.post("/api/wallet/create", async (req, res) => {
  try {
    // 1. Generate a new keypair for the user
    const pair = StellarSdk.Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    // 2. Fund the new account on the Testnet using Friendbot
    // In a production environment, you would fund this from a funded "main" account
    const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(
      publicKey
    )}`;
    await fetch(friendbotUrl);

    // 3. Store the wallet keys securely (in a real app, this would be encrypted and in a database)
    const [result] = await pool.query(
      "INSERT INTO wallets (publicKey, secretKey) VALUES (?, ?)",
      [publicKey, secretKey]
    );
    // We are storing both for this example, but in a real-world scenario, you only
    // need the public key for identification and the secret key should be highly secured.
    userWallets[publicKey] = {
      secretKey,
    };

    console.log(
      `Wallet created and funded for: ${publicKey}, DB ID: ${result.insertId}`
    );

    // 4. Return the public key to the user's frontend. The secret key is never sent to the client.
    res.status(201).json({
      message: "Wallet created and funded successfully",
      publicKey: publicKey,
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});

/**
 * Endpoint to check the balance of a user's wallet.
 */
app.get("/api/wallet/:publicKey/balance", async (req, res) => {
  const { publicKey } = req.params;

  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find((b) => b.asset_type === "native");

    res.status(200).json({
      publicKey: account.accountId,
      balance: balance.balance,
    });
  } catch (error) {
    console.error("Error loading account balance:", error);
    res.status(500).json({ error: "Failed to retrieve account balance." });
  }
});

/**
 * Endpoint to send a payment from one wallet to another.
 * This is where the core abstraction happens. The user just provides
 * the destination and amount; the server handles the secret key.
 */
app.post('/api/transaction/send-payment', async (req, res) => {
  const { sourcePublicKey, destinationPublicKey, amount } = req.body;
  
  if (!sourcePublicKey || !destinationPublicKey || !amount) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT secretKey FROM wallets WHERE publicKey = ?',
      [sourcePublicKey]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Source wallet not found.' });
    }
    
    const senderSecretKey = rows[0].secretKey;
    const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    
    const transaction = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE,   networkPassphrase: STELLAR_NETWORK_PASSPHRASE })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    console.log(`Payment sent from ${sourcePublicKey} to ${destinationPublicKey}. Hash: ${result.hash}`);
    
    res.status(200).json({
      message: 'Payment sent successfully.',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error('Error sending payment:', error);
    res.status(500).json({ error: 'Failed to send payment.' });
  }
});

function createWallet(){
  try {
     // 1. Generate a new keypair for the user
    const pair = StellarSdk.Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();
    const wallet = {publicKey, secretKey}
    return wallet
  } catch (error) {
        console.error('Error creating wallet:', error);
  }
}

async function fundWallet(walletPublicKey){
 try{
// 2. Fund the new account on the Testnet using Friendbot
    // In a production environment, you would fund this from a funded "main" account
    const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(
      publicKey
    )}`;
    await fetch(friendbotUrl);

 } catch (error) {
        console.error('Failed to fund wallet:', error);
  }
}

// console.log("wallet",createWallet())

checkDbConnectionAndMigrate().then(() => {
  app.listen(PORT, () => {
    console.log(`Stellar API listening at http://localhost:${PORT}`);
  });
});
