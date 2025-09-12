const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/connection');

// Importa i router modulari
const clientiRouter = require('./clienti');
const tipiRouter = require('./tipi');
const produzioneRouter = require('./produzione');
const pagamentoRouter = require('./pagamento');

// Associa i moduli alle relative rotte
router.use('/clienti', clientiRouter);
router.use('/', tipiRouter);
router.use('/produzione', produzioneRouter);
router.use('/produzione/pagamento', pagamentoRouter);

// 🔴 Archiviazione nome cliente
router.put('/clienti/:id/archivia', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE clienti SET nome = NULL WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Errore archiviazione nome cliente:', err);
      return res.status(500).json({ error: 'Errore archiviazione' });
    }
    console.log(`📥 Nome cliente con ID ${id} archiviato`);
    res.json({ success: true });
  });
});

// ✅ Importazione test
const testImport = require('./test-import-v2');
router.get('/test-import-v2', testImport);

// ✅ Gestione manutenzione (solo overlay/app, non proxy)
const fileManutenzione = path.join(__dirname, '../.app_maintenance');

router.get('/manutenzione', (req, res) => {
  const attiva = fs.existsSync(fileManutenzione);
  res.json({ attiva });
});

router.post('/toggle-manutenzione', (req, res) => {
  try {
    if (fs.existsSync(fileManutenzione)) {
      fs.unlinkSync(fileManutenzione);
      console.log('🔧 Modalità manutenzione DISATTIVATA');
      return res.json({ attiva: false });
    } else {
      fs.writeFileSync(fileManutenzione, 'ON');
      console.log('🔧 Modalità manutenzione ATTIVATA');
      return res.json({ attiva: true });
    }
  } catch (err) {
    console.error('❌ Errore toggle manutenzione:', err.message);
    res.status(500).json({ error: 'Errore interno' });
  }
});

module.exports = router;
