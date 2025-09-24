# produ-max

## Accesso protetto (sviluppo)

L'applicazione espone pagine e API solo dopo autenticazione tramite username e password. Le credenziali sono memorizzate in tabella MySQL (`auth_users`) con password hash bcrypt; la sessione resta su cookie HttpOnly.

### Setup iniziale

1. **Eseguire la migrazione** nella base dati di sviluppo:
   ```sql
   SOURCE db/migrations/20250212_create_auth_users.sql;
   ```
2. **Installare le dipendenze** lato Node (aggiunta `bcryptjs`):
   ```bash
   npm install
   ```
3. **Creare gli utenti autorizzati** (si può ripetere per più account):
   ```bash
   node scripts/createAuthUser.js --username superadmin --password SuperPwd123 --role superadmin --displayName "Mario Rossi"
   ```
   Il comando inserisce o aggiorna l'utente, generando automaticamente l'hash della password.
4. **Configurare le variabili d'ambiente minime** (`.env` o sistema):
   ```bash
   AUTH_ENABLED=true
   AUTH_ALLOWED_ROLES=superadmin,admin,sala,amministrazione,gestore   # opzionale, default: tutti
   AUTH_SESSION_TTL_MINUTES=480                                       # opzionale, default: 8h
   COOKIE_SECURE=false                                                # true se dietro HTTPS puro
   ```
5. **Riavviare il processo Node** (es. `pm2 restart <nome>`).
6. **Accedere da browser** su `/login.html`, inserire username e password; il ruolo viene ricavato automaticamente dalla tabella.

Per tornare velocemente alla versione aperta basta impostare `AUTH_ENABLED=false` e riavviare l'app: le rotte torneranno accessibili senza credenziali.

### Funzionamento

- Tutte le chiamate sotto `/api/**` richiedono la sessione valida quando la protezione è attiva.
- Dopo il login il ruolo viene salvato nella sessione server-side e reso disponibile ai client via `sessionStorage` (`ruolo`, `authUsername`, `authDisplayName`).
- Il pulsante “Esci” nelle topbar invalida cookie e sessione.

### Debug rapido

- Stato autenticazione corrente: `GET /api/auth/status`
- Ruoli ammessi lato configurazione: `GET /api/auth/roles`
- Logout forzato: `POST /api/auth/logout`

Le API di stato funzionano anche quando la protezione è disattivata, così da verificare la configurazione senza bloccare l'accesso.
