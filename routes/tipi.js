// routes/tipi.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// 🔽 GET: elenco tipo clienti
router.get('/tipo-clienti', (req, res) => {
  db.query('SELECT id, nome FROM tipo_cliente ORDER BY nome', (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore server' });
    res.json(results);
  });
});

// 🔽 GET: elenco tipo lavorazione
router.get('/tipo_lavorazione', (req, res) => {
  db.query('SELECT id, descrizione FROM tipo_lavorazione', (err, results) => {
    if (err) return res.status(500).send('Errore lettura tipo lavorazione');
    res.json(results);
  });
});

// 🔽 GET: elenco tipo linea
router.get('/tipo_linea', (req, res) => {
  db.query('SELECT id, descrizione FROM tipo_linea', (err, results) => {
    if (err) return res.status(500).send('Errore lettura tipo linea');
    res.json(results);
  });
});

module.exports = router;