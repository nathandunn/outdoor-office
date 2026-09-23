#!/usr/bin/env bash
# Inline the engine into the page. Edit tools/engine.js and tools/page.html, never index.html.
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
e=open('engine.js').read(); p=open('page.html').read()
assert '/*__ENGINE__*/' in p
open('../index.html','w').write(p.replace('/*__ENGINE__*/', e))
PY
if command -v node >/dev/null; then node sim.js && POLICY=random node sim.js; fi
