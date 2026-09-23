// ==ENGINE== pure rules, no DOM. Same file is inlined into the page and run headless by sim.js.
const TASTE = ['Data', 'Story', 'Gadget', 'Snacks'];
const TASTE_GLYPH = ['#', '¶', '⚙', '☕'];
const PROPS = [
  ['the churn chart', 'the Q3 numbers', 'a heat map', 'the survey results'],
  ['a customer story', 'the origin myth', 'a war story', 'the founder quote'],
  ['the prototype', 'a live demo', 'a shiny widget', 'the headset'],
  ['a box of donuts', 'the cheese plate', 'cold brew', 'a pizza'],
];
const RO = { CEO: 0, ENG: 1, IT: 2, HR: 3, MKT: 4, SALES: 5, LEGAL: 6, INTERN: 7, STAFF: 8 };
const ROLE_NAME = ['CEO', 'Engineer', 'IT', 'HR', 'Marketing', 'Sales', 'Legal', 'Intern', 'Staff'];
const ROLE_TASTES = [[0, 1], [0, 2], [2], [1], [1, 2], [3, 2], [0], [3], [0, 1, 2, 3]];
// charm, guile, hustle, grit
const ROLE_STATS = [[2, 1, 0, 1], [0, 1, 1, 2], [0, 2, 1, 1], [2, 0, 0, 2], [2, 2, 0, 0], [1, 1, 2, 0], [0, 2, 0, 2], [1, 0, 2, 1]];
const ROLE_RULE = [
  'one more seat at your talks',
  'Data and Gadget slides land an extra clap per fan',
  'your projector cannot be rigged',
  'their bullies are turned away at the door',
  'your rumours cool twice as hard',
  'buy from a step further; the stream closes three',
  'your cards cannot be pinched',
  'desks warm one more; interns take any card',
];
const PLAYABLE = [0, 1, 2, 3, 4, 5, 6, 7];
const STAT_NAME = ['Charm', 'Guile', 'Hustle', 'Grit'];
const STAT_WHAT = ['+12% claps a point', 'rumours cool harder, tricks worth more', '+1 step every two points', 'shrugs off 4 boos a point'];
const K = { NEUTRAL: 0, FOLLOWER: 1, WAGE: 2, INFLUENCER: 3, LOVER: 4, HATER: 5, BULLY: 6 };
const KIND_NAME = ['neutral', 'follower', 'wage slave', 'influencer', 'lover', 'hater', 'bully'];
const P = 0, N = 1, NONE = -1;
const A = {
  ROUNDS: 3, MOVES: 4, SLIDES: 3, WARM_COUNT: 3, WARM_AMOUNT: 1.0, CURIOUS_AT: 2.0, CUR_MAX: 3.0,
  STREAM_CLOSE: 2, RUMOUR_CHILL: 1.0, BULLY_FROM: 2, UNDERDOG: 1, FREE_POINTS: 4, STAT_MAX: 5,
  NEUTRALS: 12, WARM_RANGE: 2, DUD: 'a blank slide',
};
const claps = k => k === K.FOLLOWER || k === K.INFLUENCER || k === K.LOVER;
const flippable = k => k === K.FOLLOWER || k === K.INFLUENCER;
const booKind = k => k === K.HATER || k === K.BULLY;
const hecklesFor = r => [1, 2, 2][r - 1] || 2;
const perHeads = r => (r >= 3 ? 2 : 3);
const NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Esme', 'Finn', 'Gus', 'Hana', 'Ines', 'Jo', 'Kit', 'Lars', 'Mina', 'Ned',
  'Opal', 'Pip', 'Quinn', 'Rosa', 'Sol', 'Tam', 'Uma', 'Vic', 'Wren', 'Xavi', 'Yara', 'Zed', 'Bea', 'Cal', 'Dot',
  'Eli', 'Flo', 'Hal', 'Ivy', 'Jem', 'Lou', 'Max', 'Nia', 'Ozzy', 'Pru', 'Rex', 'Sid', 'Tess', 'Val', 'Wes'];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- the board: rooms and corridors ------------------------------------------
