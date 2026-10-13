#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p bash -n capture.sh
if /usr/bin/time -p test -z "${CAPTURE_URL:-}"; then echo "Set CAPTURE_URL." >&2; exit 1; fi
if /usr/bin/time -p test -z "${CAPTURE_DIR:-}"; then echo "Set CAPTURE_DIR." >&2; exit 1; fi
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p bash -c 'set +e; /usr/bin/time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs"; echo "$?" > "$CAPTURE_DIR/.capture-exit"'
status="$(/usr/bin/time -p cat "$CAPTURE_DIR/.capture-exit")"
/usr/bin/time -p test "$status" -eq 0 || exit "$status"
/usr/bin/time -p test -s "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -s "$CAPTURE_DIR/final-mobile.png"
/usr/bin/time -p ls -l "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
