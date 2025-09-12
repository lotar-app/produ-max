console.log('🚀 toggle_manutenzione.js INIZIATO');

(function(){
  function getRuolo(){
    var ruolo = sessionStorage.getItem('ruolo');
    if (!ruolo) {
      const params = new URLSearchParams(window.location.search);
      ruolo = params.get('ruolo') || 'sala';
      sessionStorage.setItem('ruolo', ruolo);
    }
    return ruolo;
  }

  function setupBannerIfNeeded(){
    const ruolo = getRuolo();
    if (ruolo !== 'superadmin') return;

    fetch('/api/manutenzione')
      .then(res => res.json())
      .then(data => {
        if (!data?.attiva) return;

        let attempts = 0;
        function tryAttach(){
          const banner = document.getElementById('banner-manutenzione');
          if (banner) {
            banner.innerText = '⚠️ MODALITÀ MANUTENZIONE ATTIVA (clicca per disattivare)';
            banner.style.backgroundColor = '#f39c12';
            banner.style.color = 'black';
            banner.style.textAlign = 'center';
            banner.style.padding = '10px';
            banner.style.cursor = 'pointer';
            // ensure visible above fixed topnav
            banner.style.position = 'fixed';
            banner.style.top = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.zIndex = '3000';
            banner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';

            // push down the fixed topnav and update global offset
            function applyBannerLayout(){
              var topnav = document.querySelector('.top-nav');
              if (!topnav) return;
              var bh = banner.offsetHeight || 0;
              var th = topnav.offsetHeight || 55;
              topnav.style.top = bh + 'px';
              document.documentElement.style.setProperty('--topnav-h', (th + bh) + 'px');
            }
            applyBannerLayout();
            if (window.requestAnimationFrame) requestAnimationFrame(applyBannerLayout);
            window.addEventListener('resize', applyBannerLayout);

            banner.addEventListener('click', () => {
              fetch('/api/toggle-manutenzione', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                  alert('Modalità manutenzione DISATTIVATA');
                  location.reload();
                })
                .catch(err => console.error('❌ Errore disattivazione manutenzione:', err));
            });
          } else if (attempts++ < 10) {
            setTimeout(tryAttach, 200);
          }
        }
        tryAttach();
      })
      .catch(err => console.error('❌ Errore verifica manutenzione:', err));
  }

  // Event delegation: funziona anche se la topnav viene iniettata dopo
  document.addEventListener('click', (e) => {
    const link = e.target && (e.target.id === 'toggle-manutenzione' ? e.target : e.target.closest && e.target.closest('#toggle-manutenzione'));
    if (!link) return;

    e.preventDefault();
    fetch('/api/toggle-manutenzione', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        alert(`Modalità manutenzione ${data.attiva ? 'ATTIVATA' : 'DISATTIVATA'}`);
        location.reload();
      })
      .catch(err => {
        console.error('❌ Errore attivazione manutenzione:', err);
        alert('Errore durante il cambio stato manutenzione.');
      });
  });

  // Overlay blocco per non‑superadmin (se presente nella pagina)
  function setupOverlayIfNeeded(){
    const ruolo = getRuolo();
    if (ruolo === 'superadmin') return;
    fetch('/api/manutenzione')
      .then(res => res.json())
      .then(data => {
        if (data.attiva) {
          const overlay = document.getElementById('overlay-manutenzione');
          if (overlay) overlay.style.display = 'block';
        }
      })
      .catch(() => {});
  }

  function init(){
    console.log('🔧 toggle_manutenzione.js init - ruolo:', getRuolo());
    setupBannerIfNeeded();
    setupOverlayIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
