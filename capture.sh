#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the exact CAPTURE_URL into
# CAPTURE_DIR. Leaves the app server running. Exit 75 for temporary
# navigation/browser infrastructure failures, 1 for script/rendering defects.
set -euo pipefail
cd "$(dirname "$0")"

/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is not set." >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is not set." >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"

# Run the capture in its own browser instance (closed by the runner).
set +e
/usr/bin/time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs"
status=$?
set -e

if [[ "$status" -ne 0 ]]; then
  echo "Capture run failed with exit $status." >&2
  exit "$status"
fi

# Verify both renders landed and are non-empty; anything else is a defect.
for view in desktop mobile; do
  /usr/bin/time -p test -s "$CAPTURE_DIR/final-$view.png" || { echo "Missing or empty capture: $CAPTURE_DIR/final-$view.png" >&2; exit 1; }
done
/usr/bin/time -p ls -la "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
echo "Captures ready in $CAPTURE_DIR."
