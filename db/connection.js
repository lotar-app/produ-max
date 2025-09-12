const mysql = require('mysql2');

const {
  DB_HOST = '127.0.0.1',
  DB_USER = 'lotar',
  DB_PASSWORD = 'SuperPassword123',
  DB_NAME = 'lotar_produzione_dev',
  DB_CONNECTION_LIMIT = '10'
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

console.log(`🔌 DEV DB → host: ${DB_HOST}, db: ${DB_NAME}, user: ${DB_USER}`);

module.exports = pool;
