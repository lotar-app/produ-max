const mysql = require('mysql2'); // ⬅️ non usare /promise

const pool = mysql.createPool({
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; // ⬅️ NIENTE .promise()