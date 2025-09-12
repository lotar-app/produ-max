// routes/pagamento.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// 🔄 PUT: aggiornamento pagamento e consegna da pagam_edit.html
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { pagamento, consegna } = req.body;

  if (typeof pagamento === 'undefined') {
    return res.status(400).send('Valore pagamento mancante');
  }

  const valorePagamento = pagamento ? 1 : 0;

  // 🔄 Se è presente la consegna, calcola anche i giorni
  if (consegna) {
    const queryDati = 'SELECT ingresso, finito_admin FROM produzione WHERE id = ?';
    db.query(queryDati, [id], (err, results) => {
      if (err || results.length === 0) {
        console.error('❌ Errore lettura dati esistenti:', err);
        return res.status(500).send('Errore lettura dati per il calcolo giorni');
      }

      const { ingresso, finito_admin } = results[0];
      let giorni_consegna = null;
      let giorni_totale = null;

      if (finito_admin && consegna) {
        const inizioConsegna = new Date(finito_admin);
        const fineConsegna = new Date(consegna);
        inizioConsegna.setHours(0, 0, 0, 0);
        fineConsegna.setHours(0, 0, 0, 0);
        giorni_consegna = Math.floor((fineConsegna - inizioConsegna) / (1000 * 60 * 60 * 24));
      }

      if (ingresso && consegna) {
        const inizioTotale = new Date(ingresso);
        const fineTotale = new Date(consegna);
        inizioTotale.setHours(0, 0, 0, 0);
        fineTotale.setHours(0, 0, 0, 0);
        giorni_totale = Math.floor((fineTotale - inizioTotale) / (1000 * 60 * 60 * 24));
      }

      const updateQuery = `
        UPDATE produzione
        SET pagamento = ?, consegna = ?, giorni_consegna = ?, giorni_totale = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [valorePagamento, consegna, giorni_consegna, giorni_totale, id], (err2) => {
        if (err2) {
          console.error('❌ ERRORE salvataggio completo pagamento/consegna:', err2);
          return res.status(500).send('Errore aggiornamento dati');
        }
        res.send('✔️ Pagamento, consegna e giorni aggiornati');
      });
    });
  } else {
    // 🔁 Se non c'è consegna, aggiorna solo pagamento
    const query = 'UPDATE produzione SET pagamento = ? WHERE id = ?';
    db.query(query, [valorePagamento, id], (err) => {
      if (err) {
        console.error('❌ ERRORE pagamento:', err);
        return res.status(500).send('Errore aggiornamento pagamento');
      }
      res.send('✔️ Pagamento aggiornato');
    });
  }
});

module.exports = router;