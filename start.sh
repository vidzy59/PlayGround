#!/usr/bin/env bash
# PonselArena startup: install deps, build static dist, publish deployment
# output, then serve the API + static frontend in the foreground on PORT.
set -euo pipefail
cd "$(dirname "$0")"

/usr/bin/time -p node --version
/usr/bin/time -p npm --version

# Install dependencies when node_modules is missing or package.json changed.
if [[ ! -f node_modules/.install-stamp ]] || [[ package.json -nt node_modules/.install-stamp ]]; then
  /usr/bin/time -p npm install --no-audit --no-fund
  /usr/bin/time -p mkdir -p node_modules
  /usr/bin/time -p touch node_modules/.install-stamp
else
  echo "Dependencies up to date, skipping npm install."
fi

# Build the static snapshot served as the deployment output directory.
# (The live server below serves these same files plus the /api backend.)
/usr/bin/time -p rm -rf dist
/usr/bin/time -p mkdir -p dist
/usr/bin/time -p cp index.html styles.css app.js dist/
/usr/bin/time -p test -f dist/index.html

# Publish deployment metadata for the controller (worker metadata only).
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p node -e "const fs=require('fs'),path=require('path');const out=path.join(process.argv[1],'deployment-output.json');const payload={project:process.cwd(),directory:path.join(process.cwd(),'dist')};fs.writeFileSync(out,JSON.stringify(payload));console.log(fs.readFileSync(out,'utf8'));" "$WEB_DIR"

/usr/bin/time -p node --check server.js

# Serve in the foreground; the launcher supervises this process in tmux.
PORT="${PORT:-3000}"
export PORT
exec /usr/bin/time -p node server.js
