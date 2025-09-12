const mysql = require('mysql');

// Connessione al database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 8889,
  user: 'lotar_app',
  password: 'l0t4r@25',
  database: 'lotar_produzione'
});

const idDaEstrarre = 40;

const query = `
  SELECT 
    p.*, 
    c.nome AS cliente_nome,
    tc.nome AS tipo_cliente_nome,
    tl.descrizione AS tipo_lavorazione_descrizione,
    tli.descrizione AS tipo_linea_descrizione
  FROM produzione p
  LEFT JOIN clienti c ON p.cliente_id = c.id
  LEFT JOIN tipo_cliente tc ON p.tipo_cliente_id = tc.id
  LEFT JOIN tipo_lavorazione tl ON p.tipo_lavorazione_id = tl.id
  LEFT JOIN tipo_linea tli ON p.tipo_linea_id = tli.id
  WHERE p.id = ?
`;

connection.query(query, [idDaEstrarre], (err, results) => {
  if (err) {
    console.error('Errore nella query:', err);
    connection.end();
    return;
  }

  if (results.length === 0) {
    console.log(`⚠️ Nessun record trovato con ID ${idDaEstrarre}`);
    connection.end();
    return;
  }

  const r = results[0];

  console.log(`
ID: ${r.id}
Cliente: ${r.cliente_nome}
Tipo Cliente: ${r.tipo_cliente_nome}
Tipo Lavorazione: ${r.tipo_lavorazione_descrizione}
Tipo Linea: ${r.tipo_linea_descrizione}
Note: ${r.note}
Rosso: ${r.rosso}
Azzurro: ${r.azzurro}
Fucsia: ${r.fucsia}
Nero: ${r.nero}
Verde: ${r.verde}
Pagamento: ${r.pagamento}
Pezzi: ${r.pezzi}
RAL 1: ${r.ral1}
RAL 2: ${r.ral2}
Ordine Vernice: ${r.ordine_vernice}
MQ: ${r.metriquadri}
Gita: ${r.gita}
Ingresso: ${r.ingresso}
Smontaggio: ${r.smontaggio}
Falegnameria: ${r.falegnameria}
Finito Sala: ${r.finito_sala}
Finito Admin: ${r.finito_admin}
Consegna: ${r.consegna}
Ore Smontaggio: ${r.ore_smontaggio}
Ore Falegn Extra: ${r.ore_falegn_extra}
Ore Falegn Rinforzo: ${r.ore_falegn_rinforzo}
Ore Produzione: ${r.ore_produzione}
Ore Magazzino: ${r.ore_magazz}
Ore Totale: ${r.ore_totale}
Giorni Finito Sala: ${r.giorni_finito}
Giorni Consegna: ${r.giorni_consegna}
Giorni Totale: ${r.giorni_totale}
Giorni Trascorsi: ${r.giorni_trascorsi}
Numero Progressivo: ${r.n_progressivo}
Urgente: ${r.urgente}
Viaggio: ${r.viaggio}
UFO: ${r.ufo}
Lock (Loc): ${r.loc}
Bolt: ${r.bolt}
Trasparente: ${r.trasparente}
A Corpo: ${r.a_corpo}
Franco Magazzino: ${r.f_magazzino}
  `);

  connection.end();
});