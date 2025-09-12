// index.js
const express = require('express');
const pool = require('./db/connection');

const app = express();
const PORT = 3000;

// Middleware per leggere i dati JSON inviati dal client (es. Postman o un form)
app.use(express.json());
// Middleware per servire file statici dalla cartella "public"
app.use(express.static('public'));


// ✅ Rotta di test: verifica connessione al database e funzionamento del server
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW()');
    res.json({ success: true, time: rows[0]['NOW()'] });
  } catch (error) {
    console.error('Errore di connessione:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ✅ Rotta per ottenere tutti i tipi cliente dalla tabella tipo_cliente
app.get('/api/tipi-clienti', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipo_cliente ORDER BY nome');
    res.json(rows);
  } catch (error) {
    console.error('Errore nel recupero dei tipi cliente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ✅ Rotta per ottenere tutte le righe della tabella flusso_produzione
// Restituisce anche il nome del tipo cliente tramite JOIN
app.get('/api/produzione', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        fp.id,
        fp.nome_cliente,
        tc.nome AS tipo_cliente
      FROM flusso_produzione fp
      JOIN tipo_cliente tc ON fp.tipo_id = tc.id
      ORDER BY fp.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Errore nel recupero della produzione:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ✅ Rotta per inserire una nuova voce in flusso_produzione
// Esempio di body JSON da inviare:
// { "nome_cliente": "Mario Rossi", "tipo_id": 1 }
app.post('/api/produzione', async (req, res) => {
  const { nome_cliente, tipo_id } = req.body;

  if (!nome_cliente || !tipo_id) {
    return res.status(400).json({ success: false, message: 'Dati mancanti' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO flusso_produzione (nome_cliente, tipo_id) VALUES (?, ?)',
      [nome_cliente, tipo_id]
    );

    res.json({
      success: true,
      id: result.insertId,
      nome_cliente,
      tipo_id
    });
  } catch (error) {
    console.error("Errore durante l'inserimento nel DB:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ✅ Avvio del server sulla porta specificata
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});