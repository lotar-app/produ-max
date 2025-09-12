const db = require('../db/connection');

// Restituisce il primo progressivo disponibile per l’anno indicato
function getProgressivoAnno(finitoAdminDate, callback) {
  const date = new Date(finitoAdminDate);
  const anno = date.getFullYear();

  const query = `
    SELECT n_progressivo
    FROM produzione
    WHERE n_progressivo IS NOT NULL AND YEAR(finito_admin) = ?
    ORDER BY n_progressivo ASC
  `;

  db.query(query, [anno], (err, results) => {
    if (err) return callback(err);
    const usati = results.map(r => r.n_progressivo);
    let prossimo = 1;
    for (let i = 0; i < usati.length; i++) {
      if (usati[i] !== prossimo) break;
      prossimo++;
    }
    callback(null, prossimo);
  });
}

module.exports = {
  getProgressivoAnno
};