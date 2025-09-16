#!/usr/bin/env bash
set -euo pipefail

#Configurabili
APP_NAME="${APP_NAME:-produ-prod}"
NODE_ENV="${NODE_ENV:-production}"

#Vai alla root del progetto (cartella che riceve l'rsync)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "[post-deploy] working dir: $(pwd)"
echo "[post-deploy] using pm2 app: $APP_NAME (NODE_ENV=$NODE_ENV)"

if ! command -v pm2 >/dev/null 2>&1; then
echo "[post-deploy] pm2 non trovato; salto il reload (npm i -g pm2 per abilitarlo)"
exit 0
fi

#Se c'è un ecosystem, usalo; altrimenti gestisci server.js direttamente
if ls ecosystem.config.* >/dev/null 2>&1; then
echo "[post-deploy] ecosystem presente: provo startOrReload"
pm2 startOrReload ecosystem.config.* --env "$NODE_ENV" || pm2 start ecosystem.config.* --env "$NODE_ENV"
else
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
echo "[post-deploy] reload $APP_NAME"
pm2 reload "$APP_NAME"
else
echo "[post-deploy] start server.js come $APP_NAME"
pm2 start server.js --name "$APP_NAME"
fi
fi

pm2 save || true
echo "[post-deploy] completato"
