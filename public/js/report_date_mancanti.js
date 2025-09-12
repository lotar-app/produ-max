window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Costruisci query string da inoltrare all'API, forzando i constraint necessari
    const qs = new URLSearchParams(window.location.search);
    const onlySverniciatura = qs.has('sverniciatura');
    if (onlySverniciatura) {
      // Enforce anche lato server: finito_admin mancante
      qs.set('finito_admin', 'true');
    }
    const parametri = `?${qs.toString()}`;
    const res = await fetch(`/api/report/date-mancanti${parametri}`);
    if (!res.ok) throw new Error('Errore nel recupero dei dati');

    const dati = await res.json();
    // 1) Filtro sicurezza: esclude record senza nome_lavoro
    let righe = (dati || []).filter(r => r && r.nome_lavoro && String(r.nome_lavoro).trim() !== '');

    // 2) Filtraggio per tipo in base a URL
    const hasSmont = qs.has('smontaggio');
    const hasFal = qs.has('falegnameria');
    const hasCons = qs.has('consegna');
    const hasFinito = qs.has('finito_admin');

    if (onlySverniciatura) {
      // lato server già filtra per tipo_linea_id=4; qui facciamo un ulteriore guard su descrizione linea
      righe = righe.filter(r => String(r.tipo_linea || '').trim().toUpperCase() === 'SVERNICIATURA');
    } else if (hasFinito) {
      // Da completare: escludi SVERNICIATURA sia come linea che come tipo lavorazione; consenti CUCINA
      righe = righe.filter(r => {
        const linea = String(r.tipo_linea || '').trim().toUpperCase();
        const lavoro = String(r.tipo_lavorazione || '').trim().toUpperCase();
        return linea !== 'SVERNICIATURA' && lavoro !== 'SVERNICIATURA';
      });
    } else if (hasSmont || hasFal || hasCons) {
      // Smontaggio / Falegnameria / Da consegnare: escludi SVERNICIATURA (per linea) e CUCINE/CUCINA (per tipo lavorazione)
      righe = righe.filter(r => {
        const linea = String(r.tipo_linea || '').trim().toUpperCase();
        const lavoro = String(r.tipo_lavorazione || '').trim().toUpperCase();
        return linea !== 'SVERNICIATURA' && !lavoro.startsWith('CUCIN');
      });
    } else {
      // Default report senza flag: mantieni l'esclusione storica (SVERNICIATURA e CUCINA)
      const esclusi = new Set(['SVERNICIATURA', 'CUCINA']);
      righe = righe.filter(r => !esclusi.has(String(r.tipo_lavorazione || '').trim().toUpperCase()));
    }

    // 3) Ordina per data di ingresso (meno recente -> più recente)
    function ingressoTime(v) {
      if (!v) return Number.POSITIVE_INFINITY; // metti null/invalid in fondo
      const t = Date.parse(v);
      return isNaN(t) ? Number.POSITIVE_INFINITY : t;
    }
    righe.sort((a, b) => ingressoTime(a.ingresso) - ingressoTime(b.ingresso));
    const tbody = document.querySelector('#tabella-report tbody');
    const conteggio = document.getElementById('conteggio-record');
    tbody.innerHTML = '';

    if (righe.length === 0) {
      conteggio.textContent = 'Nessuna lavorazione trovata.';
      tbody.innerHTML = `<tr><td colspan="9">Nessun dato disponibile</td></tr>`;
      return;
    }

    conteggio.textContent = `Sono presenti ${righe.length} lavorazioni`;

    righe.forEach(riga => {
      const dataIngresso = riga.ingresso 
        ? new Date(riga.ingresso).toLocaleDateString('it-IT')
        : '-';

      const dataSmontaggio = riga.smontaggio
        ? new Date(riga.smontaggio).toLocaleDateString('it-IT')
        : '-';

      const giorni = riga.giorni_lavorazione != null ? riga.giorni_lavorazione : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${riga.id}</td>
        <td>${riga.nome_lavoro || '-'}</td>
        <td>${riga.tipo_cliente || '-'}</td>
        <td>${riga.tipo_lavorazione || '-'}</td>
        <td>${riga.tipo_linea || '-'}</td>
        <td>${riga.pezzi || '-'}</td>
        <td>${dataIngresso}</td>
        <td>${dataSmontaggio}</td>
        <td>${giorni}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Errore nel recupero del report');
  }
});

document.getElementById('stampa-report').addEventListener('click', () => {
  window.print();
});
