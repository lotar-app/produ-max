const express = require('express');
const router = express.Router();
const { COOKIE_NAME, getAllowedRoles, getCookieOptions, isAuthEnabled } = require('../config/auth');
const sessionStore = require('../utils/sessionStore');
const { comparePassword } = require('../utils/password');
const authUsers = require('../db/authUsers');

function normalize(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

router.post('/login', async (req, res) => {
  if (!isAuthEnabled()) {
    return res.status(503).json({ error: 'Autenticazione non attiva' });
  }

  const username = normalize(req.body?.username);
  const password = normalize(req.body?.password);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono obbligatori' });
  }

  try {
    const user = await authUsers.findByUsername(username);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const allowedRoles = getAllowedRoles();
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Ruolo non autorizzato' });
    }

    const passwordOk = await comparePassword(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    await authUsers.touchLastLogin(user.id);

    const token = sessionStore.create({
      role: user.role,
      userId: user.id,
      username: user.username,
      displayName: user.display_name || null
    });
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.json({
      success: true,
      role: user.role,
      username: user.username,
      displayName: user.display_name || user.username
    });
  } catch (err) {
    console.error('Errore login utente:', err);
    return res.status(500).json({ error: 'Errore interno autenticazione' });
  }
});

router.post('/logout', (req, res) => {
  if (!isAuthEnabled()) {
    return res.status(200).json({ success: true });
  }

  const token = req.auth?.token;
  if (token) {
    sessionStore.destroy(token);
  }

  res.clearCookie(COOKIE_NAME, getCookieOptions({ isSecureOverride: false }));
  return res.json({ success: true });
});

router.get('/status', (req, res) => {
  const enabled = isAuthEnabled();
  const role = req.auth?.user?.role || null;
  const username = req.auth?.user?.username || null;
  const displayName = req.auth?.user?.displayName || null;
  res.json({
    authEnabled: enabled,
    authenticated: Boolean(role),
    role,
    username,
    displayName
  });
});

router.get('/roles', (req, res) => {
  res.json({
    authEnabled: isAuthEnabled(),
    roles: getAllowedRoles()
  });
});

module.exports = router;
