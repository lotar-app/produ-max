#!/usr/bin/env node
const readline = require('readline');
const { hashPassword } = require('../utils/password');
require('dotenv').config();

const mysql = require('mysql2/promise');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !value) continue;
    if (!key.startsWith('--')) continue;
    result[key.replace('--', '')] = value;
  }
  return result;
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

(async () => {
  try {
    const args = parseArgs();

    const username = args.username || await prompt('Username: ');
    const password = args.password || await prompt('Password: ');
    const role = args.role || await prompt('Ruolo (superadmin/admin/sala/amministrazione/gestore): ');
    const displayName = args.displayName || '';

    if (!username || !password || !role) {
      console.error('Username, password e ruolo sono obbligatori.');
      process.exit(1);
    }

    const allowedRoles = ['superadmin', 'admin', 'sala', 'amministrazione', 'gestore'];
    if (!allowedRoles.includes(role)) {
      console.error(`Ruolo non valido. Valori ammessi: ${allowedRoles.join(', ')}`);
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const sql = `INSERT INTO auth_users (username, password_hash, role, display_name)
                 VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), display_name = VALUES(display_name), active = 1`;

    await connection.execute(sql, [username, passwordHash, role, displayName || null]);
    await connection.end();

    console.log(`Utente "${username}" salvato con ruolo "${role}".`);
    console.log('Password memorizzata in formato hash (bcrypt).');
    console.log('Ricorda di riavviare il processo se cambi le variabili di ambiente.');
  } catch (err) {
    console.error('Errore creazione utente:', err);
    process.exit(1);
  }
})();
