const { COOKIE_NAME, getCookieOptions, isAuthEnabled } = require('../config/auth');
const sessionStore = require('../utils/sessionStore');

function parseCookies(header) {
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const [rawKey, rawValue] = part.split('=');
    if (!rawKey || typeof rawValue === 'undefined') return acc;
    const key = rawKey.trim();
    const value = rawValue.trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function attachAuth(req, res, next) {
  req.auth = {
    enabled: isAuthEnabled(),
    user: null
  };

  if (!req.auth.enabled) {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return next();
  }

  const session = sessionStore.get(token);

  if (!session) {
    sessionStore.destroy(token);
    res.clearCookie(COOKIE_NAME, getCookieOptions({ isSecureOverride: false }));
    return next();
  }

  req.auth.user = {
    role: session.data.role,
    userId: session.data.userId,
    username: session.data.username,
    displayName: session.data.displayName
  };
  req.auth.token = token;
  next();
}

function requireAuth(req, res, next) {
  if (!isAuthEnabled()) {
    return next();
  }

  if (req.auth && req.auth.user) {
    return next();
  }

  return res.status(401).json({ error: 'Autenticazione richiesta' });
}

module.exports = {
  attachAuth,
  requireAuth
};
