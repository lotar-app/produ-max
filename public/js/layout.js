// js/layout.js

export function initLayout() {
  // Inserisce il contenitore e il pulsante toggle se non già presenti
  if (!document.getElementById('menu-container')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toggle-menu';
    toggleBtn.textContent = '☰ Menu';

    const menuDiv = document.createElement('div');
    menuDiv.id = 'menu-container';

    document.body.prepend(toggleBtn);
    document.body.insertBefore(menuDiv, document.body.children[1]);
  }

  // Carica il menu da partials/menu.html
  fetch('partials/menu.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('menu-container').innerHTML = html;
    });

  // Mostra/nasconde il menu al click
  document.getElementById('toggle-menu').addEventListener('click', () => {
    document.getElementById('menu-container').classList.toggle('hidden');
  });
}