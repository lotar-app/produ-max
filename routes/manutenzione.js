const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// === Middleware di controllo superadmin ===
function soloSuperadmin(req, res, next) {
  const ruolo = req.query.ruolo || req.auth?.user?.role;
  if (ruolo !== 'superadmin') {
    return res.status(403).send('Accesso negato');
  }
  next();
}

// === Mostra stato attuale
router.get('/', soloSuperadmin, (req, res) => {
  const filePath = path.join(__dirname, '../json/manutenzione.json');
  const stato = JSON.parse(fs.readFileSync(filePath));
  res.render('manutenzione_toggle', { stato });
});

// === Attiva/disattiva manutenzione
router.post('/toggle', soloSuperadmin, (req, res) => {
  const filePath = path.join(__dirname, '../json/manutenzione.json');
  const stato = JSON.parse(fs.readFileSync(filePath));
  stato.attiva = !stato.attiva;
  fs.writeFileSync(filePath, JSON.stringify(stato, null, 2));
  res.redirect(`/manutenzione?ruolo=superadmin`);
});

module.exports = router;