const ROOMS = {
  'desk:0': { name: 'Data desk', short: 'Data desk', plan: [0.13, 0.36], taste: 0 },
  'desk:1': { name: 'Story desk', short: 'Story desk', plan: [0.34, 0.36], taste: 1 },
  'desk:2': { name: 'Gadget desk', short: 'Gadget desk', plan: [0.34, 0.62], taste: 2 },
  'desk:3': { name: 'Snacks desk', short: 'Snacks desk', plan: [0.13, 0.62], taste: 3 },
  stream: { name: 'Stream', short: 'Stream', plan: [0.72, 0.84] },
  break: { name: 'Break room', short: 'Break room', plan: [0.87, 0.46] },
  rock: { name: 'The Rock', short: 'The Rock', plan: [0.55, 0.12] },
  lobby: { name: 'Lobby', short: 'Lobby', plan: [0.58, 0.52] },
};
const EDGES = [
  ['desk:0', 'desk:1', 1], ['desk:1', 'desk:2', 1], ['desk:0', 'desk:3', 1], ['desk:3', 'desk:1', 1],
  ['desk:2', 'lobby', 1], ['desk:3', 'stream', 2], ['lobby', 'stream', 1], ['lobby', 'break', 1],
  ['lobby', 'rock', 2], ['stream', 'break', 2], ['stream', 'rock', 2], ['break', 'rock', 2], ['rock', 'desk:2', 2],
];
const ADJ = {};
for (const id in ROOMS) ADJ[id] = [];
for (const [a, b, c] of EDGES) { ADJ[a].push([b, c]); ADJ[b].push([a, c]); }
const HOME_ROOMS = ['desk:0', 'desk:1', 'desk:2', 'desk:3', 'stream', 'break', 'lobby'];

function distances(from, blocked = []) {
  const d = { [from]: 0 };
  const open = [from];
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (d[open[i]] < d[open[bi]]) bi = i;
    const u = open.splice(bi, 1)[0];
    for (const [v, c] of ADJ[u]) {
      if (blocked.includes(v)) continue;
      const nd = d[u] + c;
      if (d[v] === undefined || nd < d[v]) { d[v] = nd; if (!open.includes(v)) open.push(v); }
    }
  }
  return d;
}

function pathTo(from, to, blocked = []) {
  const d = distances(from, blocked);
  if (d[to] === undefined) return [];
  const out = [to];
  let cur = to;
  let guard = 0;
  while (cur !== from && guard++ < 20) {
    let found = false;
    for (const [v, c] of ADJ[cur]) {
      if (d[v] !== undefined && d[v] + c === d[cur] && !blocked.includes(v)) { out.unshift(v); cur = v; found = true; break; }
    }
    if (!found) break;
  }
  return out; // includes from
}

// Interest is a tug of war: warming somebody the other side courted wears them down first.
function warmRule(cur, curFor, amount, by) {
  if (curFor !== NONE && curFor !== by && cur > 0) {
    const left = cur - amount;
    if (left > 0) return [left, curFor];
    if (left === 0) return [0, NONE];
    return [Math.min(-left, A.CUR_MAX), by];
  }
  if (amount < 0) return [Math.max(cur + amount, 0), cur + amount > 0 ? curFor : NONE];
  return [Math.min(cur + amount, A.CUR_MAX), by];
}

