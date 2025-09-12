// menu-loader.js

// ✅ 1. Caricamento del menu laterale da file HTML esterno
fetch('partials/menu.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('menu-container');
    if (container) {
      container.innerHTML = html;
    }
  });

// ✅ 2. Gestione pulsante toggle del menu (solo se presente)
const toggleBtn = document.getElementById('toggle-menu');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const menu = document.getElementById('menu-container');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  });
}

// ✅ 3. Caricamento dinamico dei clienti nella select #cliente_id (se esiste)
const selectCliente = document.getElementById('cliente_id');
if (selectCliente) {
  fetch('/api/clienti')
    .then(res => res.json())
    .then(clienti => {
      clienti.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
      });
    })
    .catch(err => {
      console.error('❌ Errore nel caricamento di cliente_id:', err);
    });
}

// ✅ 4. (Opzionale) Caricamento di tipo cliente se esiste #tipo_cliente_id_menu
// Utile se hai una select diversa nel menu per filtrare o gestire tipo cliente
const selectTipoCliente = document.getElementById('tipo_cliente_id_menu');
if (selectTipoCliente) {
  fetch('/api/tipo-clienti')
    .then(res => res.json())
    .then(tipi => {
      tipi.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nome;
        selectTipoCliente.appendChild(option);
      });
    })
    .catch(err => {
      console.error('❌ Errore nel caricamento tipo_cliente_id_menu:', err);
    });
}