// routes/produzione.js
const express = require('express');
const router = express.Router();

console.log('🚨 File routes/produzione.js CARICATO');  // 👈 QUESTA È LA RIGA DI TEST

const db = require('../db/connection');
const { getProgressivoAnno } = require('./progressivo');

function isEmpty(val) {
  return val === undefined || val === null || val === '' || val === false;
}

// 🔽 GET: tutte le lavorazioni per vista.html
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.id, p.cliente_id, c.nome AS nome_lavoro, tc.nome AS tipo_cliente,
      tl.descrizione AS tipo_lavorazione, tli.descrizione AS tipo_linea,
      p.note, p.verde, p.nero, p.fucsia, p.rosso, p.azzurro,
      p.pagamento, p.pezzi, p.ral1, p.ral2, p.metriquadri,
      p.ordine_vernice, p.gita, p.ingresso, p.smontaggio, p.falegnameria,
      p.finito_sala, p.finito_admin, p.consegna,
      p.ore_smontaggio, p.ore_falegn_extra, p.ore_falegn_rinforzo,
      p.ore_falegnameria, p.ore_produzione, p.ore_magazz, p.ore_totale,
      p.giorni_lavorazione, p.giorni_consegna, p.giorni_totale,
      IF(p.consegna IS NULL, DATEDIFF(CURDATE(), p.ingresso), NULL) AS giorni_trascorsi,
      p.n_progressivo,
      p.urgente, p.viaggio, p.ufo, p.loc, p.bolt,
      p.trasparente, p.a_corpo, p.f_magazzino, p.standby,
      p.tipo_lavorazione_id, p.tipo_linea_id
    FROM produzione p
    LEFT JOIN clienti c ON p.cliente_id = c.id
    LEFT JOIN tipo_cliente tc ON p.tipo_cliente_id = tc.id
    LEFT JOIN tipo_lavorazione tl ON p.tipo_lavorazione_id = tl.id
    LEFT JOIN tipo_linea tli ON p.tipo_linea_id = tli.id
    ORDER BY p.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ ERRORE QUERY PRODUZIONE:', err);
      return res.status(500).send('Errore lettura dati');
    }
    res.json(results);
  });
});

// GET lista tipo_cliente
router.get('/tipo_cliente', (req, res) => {
  db.query('SELECT id, nome FROM tipo_cliente ORDER BY nome', (err, results) => {
    if (err) return res.status(500).send('Errore lettura tipo_cliente');
    res.json(results);
  });
});

// GET lista tipo_lavorazione
router.get('/tipo_lavorazione', (req, res) => {
  db.query('SELECT id, descrizione FROM tipo_lavorazione ORDER BY descrizione', (err, results) => {
    if (err) return res.status(500).send('Errore lettura tipo_lavorazione');
    res.json(results);
  });
});

// GET lista tipo_linea
router.get('/tipo_linea', (req, res) => {
  db.query('SELECT id, descrizione FROM tipo_linea ORDER BY descrizione', (err, results) => {
    if (err) return res.status(500).send('Errore lettura tipo_linea');
    res.json(results);
  });
});

// 🔽 GET: singola lavorazione per ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT 
      p.*, c.nome AS nome_lavoro,
      tc.nome AS tipo_cliente,
      tl.descrizione AS tipo_lavorazione,
      tli.descrizione AS tipo_linea
    FROM produzione p
    LEFT JOIN clienti c ON p.cliente_id = c.id
    LEFT JOIN tipo_cliente tc ON p.tipo_cliente_id = tc.id
    LEFT JOIN tipo_lavorazione tl ON p.tipo_lavorazione_id = tl.id
    LEFT JOIN tipo_linea tli ON p.tipo_linea_id = tli.id
    WHERE p.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send('Errore lettura lavorazione');
    if (!results.length) return res.status(404).json({ errore: 'Lavorazione non trovata' });
    res.json(results[0]);
  });
});

