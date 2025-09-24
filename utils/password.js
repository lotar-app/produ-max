const bcrypt = require('bcryptjs');

const DEFAULT_ROUNDS = 10;

function hashPassword(plain, rounds = DEFAULT_ROUNDS) {
  if (typeof plain !== 'string' || !plain.trim()) {
    throw new Error('La password da generare non può essere vuota');
  }
  return bcrypt.hash(plain, rounds);
}

function comparePassword(plain, hashed) {
  if (!hashed) return false;
  return bcrypt.compare(plain, hashed);
}

module.exports = {
  hashPassword,
  comparePassword
};
