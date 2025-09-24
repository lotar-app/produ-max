(function initAuthGuard() {
  async function logout(redirectTo = '/login.html') {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (err) {
      console.warn('Errore durante il logout:', err);
    } finally {
      try {
        sessionStorage.removeItem('ruolo');
        sessionStorage.removeItem('authUsername');
        sessionStorage.removeItem('authDisplayName');
      } catch (err) {
        console.warn('Impossibile ripulire la sessione locale:', err);
      }
      window.location.replace(redirectTo);
    }
  }

  function setupLogoutHandler() {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-auth-logout]');
      if (!trigger) return;
      event.preventDefault();
      const redirect = trigger.getAttribute('data-auth-redirect') || '/login.html';
      logout(redirect);
    });
  }
  async function ensureAuth() {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Impossibile verificare lo stato di autenticazione');
      }

      const data = await response.json();
      window.__AUTH_CONTEXT__ = data;

      if (!data.authEnabled) {
        return;
      }

      if (data.authenticated && data.role) {
        try {
          sessionStorage.setItem('ruolo', data.role);
          if (data.username) sessionStorage.setItem('authUsername', data.username);
          if (data.displayName) sessionStorage.setItem('authDisplayName', data.displayName);
        } catch (err) {
          console.warn('Impossibile salvare il ruolo in sessionStorage:', err);
        }
        return;
      }

      const currentUrl = window.location.pathname + window.location.search;
      const redirectParam = encodeURIComponent(currentUrl);
      try {
        sessionStorage.removeItem('ruolo');
        sessionStorage.removeItem('authUsername');
        sessionStorage.removeItem('authDisplayName');
      } catch (err) {
        console.warn('Impossibile ripulire la sessione locale:', err);
      }
      window.location.replace(`/login.html?redirect=${redirectParam}`);
    } catch (err) {
      console.error('Errore controllo autenticazione:', err);
    }
  }

  if (!window.AuthGuard) {
    window.AuthGuard = { logout };
  }

  setupLogoutHandler();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureAuth);
  } else {
    ensureAuth();
  }
})();
