# The Outdoor Office — the board game

The Flipbook Field rules as a board game, with no 3D: a Clue board of rooms and corridors, the
moves as cards, the talks as a sheet. One static page, no build step at runtime.

- `tools/engine.js` holds the rules: pure JS, no DOM. It is the same code the page runs.
- `tools/page.html` is the board, cards and sheets; `/*__ENGINE__*/` marks where the engine goes.
- `tools/build.sh` inlines the engine into `index.html`, then runs the harness.
- `tools/sim.js` is the harness (drive6's shape). Run it as `POLICY=greedy|random MATCHES=n node tools/sim.js`.
  Last run over 32 matches: greedy 14W 3T 15L, random 1W 3T 28L.

Numbers in `A` (top of engine.js) were approximated, not taken from the Godot `arch.gd`.
