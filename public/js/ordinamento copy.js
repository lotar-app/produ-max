
let datiCorrenti = [];
let colonnaOrdinata = localStorage.getItem('colonnaOrdinata') || 'nome_lavoro';
let direzioneOrdinamento = localStorage.getItem('direzioneOrdinamento') || 'asc';

const colonneOrdinabili = [
  { id: 'th-nome', chiave: 'nome_lavoro', testo: 'Nome', neutra: true },
  { id: 'th-tot-ore', chiave: 'totale_ore', testo: 'Tot Ore', neutra: true },
  { id: 'th-giorni-totale', chiave: 'giorni_totale', testo: 'GG Tot', neutra: true },
  { id: 'th-progressivo', chiave: 'n_progressivo', testo: 'Num', neutra: true },
  { id: 'th-id', chiave: 'id', testo: 'ID', neutra: true },
  { id: 'th-ingresso', chiave: 'ingresso', testo: 'Ingresso', neutra: true }
];

function confronta(a, b, chiave, tipo = 'stringa', direzione = 'asc') {
  const valoreA = a[chiave];
  const valoreB = b[chiave];

  const vuotoA = valoreA === null || valoreA === undefined || valoreA === '';
  const vuotoB = valoreB === null || valoreB === undefined || valoreB === '';

  // Vuoti sempre in fondo, indipendentemente da asc o desc
  if (vuotoA && !vuotoB) return 1;
  if (!vuotoA && vuotoB) return -1;
  if (vuotoA && vuotoB) return 0;

if (tipo === 'numero') {
  const numA = parseFloat(valoreA);
  const numB = parseFloat(valoreB);
  if (numA < numB) return direzione === 'asc' ? -1 : 1;
  if (numA > numB) return direzione === 'asc' ? 1 : -1;
  return 0;
} else if (tipo === 'data') {
  const dataA = new Date(valoreA);
  const dataB = new Date(valoreB);
  if (dataA < dataB) return direzione === 'asc' ? -1 : 1;
  if (dataA > dataB) return direzione === 'asc' ? 1 : -1;
  return 0;
} else {
  const cmp = valoreA.toString().localeCompare(valoreB.toString(), 'it', { sensitivity: 'base' });
  return direzione === 'asc' ? cmp : -cmp;
}
}

function aggiornaTabellaOrdinata() {
  if (!datiCorrenti.length) return;
  let tipo = 'stringa';
if (['totale_ore', 'giorni_totale', 'n_progressivo', 'id'].includes(colonnaOrdinata)) {
  tipo = 'numero';
} else if (['ingresso'].includes(colonnaOrdinata)) {
  tipo = 'data';
}

  const datiOrdinati = [...datiCorrenti].sort((a, b) =>
  confronta(a, b, colonnaOrdinata, tipo, direzioneOrdinamento)
);

  aggiornaTabella(datiOrdinati);
}

function gestisciOrdinamento(th, chiave) {
  if (colonnaOrdinata === chiave) {
    direzioneOrdinamento = direzioneOrdinamento === 'asc' ? 'desc' : 'asc';
  } else {
    colonnaOrdinata = chiave;
    direzioneOrdinamento = 'asc';
  }

  localStorage.setItem('colonnaOrdinata', colonnaOrdinata);
  localStorage.setItem('direzioneOrdinamento', direzioneOrdinamento);

  colonneOrdinabili.forEach(({ id, testo, chiave: k }) => {
    const thEl = document.getElementById(id);
    if (thEl) {
      if (k === colonnaOrdinata) {
        const freccia = direzioneOrdinamento === 'asc' ? ' 🔼' : ' 🔽';
        thEl.textContent = testo + freccia;
      } else {
        thEl.textContent = testo + ' ↕';
      }
    }
  });

  aggiornaTabella(window.produzioneDati);
}

document.addEventListener('DOMContentLoaded', () => {
  colonneOrdinabili.forEach(({ id, testo, neutra }) => {
    const th = document.getElementById(id);
    if (th) {
      th.style.cursor = 'pointer';
      th.textContent = testo + (neutra ? ' ↕' : '');
      th.addEventListener('click', () => gestisciOrdinamento(th, colonneOrdinabili.find(c => c.id === id).chiave));
    }
  });

  // Intercetta la fetch per salvare i dati correnti
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);

  // Intercetta solo fetch GET verso /api/produzione o /api/viste
  const url = args[0];
  const method = (args[1]?.method || 'GET').toUpperCase();

  if (method === 'GET' && (url.includes('/api/produzione') || url.includes('/api/viste'))) {
    const dati = await response.clone().json();

    if (!Array.isArray(dati)) {
      console.error('❌ ERRORE: dati non è un array in ordinamento.js. Contenuto:', dati);
      return response;
    }

    datiCorrenti = dati.map(item => {
      const somma =
        parseFloat(item.ore_smontaggio || 0) +
        parseFloat(item.ore_falegn_extra || 0) +
        parseFloat(item.ore_falegn_rinforzo || 0) +
        parseFloat(item.ore_produzione || 0) +
        parseFloat(item.ore_magazz || 0);

      item.totale_ore = +somma.toFixed(2);
      return item;
    });

    aggiornaTabellaOrdinata();
  }

  return response;
};
});

window.ordinaDati = function(dati) {
  let tipo = 'stringa';
if (['totale_ore', 'giorni_totale', 'n_progressivo', 'id'].includes(colonnaOrdinata)) {
  tipo = 'numero';
} else if (['ingresso'].includes(colonnaOrdinata)) {
  tipo = 'data';
}

  const datiOrdinati = [...dati].sort((a, b) => {
    return confronta(a, b, colonnaOrdinata, tipo, direzioneOrdinamento);
  });

  return datiOrdinati;
};