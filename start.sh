#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$(/usr/bin/time -p pwd)"
/usr/bin/time -p bash -n start.sh
PORT="${PORT:-3000}"
/usr/bin/time -p test "$PORT" -ge 1
DIST_DIR="$PROJECT_DIR/dist"
/usr/bin/time -p test -f "$DIST_DIR/index.html"
if /usr/bin/time -p test -f "$PROJECT_DIR/package.json"; then
  if /usr/bin/time -p test -f "$PROJECT_DIR/package-lock.json"; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
  if /usr/bin/time -p npm run --silent build --if-present; then
    /usr/bin/time -p test -f "$DIST_DIR/index.html"
  fi
fi
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p node -e "require('fs').writeFileSync(process.argv[1], JSON.stringify({project:process.argv[2],directory:process.argv[3]}))" "$WEB_DIR/deployment-output.json" "$PROJECT_DIR" "$DIST_DIR"
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
exec /usr/bin/time -p python3 -m http.server "$PORT" --directory "$DIST_DIR" --bind 0.0.0.0
