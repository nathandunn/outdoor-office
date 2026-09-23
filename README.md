# The Outdoor Office

Two parties fight over an office for twelve turns, then their leaders give a final talk. A static page:
no server, no build step at runtime.

## The game

You lead up to four colleagues. Each one is a unit on a 31 by 19 floor plan with a job, four stats
(Charm, Guile, Hustle, Grit), morale, and one job ability on a three-turn cooldown. On your turn every
unit moves up to its Hustle and does one thing:

- **argue** with an adjacent enemy (Charm against Grit; they answer back for half),
- **pickpocket** a card off an adjacent enemy,
- **take a card** from a desk (Data, Story, Gadget, Snacks; desks restock slowly),
- **raid a supply closet** for two slides of quality 2 or 3,
- **pitch** a neutral (two pitches and they join your crowd; the other side's pitches wear yours down first),
- **use the job ability**: Rally, Prototype, Jam, Counsel, Rumour, Pitch, Injunction, Fetch,
- **hire help** in the Lobby, or **rig/check the projector** at the Rock.

A unit at zero morale is demoralised: its cards drop on the floor as loot and it sulks in the car park
for three turns. All of one side's staff in the car park at once is a **rout**, and the match ends.

**Contractors** (Runner $3, Heavy $4) are units that leave after four turns. **Consultants** give a
standing rule for the match; the other side can poach one for two more than you paid. Money: $1 a turn,
$2 a break, $1 a recruit.

If nobody is routed, both leaders give a **final talk** with every card their party still holds, up to
five slides. A slide scores `quality × (2 + 3 × fans)`, where fans are the crowd and the party who want
that taste; enemy units in the room boo.

## Layout

- `index.html` is the game. Do not edit it; it is built.
- `rpg/engine.js` holds the rules and the AI: plain JS, no DOM. `rpg/page.html` is the board and panels,
  `rpg/style.css` the shared look. `cd rpg && python3 build.py ../index.html` inlines all three.
- `rpg/sim.js` is the harness: `POLICY=greedy|random MATCHES=n PARTY=k node rpg/sim.js`. The greedy
  player uses the same planner as the nemesis. Last run: greedy 52W 48L over 100, random 0W 40L,
  about 3.5 breaks a match.
- `board.html` is the earlier board-game version, built from `board/` by `board/build.sh`.
