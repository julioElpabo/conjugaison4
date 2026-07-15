#!/usr/bin/env bash

set -Eeuo pipefail

application_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$application_root"

if ! command -v npm >/dev/null 2>&1; then
  for node_bin in /opt/plesk/node/24/bin /opt/plesk/node/22/bin; do
    if [[ -x "$node_bin/npm" ]]; then
      export PATH="$node_bin:$PATH"
      break
    fi
  done
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Une version de Node.js compatible est introuvable. Activez Node.js 22 ou 24 dans le Node.js Toolkit de Plesk.' >&2
  exit 1
fi

node -e "const [major, minor] = process.versions.node.split('.').map(Number); const valid = (major === 22 && minor >= 12) || (major === 24 && minor >= 11) || major >= 26; if (!valid) process.exit(1)" || {
  echo "Version de Node.js incompatible : $(node --version). Utilisez Node.js 22.12+, 24.11+ ou une branche prise en charge par le projet." >&2
  exit 1
}

echo "Déploiement avec Node.js $(node --version) et npm $(npm --version)"
npm ci --no-audit --no-fund
npm run build

test -f .output/server/index.mjs
test -f .output/public/_nuxt/builds/latest.json

restart_file="${1:-${PLESK_RESTART_FILE:-../tmp/restart.txt}}"
mkdir -p "$(dirname "$restart_file")"
touch "$restart_file"

echo "Déploiement terminé. Redémarrage demandé via $restart_file"
