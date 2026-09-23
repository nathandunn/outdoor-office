# The Outdoor Office

Two parties fight over one small office for eight turns, then their leaders give a final talk. A static
page: no server, no build step at runtime.

## The game

You lead up to four colleagues. Each is a unit on a 21 by 13 floor with a job, four stats (Charm, Guile,
Hustle, Grit), morale, and one job ability on a three-turn cooldown. The desks are in the middle of the
floor, between the parties; each side's supply closets are behind its office and locked to its owner, so
raiding one means going through the people it belongs to. On your turn every unit moves and does one thing:

- **argue** with an adjacent enemy (Charm against Grit; they answer back for half),
- **pickpocket** a card off an adjacent enemy,
- **take a card** from a desk (two per desk, no restock),
- **raid the other side's closet** for two slides of quality 2 or 3,
- **pitch** a neutral (two pitches and they join your crowd; the other side's pitches wear yours down first),
- **use the job ability**: Rally, Prototype, Jam, Counsel, Rumour, Pitch, Injunction, Fetch,
- **bank** carried cards in your own office, where nobody can take them,
- **hire** in the Lobby, or **rig/check the projector** at the Rock.

Carrying three or more cards slows a unit by a tile. A unit at zero morale drops its cards as loot and sulks
for two turns, coming back at 2 morale. From turn 4, holding still costs a point of morale. The last two
turns are **all hands**: anyone broken stays broken, and when time is called every undecided neutral goes
with whichever party has more people standing beside them. All of one side's staff broken at once is a rout.

Money is $3 a turn and does not carry over, plus $2 a break and $1 a recruit. **Contractors** (Runner,
Heavy; $3) leave after two turns. **Consultants** come down $1 each turn nobody buys them, and can be
poached for $2 more than the buyer paid.

The **final talk**: each leader picks three slides without seeing the other's, and they are shown in turns.
A slide of the same taste as the one the room just saw scores nothing. Otherwise a slide scores
`quality x (2 + 3 x fans)`, fans being the crowd and the party who want that taste; enemy units in the room
boo, and there is one heckle to answer.

## Layout

- `index.html` is the game. Do not edit it; it is built.
- `rpg/engine.js` holds the rules and the planner: plain JS, no DOM. `rpg/page.html` is the board and
  panels, `rpg/style.css` the shared look. `cd rpg && python3 build.py ../index.html` inlines all three.
- `rpg/sim.js` is the harness: `POLICY=greedy|random MATCHES=n PARTY=k node rpg/sim.js`. The greedy
  player uses the same planner as the nemesis. Last run: greedy 47W 1T 52L over 100, random 0W 40L,
  about 4.7 breaks a match.
- `board.html` is the earlier board-game version, built from `board/` by `board/build.sh`.