class Game {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.rng = mulberry32(this.seed);
    this.people = []; this.nextId = 1; this.usedNames = new Set();
    this.round = 1; this.move = 1;
    this.pos = { 0: 'stream', 1: 'break' };
    this.satchel = { 0: [], 1: [] };
    this.points = { 0: 0, 1: 0 }; this.clapsTotal = { 0: 0, 1: 0 }; this.boosTotal = { 0: 0, 1: 0 };
    this.presented = { 0: false, 1: false }; this.rigged = { 0: false, 1: false }; this.sablog = { 0: [], 1: [] };
    this.roles = { 0: RO.STAFF, 1: RO.STAFF }; this.stats = { 0: [1, 1, 1, 1], 1: [1, 1, 1, 1] }; this.parties = { 0: [], 1: [] };
    this.lastFirst = N; this.lastLeader = NONE; this.leadChanges = 0; this.startFlip = false;
    this.log = []; this.over = false; this.first = P; this.roundCard = null;
    this.resetRoundStats();
  }
  r() { return this.rng(); }
  ri(n) { return Math.floor(this.rng() * n); }
  pick(a) { return a[this.ri(a.length)]; }
  say(side, text) { this.log.push({ side, text, round: this.round, move: this.move }); }
  other(s) { return 1 - s; }
  stat(s, i) { return this.stats[s][i]; }
  has(s, role) { return this.people.some(p => p.side === s && p.role === role && claps(p.kind)); }
  count(s) { let n = 0; for (const p of this.people) if (p.side === s && claps(p.kind)) n++; return n; }
  isCurious(p) { return p.kind === K.NEUTRAL && p.curiosity >= A.CURIOUS_AT; }
  isCuriousFor(p, s) { return this.isCurious(p) && p.curiousFor === s; }
  steps(s) { return 2 + Math.floor(this.stat(s, 2) / 2); }
  resetRoundStats() {
    this.roundStats = { 0: { claps: 0, boos: 0, gained: 0, lost: 0 }, 1: { claps: 0, boos: 0, gained: 0, lost: 0 } };
  }

  pickName() {
    for (let i = 0; i < 40; i++) { const n = this.pick(NAMES); if (!this.usedNames.has(n)) { this.usedNames.add(n); return n; } }
    const f = 'Colleague ' + (this.usedNames.size + 1); this.usedNames.add(f); return f;
  }
  randomRole() {
    const w = [1, 2, 2, 2, 2, 2, 2, 5, 4];
    let t = this.r() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < w.length; i++) { t -= w[i]; if (t < 0) return i; }
    return RO.STAFF;
  }
  addPerson(kind, side, room, role = -1) {
    const r = role >= 0 ? role : this.randomRole();
    const p = { id: this.nextId++, name: this.pickName(), kind, side, room, home: room, role: r,
      taste: this.pick(ROLE_TASTES[r]), curiosity: 0, curiousFor: NONE, resolve: false };
    this.people.push(p);
    return p;
  }

  // cfg: {role, stats:[4], party:[roles]}
  setup(cfg) {
    this.roles[P] = cfg.role; this.stats[P] = cfg.stats.slice(); this.parties[P] = cfg.party.slice();
    const nr = this.pick(PLAYABLE);
    this.roles[N] = nr;
    const ns = ROLE_STATS[nr].slice();
    for (let i = 0; i < A.FREE_POINTS; i++) {
      let k = this.ri(4);
      if (ns[k] >= A.STAT_MAX) k = (k + 1) % 4;
      ns[k]++;
    }
    this.stats[N] = ns;
    this.parties[N] = this.parties[P].map(() => this.pick(PLAYABLE));

    for (const side of [P, N]) {
      this.addPerson(K.HATER, side, this.pick(HOME_ROOMS));
      for (const r of this.parties[side]) this.addPerson(K.FOLLOWER, side, this.pick(HOME_ROOMS), r);
    }
    let ceo = false;
    for (let i = 0; i < A.NEUTRALS; i++) {
      const q = this.addPerson(K.NEUTRAL, NONE, this.pick(HOME_ROOMS));
      if (q.role === RO.CEO) { if (ceo) { q.role = RO.STAFF; q.taste = this.pick(ROLE_TASTES[RO.STAFF]); } ceo = true; }
    }
    this.startFlip = this.r() < 0.5;
    this.placeForRound();
  }

  placeForRound() {
    const swap = (this.round % 2 === 0) !== this.startFlip;
    this.pos = { 0: swap ? 'break' : 'stream', 1: swap ? 'stream' : 'break' };
  }

  reachFrom(s, here, extra = 0) {
    const d = distances(here, [this.pos[this.other(s)]]);
    const out = {};
    for (const id in d) if (d[id] <= this.steps(s) + extra) out[id] = d[id];
    return out;
  }

  demand(s) {
    const d = [0, 0, 0, 0];
    for (const p of this.people) if ((p.side === s && claps(p.kind)) || this.isCuriousFor(p, s)) d[p.taste]++;
    return d;
  }

  // Who a desk visit at [room] warms, nearest first on the board.
  warmTargets(room, side) {
    const d = distances(room);
    const n = A.WARM_COUNT + (this.has(side, RO.INTERN) ? 1 : 0);
    return this.people
      .filter(p => p.kind === K.NEUTRAL && d[p.room] !== undefined && d[p.room] <= A.WARM_RANGE)
      .sort((a, b) => d[a.room] - d[b.room] || (this.isCuriousFor(a, side) ? 1 : 0) - (this.isCuriousFor(b, side) ? 1 : 0) || a.id - b.id)
      .slice(0, n);
  }
  warmPreview(room, side) {
    let fresh = 0, stolen = 0;
    for (const q of this.warmTargets(room, side)) {
      const r = warmRule(q.curiosity, q.curiousFor, A.WARM_AMOUNT, side);
      const wasTheirs = this.isCurious(q) && q.curiousFor !== side;
      const nowMine = r[1] === side && r[0] >= A.CURIOUS_AT;
      if (wasTheirs && !(r[1] !== side && r[0] >= A.CURIOUS_AT)) stolen++;
      if (nowMine && !this.isCuriousFor(q, side)) fresh++;
    }
    return [fresh, stolen];
  }
  warm(p, amount, by) {
    const r = warmRule(p.curiosity, p.curiousFor, amount, by);
    p.curiosity = r[0]; p.curiousFor = r[1];
  }

  closeMax(s) { return A.STREAM_CLOSE + (this.has(s, RO.SALES) ? 1 : 0); }
  chill(s) { const c = A.RUMOUR_CHILL + 0.4 * this.stat(s, 1); return this.has(s, RO.MKT) ? c * 2 : c; }

  poachTargets(side, limit = 2, from = null) {
    const other = this.other(side);
    const d = distances(from || this.pos[side]);
    const out = [];
    for (const p of this.people) {
      if (p.side !== other || !flippable(p.kind) || p.resolve || p.room === 'rock') continue;
      let card = this.satchel[side].findIndex(c => c.taste === p.taste);
      if (card < 0 && p.role === RO.INTERN && this.satchel[side].length > 0) card = 0;
      if (card < 0) continue;
      const prop = this.satchel[side][card];
      out.push({
        id: 'poach:' + p.id, kind: 'poach', station: p.room, target: p.id, card,
        label: 'Buy ' + p.name,
        sub: `${ROLE_NAME[p.role]}, wants ${TASTE[p.taste]}; spend ${prop.name} in the ${ROOMS[p.room].name.toLowerCase()}`,
        enabled: true, why: '', value: 4.2, walk: d[p.room] ?? 99,
      });
    }
    out.sort((a, b) => a.walk - b.walk);
    return out.slice(0, limit);
  }
  threatened(side) { return this.poachTargets(this.other(side), 1).length > 0; }

  // Every legal move for [side], each saying what it would do. The same list feeds
  // the player's cards and the nemesis's choice.
  options(side, fromRoom = '', lookahead = true) {
    const other = this.other(side);
    const demand = this.demand(side);
    const here = fromRoom || this.pos[side];
    const opts = [];

    for (let i = 0; i < 4; i++) {
      const id = 'desk:' + i;
      const w = this.warmPreview(id, side);
      let sub = `take a ${TASTE[i]} card; ${demand[i]} in the room want it`;
      if (w[0] > 0) sub += `; ${w[0]} nearby get curious`;
      if (w[1] > 0) sub += `; steals ${w[1]} from them`;
      opts.push({ id, kind: 'desk', taste: i, station: id, label: `${TASTE[i]} desk`, sub, enabled: true, why: '',
        value: demand[i] + 1.1 * w[0] + 0.7 * w[1] });
    }

    const curious = this.people.filter(p => this.isCuriousFor(p, side) && p.room === 'stream').length;
    const cm = this.closeMax(side);
    opts.push({ id: 'stream', kind: 'stream', station: 'stream', label: 'Stream',
      sub: curious > 0 ? `close up to ${cm} of the ${curious} curious about you there` : 'nobody curious about you there yet; warms them a little',
      enabled: true, why: '', value: Math.min(curious, cm) * 2.6 + (curious === 0 ? 0.4 : 0) });

    const exposed = this.people.filter(p => p.side === side && flippable(p.kind) && !p.resolve).length;
    opts.push({ id: 'break', kind: 'break', station: 'break', label: 'Break room',
      sub: exposed > 0 ? `shield your ${exposed} followers from being bought this round; a wage slave pads the crowd` : 'a wage slave pads the crowd; nothing of yours is exposed',
      enabled: true, why: '', value: 0.5 + (exposed >= 1 && this.threatened(side) ? 2.4 : 0) });

    const haters = this.people.filter(p => p.side === side && p.kind === K.HATER).length;
    if (this.count(side) >= 2 && haters < A.BULLY_FROM) {
      opts.push({ id: 'heckler', kind: 'heckler', station: 'break', label: 'Send a heckler',
        sub: `one of your followers turns sour and boos their every talk; with ${A.BULLY_FROM} they send a bully`,
        enabled: true, why: '',
        value: (this.count(side) >= this.count(other) + 1 ? 1.8 : 0.6) + (haters === A.BULLY_FROM - 1 ? 0.8 : 0) });
    }

    // --- sabotage ---
    const theirHand = this.satchel[other];
    const tastes = [...new Set(theirHand.map(c => c.taste).filter(t => t >= 0))].slice(0, 2);
    for (const t of tastes) {
      const legal = this.has(other, RO.LEGAL);
      opts.push({ id: 'pinch:' + t, kind: 'pinch', taste: t, station: 'desk:' + t, label: `Pinch their ${TASTE[t]} card`,
        sub: `take it out of their hand and into yours; they hold ${theirHand.length}`,
        enabled: !legal, why: legal ? 'their Legal has the desk locked' : '',
        value: 2.6 + 0.4 * theirHand.length + (demand[t] >= 2 ? 0.8 : 0) + 0.3 * this.stat(side, 1) });
    }
    const theirsNear = this.people.filter(p => p.kind === K.NEUTRAL && p.curiousFor === other && p.curiosity > 0 && p.room === 'stream').length;
    if (theirsNear > 0) {
      opts.push({ id: 'rumour', kind: 'rumour', station: 'stream', label: 'Spread a rumour',
        sub: `${theirsNear} by the water were warming to them; cools each by ${this.chill(side).toFixed(1)}`,
        enabled: true, why: '', value: 0.9 * Math.min(theirsNear, 3) + 0.3 * this.stat(side, 1) });
    }
    if (!this.rigged[other] && !this.presented[other] && theirHand.length >= 1 && this.move < A.MOVES) {
      const it = this.has(other, RO.IT);
      opts.push({ id: 'rig', kind: 'rig', station: 'rock', label: 'Rig the projector',
        sub: 'their best slide comes up blank at their talk, unless they spend a move to check it',
        enabled: !it, why: it ? 'their IT has it locked down' : '',
        value: (theirHand.length >= 2 ? 2.4 : 1.0) + 0.3 * this.stat(side, 1) });
    }
    if (this.rigged[side]) {
      opts.push({ id: 'check', kind: 'check', station: 'rock', label: 'Check the projector',
        sub: 'it has been rigged against you; this puts it right', enabled: true, why: '',
        value: this.satchel[side].length >= 2 ? 2.2 : 0.9 });
    }

    for (const t of this.poachTargets(side, 2, here)) opts.push(t);

    const hand = this.satchel[side].length;
    opts.push({ id: 'present', kind: 'present', station: 'rock', label: 'Present now',
      sub: `${hand} slide${hand === 1 ? '' : 's'} in hand; forfeits your remaining moves` + (this.rigged[side] ? '. Projector rigged: your best slide will be blank' : ''),
      enabled: true, why: '', value: hand >= A.SLIDES ? 2.5 : -1 });

    if (here !== 'lobby') {
      opts.push({ id: 'lobby', kind: 'lobby', station: 'lobby', label: 'Walk to the Lobby',
        sub: 'no action; the hub, close to every room', enabled: true, why: '', value: 0.2 });
    }

    // The board has the last word on every card.
    const reach = this.reachFrom(side, here);
    const reachSales = this.has(side, RO.SALES) ? this.reachFrom(side, here, 1) : reach;
    for (const o of opts) if (o.enabled) this.gate(side, o, o.kind === 'poach' ? reachSales : reach, here);

    if (lookahead) {
      for (const o of opts) if (o.enabled && o.kind !== 'present') o.value += 0.5 * this.bestNext(side, o.station);
    }
    return opts;
  }

  gate(side, o, reach, here) {
    const other = this.other(side);
    const room = o.station;
    o.steps = reach[room];
    if (room === this.pos[other]) { o.enabled = false; o.why = 'your nemesis is standing there'; }
    else if (reach[room] === undefined) {
      const far = distances(here, [this.pos[other]])[room];
      o.enabled = false;
      o.why = far !== undefined ? `${far} steps away, you have ${this.steps(side)}` : 'no way through; they are in the doorway';
    }
  }

  bestNext(side, room) {
    let best = 0;
    for (const o of this.options(side, room, false)) {
      if (o.enabled && o.kind !== 'present' && o.kind !== 'lobby') best = Math.max(best, o.value);
    }
    return best;
  }

  // --- doing things ---
  execute(side, opt) {
    const who = side === P ? 'You' : 'They';
    this.pos[side] = opt.station;
    switch (opt.kind) {
      case 'desk': this.actDesk(side, opt.taste); break;
      case 'stream': this.actStream(side); break;
      case 'break': this.actBreak(side); break;
      case 'heckler': this.actHeckler(side); break;
      case 'pinch': this.actPinch(side, opt.taste); break;
      case 'rumour': this.actRumour(side); break;
      case 'rig': this.actRig(side); break;
      case 'check': this.actCheck(side); break;
      case 'poach': this.actPoach(side, opt.target, opt.card); break;
      case 'lobby': this.say(side, `${who} stepped into the Lobby.`); break;
      default: this.say(side, `${who} stood still.`);
    }
  }

  actDesk(side, taste) {
    const prop = { taste, name: this.pick(PROPS[taste]) };
    this.satchel[side].push(prop);
    let fresh = 0;
    for (const q of this.warmTargets('desk:' + taste, side)) {
      const was = this.isCuriousFor(q, side);
      this.warm(q, A.WARM_AMOUNT, side);
      if (this.isCurious(q)) q.room = 'stream';
      if (!was && this.isCuriousFor(q, side)) fresh++;
    }
    this.say(side, side === P ? `You took ${prop.name}. ${fresh} got curious and drifted to the stream.`
      : `They took a ${TASTE[taste]} card. ${fresh} got curious about them.`);
  }

  actStream(side) {
    const cur = this.people.filter(p => this.isCuriousFor(p, side) && p.room === 'stream').sort((a, b) => b.curiosity - a.curiosity);
    if (!cur.length) {
      let n = 0;
      for (const p of this.people) if (p.kind === K.NEUTRAL && p.room === 'stream') { this.warm(p, 0.5, side); n++; }
      this.say(side, side === P ? `Nobody at the water was interested yet. ${n} warmed a little.` : `They loitered at the stream. ${n} warmed a little.`);
      return;
    }
    let taken = 0;
    for (const p of cur) {
      if (taken >= this.closeMax(side)) break;
      p.kind = p.curiosity >= A.CUR_MAX - 0.01 && this.r() < 0.3 ? K.INFLUENCER : K.FOLLOWER;
      p.side = side; p.curiosity = 0; p.curiousFor = NONE; p.room = p.home;
      taken++;
    }
    this.roundStats[side].gained += taken;
    this.say(side, side === P ? `You won over ${taken} at the water.` : `They won over ${taken} at the water.`);
  }

  actBreak(side) {
    this.addPerson(K.WAGE, side, 'break');
    for (const p of this.people) if (p.side === side && flippable(p.kind)) p.resolve = true;
    this.say(side, side === P ? 'Rallied. Your people cannot be bought this round; a wage slave drifted in.'
      : 'They rallied. Nobody of theirs can be bought this round.');
  }

  actHeckler(side) {
    const pool = this.people.filter(p => p.side === side && p.kind === K.FOLLOWER);
    if (!pool.length) return;
    const q = this.pick(pool);
    q.kind = K.HATER;
    this.say(side, side === P ? `${q.name} has gone sour on your behalf.` : `They turned ${q.name} into a heckler.`);
  }

  actPinch(side, taste) {
    const other = this.other(side);
    const i = this.satchel[other].findIndex(c => c.taste === taste);
    if (i < 0) return;
    const card = this.satchel[other].splice(i, 1)[0];
    this.satchel[side].push(card);
    if (side === P) { this.say(P, `You pinched their ${card.name}.`); this.sablog[N].push(`you pinched their ${TASTE[taste]}`); }
    else { this.say(N, `They pinched your ${card.name} right off the desk.`); this.sablog[P].push(`they pinched your ${TASTE[taste]}`); }
  }

  actRumour(side) {
    const other = this.other(side);
    let n = 0;
    for (const p of this.people) {
      if (p.kind === K.NEUTRAL && p.curiousFor === other && p.curiosity > 0 && p.room === 'stream') { this.warm(p, this.chill(side), side); n++; }
    }
    if (side === P) { this.say(P, `A word by the water. ${n} went cold on them.`); this.sablog[N].push(`your rumour cooled ${n}`); }
    else { this.say(N, `They have been talking about you by the water. ${n} of yours went cold.`); this.sablog[P].push(`their rumour cooled ${n} of yours`); }
  }

  actRig(side) {
    this.rigged[this.other(side)] = true;
    this.say(side, side === P ? 'Projector rigged. Their best slide will be blank.' : 'They were at the rock. Your projector is rigged: check it, or present blind.');
  }
  actCheck(side) {
    this.rigged[side] = false;
    this.say(side, side === P ? 'Projector checked and put right.' : 'They checked the projector. Your rig is undone.');
  }
  springRig(side) {
    if (!this.rigged[side]) return null;
    this.rigged[side] = false;
    const h = this.satchel[side];
    if (!h.length) return null;
    const d = this.demand(side);
    let best = 0;
    for (let i = 0; i < h.length; i++) if (h[i].taste >= 0 && d[h[i].taste] > (h[best].taste >= 0 ? d[h[best].taste] : -1)) best = i;
    const lost = h[best];
    h[best] = { taste: -1, name: A.DUD };
    this.say(side, side === P ? `The projector was rigged. Your ${lost.name} is a blank slide.` : `Their projector was rigged. Their ${lost.name} came up blank.`);
    return lost;
  }

  actPoach(side, targetId, card) {
    const t = this.people.find(p => p.id === targetId);
    if (!t || card < 0 || card >= this.satchel[side].length) return;
    const prop = this.satchel[side].splice(card, 1)[0];
    t.kind = K.FOLLOWER; t.side = side;
    this.roundStats[side].gained++; this.roundStats[this.other(side)].lost++;
    this.say(side, side === P ? `${t.name} took ${prop.name} and came over.` : `They bought ${t.name} off you with ${prop.name}.`);
  }

  tickInfluencers(side) {
    for (const p of this.people) {
      if (p.side !== side || p.kind !== K.INFLUENCER) continue;
      const d = distances(p.room);
      const q = this.people.filter(x => x.kind === K.NEUTRAL && !this.isCuriousFor(x, side))
        .sort((a, b) => (d[a.room] ?? 99) - (d[b.room] ?? 99) || a.id - b.id)[0];
      if (!q) continue;
      this.warm(q, A.WARM_AMOUNT, side);
      if (this.isCurious(q)) q.room = 'stream';
    }
  }

  noteLead() {
    const a = this.count(P), b = this.count(N);
    const leader = a > b ? P : b > a ? N : NONE;
    if (leader !== NONE && this.lastLeader !== NONE && leader !== this.lastLeader) this.leadChanges++;
    if (leader !== NONE) this.lastLeader = leader;
  }

  sendBullies() {
    for (const side of [P, N]) {
      const h = this.people.filter(p => p.side === side && p.kind === K.HATER);
      if (h.length >= A.BULLY_FROM) {
        const b = this.pick(h); b.kind = K.BULLY;
        this.say(side, side === N ? `${b.name} has been sent to sit at the front of your talk.` : `${b.name} is off to sit at the front of their talk.`);
      }
    }
  }

  firstMover() {
    const a = this.count(P), b = this.count(N);
    let f;
    if (a > b) f = P; else if (b > a) f = N; else f = this.lastFirst === P ? N : P;
    this.lastFirst = f;
    return f;
  }

  beginRound() {
    this.resetRoundStats();
    for (const p of this.people) p.resolve = false;
    this.presented = { 0: false, 1: false };
    this.sablog = { 0: [], 1: [] };
    if (this.round > 1) this.placeForRound();
    this.move = 1;
  }

  // --- the talk ---
  startTalk(side) {
    const other = this.other(side);
    this.presented[side] = true;
    this.pos[side] = 'rock';
    const hr = this.has(side, RO.HR);
    const audience = [];
    let bounced = 0;
    for (const p of this.people) {
      if (p.side === side && p.kind !== K.NEUTRAL && !booKind(p.kind)) audience.push(p);
      else if (p.side === other && booKind(p.kind)) {
        if (p.kind === K.BULLY && hr) { bounced++; continue; }
        audience.push(p);
      }
    }
    let slots = Math.floor(audience.length / perHeads(this.round));
    if (this.count(side) < this.count(other)) slots += A.UNDERDOG;
    if (this.has(side, RO.CEO)) slots++;
    const d = distances('rock');
    const spectators = this.people.filter(p => this.isCuriousFor(p, side))
      .sort((a, b) => d[a.room] - d[b.room] || b.curiosity - a.curiosity || a.id - b.id).slice(0, Math.max(slots, 0));
    const blanked = this.springRig(side);
    const hand = this.satchel[side].slice();
    const booers = audience.filter(p => p.side === other);
    return {
      side, audience, spectators, hand, played: [], claps: 0, boos: 0, blanked, bounced,
      booers, bully: booers.some(b => b.kind === K.BULLY),
      heckles: booers.length ? hecklesFor(this.round) : 0, hecklesDone: 0, pending: false,
      slidesMax: Math.min(A.SLIDES, hand.length), lines: [], lost: [], won: [], done: false,
    };
  }
  fans(t, taste) {
    let n = 0;
    for (const p of t.audience) if (p.side === t.side && claps(p.kind) && p.taste === taste) n++;
    for (const p of t.spectators) if (p.taste === taste) n++;
    return n;
  }
  slideClaps(t, card) {
    if (card.taste < 0) return 0;
    const f = this.fans(t, card.taste);
    return Math.round((2 + 5 * f) * (1 + 0.12 * this.stat(t.side, 0))) +
      (this.has(t.side, RO.ENG) && (card.taste === 0 || card.taste === 2) ? f : 0);
  }
  heckleOdds(t) {
    const lovers = t.audience.filter(p => p.side === t.side && p.kind === K.LOVER).length;
    return Math.min(0.95, 0.6 + 0.1 * lovers);
  }
  ignoreCost(t) { return Math.max(1, 4 - this.stat(t.side, 3)); }
  playSlide(t, idx) {
    const card = t.hand.splice(idx, 1)[0];
    t.played.push(card);
    const c = this.slideClaps(t, card);
    let b = card.taste < 0 ? 3 : 0;
    for (const bo of t.booers) b += bo.kind === K.BULLY ? 3 : 2;
    t.claps += c; t.boos += b;
    t.lines.push(card.taste < 0 ? `A blank slide. The room stares at the wall. ${b} boos.`
      : `${card.name}: ${this.fans(t, card.taste)} wanted ${TASTE[card.taste]}. ${c} claps${b ? `, ${b} boos` : ''}.`);
    if (t.hecklesDone < t.heckles) t.pending = true;
  }
  resolveHeckle(t, clapBack) {
    t.hecklesDone++; t.pending = false;
    if (clapBack) {
      if (this.r() < this.heckleOdds(t)) { t.claps += 9; t.lines.push('Clapped back. The room roars: +9 claps.'); }
      else {
        t.boos += 5; t.lines.push('The comeback fell flat: +5 boos.');
        if (t.bully) { const q = this.loseOne(t); if (q) t.lines.push(`The bully took ${q.name} with them.`); }
      }
    } else {
      const c = this.ignoreCost(t);
      t.boos += c; t.lines.push(`Let it go: +${c} boos.`);
    }
  }
  loseOne(t) {
    const pool = t.audience.filter(p => p.side === t.side && flippable(p.kind) && !t.lost.includes(p));
    if (!pool.length) return null;
    const q = this.pick(pool); t.lost.push(q); return q;
  }
  aiSlide(t) {
    let best = 0, bw = -1;
    for (let i = 0; i < t.hand.length; i++) { const w = t.hand[i].taste < 0 ? -1 : this.fans(t, t.hand[i].taste); if (w > bw) { bw = w; best = i; } }
    return best;
  }
  finishTalk(t) {
    const side = t.side;
    if (t.bully) { const q = this.loseOne(t); if (q) t.lines.push(`The bully at the front walked off with ${q.name}.`); }
    const C = t.claps, B = t.boos;
    const lovers = t.audience.filter(p => p.side === side && p.kind === K.LOVER).length;
    let n = Math.max(0, Math.floor((B - 4 * this.stat(side, 3) - 0.5 * C) / 8)) - lovers;
    while (n-- > 0) this.loseOne(t);
    const ratio = C / Math.max(C + B, 1);
    const conv = Math.round(t.spectators.length * Math.min(1, Math.max(0, (ratio - 0.35) / 0.5)));
    t.won = t.spectators.slice(0, conv);
    for (const p of t.won) { p.kind = K.FOLLOWER; p.side = side; p.curiosity = 0; p.curiousFor = NONE; p.room = p.home; }
    for (const q of t.lost) { q.kind = K.NEUTRAL; q.side = NONE; q.curiosity = A.CURIOUS_AT - 0.5; q.curiousFor = side; q.resolve = false; q.room = q.home; }
    t.ratio = ratio;
    t.gained = Math.max(C - B, 0);
    this.points[side] += t.gained;
    this.clapsTotal[side] += C; this.boosTotal[side] += B;
    this.roundStats[side].claps += C; this.roundStats[side].boos += B;
    this.roundStats[side].gained += t.won.length; this.roundStats[side].lost += t.lost.length;
    if (ratio > 0.78 && C >= 20) {
      const f = this.people.find(p => p.side === side && p.kind === K.FOLLOWER);
      if (f) { f.kind = K.LOVER; t.lover = f; }
    }
    this.satchel[side] = [];
    this.noteLead();
    t.done = true;
    const who = side === P ? 'Your' : 'Their';
    this.say(side, `${who} talk: ${C} claps, ${B} boos. Won ${t.won.length}, lost ${t.lost.length}.`);
  }

  endRound() {
    for (const p of this.people) if (p.kind === K.BULLY) p.kind = K.HATER;
    this.roundCard = {
      round: this.round, last: this.round >= A.ROUNDS,
      you: { ...this.roundStats[P], people: this.count(P), points: this.points[P] },
      them: { ...this.roundStats[N], people: this.count(N), points: this.points[N] },
    };
  }

  nemesisChoose() {
    let best = null, bv = -Infinity;
    for (const o of this.options(N)) {
      if (!o.enabled) continue;
      if (o.kind === 'present' && this.move < A.MOVES && this.satchel[N].length < A.SLIDES) continue;
      const v = o.value + this.r() * 0.1;
      if (v > bv) { bv = v; best = o; }
    }
    return best || { kind: 'pass', station: this.pos[N], label: 'Wait' };
  }

  result() {
    const a = this.count(P), b = this.count(N);
    let winner = a > b ? P : b > a ? N : NONE;
    if (winner === NONE) winner = this.points[P] > this.points[N] ? P : this.points[N] > this.points[P] ? N : NONE;
    return { you: a, them: b, margin: a - b, winner, leadChanges: this.leadChanges, pts: [this.points[P], this.points[N]] };
  }

  // The whole match. agent answers the player's questions; hooks let a UI watch.
  async run(agent, hooks = {}) {
    const H = async (k, ...a) => { if (hooks[k]) await hooks[k](...a); };
    while (this.round <= A.ROUNDS) {
      this.beginRound();
      const first = this.firstMover();
      this.first = first;
      await H('roundStart', first);
      const order = first === P ? [P, N] : [N, P];
      for (let m = 0; m < A.MOVES; m++) {
        this.move = m + 1;
        for (const side of order) {
          if (this.presented[side]) continue;
          this.turn = side;
          let opt;
          if (side === P) opt = await agent.chooseMove(this.options(P));
          else { opt = this.nemesisChoose(); await H('nemesisMove', opt); }
          if (opt.kind === 'present') {
            this.say(side, side === P ? 'You went to the rock early.' : 'They went to the rock early.');
            await this.runTalk(side, agent, hooks);
          } else this.execute(side, opt);
          this.tickInfluencers(side);
          this.noteLead();
          await H('afterMove', side, opt);
        }
      }
      this.turn = NONE;
      this.sendBullies();
      for (const side of order) if (!this.presented[side]) await this.runTalk(side, agent, hooks);
      this.endRound();
      await H('roundEnd', this.roundCard);
      this.round++;
    }
    this.round = A.ROUNDS;
    this.over = true;
    const res = this.result();
    await H('matchEnd', res);
    return res;
  }

  async runTalk(side, agent, hooks = {}) {
    const H = async (k, ...a) => { if (hooks[k]) await hooks[k](...a); };
    const t = this.startTalk(side);
    await H('talkStart', t);
    while (t.played.length < t.slidesMax) {
      const idx = side === P ? await agent.chooseSlide(t, this) : this.aiSlide(t);
      this.playSlide(t, idx);
      await H('talkUpdate', t);
      if (t.pending) {
        const cb = side === P ? await agent.chooseHeckle(t, this) : false;
        this.resolveHeckle(t, cb);
        await H('talkUpdate', t);
      }
    }
    this.finishTalk(t);
    await H('talkEnd', t);
  }
}
if (typeof module !== 'undefined') module.exports = { Game, A, P, N, NONE, K, RO, PLAYABLE, ROLE_STATS, TASTE, ROOMS, EDGES, distances, pathTo };
// ==/ENGINE==
