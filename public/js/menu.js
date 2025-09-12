// menu.js – Gestione apertura menu top (toggle e caricamento contenuto dinamico)

document.addEventListener('DOMContentLoaded', function () {
  const toggleMenu = document.getElementById('toggle-menu');
  const menuContainer = document.getElementById('menu-container');

  if (!toggleMenu || !menuContainer) return;

  // Toggle visibilità del menu
  toggleMenu.addEventListener('click', () => {
    menuContainer.classList.toggle('hidden');
  });

  // Ricava il ruolo dalla query string
  const params = new URLSearchParams(window.location.search);
  const ruolo = params.get('ruolo') || 'guest';

  // Caricamento dinamico del menu HTML da partials in base al ruolo
  fetch(`partials/menu_${ruolo}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`Menu per ruolo "${ruolo}" non trovato`);
      return res.text();
    })
    .then(html => {
      menuContainer.innerHTML = html;

      // 🔸 Evidenzia voce attiva in base alla pagina corrente
      const currentPage = window.location.pathname.split('/').pop();
      const links = menuContainer.querySelectorAll('a');

      links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });
    })
    .catch(err => {
      console.error('Errore caricamento menu per ruolo:', err);
    });
});