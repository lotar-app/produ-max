const crypto = require('crypto');
const { getSessionTtlMs } = require('../config/auth');

const sessions = new Map();

function create(sessionData) {
  if (!sessionData || !sessionData.role) {
    throw new Error('Sessione non valida: ruolo mancante');
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    data: {
      role: sessionData.role,
      userId: sessionData.userId || null,
      username: sessionData.username || null,
      displayName: sessionData.displayName || null
    },
    createdAt: Date.now()
  });
  return token;
}

function get(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  const ttl = getSessionTtlMs();
  if (Date.now() - session.createdAt > ttl) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function destroy(token) {
  if (!token) return;
  sessions.delete(token);
}

function purgeExpired() {
  const ttl = getSessionTtlMs();
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > ttl) {
      sessions.delete(token);
    }
  }
}

setInterval(purgeExpired, 30 * 60 * 1000).unref();

module.exports = {
  create,
  destroy,
  get
};
