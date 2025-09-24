// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const { attachAuth, requireAuth } = require('./middleware/auth');

// 🔌 Connessione DB (serve solo per attivarla all'avvio)
console.log('✅ server.js avviato');        // appena prima del require
require('./db/connection');
console.log('✅ dopo require connection');  // subito dopo

const app = express();

// Middleware base
app.use(cors());
app.use(express.json());
app.use(attachAuth);

// Serve i file statici (HTML, JS, CSS) dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));


// Serve anche gli script JS personalizzati da /scripts
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// ✅ Collegamento alle API principali
const apiRoutes = require('./routes/api');
app.use('/api/auth', authRoutes);
app.use('/api', (req, res, next) => {
  if (!req.auth || !req.auth.enabled) return next();
  return requireAuth(req, res, next);
});
app.use('/api', apiRoutes); // carica tutto da routes/api.js

// ✅ Route di test per importazione
const testImport = require('./routes/test-import-v2');
app.get('/api/test-import-v2', testImport);

// ✅ Collegamento alle viste speciali
const visteSpecialiRoutes = require('./routes/visteSpeciali');
app.use('/api/viste', visteSpecialiRoutes);

// ✅ Collegamento diretto alle route produzione (inclusa /api/report)
const produzioneRoutes = require('./routes/produzione');
app.use('/api', produzioneRoutes); // ora la route /api/report funzionerà

// Avvio server
const PORT = parseInt(process.env.PORT, 10) || 3004; // DEV su 3004 per evitare conflitto con STABILE
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});

// ⏰ Pianifica aggiornamento giornaliero
const cron = require('node-cron');
const aggiornaGiorniTrascorsi = require('./scripts/updateGiorniTrascorsi');

// Esegui subito all'avvio del server
aggiornaGiorniTrascorsi();

// Pianifica l'esecuzione ogni giorno alle 02:00
cron.schedule('0 2 * * *', () => {
  console.log('⏰ Esecuzione giornaliera: aggiornamento giorni trascorsi');
  aggiornaGiorniTrascorsi();
});

//route di import da file json
const importArchiviatiNomi = require('./routes/import-archiviati-nomi');
app.use('/api', importArchiviatiNomi);
