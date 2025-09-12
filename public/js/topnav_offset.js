// Shared helper to apply top-nav offset consistently across pages
// Usage: call setupTopnavOffset(placeholderElement?) right after injecting the topnav HTML
(function(){
  function setupTopnavOffset(placeholder){
    try{
      document.body.classList.add('has-topnav');

      function applyTopnavOffset(){
        var root = document.documentElement;
        var topnav = (placeholder && placeholder.querySelector && placeholder.querySelector('.top-nav')) || document.querySelector('.top-nav');
        var th = (topnav && topnav.offsetHeight) ? topnav.offsetHeight : 55; // fallback validated height
        var banner = document.getElementById('banner-manutenzione');
        var bh = (banner && banner.offsetParent !== null && banner.offsetHeight) ? banner.offsetHeight : 0;
        var total = th + bh;
        root.style.setProperty('--topnav-h', total + 'px');
      }

      // initial + next frame (after render)
      applyTopnavOffset();
      if (window.requestAnimationFrame) requestAnimationFrame(applyTopnavOffset);

      // on resize
      window.addEventListener('resize', applyTopnavOffset);

      // observe changes to placeholder size/content if available
      if (placeholder && 'ResizeObserver' in window) {
        try{
          var ro = new ResizeObserver(applyTopnavOffset);
          ro.observe(placeholder);
        }catch(e){ /* no-op */ }
      }

      // safety after late-loading assets (icons/fonts)
      setTimeout(applyTopnavOffset, 400);
    }catch(err){
      console.error('[topnav_offset] Errore applicazione offset:', err);
    }
  }

  // expose
  window.setupTopnavOffset = setupTopnavOffset;
})();
