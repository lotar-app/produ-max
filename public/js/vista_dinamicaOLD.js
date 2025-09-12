console.log("🚀 vista_dinamica.js avviato");

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVistaDinamica);
} else {
  initVistaDinamica(); // DOM già pronto
}

function initVistaDinamica() {
  console.log("✅ DOMContentLoaded attivo – fetch e tabella avviati");

  const filtro = new URLSearchParams(window.location.search).get('filtro');
  const endpoint = filtro ? `/api/viste/${filtro}` : '/api/produzione`;

  fetch(endpoint)
    .then(res => res.json())
    .then(dati => {
      console.log(`✅ Dati fetch ricevuti: (${dati.length})`, dati);
      aggiornaTabella(dati);
    });

  // Menu dinamico
  fetch('partials/menu_base.html')
    .then(res => res.text())
    .then(base => {
      document.getElementById('menu-container').innerHTML = base;

      const ruolo = getRuolo();
      fetch(`partials/menu_${ruolo}.html`)
        .then(res => res.text())
        .then(linkHtml => {
          const menuLinks = document.getElementById('menu-links');
          if (menuLinks) menuLinks.innerHTML = linkHtml;
        });
    });
}


  const filtro = new URLSearchParams(window.location.search).get('filtro');
  const endpoint = filtro ? `/api/viste/${filtro}` : '/api/produzione';

 fetch(endpoint)
  .then(res => res.json())
  .then(dati => {
    console.log("✅ Dati fetch ricevuti:", dati);
    window.produzioneDati = dati;
    popolaFiltroTipoCliente(dati);
    popolaFiltroTipoLavorazione(dati);
    popolaFiltroTipoLinea(dati);

    // ✅ Aspetta finché window.ordinaDati è disponibile
    const waitForOrdina = setInterval(() => {
      if (typeof window.ordinaDati === 'function') {
        clearInterval(waitForOrdina);
        console.log("✅ ordinaDati disponibile – ora aggiorno tabella");
        aggiornaTabella(dati);
      } else {
        console.log("⏳ In attesa di window.ordinaDati...");
      }
    }, 100);
  })


  // === Menu dinamico ===
  fetch('partials/menu_base.html')
    .then(res => res.text())
    .then(base => {
      document.getElementById('menu-container').innerHTML = base;
      const ruolo = getRuolo();
      return fetch(`partials/menu_${ruolo}.html`);
    })
    .then(res => res.text())
    .then(linkHtml => {
      const menuLinks = document.getElementById('menu-links');
      if (menuLinks) menuLinks.innerHTML = linkHtml;
    });
});



