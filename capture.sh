#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the exact CAPTURE_URL into CAPTURE_DIR.
# Exit 75 = temporary navigation/browser infrastructure failure; exit 1 = script/rendering defect.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p pwd
/usr/bin/time -p bash -c 'test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is not set." >&2; exit 1; }'
/usr/bin/time -p bash -c 'test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is not set." >&2; exit 1; }'
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p node --version
RUNTIME_FALLBACK="/home/runner/work/_temp/omgithub-runtime"
RUNTIME_USED="${RUNTIME_DIR:-$RUNTIME_FALLBACK}"
/usr/bin/time -p test -f "$RUNTIME_USED/scripts/default-capture.mjs"
# Run the capture in this script's own browser; never touch the app-server tmux session.
if /usr/bin/time -p env "RUNTIME_DIR=$RUNTIME_USED" "CAPTURE_URL=$CAPTURE_URL" "CAPTURE_DIR=$CAPTURE_DIR" node "$RUNTIME_USED/scripts/default-capture.mjs"; then
  status=0
else
  status=$?
fi
if [[ $status -ne 0 ]]; then
  echo "capture backend exited with status $status" >&2
  exit "$status"
fi
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"
/usr/bin/time -p ls -la "$CAPTURE_DIR"
echo "capture OK: $CAPTURE_DIR/final-desktop.png + final-mobile.png"
