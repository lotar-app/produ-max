document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  let ruolo = null;
  try {
    ruolo = sessionStorage.getItem('ruolo');
  } catch (err) {
    console.warn('Impossibile leggere il ruolo dalla sessione:', err);
  }
  if (!ruolo) {
    ruolo = urlParams.get('ruolo') || 'admin';
  }
  try {
    sessionStorage.setItem('ruolo', ruolo);
  } catch (err) {
    console.warn('Impossibile salvare il ruolo:', err);
  }

  if (!id) {
    alert('ID non fornito');
    window.location.href = `vista_dinamica.html?ruolo=${ruolo}`;
    return;
  }

  document.getElementById('id').value = id;

  fetch(`/api/produzione/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Errore nel recupero dati');
      return res.json();
    })
    .then(dati => {
      document.getElementById('nome').textContent = dati.nome_lavoro || '';
      document.getElementById('tipo_cliente_id').textContent = dati.tipo_cliente || '';
      document.getElementById('tipo_lavorazione_id').textContent = dati.tipo_lavorazione || '';
      document.getElementById('tipo_linea_id').textContent = dati.tipo_linea || '';

      document.getElementById('pagamento').checked = !!dati.pagamento;
      document.getElementById('consegna').value = dati.consegna || '';

        // ✅ Nascondi il checkbox "Consegnato oggi" se la data consegna è già valorizzata
        if (dati.consegna) {
          const consegnaBox = document.getElementById('flagConsegnaWrapper');
          const infoMsg = document.getElementById('consegnaInfo');
          if (consegnaBox) consegnaBox.style.display = 'none';
          if (infoMsg) infoMsg.style.display = 'block';
        }
    })
    .catch(err => {
      console.error('Errore caricamento dati:', err);
      alert('Errore caricamento dati');
    });

  // ✅ Salvataggio (ORA dentro DOMContentLoaded)
  document.getElementById('pagamForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const pagamento = document.getElementById('pagamento').checked;
    const flagConsegna = document.getElementById('flagConsegna').checked;
    const consegnaEsistente = document.getElementById('consegna').value;

    const payload = { pagamento };

    if (flagConsegna && !consegnaEsistente) {
      const oggi = new Date().toISOString().split('T')[0];
      payload.consegna = oggi;
    }

    console.log('📦 Payload da inviare:', payload);

    fetch(`/api/produzione/pagamento/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
    window.location.href = `vista_dinamica.html?ruolo=${encodeURIComponent(ruolo)}&success=true`;
      })
      .catch(err => {
        console.error('❌ Errore salvataggio:', err);
        alert('Errore nel salvataggio');
      });
  });
});
