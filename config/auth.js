const COOKIE_NAME = 'produ_max_auth';

function isAuthEnabled() {
  return process.env.AUTH_ENABLED === 'true';
}

function getAllowedRoles() {
  const envValue = process.env.AUTH_ALLOWED_ROLES;
  if (!envValue) {
    return ['superadmin', 'admin', 'sala', 'amministrazione', 'gestore'];
  }
  return envValue
    .split(',')
    .map(role => role.trim())
    .filter(Boolean);
}

function getSessionTtlMs() {
  const minutes = parseInt(process.env.AUTH_SESSION_TTL_MINUTES, 10);
  if (Number.isFinite(minutes) && minutes > 0) {
    return minutes * 60 * 1000;
  }
  return 8 * 60 * 60 * 1000; // default 8 hours
}

function getCookieOptions({ isSecureOverride } = {}) {
  const secureFromEnv = process.env.COOKIE_SECURE === 'true';
  const secure = typeof isSecureOverride === 'boolean' ? isSecureOverride : secureFromEnv;
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: getSessionTtlMs()
  };
}

module.exports = {
  COOKIE_NAME,
  getAllowedRoles,
  getCookieOptions,
  getSessionTtlMs,
  isAuthEnabled
};
