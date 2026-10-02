#!/usr/bin/env bash
# SpekHP startup: install deps, publish deployment output, serve foreground on PORT (default 3000).
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p pwd
PROJECT_ROOT="$(pwd)"
/usr/bin/time -p node --version
/usr/bin/time -p npm --version
if [[ -f package-lock.json ]]; then
  /usr/bin/time -p npm ci --no-audit --no-fund
else
  /usr/bin/time -p npm install --no-audit --no-fund
fi
/usr/bin/time -p test -f public/index.html
/usr/bin/time -p test -f server.js
PORT="${PORT:-3000}"
export PORT
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p node -e "require('fs').writeFileSync(require('path').join(process.argv[1],'deployment-output.json'), JSON.stringify({project:process.argv[2],directory:require('path').join(process.argv[2],'public')}))" "$WEB_DIR" "$PROJECT_ROOT"
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
/usr/bin/time -p node -e "const p=JSON.parse(require('fs').readFileSync(require('path').join(process.argv[1],'deployment-output.json'),'utf8')); if(!p.project||!p.directory) throw new Error('bad deployment-output'); console.log('deployment-output OK: '+p.directory)" "$WEB_DIR"
exec /usr/bin/time -p node server.js
