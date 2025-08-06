const { pool } = require('../db');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(username, passwordHash) {
    const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, passwordHash]);
    return result.insertId;
  }
}

module.exports = User;
