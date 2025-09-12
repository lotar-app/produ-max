
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

(function () {
  function initOrdinamento() {
    // 1) Aggancia i click ai TH specificati in colonneOrdinabili
    colonneOrdinabili.forEach(({ id, testo, neutra }) => {
      const th = document.getElementById(id);
      if (th) {
        th.style.cursor = 'pointer';
        th.textContent = testo + (neutra ? ' ↕' : '');
        // Evita doppi listener se re-inizializzi
        th.replaceWith(th.cloneNode(true));
        const thNew = document.getElementById(id);
        thNew.style.cursor = 'pointer';
        thNew.textContent = testo + (neutra ? ' ↕' : '');
        thNew.addEventListener('click', () => {
          const cfg = colonneOrdinabili.find(c => c.id === id);
          if (!cfg) return;
          gestisciOrdinamento(thNew, cfg.chiave);
        });
      }
    });

    // 2) Intercetta la fetch per salvare i dati correnti (una sola volta)
    if (!window.__ord_fetch_patched) {
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        try {
          const url = args[0];
          const method = (args[1]?.method || 'GET').toUpperCase();

          // Intercetta solo GET verso /api/produzione o /api/viste
          if (method === 'GET' && (String(url).includes('/api/produzione') || String(url).includes('/api/viste'))) {
            const dati = await response.clone().json();

            if (!Array.isArray(dati)) {
              console.error('❌ ERRORE: dati non è un array in ordinamento.js. Contenuto:', dati);
              return response;
            }

            // Calcola totale_ore come in stabile
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
        } catch (e) {
          // Non bloccare mai la risposta
          console.warn('ordinamento.js fetch hook warning:', e);
        }

        return response;
      };
      window.__ord_fetch_patched = true;
    }
  }

  // 3) Esegui subito se il DOM è già pronto, altrimenti attendi
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrdinamento, { once: true });
  } else {
    initOrdinamento();
  }

  // 4) Espone l'init per richiamo manuale (opzionale)
  window.initOrdinamento = initOrdinamento;
})();


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