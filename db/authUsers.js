const db = require('./connection');

function findByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username, password_hash, role, display_name, active FROM auth_users WHERE username = ? LIMIT 1';
    db.query(sql, [username], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function touchLastLogin(id) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE auth_users SET last_login_at = NOW() WHERE id = ?';
    db.query(sql, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  findByUsername,
  touchLastLogin
};
