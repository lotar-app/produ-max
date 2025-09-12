// Centralized environment detection and UI hints
(function () {
  try {
    var host = (window.location && window.location.hostname) || '';
    var isDev = host.includes('dev') || host.includes('localhost') || host.includes('clone');

    // Set environment class ASAP for CSS (topbar color)
    var cls = isDev ? 'env-dev' : 'env-stable';
    if (document && document.documentElement && !document.documentElement.classList.contains(cls)) {
      document.documentElement.classList.add(cls);
    }

    // Prefix page title with environment label
    var label = isDev ? 'SVILUPPO' : 'STABILE';
    var baseTitle = document.title.replace(/^(SVILUPPO|STABILE)\s*·\s*/i, '');
    document.title = label + ' · ' + baseTitle;

    function updateBadge() {
      var badge = document.getElementById('env-badge');
      if (!badge) return;
      badge.textContent = isDev ? 'SVILUPPO' : 'STABILE';
      badge.style.backgroundColor = isDev ? '#c0392b' : '#27ae60';
      badge.style.color = '#fff';
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateBadge);
    } else {
      updateBadge();
    }
  } catch (e) {
    console && console.warn && console.warn('[env.js] Unable to set env UI:', e);
  }
})();
