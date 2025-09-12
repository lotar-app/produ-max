const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'lotar',
  password: 'SuperPassword123',
  database: 'lotar_produzione_dev'
});

router.get('/importa-archiviati-nomi', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../json/archiviati-4.json');
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    let count = 0;

    for (const row of jsonData) {
      const tipo_cliente_id = await getId('tipo_cliente', 'nome', row.CLIENTE);
      const tipo_lavorazione_id = await getId('tipo_lavorazione', 'descrizione', row.LAVORAZIONE);
      const tipo_linea_id = await getId('tipo_linea', 'descrizione', row.LINEA);

      // Inserisce cliente con il nome fornito
      const nomeCliente = row['NOME CLIENTE']?.trim() || null;
      const [clienteResult] = await pool.query('INSERT INTO clienti (nome) VALUES (?)', [nomeCliente]);
      const cliente_id = clienteResult.insertId;

      const ingresso = formatDate(row.INGRESSO);
      const smontaggio = formatDate(row.SMONT);
      const falegnameria = formatDate(row.FALEGN);
      const finito_admin = formatDate(row.FINITO);
      const consegna = formatDate(row.CONSEGNE);

      const giorni_totale = ingresso && consegna ? diffDays(ingresso, consegna) : null;
      const giorni_lavorazione = ingresso && finito_admin ? diffDays(ingresso, finito_admin) : null;
      const giorni_consegna = finito_admin && consegna ? diffDays(finito_admin, consegna) : null;

      const ore_falegn_extra = parseFloat(row.Hf) || 0;
      const ore_smontaggio = parseFloat(row.Hs) || 0;
      const ore_produzione = parseFloat(row.Hp) || 0;
      const ore_falegnameria = ore_falegn_extra;

      const n_progressivo = parseInt(row.nu) || null;
      const ufo = row.ufo === '' ? null : parseInt(row.ufo);
      const loc = row.lock === '' ? null : parseInt(row.lock);
      const standby = 0;

      const ordine_vernice = row.VERN == 0 ? 1 : 0;

      const query = `
        INSERT INTO produzione (
          cliente_id, tipo_cliente_id, tipo_lavorazione_id, tipo_linea_id,
          pezzi, ral1, ral2, metriquadri, ordine_vernice, gita,
          ingresso, smontaggio, falegnameria, finito_admin, consegna,
          ore_falegn_extra, ore_falegn_rinforzo, ore_falegnameria,
          ore_smontaggio, ore_produzione, n_progressivo,
          ufo, loc, finito_sala,
          giorni_totale, giorni_lavorazione, giorni_consegna, standby
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        cliente_id,
        tipo_cliente_id,
        tipo_lavorazione_id,
        tipo_linea_id,
        parseInt(row.PZ) || 0,
        row.RAL1 || null,
        row.RAL2 || null,
        parseFloat(row.MQ) || 0,
        ordine_vernice,
        row.GITA || '',
        ingresso,
        smontaggio,
        falegnameria,
        finito_admin,
        consegna,
        ore_falegn_extra,
        0,
        ore_falegnameria,
        ore_smontaggio,
        ore_produzione,
        n_progressivo,
        ufo,
        loc,
        1,
        giorni_totale,
        giorni_lavorazione,
        giorni_consegna,
        standby
      ];

      await pool.query(query, values);
      count++;
    }

    res.send(`✅ Importazione completata. Righe inserite: ${count}`);
  } catch (err) {
    console.error('❌ Errore durante importazione:', err);
    res.status(500).send('Errore durante importazione.');
  }
});

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function diffDays(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

async function getId(tabella, colonna, valore) {
  if (!valore || valore === '') return null;
  const [rows] = await pool.query(`SELECT id FROM ${tabella} WHERE ${colonna} = ?`, [valore]);
  return rows.length ? rows[0].id : null;
}

module.exports = router;