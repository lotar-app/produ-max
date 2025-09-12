// ✅ Converte stringhe con virgola in numeri con punto
function normalizzaNumero(val) {
  if (typeof val === 'string') {
    val = val.replace(',', '.');
  }
  return val === '' ? null : Number(val);
}

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    alert('ID non specificato');
    const urlParams = new URLSearchParams(window.location.search);
const ruolo = urlParams.get('ruolo');
window.location.href = `vista.html${ruolo ? '?ruolo=' + ruolo : ''}`;
    return;
  }

  document.getElementById('id').value = id;

  // Carica opzioni select
  Promise.all([
    fetch('/api/tipo-clienti').then(res => res.json()),
    fetch('/api/tipo_lavorazione').then(res => res.json()),
    fetch('/api/tipo_linea').then(res => res.json())
  ])
    .then(([clienti, lavorazioni, linee]) => {
      popolaSelect('tipo_cliente_id', clienti);
      popolaSelect('tipo_lavorazione_id', lavorazioni);
      popolaSelect('tipo_linea_id', linee);

      // Carica dati esistenti
      fetch(`/api/produzione/${id}`)
        .then(res => res.json())
        .then(data => {
          document.getElementById('nome').value = data.nome_lavoro || '';

          for (const key in data) {
            const el = document.getElementById(key);
            if (!el) continue;

            if (el.type === 'checkbox') {
              el.checked = !!data[key];
            } else if (el.type === 'date') {
              el.value = formatDateOnly(data[key]);
            } else {
              el.value = data[key] ?? '';
            }
          }

          const aCorpoCheckbox = document.getElementById('a_corpo');
          const trasparenteCheckbox = document.getElementById('trasparente');
          if (aCorpoCheckbox && trasparenteCheckbox) {
            aCorpoCheckbox.addEventListener('change', () => {
              if (aCorpoCheckbox.checked) trasparenteCheckbox.checked = false;
            });
            trasparenteCheckbox.addEventListener('change', () => {
              if (trasparenteCheckbox.checked) aCorpoCheckbox.checked = false;
            });
          }
        });
    });

  // ✅ Salvataggio
  document.getElementById('adminForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const dati = {};
    const form = e.target;

    for (const el of form.elements) {
      if (!el.name) continue;

      if (el.type === 'checkbox') {
        dati[el.name] = el.checked ? 1 : 0;
      } else if (el.type === 'date') {
        dati[el.name] = el.value ? el.value : null;
      } else if (el.type === 'number') {
        dati[el.name] = normalizzaNumero(el.value);
      } else {
        dati[el.name] = el.value || null;
      }
    }

    //debugger;
    //console.log('📦 Dati inviati dal form admin_edit:', dati);
    

    fetch(`/api/produzione/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dati)
    })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t); });
        const ruolo = new URLSearchParams(window.location.search).get('ruolo') || 'admin';
        window.location.href = `vista_dinamica.html?ruolo=${ruolo}&success=true`; 
        
      })
      .catch(err => {
        console.error('❌ Errore:', err);
        alert('Errore nel salvataggio');
      });
  });
});

function popolaSelect(id, dati) {
  const select = document.getElementById(id);
  dati.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.nome || item.descrizione;
    select.appendChild(opt);
  });
}

function formatDateOnly(input) {
  if (!input) return '';
  const date = new Date(input);
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
}