const express = require('express');
const router = express.Router();
const db = require('../db/connection');

console.log('✅ visteSpeciali.js caricato');

// /api/produzione/pagati
router.get('/pagati', (req, res) => {
  console.log('📥 GET ricevuto su /api/viste/pagati');
  
  const query = `
    SELECT 
      p.*, 
      DATEDIFF(CURDATE(), p.ingresso) AS giorni_trascorsi,
      cli.nome AS nome_lavoro, 
      tc.nome AS tipo_cliente, 
      tl.descrizione AS tipo_lavorazione, 
      tln.descrizione AS tipo_linea
    FROM produzione p
    LEFT JOIN clienti cli ON p.cliente_id = cli.id
    LEFT JOIN tipo_cliente tc ON p.tipo_cliente_id = tc.id
    LEFT JOIN tipo_lavorazione tl ON p.tipo_lavorazione_id = tl.id
    LEFT JOIN tipo_linea tln ON p.tipo_linea_id = tln.id
    WHERE p.pagamento = 1 
      AND cli.nome IS NOT NULL 
      AND TRIM(cli.nome) <> ''
    ORDER BY p.id DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Errore nella query pagati:', err.sqlMessage);
      return res.status(500).json({ error: 'Errore server', dettaglio: err.sqlMessage });
    }

    console.log('🔎 Primo record pagati:', results[0]);
    res.json(results);
  });
});

// altre viste future:
// router.get('/produzione/consegnati', ...)
module.exports = router;    