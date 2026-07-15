#!/usr/bin/env bash

set -Eeuo pipefail

# Les actions Git de Plesk peuvent être lancées avec un PATH minimal.
export PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"

script_path="${BASH_SOURCE[0]}"
if [[ "$script_path" != /* ]]; then
  script_path="$PWD/$script_path"
fi
script_dir="${script_path%/*}"
application_root="$(cd "$script_dir/.." && pwd)"
cd "$application_root"

available_node_versions=()
for node_bin in /opt/plesk/node/*/bin; do
  if [[ -x "$node_bin/node" && -x "$node_bin/npm" ]]; then
    node_version="$($node_bin/node --version 2>/dev/null || true)"
    available_node_versions+=("${node_version:-version inconnue} ($node_bin)")
    if "$node_bin/node" -e "const [major, minor] = process.versions.node.split('.').map(Number); const valid = (major === 22 && minor >= 12) || (major === 24 && minor >= 11) || major >= 26; if (!valid) process.exit(1)"; then
      export PATH="$node_bin:$PATH"
      break
    fi
  fi
done

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if (( ${#available_node_versions[@]} )); then
    printf 'Versions Node.js détectées par Plesk : %s\n' "${available_node_versions[*]}" >&2
  else
    echo 'Aucune installation Node.js détectée dans /opt/plesk/node.' >&2
  fi
  echo 'Une version de Node.js compatible est introuvable. Activez Node.js 22, 24 ou 26 dans le Node.js Toolkit de Plesk.' >&2
  exit 1
fi

node -e "const [major, minor] = process.versions.node.split('.').map(Number); const valid = (major === 22 && minor >= 12) || (major === 24 && minor >= 11) || major >= 26; if (!valid) process.exit(1)" || {
  echo "Version de Node.js incompatible : $(node --version). Utilisez Node.js 22.12+, 24.11+ ou 26+." >&2
  exit 1
}

echo "Déploiement avec Node.js $(node --version) et npm $(npm --version)"
npm ci --no-audit --no-fund
npm run build

test -f .output/server/index.mjs
test -f .output/public/_nuxt/builds/latest.json

restart_file="${1:-${PLESK_RESTART_FILE:-../tmp/restart.txt}}"
restart_dir="${restart_file%/*}"
if [[ "$restart_dir" == "$restart_file" ]]; then
  restart_dir='.'
fi
mkdir -p "$restart_dir"
touch "$restart_file"

echo "Déploiement terminé. Redémarrage demandé via $restart_file"
