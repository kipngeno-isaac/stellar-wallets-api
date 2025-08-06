const { pool } = require('../db');

class Wallet {
  static async create(userId, publicKey, secretKey) {
    const [result] = await pool.query(
      'INSERT INTO wallets (userId, publicKey, secretKey) VALUES (?, ?, ?)',
      [userId, publicKey, secretKey]
    );
    return result.insertId;
  }

  static async findByPublicKey(publicKey) {
    const [rows] = await pool.query('SELECT * FROM wallets WHERE publicKey = ?', [publicKey]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM wallets WHERE userId = ?', [userId]);
    return rows;
  }
}

module.exports = Wallet;
