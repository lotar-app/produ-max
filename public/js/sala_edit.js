// FILE: js/sala_edit.js

// Funzione per ottenere l'ID dalla querystring
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Funzione per popolare i dati del form
async function caricaDati(id) {
  const res = await fetch(`/api/produzione/${id}`);
  const data = await res.json();

  document.getElementById('smontaggio').value = data.smontaggio ? data.smontaggio.split('T')[0] : '';
  document.getElementById('falegnameria').value = data.falegnameria ? data.falegnameria.split('T')[0] : '';
  document.getElementById('finito_sala').value = data.finito_sala ? data.finito_sala.split('T')[0] : '';
}

// Salvataggio dati
async function salvaDati(id) {
  const smontaggio = document.getElementById('smontaggio').value;
  const falegnameria = document.getElementById('falegnameria').value;
  const finito_sala = document.getElementById('finito_sala').value;

  const body = {
    smontaggio: smontaggio || null,
    falegnameria: falegnameria || null,
    finito_sala: finito_sala || null
  };

  const res = await fetch(`/api/produzione/sala/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    document.getElementById('successMessage').textContent = '✅ Modifiche salvate con successo';
    document.getElementById('successMessage').style.display = 'block';
    setTimeout(() => window.location.href = 'vista.html', 1500);
  }
}

// Inizializzazione
const id = getIdFromUrl();
if (id) caricaDati(id);

document.getElementById('formSala').addEventListener('submit', e => {
  e.preventDefault();
  salvaDati(id);
});
