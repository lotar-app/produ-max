(function () {
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const queryRuolo = params.get('ruolo');
    const storedRuolo = sessionStorage.getItem('ruolo');
    const ruolo = storedRuolo || queryRuolo || 'gestore';

    if (!storedRuolo && queryRuolo) {
      sessionStorage.setItem('ruolo', queryRuolo);
    } else if (!storedRuolo && !queryRuolo) {
      sessionStorage.setItem('ruolo', ruolo);
    }

    if (!id) {
      alert('ID lavorazione mancante');
      return;
    }

    mostraRuoloUtente(ruolo);
    caricaTopnav(ruolo);
    caricaDettaglio(id);
    setupEventi(id, ruolo);
  }

  function mostraRuoloUtente(ruolo) {
    const spanRuolo = document.getElementById('ruolo-utente');
    if (spanRuolo) spanRuolo.textContent = ruolo;
    const spanUtente = document.getElementById('utente-loggato');
    if (spanUtente) {
      const nome = sessionStorage.getItem('authDisplayName') || sessionStorage.getItem('authUsername');
      spanUtente.textContent = nome || '—';
    }
  }

  function caricaTopnav(ruolo) {
    fetch(`partials/topnav_${ruolo}.html`)
      .then(res => {
        if (!res.ok) throw new Error(`Topnav ${ruolo} non trovata (${res.status})`);
        return res.text();
      })
      .then(html => {
        const placeholder = document.getElementById('top-menu-placeholder');
        if (!placeholder) return;
        placeholder.innerHTML = html;
        if (window.setupTopnavOffset) window.setupTopnavOffset(placeholder);
      })
      .catch(err => console.error('Errore caricamento topnav gestore:', err));
  }

  function caricaDettaglio(id) {
    fetch(`/api/produzione/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Errore caricamento dati (${res.status})`);
        return res.json();
      })
      .then(data => {
        document.getElementById('info-id').textContent = data.id;
        document.getElementById('info-nome').textContent = data.nome_lavoro || '—';
        document.getElementById('info-tipo-cliente').textContent = data.tipo_cliente || '—';
        document.getElementById('info-tipo-lavorazione').textContent = data.tipo_lavorazione || '—';
        document.getElementById('info-tipo-linea').textContent = data.tipo_linea || '—';
        document.getElementById('info-pezzi').textContent = data.pezzi != null ? data.pezzi : '—';

        const ordineCheckbox = document.getElementById('ordine-vernice');
        const fermoCheckbox = document.getElementById('fermo');
        const viaggioInput = document.getElementById('viaggio');

        if (ordineCheckbox) ordineCheckbox.checked = !!data.ordine_vernice;
        if (fermoCheckbox) fermoCheckbox.checked = !!data.standby;
        if (viaggioInput) viaggioInput.value = normalizzaDataPerInput(data.viaggio);
      })
      .catch(err => {
        console.error('Errore caricamento dettaglio gestore:', err);
        alert('Errore nel recupero della lavorazione');
      });
  }

  function setupEventi(id, ruolo) {
    const form = document.getElementById('gestore-form');
    if (form) {
      form.addEventListener('submit', (event) => salva(event, id, ruolo));
    }

    const annullaBtn = document.getElementById('annulla-btn');
    if (annullaBtn) {
      annullaBtn.addEventListener('click', () => {
        window.location.href = `vista_dinamica.html?ruolo=${ruolo}`;
      });
    }
  }

  function salva(event, id, ruolo) {
    event.preventDefault();
    const ordineCheckbox = document.getElementById('ordine-vernice');
    const fermoCheckbox = document.getElementById('fermo');
    const viaggioInput = document.getElementById('viaggio');
    const messaggio = document.getElementById('messaggio');

    const payload = {
      ordine_vernice: !!(ordineCheckbox && ordineCheckbox.checked),
      standby: !!(fermoCheckbox && fermoCheckbox.checked),
      viaggio: viaggioInput && viaggioInput.value ? viaggioInput.value : null
    };

    fetch(`/api/produzione/gestore/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Errore salvataggio (${res.status})`);
        if (messaggio) {
          messaggio.textContent = '✅ Modifiche salvate con successo';
          messaggio.style.display = 'block';
        }
        setTimeout(() => {
          window.location.href = `vista_dinamica.html?ruolo=${ruolo}&success=true`;
        }, 600);
      })
      .catch(err => {
        console.error('Errore salvataggio gestore:', err);
        alert('Errore durante il salvataggio delle modifiche');
      });
  }

  function normalizzaDataPerInput(valore) {
    if (!valore) return '';
    if (typeof valore === 'string' && valore.includes('T')) {
      return valore.split('T')[0];
    }
    const parsed = new Date(valore);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return valore;
  }
})();
