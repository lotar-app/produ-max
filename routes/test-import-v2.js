const db = require('../db/connection'); // Assicurati che punti a `lotar_produzione_dev`

const inserisciTest = (req, res) => {
  // Dati della riga di test
  const data = {
    tipo_cliente: 'Privato',
    tipo_lavorazione: 'Persiane',
    tipo_linea: 'ECO',
    pezzi: 4,
    ral1: '6005',
    ral2: '0',
    metriquadri: 4,
    gita: 'c',
    ingresso: '06/12/2024',
    smontaggio: '13/12/2024',
    falegnameria: '16/12/2024',
    finito_admin: '09/01/2025',
    consegna: '14/01/2025',
    ore_falegn_extra: 2,
    ore_falegn_rinforzo: 0,
    ore_smontaggio: 1,
    ore_produzione: 8.75,
    n_progressivo: 1,
    ufo: null,
    loc: null,
    vernice: '0' // Arriva così da Google Sheets: "0" = da ordinare
  };

  // Conversione data da gg/mm/aaaa a aaaa-mm-gg
  const convertiData = (str) => {
    if (!str) return null;
    const [gg, mm, aaaa] = str.split('/');
    return `${aaaa}-${mm}-${gg}`;
  };

  // Funzione per recuperare ID da una tabella
  const getId = (tabella, colonna, valore, callback) => {
    db.query(`SELECT id FROM ${tabella} WHERE ${colonna} = ?`, [valore], (err, results) => {
      if (err || results.length === 0) return callback(err || new Error('Valore non trovato'));
      callback(null, results[0].id);
    });
  };

  getId('tipo_cliente', 'nome', data.tipo_cliente, (err1, tipo_cliente_id) => {
    if (err1) return res.status(500).send('Errore tipo_cliente');

    getId('tipo_lavorazione', 'descrizione', data.tipo_lavorazione, (err2, tipo_lavorazione_id) => {
      if (err2) return res.status(500).send('Errore tipo_lavorazione');

      getId('tipo_linea', 'descrizione', data.tipo_linea, (err3, tipo_linea_id) => {
        if (err3) return res.status(500).send('Errore tipo_linea');

        // Inserisci cliente con nome = NULL
        db.query('INSERT INTO clienti (nome) VALUES (NULL)', (err4, resultCliente) => {
          if (err4) return res.status(500).send('Errore inserimento cliente');
          const cliente_id = resultCliente.insertId;

          // Conversioni date
          const ingresso = convertiData(data.ingresso);
          const finito_admin = convertiData(data.finito_admin);
          const consegna = convertiData(data.consegna);

          // Calcoli
          const giorniTotale = ingresso && consegna
            ? Math.round((new Date(consegna) - new Date(ingresso)) / (1000 * 60 * 60 * 24))
            : null;

          const giorniConsegna = finito_admin && consegna
            ? Math.round((new Date(consegna) - new Date(finito_admin)) / (1000 * 60 * 60 * 24))
            : null;

          const giorniLavorazione = ingresso && finito_admin
            ? Math.round((new Date(finito_admin) - new Date(ingresso)) / (1000 * 60 * 60 * 24))
            : null;

          const oreFalegnameria = (data.ore_falegn_extra || 0) + (data.ore_falegn_rinforzo || 0);

          // ✅ Spostato qui
          const ordine_vernice = (data.vernice === '0' || data.vernice === 0) ? 1 : 0;

          // Query finale
          const query = `INSERT INTO produzione (
            cliente_id, tipo_cliente_id, tipo_lavorazione_id, tipo_linea_id,
            pezzi, ral1, ral2, metriquadri, ordine_vernice, gita,
            ingresso, smontaggio, falegnameria, finito_admin, consegna,
            ore_falegn_extra, ore_falegn_rinforzo, ore_falegnameria, ore_smontaggio,
            ore_produzione, n_progressivo, ufo, loc, finito_sala,
            giorni_totale, giorni_lavorazione, giorni_consegna
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const values = [
            cliente_id,
            tipo_cliente_id,
            tipo_lavorazione_id,
            tipo_linea_id,
            data.pezzi,
            data.ral1,
            data.ral2,
            data.metriquadri,
            ordine_vernice,
            data.gita,
            ingresso,
            convertiData(data.smontaggio),
            convertiData(data.falegnameria),
            finito_admin,
            consegna,
            data.ore_falegn_extra,
            data.ore_falegn_rinforzo,
            oreFalegnameria,
            data.ore_smontaggio,
            data.ore_produzione,
            data.n_progressivo,
            data.ufo,
            data.loc,
            1, // finito_sala
            giorniTotale,
            giorniLavorazione,
            giorniConsegna
          ];

          // Log diagnostico
          console.log('🧾 QUERY COMPLETA:\n' + query);
          console.log('📦 VALORI:\n', values);
          console.log('🔢 Numero valori:', values.length);         

          // Esecuzione query
          db.query(query, values, (err5, resultFinale) => {
            if (err5) {
              console.error('❌ Errore inserimento produzione:', err5.sqlMessage || err5.message);
              return res.status(500).send('❌ Errore inserimento produzione: ' + (err5.sqlMessage || err5.message));
            }
            res.send(`✅ Inserimento completato. ID produzione: ${resultFinale.insertId}`);
          });
        });
      });
    });
  });
};

module.exports = inserisciTest;