// routes/clienti.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// 🔍 GET: elenco clienti con filtro (autocomplete)
router.get('/', (req, res) => {
  const q = req.query.q || '';
  const query = `
    SELECT id, nome FROM clienti
    WHERE LOWER(nome) LIKE ?
    ORDER BY nome LIMIT 10
  `;
  const filtro = `%${q.toLowerCase()}%`;

  db.query(query, [filtro], (err, results) => {
    if (err) {
      console.error('❌ ERRORE SUGGERIMENTI CLIENTI:', err);
      return res.status(500).send('Errore ricerca clienti');
    }
    res.json(results);
  });
});

// Archivia cliente (setta nome a NULL)
router.put('/:id/archivia', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('UPDATE clienti SET nome = NULL WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Errore durante archiviazione cliente:', err);
    res.sendStatus(500);
  }
});
module.exports = router;