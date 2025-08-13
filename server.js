const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { checkDbConnectionAndMigrate } = require('./db');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

checkDbConnectionAndMigrate().then(() => {
  app.listen(port, () => {
    console.log(`Stellar API listening at http://localhost:${port}`);
  });
});
