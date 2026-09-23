#!/usr/bin/env bash
# Inline the engine into the page. Edit board/engine.js and board/page.html, never board.html.
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
e=open('engine.js').read(); p=open('page.html').read()
assert '/*__ENGINE__*/' in p
open('../board.html','w').write(p.replace('/*__ENGINE__*/', e))
PY
if command -v node >/dev/null; then node sim.js && POLICY=random node sim.js; fi
