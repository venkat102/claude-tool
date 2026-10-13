#!/bin/sh
# Open a Jarvis SPA from a checkout or git worktree in real Chrome (through Playwright) and run
# one check script against it.
#
#   run.sh <frontend-dir> <check-script.mjs> [port]
#
#   <frontend-dir>   the `frontend/` of the tree under test (a worktree's is fine)
#   <check-script>   an .mjs that drives the page with the `playwright` library (see example.mjs);
#                    it reads its address from the BASE environment variable
#   [port]           the dev server's port, 8117 by default. It must be FREE: another session
#                    may be serving a different tree on the default 8080, and a check against
#                    that proves nothing about this tree. The run stops if the port is taken.
#
# What it takes care of:
# - `npm ci` must already have been run in <frontend-dir> AND in its sibling `wiki-graph-core/`
#   (the dev server imports it); this script says so if either is missing.
# - A worktree is not inside a bench, so `src/socket.js`'s import of the bench's
#   common_site_config.json cannot resolve. The dev server is started with a wrapper config
#   (vite.wrapper.config.mjs) that points that import at a stand-in file.
# - The two helper files are copied into <frontend-dir> for the run (module resolution needs
#   them there) and removed afterwards. Nothing is left in the tree.
# - Frappe is NOT needed: the check script answers the API calls itself (page.route).
#
# The check script's stdout lines starting with PASS, FAIL, RESULT, SHOT, PROBE, URL or ERRORS
# are printed; everything else is dropped. Exit code 1 if the server did not start.
HERE=$(cd "$(dirname "$0")" && pwd)
F=$1
C=$2
PORT=${3:-8117}
[ -n "$F" ] && [ -n "$C" ] || { echo "usage: run.sh <frontend-dir> <check-script.mjs> [port]"; exit 2; }
[ -d "$F/node_modules" ] || { echo "ERRORS run 'npm ci' in $F first"; exit 1; }
[ -d "$F/../wiki-graph-core/node_modules" ] || { echo "ERRORS run 'npm ci' in $F/../wiki-graph-core first"; exit 1; }
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then echo "ERRORS port $PORT is already in use"; exit 1; fi
TMP=${TMPDIR:-/tmp}/ui-browser-check-$$
mkdir -p "$TMP"
printf '{"socketio_port": 9000, "webserver_port": 8000}\n' > "$TMP/common_site_config.json"
NAME=zz_ui_check_$$.mjs; CFG=zz_vite_ui_$$.config.mjs
cp "$HERE/vite.wrapper.config.mjs" "$F/$CFG"
cp "$C" "$F/$NAME"
cd "$F" || exit 1
# frappe-ui's Vite plugin derives the dev port from the bench web port: 8080 + (web port - 8000).
WEB=$((8000 + PORT - 8080))
UI_CHECK_SITE_CONFIG="$TMP/common_site_config.json" FRAPPE_WEB_SERVER_PORT=$WEB \
  node node_modules/vite/bin/vite.js --config $CFG --strictPort > "$TMP/vite.out" 2>&1 &
VITE=$!
i=0
until curl -s -m 2 -o /dev/null "http://localhost:$PORT/" || [ $i -ge 30 ]; do sleep 1; i=$((i+1)); done
if ! grep -q "localhost:$PORT" "$TMP/vite.out"; then
  echo "ERRORS dev server did not start on $PORT"; tail -5 "$TMP/vite.out"
  kill $VITE 2>/dev/null; rm -f "$F/$CFG" "$F/$NAME"; exit 1
fi
BASE="http://localhost:$PORT" timeout 300 node "$NAME" 2>&1 | grep -E "^(URL|ERRORS|PASS|FAIL|RESULT|SHOT|PROBE)|Error" | cut -c1-600
kill $VITE 2>/dev/null
rm -f "$F/$CFG" "$F/$NAME"
grep -n "rror" "$TMP/vite.out" | grep -v "    at \|ECONNREFUSED\|proxy error" | cut -c1-240 | sort -u | head -4
rm -rf "$TMP"