// 🔽 POST: inserimento nuova lavorazione da form.html
router.post('/', (req, res) => {
//throw new Error('🔥 ERRORE DI TEST - BLOCCO POST');

console.log('📩 Richiesta POST /api/produzione ricevuta');
try {
  console.log('📦 Dati ricevuti dal form:\n', JSON.stringify(req.body, null, 2));
  console.log('🔎 standby ricevuto è:', req.body.standby);
} catch (err) {
  console.error('❌ Errore nel leggere req.body:', err);
}

  const {
    nome, tipo_cliente_id, tipo_lavorazione_id, tipo_linea_id,
    pezzi, ral1, ral2, metriquadri, ordine_vernice, gita, ingresso,
    urgente, viaggio, ufo, loc, bolt,
    a_corpo, trasparente, f_magazzino, standby
  } = req.body;

  const cercaCliente = 'SELECT id FROM clienti WHERE nome = ? LIMIT 1';

  console.log('🔍 Cerco cliente con nome:', nome);

  db.query(cercaCliente, [nome], (err, results) => {
    if (err) {
      console.error('❌ Errore durante la ricerca cliente:', err);
      return res.status(500).send('Errore ricerca cliente');
    }

    if (results.length > 0) {
      console.log('✅ Cliente trovato con ID:', results[0].id);
      inserisci(results[0].id);
    } else {
      console.log('🆕 Cliente non trovato, inserisco nuovo:', nome || 'null');
      db.query('INSERT INTO clienti (nome) VALUES (?)', [nome || null], (err2, insertResult) => {
        if (err2) {
          console.error('❌ Errore durante l’inserimento del cliente:', err2);
          return res.status(500).send('Errore inserimento cliente');
        }
        console.log('✅ Cliente inserito con ID:', insertResult.insertId);
        inserisci(insertResult.insertId);
      });
    }
  });

  function isEmpty(val) {
    return val === undefined || val === null || val === '';
  }

  function inserisci(clienteId) {

      if (isEmpty(tipo_linea_id)) {
  console.error('❌ tipo_linea_id mancante, impossibile procedere');
  return res.status(400).send('tipo_linea_id mancante');
}

    const isSverniciatura = parseInt(tipo_linea_id) === 4;
    const oggi = new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO produzione (
        cliente_id, tipo_cliente_id, tipo_lavorazione_id, tipo_linea_id,
        pezzi, ral1, ral2, metriquadri, ordine_vernice, gita, ingresso,
        ore_smontaggio, ore_falegnameria, falegnameria,
        urgente, viaggio, ufo, loc, bolt, rosso,
        a_corpo, trasparente, f_magazzino, standby
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valori = [
      clienteId,
      parseInt(tipo_cliente_id),
      parseInt(tipo_lavorazione_id),
      parseInt(tipo_linea_id),
      parseInt(pezzi),
      isSverniciatura ? null : ral1,
      isSverniciatura ? null : ral2,
      parseFloat(metriquadri) || null,
      isSverniciatura ? 0 : (ordine_vernice ? 1 : 0),
      gita,
      ingresso,
      isSverniciatura ? 0.5 : null,
      isSverniciatura ? 0 : null,
      isSverniciatura ? oggi : null,
      isEmpty(urgente) ? null : urgente,
      isEmpty(viaggio) ? null : viaggio,
      isEmpty(ufo) ? null : parseInt(ufo),
      isEmpty(loc) ? null : parseInt(loc),
      isEmpty(bolt) ? null : parseInt(bolt),
      urgente ? 1 : 0,
      a_corpo ? 1 : 0,
      trasparente ? 1 : 0,
      f_magazzino ? 1 : 0,
      standby ? 1 : 0
    ];

    console.log('🛠️ Query INSERT in esecuzione con i seguenti valori:');
    console.log(valori.map((v, i) => `${i + 1}. ${v}`).join('\n'));

    db.query(query, valori, (err3) => {
      if (err3) {
        console.error('❌ ERRORE durante INSERT produzione:', err3);
        return res.status(500).send('Errore inserimento produzione');
      }
      console.log('✅ Lavorazione inserita correttamente nel DB');
      res.send('✅ Inserimento avvenuto con successo');
    });
  }
});

router.put('/sala/:id', (req, res) => {
  const id = req.params.id;
  const { smontaggio, falegnameria, finito_sala } = req.body;

  // Recupera i dati attuali
  const selectQuery = 'SELECT smontaggio, falegnameria, finito_sala FROM produzione WHERE id = ?';
  db.query(selectQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      console.error('❌ Errore lettura dati esistenti:', err);
      return res.status(500).send('Errore lettura dati');
    }

    const attuali = results[0];

    // Applica aggiornamenti solo se presenti
    const nuovoSmontaggio = smontaggio ?? attuali.smontaggio;
    const nuovaFalegnameria = falegnameria ?? attuali.falegnameria;
    const nuovoFinitoSala = finito_sala ?? attuali.finito_sala;

    // 🔁 Logica pallini come in admin_edit
    const azzurro = (nuovaFalegnameria && nuovaFalegnameria !== '') ? 1 : null;

    // Per sicurezza, recuperiamo anche ore_falegn_extra e rinforzo per calcolare fucsia (se disponibili)
    const selectOre = `SELECT ore_falegn_extra, ore_falegn_rinforzo FROM produzione WHERE id = ?`;
    db.query(selectOre, [id], (errOre, resOre) => {
      if (errOre || !resOre.length) {
        console.error('❌ Errore lettura ore falegnameria:', errOre);
        return res.status(500).send('Errore lettura ore');
      }

      const extra = parseFloat(resOre[0].ore_falegn_extra || 0);
      const rinforzo = parseFloat(resOre[0].ore_falegn_rinforzo || 0);
      const oreFalegnameria = extra + rinforzo;

      const fucsia = (nuovaFalegnameria && oreFalegnameria > 0) ? 1 : null;

      // ✅ Query con logica colori
      const updateQuery = `
        UPDATE produzione
        SET smontaggio = ?, falegnameria = ?, finito_sala = ?, azzurro = ?, fucsia = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [nuovoSmontaggio, nuovaFalegnameria, nuovoFinitoSala, azzurro, fucsia, id], (err2) => {
        if (err2) {
          console.error('❌ Errore salvataggio sala:', err2);
          return res.status(500).send('Errore salvataggio');
        }
        res.send('✅ Aggiornamento effettuato con successo');
      });
    });
  });
});



// 🔽 PUT: aggiornamento completo da admin_edit.html
router.put('/admin/:id', (req, res) => {
  const id = req.params.id;
  const {
    nome,
    tipo_cliente_id,
    tipo_lavorazione_id,
    tipo_linea_id,
    note,
    pagamento,
    ordine_vernice,
    finito_sala,
    pezzi,
    ral1,
    ral2,
    metriquadri,
    gita,
    urgente,
    viaggio,
    ufo,
    loc,
    bolt,
    ingresso,
    smontaggio,
    falegnameria,
    finito_admin,
    consegna,
    ore_smontaggio,
    ore_falegn_extra,
    ore_falegn_rinforzo,
    ore_produzione,
    ore_magazz,
    trasparente,
    a_corpo,
    f_magazzino,
    standby
  } = req.body;

  // 🔢 Calcolo ore_totale
  const oreTot = (
    (parseFloat(ore_smontaggio) || 0) +
    (parseFloat(ore_falegn_extra) || 0) +
    (parseFloat(ore_falegn_rinforzo) || 0) +
    (parseFloat(ore_produzione) || 0) +
    (parseFloat(ore_magazz) || 0)
  );
  const ore_totale = Math.round(oreTot * 10) / 10;

  // 🔢 Calcolo giorni lavorazione
  let giorni_lavorazione = null;
  if (ingresso && finito_admin) {
    const inizio = new Date(ingresso);
    const fine = new Date(finito_admin);
    inizio.setHours(0, 0, 0, 0);
    fine.setHours(0, 0, 0, 0);
    const diffTime = fine - inizio;
    giorni_lavorazione = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // 🔢 Calcolo giorni consegna
  let giorni_consegna = null;
  if (finito_admin && consegna) {
    giorni_consegna = Math.ceil((new Date(consegna) - new Date(finito_admin)) / (1000 * 60 * 60 * 24));
  }

  // 🔢 Calcolo giorni totale
  let giorni_totale = null;
  if (ingresso && consegna) {
    giorni_totale = Math.ceil((new Date(consegna) - new Date(ingresso)) / (1000 * 60 * 60 * 24));
  }

  // 🔢 Calcolo giorni trascorsi
  let giorni_trascorsi = null;
  if (ingresso) {
    if (consegna && finito_admin) {
      giorni_trascorsi = Math.floor((new Date(finito_admin) - new Date(ingresso)) / (1000 * 60 * 60 * 24));
    } else {
      giorni_trascorsi = Math.floor((new Date() - new Date(ingresso)) / (1000 * 60 * 60 * 24));
    }
  }

  // calcolo ore totali falegnameria
  let ore_falegnameria = null;
const extra = parseFloat(ore_falegn_extra || 0);
const rinforzo = parseFloat(ore_falegn_rinforzo || 0);
const somma = extra + rinforzo;
if (somma > 0) {
  ore_falegnameria = Math.round(somma * 100) / 100;
}

const azzurro = falegnameria ? 1 : null;
const fucsia = (falegnameria && parseFloat(ore_falegnameria) > 0) ? 1 : null;



  // 🔁 Recupera valori attuali di azzurro e fucsia
  db.query('SELECT azzurro, fucsia FROM produzione WHERE id = ?', [id], (err0, result0) => {
    if (err0 || !result0.length) {
      console.error('❌ Errore lettura azzurro/fucsia:', err0);
      return res.status(500).send('Errore lettura dati');
    }

    let azzurro = result0[0].azzurro;
    let fucsia = result0[0].fucsia;

    const hasFalegnameria = Object.prototype.hasOwnProperty.call(req.body, 'falegnameria');
    const hasOreFalegnameria = Object.prototype.hasOwnProperty.call(req.body, 'ore_falegnameria');

    // 🔵 AZZURRO: si accende se c'è la data
    if (hasFalegnameria) {
      azzurro = (falegnameria && falegnameria !== '') ? 1 : null;
    }

    // 💗 FUCSIA: si accende solo se c'è data + ore > 0
    if ((hasFalegnameria || hasOreFalegnameria)) {
      const oreValide = ore_falegnameria !== null && ore_falegnameria !== undefined && parseFloat(ore_falegnameria) > 0;
      fucsia = (falegnameria && oreValide) ? 1 : null;
    }


    const query = `
      UPDATE produzione SET
        tipo_cliente_id = ?, tipo_lavorazione_id = ?, tipo_linea_id = ?, note = ?, pagamento = ?,
        ordine_vernice = ?, finito_sala = ?, pezzi = ?, ral1 = ?, ral2 = ?, metriquadri = ?, gita = ?,
        urgente = ?, viaggio = ?, ufo = ?, loc = ?, bolt = ?, ingresso = ?, smontaggio = ?, falegnameria = ?,
        finito_admin = ?, consegna = ?, ore_smontaggio = ?, ore_falegn_extra = ?, ore_falegn_rinforzo = ?,
        ore_produzione = ?, ore_magazz = ?, ore_falegnameria = ?, ore_totale = ?,
        giorni_lavorazione = ?, giorni_consegna = ?, giorni_totale = ?, 
        trasparente = ?, a_corpo = ?, f_magazzino = ?, standby = ?, azzurro = ?, fucsia = ?
      WHERE id = ?
    `;

    const valori = [
      tipo_cliente_id || null,
      tipo_lavorazione_id || null,
      tipo_linea_id || null,
      note || null,
      pagamento ? 1 : 0,
      ordine_vernice ? 1 : 0,
      finito_sala ? 1 : 0,
      pezzi || null,
      ral1 || null,
      ral2 || null,
      metriquadri || null,
      gita || null,
      urgente || null,
      viaggio || null,
      ufo || null,
      loc || null,
      bolt || null,
      ingresso || null,
      smontaggio || null,
      falegnameria || null,
      finito_admin || null,
      consegna || null,
      ore_smontaggio || null,
      ore_falegn_extra || null,
      ore_falegn_rinforzo || null,
      ore_produzione || null,
      ore_magazz || null,
      ore_falegnameria,
      ore_totale,
      giorni_lavorazione,
      giorni_consegna,
      giorni_totale,
      trasparente ? 1 : 0,
      a_corpo ? 1 : 0,
      f_magazzino ? 1 : 0,
      standby ? 1 : 0,
      azzurro,
      fucsia,
      id
    ];

    db.query(query, valori, (err) => {
      if (err) {
        console.error('❌ Errore aggiornamento admin_edit:', err);
        return res.status(500).send('Errore salvataggio');
      }

        // 🆕 Aggiorna nome cliente se presente
  if (nome && nome.trim() !== '') {
    db.query('SELECT cliente_id FROM produzione WHERE id = ?', [id], (errCliente, resultsCliente) => {
      if (!errCliente && resultsCliente.length > 0) {
        const clienteId = resultsCliente[0].cliente_id;
        if (clienteId) {
          db.query('UPDATE clienti SET nome = ? WHERE id = ?', [nome.trim(), clienteId], (errUpdate) => {
            if (errUpdate) {
              console.error('❌ Errore aggiornamento nome cliente:', errUpdate);
            } else {
              console.log(`✅ Nome cliente aggiornato a "${nome.trim()}" per cliente_id ${clienteId}`);
            }
          });
        }
      }
    });
  }

      // 🔁 Assegnazione progressivo se serve
      if (finito_admin) {
        db.query('SELECT n_progressivo FROM produzione WHERE id = ?', [id], (err2, results) => {
          if (err2 || !results.length) {
            console.error('Errore lettura progressivo:', err2);
            return res.send('✅ aggiornamento admin_edit avvenuto con successo');
          }

          const { n_progressivo } = results[0];
          if (!n_progressivo) {
            getProgressivoAnno(finito_admin, (err3, prossimo) => {
              if (err3) {
                console.error('Errore generazione progressivo:', err3);
                return res.send('✅ aggiornamento admin_edit avvenuto con successo');
              }

              db.query('UPDATE produzione SET n_progressivo = ? WHERE id = ?', [prossimo, id], (err4) => {
                if (err4) {
                  console.error('Errore salvataggio progressivo:', err4);
                } else {
                  console.log(`✅ Progressivo ${prossimo} assegnato a ID ${id}`);
                }
                return res.send('✅ aggiornamento admin_edit avvenuto con successo');
              });
            });
          } else {
            return res.send('✅ aggiornamento admin_edit avvenuto con successo');
          }
        });
      } else {
        return res.send('✅ aggiornamento admin_edit avvenuto con successo');
      }
    });
  });
});

// Archivia il nome cliente collegato a una riga di produzione
router.put('/archivia/:id', (req, res) => {
  const idProduzione = req.params.id;

  const getClienteIdSql = `SELECT cliente_id FROM produzione WHERE id = ?`;
  db.query(getClienteIdSql, [idProduzione], (err, results) => {
    if (err) {
      console.error('❌ Errore nel recupero cliente_id:', err);
      return res.status(500).json({ error: 'Errore recupero cliente_id' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Produzione non trovata' });
    }

    const clienteId = results[0].cliente_id;

    const archiviaClienteSql = `UPDATE clienti SET nome = NULL WHERE id = ?`;
    db.query(archiviaClienteSql, [clienteId], (err2, result2) => {
      if (err2) {
        console.error('❌ Errore durante archiviazione del nome:', err2);
        return res.status(500).json({ error: 'Errore archiviazione nome' });
      }

      console.log(`📥 Archiviato nome cliente ID: ${clienteId}`);
      res.json({ success: true });
    });
  });
});

// === REPORT: date mancanti (dinamico: consegna, smontaggio, falegnameria, finito_admin) ===
router.get('/report/date-mancanti', (req, res) => {
  const condizioni = [];

  // Esclude sempre i record senza nome cliente (archiviati o vuoti)
  condizioni.push("(c.nome IS NOT NULL AND TRIM(c.nome) <> '')");

  if (req.query.consegna) condizioni.push('p.consegna IS NULL');
  if (req.query.smontaggio) condizioni.push('p.smontaggio IS NULL');
  if (req.query.falegnameria) condizioni.push('p.falegnameria IS NULL');
  if (req.query.finito_admin) condizioni.push('p.finito_admin IS NULL');
  // Per il report SVERNICIATURA: imponi finito_admin mancante e tipo lavorazione = SVERNICIATURA
  if (req.query.sverniciatura) {
    condizioni.push("p.finito_admin IS NULL");
    condizioni.push("p.tipo_linea_id = 4");
  }

  // Filtri di esclusione per tipo_lavorazione in base al tipo di report richiesto
  if (!req.query.sverniciatura) {
    // Per smontaggio/falegnameria/da consegnare: escludi sempre SVERNICIATURA (per linea) e CUCINA (per tipo lavorazione)
    if (req.query.smontaggio || req.query.falegnameria || req.query.consegna) {
      condizioni.push("p.tipo_linea_id <> 4");
      condizioni.push("UPPER(TRIM(tl.descrizione)) NOT LIKE 'CUCIN%'");
    } else if (req.query.finito_admin) {
      // Per 'da completare': escludi SVERNICIATURA (sia per linea che per descrizione), consenti CUCINA
      condizioni.push("p.tipo_linea_id <> 4");
      condizioni.push("UPPER(TRIM(tl.descrizione)) <> 'SVERNICIATURA'");
    }
  }

  const whereClause = condizioni.length ? 'WHERE ' + condizioni.join(' AND ') : '';

  const sql = `
    SELECT 
      p.id, 
      c.nome AS nome_lavoro,
      tc.nome AS tipo_cliente,
      tl.descrizione AS tipo_lavorazione,
      tli.descrizione AS tipo_linea,
      p.pezzi,
      p.ingresso,
      p.smontaggio,
      p.finito_admin,
      DATEDIFF(CURDATE(), p.ingresso) AS giorni_lavorazione
    FROM produzione p
    LEFT JOIN clienti c ON p.cliente_id = c.id
    LEFT JOIN tipo_cliente tc ON p.tipo_cliente_id = tc.id
    LEFT JOIN tipo_lavorazione tl ON p.tipo_lavorazione_id = tl.id
    LEFT JOIN tipo_linea tli ON p.tipo_linea_id = tli.id
    ${whereClause}
    ORDER BY (p.ingresso IS NULL), p.ingresso ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Errore nel recupero del report date mancanti:', err);
      return res.status(500).json({ errore: 'Errore nel recupero dei dati' });
    }

    res.json(results);
  });
});

