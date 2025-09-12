// scripts/updateGiorniTrascorsi.js
const db = require('../db/connection');

function aggiornaGiorniTrascorsi() {
  const query = `
    UPDATE produzione
    SET giorni_lavorazione = DATEDIFF(CURDATE(), ingresso)
    WHERE ingresso IS NOT NULL AND consegna IS NULL
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('❌ Errore aggiornamento giorni:', err);
    } else {
      console.log(`✅ Giorni aggiornati su ${result.affectedRows} righe`);
    }
  });
}

module.exports = aggiornaGiorniTrascorsi;