Release preparata per produzione-stabile (2.1 fix topnav)

Cutover atomico suggerito (rollback semplice):
1) Verificare che il vhost punti a /var/www/produzione-stabile (directory o symlink).
2) Preparare backup rapido dell'attuale cartella:
   mv /var/www/produzione-stabile /var/www/produzione-stabile.prev.$(date +%Y%m%d-%H%M%S)
   ln -s "/var/www/releases/produzione-stabile-20250910-155134Z-2.1-fix-topnav" /var/www/produzione-stabile
3) Ricaricare il servizio web (nginx/apache) o svuotare cache proxy/CDN.
4) Verifica: vista_dinamica.html?ruolo=superadmin|admin|sala
5) Rollback: ripuntare il symlink alla dir .prev in caso di problemi.

Nota: questa release rimuove l'uso dei vecchi partial menu_*.html in vista_dinamica.js.