router.get('/statistiche/mensili', (req, res) => {
  const { mese, anno } = req.query;

  if (!mese || !anno) {
    return res.status(400).json({ errore: 'Mese e anno sono obbligatori' });
  }

  const ultimoGiorno = new Date(anno, parseInt(mese), 0).getDate();
  const inizioMese = `${anno}-${mese.padStart(2, '0')}-01 00:00:00`;
  const fineMese = `${anno}-${mese.padStart(2, '0')}-${ultimoGiorno} 23:59:59`;

  const queryPrincipale = `
    SELECT
      COUNT(*) AS num_schede,

      IFNULL(SUM(CASE WHEN tipo_linea_id = 4 THEN metriquadri ELSE 0 END), 0) AS mq_sverniciatura,
      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN metriquadri ELSE 0 END), 0) AS mq_altre,

      IFNULL(SUM(CASE WHEN tipo_linea_id = 4 THEN ore_smontaggio ELSE 0 END), 0) AS ore_sv_smontaggio,
      IFNULL(SUM(CASE WHEN tipo_linea_id = 4 THEN ore_produzione ELSE 0 END), 0) AS ore_sv_produzione,

      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN ore_smontaggio ELSE 0 END), 0) AS ore_alt_smontaggio,
      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN ore_falegn_extra ELSE 0 END), 0) AS ore_alt_falextra,
      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN ore_falegn_rinforzo ELSE 0 END), 0) AS ore_alt_falrinf,
      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN ore_falegnameria ELSE 0 END), 0) AS ore_alt_fal,
      IFNULL(SUM(CASE WHEN tipo_linea_id != 4 THEN ore_produzione ELSE 0 END), 0) AS ore_alt_prod
    FROM produzione
    WHERE finito_admin IS NOT NULL
      AND finito_admin BETWEEN ? AND ?
  `;

  const queryPezziSverniciatura = `
    SELECT IFNULL(SUM(pezzi), 0) AS pezzi_sverniciatura
    FROM produzione
    WHERE tipo_linea_id = 4
      AND finito_admin IS NOT NULL
      AND finito_admin BETWEEN ? AND ?
  `;

  const queryPezziFalegnameria = `
    SELECT IFNULL(SUM(pezzi), 0) AS pezzi_falegnameria
    FROM produzione
    WHERE tipo_linea_id != 4
      AND finito_admin IS NOT NULL
      AND (
        ore_falegnameria > 0 OR
        ore_falegn_extra > 0 OR
        ore_falegn_rinforzo > 0
      )
      AND finito_admin BETWEEN ? AND ?
  `;

  db.query(queryPrincipale, [inizioMese, fineMese], (err, results) => {
    if (err) {
      console.error('❌ Errore nella query principale:', err);
      return res.status(500).json({ errore: 'Errore nel calcolo delle statistiche' });
    }

    const output = results[0];

    db.query(queryPezziSverniciatura, [inizioMese, fineMese], (err2, res2) => {
      if (err2) {
        console.error('❌ Errore pezzi_sverniciatura:', err2);
        return res.status(500).json({ errore: 'Errore nel calcolo dei pezzi sverniciatura' });
      }

      output.pezzi_sverniciatura = res2[0].pezzi_sverniciatura;

      db.query(queryPezziFalegnameria, [inizioMese, fineMese], (err3, res3) => {
        if (err3) {
          console.error('❌ Errore pezzi_falegnameria:', err3);
          return res.status(500).json({ errore: 'Errore nel calcolo dei pezzi falegnameria' });
        }

        output.pezzi_falegnameria = res3[0].pezzi_falegnameria;

        console.log('📦 Output finale:', output);
        res.json(output);
      });
    });
  });
});

module.exports = router;
