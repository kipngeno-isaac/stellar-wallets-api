const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkDbConnectionAndMigrate() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  }
}

module.exports = {
  pool,
  checkDbConnectionAndMigrate,
};