// 🔁 Applica i filtri ai dati e popola la tabella
function aggiornaTabella(dati) {
  console.log("📥 aggiornaTabella ATTIVATA con", dati.length, "righe");
  const tbody = document.getElementById('tabellaBody');
  tbody.innerHTML = '';

  // Recupera i filtri da localStorage
  const filtroVernice = localStorage.getItem('filtroVernice') === 'true';
  const filtroIngresso = localStorage.getItem('filtroIngresso') || '';
  const filtroSmontaggio = localStorage.getItem('filtroSmontaggio') || '';
  const filtroFalegnameria = localStorage.getItem('filtroFalegnameria') || '';
  const filtroFinitoAdmin = localStorage.getItem('filtroFinitoAdmin') || '';
  const filtroConsegna = localStorage.getItem('filtroConsegna') || '';
  const filtroProgressivo = localStorage.getItem('filtroProgressivo') || '';
  const filtroACorpo = localStorage.getItem('filtroACorpo') === 'true';
  const filtroTrasparente = localStorage.getItem('filtroTrasparente') === 'true';
  const filtroNome = (localStorage.getItem('filtroNome') || '').toLowerCase().trim();
  const filtroTipoCliente = (localStorage.getItem('filtroTipoCliente') || '').trim();
  const filtroUrgente = localStorage.getItem('filtroUrgente') === 'true';
  const filtroTipoLavorazione = (localStorage.getItem('filtroTipoLavorazione') || '').toLowerCase().trim();
  const filtroTipoLinea = (localStorage.getItem('filtroTipoLinea') || '').toLowerCase().trim();
  const filtroRAL1 = (localStorage.getItem('filtroRAL1') || '').toLowerCase().trim();
  const filtroRAL2 = (localStorage.getItem('filtroRAL2') || '').toLowerCase().trim();
  const filtroStandby = localStorage.getItem('filtroStandby') === 'true';

  const datiOrdinati = window.ordinaDati(dati);

  const recordFiltrati = datiOrdinati.filter(item => {
    const nomeMatch = !filtroNome || item.nome_lavoro?.toLowerCase().startsWith(filtroNome);
    const tipoClienteMatch = !filtroTipoCliente || item.tipo_cliente === filtroTipoCliente;
    const urgenteMatch = !filtroUrgente || item.urgente;

    const tipoLav = item.tipo_lavorazione?.trim().toLowerCase() || '';
    const tipoLavMatch = !filtroTipoLavorazione || tipoLav === filtroTipoLavorazione;

    const tipoLinea = item.tipo_linea?.trim().toLowerCase() || '';
    const tipoLineaMatch = !filtroTipoLinea || tipoLinea === filtroTipoLinea;

    const ral1 = item.ral1?.toLowerCase() || '';
    const ral2 = item.ral2?.toLowerCase() || '';
    const ral1Match = !filtroRAL1 || ral1.includes(filtroRAL1);
    const ral2Match = !filtroRAL2 || ral2.includes(filtroRAL2);

    const isSverniciatura = item.tipo_linea?.trim().toLowerCase() === 'sverniciatura';
    const verniceMatch = !filtroVernice || (!item.ordine_vernice && !isSverniciatura);

    const ingressoMatch = !filtroIngresso || formatDateForInput(item.ingresso) === filtroIngresso;
    const smontaggioMatch = !filtroSmontaggio || formatDateForInput(item.smontaggio) === filtroSmontaggio;
    const falegnameriaMatch = !filtroFalegnameria || formatDateForInput(item.falegnameria) === filtroFalegnameria;
    const finitoAdminMatch = !filtroFinitoAdmin || formatDateForInput(item.finito_admin) === filtroFinitoAdmin;
    const consegnaMatch = !filtroConsegna || formatDateForInput(item.consegna) === filtroConsegna;

    const progressivoMatch = !filtroProgressivo || String(item.n_progressivo || '').includes(filtroProgressivo);

    const aCorpoMatch = !filtroACorpo || item.a_corpo;
    const trasparenteMatch = !filtroTrasparente || item.trasparente;

    const filtroNomeVuoto = localStorage.getItem('filtroNomeVuoto') || 'tutti';
    const nomeLavoro = item.nome_lavoro?.trim() || '';

    const nomeVuotoMatch =
      filtroNomeVuoto === 'tutti' ||
      (filtroNomeVuoto === 'vuoti' && nomeLavoro === '') ||
      (filtroNomeVuoto === 'pieni' && nomeLavoro !== '');

    return (
      nomeMatch &&
      tipoClienteMatch &&
      urgenteMatch &&
      tipoLavMatch &&
      tipoLineaMatch &&
      ral1Match &&
      ral2Match &&
      verniceMatch &&
      ingressoMatch &&
      smontaggioMatch &&
      falegnameriaMatch &&
      finitoAdminMatch &&
      consegnaMatch &&
      progressivoMatch &&
      aCorpoMatch &&
      trasparenteMatch &&
      nomeVuotoMatch &&
      (!filtroStandby || item.standby === 1)
    );
  });

  // Aggiorna conteggi
  const totali = calcolaTotali(recordFiltrati);
const testoConteggio = `Sono presenti ${recordFiltrati.length} record. &nbsp;Pezzi = ${totali.pezzi} &nbsp;&nbsp; MQ = ${totali.mq}`;

const divInizio = document.getElementById('conteggio-records-inizio');
const divFine = document.getElementById('conteggio-records-fine');
 
if (divInizio) divInizio.innerHTML = `<span id="conteggio-records-testo">${testoConteggio}</span>`;
if (divFine) divFine.innerHTML = `<span id="conteggio-records-testo">${testoConteggio}</span>`;

  // Genera righe
  recordFiltrati.forEach(item => {
    const isSverniciatura = item.tipo_linea?.trim().toLowerCase() === 'sverniciatura';
    if (item.finito_admin) item.verde = true;

    const totOreFalegn = item.ore_falegnameria !== null
  ? parseFloat(item.ore_falegnameria).toFixed(2)
  : '';

    const totOre = (
      parseFloat(item.ore_smontaggio || 0) +
      parseFloat(item.ore_falegn_extra || 0) +
      parseFloat(item.ore_falegn_rinforzo || 0) +
      parseFloat(item.ore_produzione || 0) +
      parseFloat(item.ore_magazz || 0)
    ).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.urgente !== null ? '<span class="pallino rosso"></span>' : ''}</td>
      <td>${(item.nome_lavoro || '').trim()}</td>
      <td>${item.tipo_cliente}</td>
      <td>${item.tipo_lavorazione}</td>
      <td>${item.tipo_linea}</td>
      <td>${item.azzurro ? '<span class="pallino azzurro"></span>' : ''}</td>
      <td>${item.fucsia ? '<span class="pallino fucsia"></span>' : ''}</td>
      <td>${item.nero || item.finito_sala ? '<span class="pallino nero"></span>' : ''}</td>
      <td>${item.verde ? '<span class="pallino verde"></span>' : ''}</td>
      <td>${item.pagamento ? '✔️' : ''}</td>
      <td>${item.pezzi}</td>
      <td>${isSverniciatura ? '❌' : (item.ral1 || '')}</td>
      <td>${isSverniciatura ? '❌' : (item.ral2 || '')}</td>
      <td>${isSverniciatura ? '❌' : (item.ordine_vernice ? '✔️' : '')}</td>
      <td>${item.metriquadri}</td>
      <td>${item.gita || ''}</td>
      <td>${formatDateLocal(item.ingresso)}</td>
      <td>${formatDateLocal(item.smontaggio)}</td>
      <td>${formatDateLocal(item.falegnameria)}</td>
      <td>${item.finito_sala ? '✔️' : ''}</td>
      <td>${formatDateLocal(item.finito_admin)}</td>
      <td>${formatDateLocal(item.consegna)}</td>
      <td>${formatOre(item.ore_smontaggio)}</td>
      <td>${formatOre(item.ore_falegn_extra)}</td>
      <td>${formatOre(item.ore_falegn_rinforzo)}</td>
      <td style="background-color: ${parseFloat(totOreFalegn) > 0 ? '#ffd965' : 'transparent'}">${totOreFalegn}</td>
      <td>${formatOre(item.ore_produzione)}</td>
      <td>${formatOre(item.ore_magazz)}</td>
      <td style="background-color: ${parseFloat(totOre) > 0 ? '#ffd965' : 'transparent'}">${totOre}</td>
      <td style="background-color: ${!item.consegna ? '#b7e1cd' : 'transparent'}">${item.giorni_trascorsi ?? ''}</td>
<td>${item.giorni_consegna ?? ''}</td>
<td style="background-color: ${parseInt(item.giorni_lavorazione) > 0 ? '#ffd965' : 'transparent'}">${item.giorni_lavorazione ?? ''}</td>
<td style="background-color: ${item.consegna ? '#b7e1cd' : 'transparent'}">${item.giorni_totale ?? ''}</td>
      <td>${item.n_progressivo ?? ''}</td>
      <td>${formatDateLocal(item.urgente)}</td>
      <td>${formatDateLocal(item.viaggio)}</td>
      <td>${item.ufo ?? ''}</td>
      <td>${item.loc ?? ''}</td>
      <td>${item.bolt ?? ''}</td>
      <td>${item.a_corpo ? '✔️' : ''}</td>
      <td>${item.trasparente ? '✔️' : ''}</td>
      <td>${item.f_magazzino ? '✔️' : ''}</td>
      <td>${item.note || ''}</td>
      <td>${item.standby ? '<span class="fermo-icon"></span>' : ''}</td>
      <td>${item.id}</td>
      <td style="white-space: nowrap">
  ${(() => {
    const ruolo = getRuolo();
    const isSverniciatura = item.tipo_linea?.trim().toLowerCase() === 'sverniciatura';
    const ruoliAbilitati = ['admin', 'superadmin', 'amministrazione'];
    let html = '';

    if (!isSverniciatura || ruoliAbilitati.includes(ruolo)) {
      switch (ruolo) {
        case 'superadmin':
          console.log('ID:', item.id, 'Cliente ID:', item.cliente_id);
          html += `<a href="sala_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica sala</a>`;
          html += `<a href="admin_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica admin</a>`;
          html += `<a href="pagam_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica Amm</a>`;
          html += `<button class="btn rosso" onclick="archiviaCliente(${item.id})">Archivia</button>`;
          break;

        case 'admin':
          html += `<a href="admin_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica admin</a>`;
          html += `<button class="btn rosso" onclick="archiviaCliente(${item.id})">Archivia</button>`;
          break;

        case 'sala':
          if (!isSverniciatura) {
            html += `<a href="sala_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica sala</a>`;
          }
          break;

        case 'amministrazione':
          console.log('✅ Sono nel case amministrazione per ID:', item.id);
          html += `<a href="pagam_edit.html?id=${item.id}&ruolo=${ruolo}" class="btn">Modifica Amm</a>`;
          break;

        case 'gestore':
          // Nessun pulsante
          break;
      }
    }

    return html;
  })()}
</td>

    `;
    tbody.appendChild(tr);
  });
}

// funzione per sommare pezzi e mq
function calcolaTotali(recordFiltrati) {
  let sommaPezzi = 0;
  let sommaMq = 0;

  recordFiltrati.forEach(item => {
    const pezzi = parseFloat(item.pezzi) || 0;
    const mq = parseFloat(item.metriquadri) || 0;
    sommaPezzi += pezzi;
    sommaMq += mq;
  });

  return {
    pezzi: sommaPezzi,
    mq: sommaMq.toFixed(2)
  };
}

// calcolo dei totali
function calcolaTotali(recordFiltrati) {
  let sommaPezzi = 0;
  let sommaMq = 0;

  recordFiltrati.forEach(item => {
    const pezzi = parseFloat(item.pezzi) || 0;
    const mq = parseFloat(item.metriquadri) || 0;
    sommaPezzi += pezzi;
    sommaMq += mq;
  });

  return {
    pezzi: sommaPezzi,
    mq: sommaMq.toFixed(2)
  };
}

// ✅ Rende aggiornaTabella disponibile globalmente per ordinamento.js
  window.aggiornaTabella = aggiornaTabella;

function formatDateForInput(d) {
  if (!d) return '';
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
}

function formatOre(val) {
  if (val == null || val === '') return '';
  return parseFloat(val).toFixed(2);
}

function popolaFiltroTipoCliente(dati) {
  const select = document.getElementById('filtro-tipo-cliente');
  if (!select) return;

  const primaOpzione = select.querySelector('option');
  select.innerHTML = '';
  if (primaOpzione) select.appendChild(primaOpzione);

  const tipiUnici = [...new Set(dati.map(d => d.tipo_cliente).filter(Boolean))];
  tipiUnici.sort().forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.textContent = tipo;
    select.appendChild(option);
  });

  const salvato = localStorage.getItem('filtroTipoCliente');
  if (salvato) select.value = salvato;
}

function popolaFiltroTipoLavorazione(dati) {
  const select = document.getElementById('filtro-tipo-lavorazione');
  if (!select) return;

  const primaOpzione = select.querySelector('option');
  select.innerHTML = '';
  if (primaOpzione) select.appendChild(primaOpzione);

  const lavorazioniUniche = [...new Set(dati.map(d => d.tipo_lavorazione).filter(Boolean))];
  lavorazioniUniche.sort().forEach(lav => {
    const option = document.createElement('option');
    option.value = lav;
    option.textContent = lav;
    select.appendChild(option);
  });

  const salvato = localStorage.getItem('filtroTipoLavorazione');
  if (salvato) select.value = salvato;
}

function popolaFiltroTipoLinea(dati) {
  const select = document.getElementById('filtro-tipo-linea');
  if (!select) return;

  const primaOpzione = select.querySelector('option');
  select.innerHTML = '';
  if (primaOpzione) select.appendChild(primaOpzione);

  const tipiUnici = [...new Set(dati.map(d => d.tipo_linea).filter(Boolean))];
  tipiUnici.sort().forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.textContent = tipo;
    select.appendChild(option);
  });

  const salvato = localStorage.getItem('filtroTipoLinea');
  if (salvato) select.value = salvato;
}




//aggiungo la funzione che riconosce il ruolo dell'utente
function getRuolo() {
  const params = new URLSearchParams(window.location.search);
  return params.get('ruolo') || 'sala'; // default: sala
}

function archiviaCliente(clienteId) {
  if (!confirm('Sei sicuro di voler archiviare il nome di questo cliente?')) return;

  fetch(`/api/produzione/archivia/${clienteId}`, {
    method: 'PUT'
  })
  .then(response => {
    if (!response.ok) throw new Error('Errore durante l\'archiviazione');
    alert('Cliente archiviato con successo');
    location.reload();
  })
  .catch(error => {
    console.error('Errore:', error);
    alert('Errore durante l\'archiviazione');
  });
}

