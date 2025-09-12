window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/report/consegna-mancante');
    if (!res.ok) throw new Error('Errore nel recupero dei dati');

    const dati = await res.json();
    const tbody = document.querySelector('#tabella-report tbody');
    const conteggio = document.getElementById('conteggio-record');
    tbody.innerHTML = '';

    if (dati.length === 0) {
      conteggio.textContent = 'Nessuna lavorazione trovata.';
      tbody.innerHTML = `<tr><td colspan="7">Nessun dato disponibile</td></tr>`;
      return;
    }

    conteggio.textContent = `Sono presenti ${dati.length} lavorazioni`;

    dati.forEach(riga => {
      const dataIngresso = riga.ingresso 
        ? new Date(riga.ingresso).toLocaleDateString('it-IT')
        : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${riga.id}</td>
        <td>${riga.nome_lavoro || '-'}</td>
        <td>${riga.tipo_cliente || '-'}</td>
        <td>${riga.tipo_lavorazione || '-'}</td>
        <td>${riga.tipo_linea || '-'}</td>
        <td>${dataIngresso}</td>
        <td>${riga.note || ''}</td>
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