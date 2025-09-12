document.addEventListener('DOMContentLoaded', () => {
  // ✅ Popolamento dinamico dei menu a tendina
  const selezioni = [
    { id: 'tipo_cliente_id', url: '/api/tipo-clienti' },
    { id: 'tipo_lavorazione_id', url: '/api/tipo_lavorazione' },
    { id: 'tipo_linea_id', url: '/api/tipo_linea' }
  ];

  selezioni.forEach(({ id, url }) => {
    const select = document.getElementById(id);
    if (!select) return;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.id;
          option.textContent = opt.nome || opt.descrizione;
          select.appendChild(option);
        });
      })
      .catch(err => console.error(`Errore nel caricamento di ${url}:`, err));
  });

  // ✅ Logica: nascondi/mostra RAL e Vernice se tipo_linea === 4
  const tipoLineaSelect = document.getElementById('tipo_linea_id');
  const sezioneRAL = document.getElementById('sezione_ral');
  const sezioneVernice = document.getElementById('sezione_vernice');

  if (tipoLineaSelect) {
    tipoLineaSelect.addEventListener('change', () => {
      const tipoLineaId = parseInt(tipoLineaSelect.value);
      const disabilita = tipoLineaId === 4;

      sezioneRAL.style.display = disabilita ? 'none' : 'block';
      sezioneVernice.style.display = disabilita ? 'none' : 'block';

      document.getElementById('ral1').disabled = disabilita;
      document.getElementById('ral2').disabled = disabilita;
      document.getElementById('ordine_vernice').disabled = disabilita;

      document.getElementById('ore_smontaggio').value = disabilita ? 0.5 : '';
      document.getElementById('ore_falegnameria').value = '';
    });
  }

  // ✅ Esclusione checkbox a_corpo / trasparente
  const aCorpo = document.getElementById('a_corpo');
  const trasparente = document.getElementById('trasparente');

  if (aCorpo && trasparente) {
    aCorpo.addEventListener('change', () => {
      if (aCorpo.checked) trasparente.checked = false;
    });
    trasparente.addEventListener('change', () => {
      if (trasparente.checked) aCorpo.checked = false;
    });
  }

  // ✅ Autocomplete per campo nome cliente con frecce e invio
  const nomeInput = document.getElementById('nome');
  const suggerimentiBox = document.getElementById('suggerimenti');
  let indiceAttivo = -1;

  nomeInput.addEventListener('input', () => {
    const query = nomeInput.value.trim();
    suggerimentiBox.innerHTML = '';
    indiceAttivo = -1;

    if (query.length < 2) return;

    fetch(`/api/clienti?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        data.forEach((cliente, index) => {
          const div = document.createElement('div');
          div.textContent = cliente.nome;
          div.classList.add('suggestion-item');
          div.addEventListener('click', () => {
            nomeInput.value = cliente.nome;
            suggerimentiBox.innerHTML = '';
            indiceAttivo = -1;
          });
          suggerimentiBox.appendChild(div);
        });
      })
      .catch(err => console.error('Errore nel caricamento nomi:', err));
  });

  nomeInput.addEventListener('keydown', (e) => {
    const items = suggerimentiBox.querySelectorAll('.suggestion-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      indiceAttivo = (indiceAttivo + 1) % items.length;
      evidenziaItem(items);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      indiceAttivo = (indiceAttivo - 1 + items.length) % items.length;
      evidenziaItem(items);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (indiceAttivo >= 0 && indiceAttivo < items.length) {
        nomeInput.value = items[indiceAttivo].textContent;
        suggerimentiBox.innerHTML = '';
        indiceAttivo = -1;
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      suggerimentiBox.innerHTML = '';
      indiceAttivo = -1;
    }
  });

  function evidenziaItem(items) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === indiceAttivo);
    });
  }

  document.addEventListener('click', (e) => {
    if (!suggerimentiBox.contains(e.target) && e.target !== nomeInput) {
      suggerimentiBox.innerHTML = '';
      indiceAttivo = -1;
    }
  });

  // ✅ Salvataggio + redirect (questo era fuori, ora è dentro)
  document.getElementById('produzioneForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const dati = {};

    for (const el of form.elements) {
      if (!el.name) continue;

      let value;

      if (el.type === 'checkbox') {
        value = el.checked ? 1 : 0;
      } else {
        value = el.value || null;
      }

      if (el.name === 'nome' && typeof value === 'string') {
        value = value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      dati[el.name] = value;
    }

    // 👇 FERMA L'ESECUZIONE PRIMA DELL'INVIO
    // debugger;

    fetch('/api/produzione', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dati)
    })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t); });
        document.getElementById('successMessage').textContent = '✅ Inserimento avvenuto con successo';
        document.getElementById('successMessage').style.display = 'block';

        const urlParams = new URLSearchParams(window.location.search);
        const ruolo = urlParams.get('ruolo');
        window.location.href = `vista_dinamica.html${ruolo ? '?ruolo=' + ruolo : ''}`;
      })
      .catch(err => {
        console.error('❌ Errore:', err);
        alert('Errore durante il salvataggio');
      });
  });
});