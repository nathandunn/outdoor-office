// ==ENGINE== The Outdoor Office, party battle. Pure rules, no DOM; the page and sim.js both run this file.
const TASTE = ['Data', 'Story', 'Gadget', 'Snacks'];
const TASTE_GLYPH = ['#', '¶', '⚙', '☕'];
const PROPS = [
  ['the churn chart', 'the Q3 numbers', 'a heat map', 'the survey results'],
  ['a customer story', 'the origin myth', 'a war story', 'the founder quote'],
  ['the prototype', 'a live demo', 'a shiny widget', 'the headset'],
  ['a box of donuts', 'the cheese plate', 'cold brew', 'a pizza'],
];
const GOLD = ['the board deck', 'the leaked roadmap', 'the award photo', 'the viral clip', 'the secret sauce', 'the 10x chart'];
const RO = { CEO: 0, ENG: 1, IT: 2, HR: 3, MKT: 4, SALES: 5, LEGAL: 6, INTERN: 7, STAFF: 8 };
const ROLE_NAME = ['CEO', 'Engineer', 'IT', 'HR', 'Marketing', 'Sales', 'Legal', 'Intern', 'Staff'];
const ROLE_TASTES = [[0, 1], [0, 2], [2], [1], [1, 2], [3, 2], [0], [3], [0, 1, 2, 3]];
// charm, guile, hustle, grit
const ROLE_STATS = [[2, 1, 0, 1], [0, 1, 1, 2], [0, 2, 1, 1], [2, 0, 0, 2], [2, 2, 0, 0], [1, 1, 2, 0], [0, 2, 0, 2], [1, 0, 2, 1]];
const PLAYABLE = [0, 1, 2, 3, 4, 5, 6, 7];
// What each job is for, and what it costs you. Stats and the ability do the rest.
const JOB_PRO = [
  'Charm and Grit both: argues well and takes it. Rally moves the whole party.',
  'Knows gadgets: Gadget cards they take are quality 2, and as leader, Gadget slides land an extra clap per fan. Prototype makes a slide from nothing.',
  'Knows gadgets too, same as the Engineer. Jam knocks a card out of an enemy hand from four tiles away.',
  'Tough, and the only healer: Counsel puts six morale back.',
  'Rumour hits everyone within two tiles at once; the best crowd-control on the floor.',
  'Charm plus Hustle: fast, and Pitch wins the undecided from three tiles away.',
  'Grit and Guile: hard to break, good at picking pockets. Injunction pins an enemy for a turn.',
  'Fastest legs in the office, and Fetch takes a card without walking to the desk.',
];
const JOB_CON = [
  'Slow. No Hustle at all.',
  'No Charm: loses arguments they start.',
  'No Charm either, and little morale.',
  'Slow, and no Guile: never a crit, poor pickpocket.',
  'No Grit: the lowest morale of any job, and the easiest to break.',
  'No Grit: breaks fast if caught.',
  'Slow, and no Charm to argue with.',
  'Weak and easily broken, and everything they carry drops when they are.',
];
const STAT_NAME = ['Charm', 'Guile', 'Hustle', 'Grit'];
const STAT_WHAT = ['hits harder in an argument, lands slides', 'crits, pickpocketing', '+1 move every two points', 'more morale, takes less'];
const ABILITY = [
  { name: 'Rally', what: 'allies within 3 tiles who have not moved yet get 2 extra tiles this turn' },
  { name: 'Prototype', what: 'build a Gadget slide, quality 2' },
  { name: 'Jam', what: 'an enemy within 4 drops a card and their ability goes on cooldown' },
  { name: 'Counsel', what: 'an ally within 2, or yourself, regains 6 morale' },
  { name: 'Rumour', what: 'every enemy within 2 tiles loses 3 morale' },
  { name: 'Pitch', what: 'somebody undecided within 3 tiles warms to you by 2' },
  { name: 'Injunction', what: 'an enemy within 4 cannot move on their next turn' },
  { name: 'Fetch', what: 'take a card from any desk within 6 tiles' },
];
// Consultants stand in the Lobby. Three pitches and they work for you; the other side can pitch them back.
const CONSULTANTS = [
  { id: 'data', name: 'The Data Whisperer', what: 'Data slides land half again as hard at the final talk' },
  { id: 'spin', name: 'Spin Doctor', what: '+1 damage on every argument you start' },
  { id: 'agile', name: 'Agile Coach', what: '+1 move for all your units' },
  { id: 'pr', name: 'Crisis PR', what: 'your demoralised come back after 1 turn, not 2' },
  { id: 'hunt', name: 'Headhunter', what: 'every pitch warms one more' },
  { id: 'keynote', name: 'Keynote Coach', what: '+3 claps a slide at the final talk' },
];
// Contractors stand in the Lobby too. One pitch and they join your party for two turns, then go back to waiting.
const CONTRACTORS = [
  { id: 'runner', name: 'Runner', stats: [0, 1, 5, 1], morale: 6, what: 'fast legs, weak argument; fetches loot' },
  { id: 'heavy', name: 'Heavy', stats: [3, 0, 1, 3], morale: 10, what: 'slow, loud, hard to shout down; blocks a door' },
];
const CONSULT_AT = 3;
const LOBBY_SPOTS = [[10, 10], [8, 11], [12, 11], [9, 10], [11, 10]];
const P = 0, N = 1, NONE = -1;
const A = {
  TURNS: 8, W: 21, H: 13, SULK: 2, CD: 3, CARRY: 4, SLIDES: 3, JOIN_AT: 2, DESK_STOCK: 2,
  CONTRACT_TURNS: 2, FREE_POINTS: 4, STAT_MAX: 5, DUD: 'a blank slide',
  HEAVY_LOAD: 3, HOLD_COST_FROM: 4, FUSE: 2,
};
const NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Esme', 'Finn', 'Gus', 'Hana', 'Ines', 'Jo', 'Kit', 'Lars', 'Mina', 'Ned',
  'Opal', 'Pip', 'Quinn', 'Rosa', 'Sol', 'Tam', 'Uma', 'Vic', 'Wren', 'Xavi', 'Yara', 'Zed', 'Bea', 'Cal', 'Dot',
  'Eli', 'Flo', 'Hal', 'Ivy', 'Jem', 'Lou', 'Max', 'Nia', 'Ozzy', 'Pru', 'Rex', 'Sid', 'Tess', 'Val', 'Wes'];
const DESKS = { D: 0, S: 1, G: 2, K: 3 };
const WALK = new Set(['.', 'R', 'L', 'a', 'b']);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (x, y) => x + ',' + y;
const man = (a, b, x, y) => Math.abs(a - x) + Math.abs(b - y);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The floor, drawn once for the left half and mirrored, so neither side has the better office.
// Small on purpose: the desks are in the middle, between the two parties, and the closets are behind them.
function buildMap() {
  const W = A.W, H = A.H;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const mir = c => (c === 'a' ? 'b' : c);
  const set = (x, y, c) => { g[y][x] = c; g[y][W - 1 - x] = mir(c); };
  const hline = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, '#'); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, '#'); };
  hline(0, 10, 0); hline(0, 10, H - 1); vline(0, 0, H - 1);
  // your office: a wall with a three-tile doorway in the middle
  vline(6, 1, 4); vline(6, 8, 11);
  // the supply closets, in the corners behind each office: only the other side may raid them
  set(1, 1, 'C'); set(1, 11, 'C');
  // the desks, in the middle of the floor, with low partitions to fight around
  set(8, 2, 'D'); set(8, 10, 'S'); set(10, 4, 'G'); set(10, 8, 'K');
  set(8, 5, '#'); set(8, 7, '#');
  // the Rock at the top, the Lobby at the bottom
  set(10, 1, 'R'); set(10, 11, 'L');
  for (const [x, y] of [[4, 6], [4, 5], [4, 7], [3, 6], [5, 6]]) set(x, y, 'a');
  return g;
}
const SPAWN_N = [[4, 2], [4, 10], [7, 3], [7, 9], [9, 6]];

// Interest is a tug of war: pitching someone the other side has been courting wears that down first.
function warmRule(cur, curFor, amount, by) {
  if (curFor !== NONE && curFor !== by && cur > 0) {
    const left = cur - amount;
    if (left > 0) return [left, curFor];
    if (left === 0) return [0, NONE];
    return [-left, by];
  }
  return [cur + amount, by];
}

class Game {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.rng = mulberry32(this.seed);
    this.map = buildMap();
    this.units = []; this.neutrals = []; this.loot = {}; this.stock = {}; this.nextId = 1; this.used = new Set();
    this.crowd = { 0: [], 1: [] };
    this.bank = { 0: [], 1: [] };
    this.rigged = { 0: false, 1: false };
    this.breaks = { 0: 0, 1: 0 };
    this.turn = 1; this.side = P; this.first = N; this.log = []; this.over = false; this.winner = NONE; this.how = '';
    for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (DESKS[this.map[y][x]] !== undefined) this.stock[key(x, y)] = A.DESK_STOCK;
  }
  r() { return this.rng(); }
  ri(n) { return Math.floor(this.rng() * n); }
  pick(a) { return a[this.ri(a.length)]; }
  say(side, text) { this.log.push({ side, text, turn: this.turn }); }
  other(s) { return 1 - s; }
  name() {
    for (let i = 0; i < 50; i++) { const n = this.pick(NAMES); if (!this.used.has(n)) { this.used.add(n); return n; } }
    return 'Temp ' + this.nextId;
  }
  has(side, id) { return this.neutrals.some(n => n.kind === 'consultant' && n.cid === id && n.side === side); }
  consultants() { return this.neutrals.filter(n => n.kind === 'consultant'); }
  tile(x, y) { return x < 0 || y < 0 || x >= A.W || y >= A.H ? '#' : this.map[y][x]; }
  active(side) { return this.units.filter(u => u.side === side && u.sulk === 0 && !u.gone); }
  unitAt(x, y) { return this.units.find(u => u.x === x && u.y === y && u.sulk === 0 && !u.gone); }
  neutralAt(x, y) { return this.neutrals.find(n => n.x === x && n.y === y); }
  free(x, y) { return WALK.has(this.tile(x, y)) && !this.unitAt(x, y) && !this.neutralAt(x, y); }

  // --- setup ---
  mkUnit(side, job, stats, leader, kind = 'staff', extra = {}) {
    const grit = stats[3];
    const u = {
      id: this.nextId++, side, job, stats: stats.slice(), leader, kind,
      name: leader ? (side === P ? 'You' : 'Your nemesis') : kind === 'staff' ? this.name() : extra.name,
      taste: job >= 0 ? this.pick(ROLE_TASTES[job]) : this.ri(4),
      max: extra.morale || 6 + 2 * grit + (leader ? 3 : 0), morale: 0, x: -1, y: -1, cards: [], cd: 0,
      moved: false, acted: false, sulk: 0, rooted: 0, gone: false, expires: extra.expires || 0, bonus: 0,
    };
    u.morale = u.max;
    this.units.push(u);
    return u;
  }
  spawnTiles(side) {
    const out = [];
    const c = side === P ? 'a' : 'b';
    for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (this.map[y][x] === c) out.push([x, y]);
    return out;
  }
  placeNear(u, sx, sy) {
    const seen = new Set([key(sx, sy)]);
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (this.free(x, y)) { u.x = x; u.y = y; return true; }
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (!seen.has(k) && this.tile(nx, ny) !== '#') { seen.add(k); q.push([nx, ny]); }
      }
    }
    return false;
  }
  memberStats(job) {
    const s = ROLE_STATS[job].slice();
    const order = [0, 1, 2, 3].sort((a, b) => s[b] - s[a]);
    s[order[0]]++; s[order[1]]++;
    return s;
  }
  // cfg: {role, stats:[4], party:[jobs]}
  setup(cfg) {
    this.jobs = { 0: cfg.role };
    const nr = this.pick(PLAYABLE);
    this.jobs[N] = nr;
    const ns = ROLE_STATS[nr].slice();
    for (let i = 0; i < A.FREE_POINTS; i++) { let k = this.ri(4); if (ns[k] >= A.STAT_MAX) k = (k + 1) % 4; ns[k]++; }
    const parties = { 0: cfg.party.slice(), 1: cfg.party.map(() => this.pick(PLAYABLE)) };
    this.parties = parties;
    for (const side of [P, N]) {
      const tiles = this.spawnTiles(side);
      const lead = this.mkUnit(side, side === P ? cfg.role : nr, side === P ? cfg.stats : ns, true);
      [lead.x, lead.y] = tiles[0];
      parties[side].forEach((job, i) => { const u = this.mkUnit(side, job, this.memberStats(job), false); [u.x, u.y] = tiles[i + 1]; });
    }
    for (const [x, y] of SPAWN_N) {
      for (const xx of [x, A.W - 1 - x]) {
        const role = this.pick([0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8]);
        this.neutrals.push({ id: this.nextId++, kind: 'n', name: this.name(), role, taste: this.pick(ROLE_TASTES[role]), x: xx, y, amt: 0, for: NONE });
      }
    }
    // The hired help waits in the Lobby: three consultants and two contractors.
    const pool = CONSULTANTS.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = this.ri(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    let spot = 0;
    for (const c of pool.slice(0, 3)) {
      const [x, y] = LOBBY_SPOTS[spot++];
      this.neutrals.push({ id: this.nextId++, kind: 'consultant', cid: c.id, name: c.name, what: c.what, role: RO.STAFF, taste: this.ri(4), x, y, amt: 0, for: NONE, side: NONE });
    }
    for (const c of CONTRACTORS) this.addContractorNpc(c, LOBBY_SPOTS[spot++]);
    this.startTurn(this.first);
  }
  addContractorNpc(c, at) {
    const [sx, sy] = at || this.lobby();
    const n = { id: this.nextId++, kind: 'contractor', cid: c.id, name: c.name, what: c.what, role: RO.STAFF, taste: this.ri(4), x: -1, y: -1, amt: 0, for: NONE };
    const seen = new Set([key(sx, sy)]);
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (this.free(x, y) && this.tile(x, y) !== 'L') { n.x = x; n.y = y; break; }
      for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (!seen.has(k) && this.tile(nx, ny) !== '#') { seen.add(k); q.push([nx, ny]); } }
    }
    if (n.x >= 0) this.neutrals.push(n);
    return n;
  }

  // --- movement ---
  moveOf(u) {
    if (u.rooted > 0) return 0;
    return Math.max(1, 3 + Math.floor(u.stats[2] / 2) + (this.has(u.side, 'agile') ? 1 : 0) + u.bonus - (u.cards.length >= A.HEAVY_LOAD ? 1 : 0));
  }
  // Tiles this unit can end on, with step counts. Allies can be walked through; enemies and neutrals cannot.
  reach(u, fromX = u.x, fromY = u.y, range = null) {
    const mv = range === null ? (u.moved ? 0 : this.moveOf(u)) : range;
    const dist = { [key(fromX, fromY)]: 0 };
    const prev = {};
    const q = [[fromX, fromY]];
    while (q.length) {
      const [x, y] = q.shift();
      const d = dist[key(x, y)];
      if (d >= mv) continue;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (dist[k] !== undefined || !WALK.has(this.tile(nx, ny)) || this.neutralAt(nx, ny)) continue;
        const o = this.unitAt(nx, ny);
        if (o && o.side !== u.side) continue;
        dist[k] = d + 1; prev[k] = key(x, y); q.push([nx, ny]);
      }
    }
    const out = {};
    for (const k in dist) {
      const [x, y] = k.split(',').map(Number);
      const o = this.unitAt(x, y);
      if (!o || o === u) out[k] = dist[k];
    }
    return { tiles: out, prev };
  }
  pathTo(u, x, y) {
    const { prev } = this.reach(u);
    const out = [];
    let k = key(x, y);
    while (k && k !== key(u.x, u.y)) { out.unshift(k.split(',').map(Number)); k = prev[k]; }
    return out;
  }
  moveUnit(u, x, y) {
    if (u.moved || (x === u.x && y === u.y)) { u.moved = true; return; }
    const { tiles } = this.reach(u);
    if (tiles[key(x, y)] === undefined) return;
    u.from = [u.x, u.y];
    u.x = x; u.y = y; u.moved = true;
    this.pickUp(u);
  }
  undoMove(u) {
    if (!u.from || u.acted) return;
    [u.x, u.y] = u.from; u.from = null; u.moved = false;
  }
  pickUp(u) {
    const k = key(u.x, u.y);
    const pile = this.loot[k];
    if (!pile || !pile.length) return 0;
    let n = 0;
    while (pile.length && u.cards.length < A.CARRY) { u.cards.push(pile.shift()); n++; }
    if (!pile.length) delete this.loot[k];
    if (n) { u.from = null; this.say(u.side, `${u.name} picked up ${n} card${n === 1 ? '' : 's'} off the floor.`); }
    return n;
  }
  adj(x, y) { return DIRS.map(([dx, dy]) => [x + dx, y + dy]); }

  // --- what a unit can do where it stands ---
  dmgOf(a, d) { return Math.max(1, Math.round(2 + 1.5 * a.stats[0] - 0.75 * d.stats[3])) + (this.has(a.side, 'spin') ? 1 : 0); }
  counterOf(d, a) { return Math.max(1, Math.floor((Math.max(1, Math.round(2 + 1.5 * d.stats[0] - 0.75 * a.stats[3]))) / 2)); }
  pickChance(a) { return Math.min(0.85, 0.3 + 0.1 * a.stats[1]); }
  demand(side) {
    const d = [0, 0, 0, 0];
    for (const n of this.crowd[side]) d[n.taste]++;
    for (const u of this.active(side)) d[u.taste]++;
    return d;
  }
  fuse() { return this.turn > A.TURNS - A.FUSE; }
  // Your own supplies are locked to you; only the other side's closets can be raided.
  raidable(side, x) { return side === P ? x > Math.floor(A.W / 2) : x < Math.floor(A.W / 2); }
  onHome(u) { return this.tile(u.x, u.y) === (u.side === P ? 'a' : 'b'); }
  pitchAmt(u, base = 1) { return base + (u.stats[0] >= 3 ? 1 : 0) + (this.has(u.side, 'hunt') ? 1 : 0); }
  joinAt(n) { return n.kind === 'consultant' ? CONSULT_AT : n.kind === 'contractor' ? 1 : A.JOIN_AT; }
  wouldJoin(n, side, amt) { const r = warmRule(n.amt, n.for, amt, side); return r[1] === side && r[0] >= this.joinAt(n); }

  actions(u) {
    const out = [];
    if (u.acted || u.sulk || u.gone) return out;
    const other = this.other(u.side);
    const near = this.adj(u.x, u.y);
    for (const [x, y] of near) {
      const e = this.unitAt(x, y);
      if (e && e.side === other) {
        const d = this.dmgOf(u, e);
        out.push({ kind: 'confront', target: e.id, x, y, label: `Argue with ${e.name}`,
          sub: `${d}–${d + 1} morale off their ${e.morale}${d >= e.morale ? ', breaks them' : `; they answer back for ${this.counterOf(e, u)}`}` });
        if (e.cards.length) out.push({ kind: 'pickpocket', target: e.id, x, y, label: `Pickpocket ${e.name}`,
          sub: `${Math.round(100 * this.pickChance(u))}% to lift one of their ${e.cards.length} card${e.cards.length === 1 ? '' : 's'}` });
      }
      const t = this.tile(x, y);
      if (DESKS[t] !== undefined && u.cards.length < A.CARRY && this.stock[key(x, y)] > 0) {
        out.push({ kind: 'desk', x, y, taste: DESKS[t], label: `Take a ${TASTE[DESKS[t]]} card`, sub: `${this.stock[key(x, y)]} left on this desk; ${this.demand(u.side)[DESKS[t]]} of yours want ${TASTE[DESKS[t]]}${DESKS[t] === 2 && this.gadgetHand(u) ? '; quality 2 in these hands' : ''}` });
      }
      if (t === 'C' && this.raidable(u.side, x)) out.push({ kind: 'closet', x, y, label: 'Raid their supply closet', sub: 'two good slides, quality 2 or 3; first come, first served' });
      const n = this.neutralAt(x, y);
      if (n) {
        const amt = this.pitchAmt(u);
        if (n.kind === 'consultant') {
          if (n.side !== u.side) out.push({ kind: 'pitch', target: n.id, x, y, label: `${n.side === other ? 'Poach' : 'Woo'} ${n.name}`,
            sub: `consultant: ${n.what}; ${this.wouldJoin(n, u.side, amt) ? 'comes over to you' : `warms by ${amt} of ${CONSULT_AT}`}` });
        } else if (n.kind === 'contractor') {
          out.push({ kind: 'pitch', target: n.id, x, y, label: `Sign the ${n.name}`, sub: `${n.what}; joins your party for ${A.CONTRACT_TURNS} turns` });
        } else {
          out.push({ kind: 'pitch', target: n.id, x, y, label: `Pitch ${n.name}`,
            sub: `${ROLE_NAME[n.role]}, wants ${TASTE[n.taste]}; ${this.wouldJoin(n, u.side, amt) ? 'becomes your follower' : `warms by ${amt}`}` });
        }
      }
    }
    if (u.cd === 0 && u.job >= 0 && u.kind === 'staff') for (const a of this.abilityTargets(u)) out.push(a);
    if (this.onHome(u) && u.cards.length) out.push({ kind: 'bank', label: `Bank ${u.cards.length} card${u.cards.length === 1 ? '' : 's'}`, sub: 'left in your office: safe from pickpockets and drops, and still yours at the talk' });
    if (this.tile(u.x, u.y) === 'R') {
      if (!this.rigged[other] && this.turn < A.TURNS) out.push({ kind: 'rig', label: 'Rig their projector', sub: 'their best slide comes up blank at the final talk, unless they check it' });
      if (this.rigged[u.side]) out.push({ kind: 'check', label: 'Check your projector', sub: 'it has been rigged; this puts it right' });
    }
    out.push({ kind: 'wait', label: 'Hold', sub: this.turn >= A.HOLD_COST_FROM && u.morale > 1 ? 'do nothing, and lose 1 morale for it' : 'do nothing more this turn' });
    return out;
  }

  abilityTargets(u) {
    const other = this.other(u.side);
    const ab = ABILITY[u.job];
    const within = (list, r) => list.filter(v => man(u.x, u.y, v.x, v.y) <= r);
    const base = { kind: 'ability', ability: u.job };
    const out = [];
    switch (u.job) {
      case RO.CEO: {
        const allies = within(this.active(u.side), 3).filter(v => v !== u && !v.moved);
        if (allies.length) out.push({ ...base, label: `${ab.name}`, sub: `${allies.length} nearby get 2 more tiles this turn` });
        break;
      }
      case RO.ENG:
        if (u.cards.length < A.CARRY) out.push({ ...base, label: ab.name, sub: ab.what });
        break;
      case RO.IT:
        for (const e of within(this.active(other), 4)) out.push({ ...base, target: e.id, x: e.x, y: e.y, label: `${ab.name} ${e.name}`, sub: `${e.cards.length ? 'they drop a card; ' : ''}their ability waits ${A.CD} turns` });
        break;
      case RO.HR:
        for (const v of within(this.active(u.side), 2)) if (v.morale < v.max) out.push({ ...base, target: v.id, x: v.x, y: v.y, label: `${ab.name} ${v === u ? 'yourself' : v.name}`, sub: `back up to ${Math.min(v.max, v.morale + 6)} of ${v.max}` });
        break;
      case RO.MKT: {
        const hit = within(this.active(other), 2);
        if (hit.length) out.push({ ...base, label: ab.name, sub: `${hit.length} enemy within 2 lose 3 morale each` });
        break;
      }
      case RO.SALES:
        for (const n of this.neutrals.filter(n => man(u.x, u.y, n.x, n.y) <= 3 && n.kind !== 'contractor' && !(n.kind === 'consultant' && n.side === u.side))) {
          const amt = this.pitchAmt(u, 2);
          out.push({ ...base, target: n.id, x: n.x, y: n.y, label: `${ab.name} ${n.name}`, sub: this.wouldJoin(n, u.side, amt) ? (n.kind === 'consultant' ? 'comes over to you' : 'becomes your follower') : `warms by ${amt}` });
        }
        break;
      case RO.LEGAL:
        for (const e of within(this.active(other), 4)) if (!e.rooted) out.push({ ...base, target: e.id, x: e.x, y: e.y, label: `${ab.name} on ${e.name}`, sub: 'they cannot move on their next turn' });
        break;
      case RO.INTERN: {
        if (u.cards.length >= A.CARRY) break;
        const seen = new Set();
        for (const k in this.stock) {
          const [x, y] = k.split(',').map(Number);
          const t = DESKS[this.tile(x, y)];
          if (this.stock[k] > 0 && man(u.x, u.y, x, y) <= 6 && !seen.has(t)) { seen.add(t); out.push({ ...base, x, y, taste: t, label: `${ab.name} a ${TASTE[t]} card`, sub: `from the desk ${man(u.x, u.y, x, y)} tiles away` }); }
        }
        break;
      }
    }
    return out;
  }

  byId(id) { return this.units.find(v => v.id === id) || this.neutrals.find(v => v.id === id); }

  act(u, a) {
    if (u.acted) return;
    u.acted = true; u.moved = true; u.from = null;
    const other = this.other(u.side);
    const t = a.target !== undefined ? this.byId(a.target) : null;
    switch (a.kind) {
      case 'confront': {
        let d = this.dmgOf(u, t) + this.ri(2);
        const crit = this.r() < 0.05 * u.stats[1];
        if (crit) d *= 2;
        this.say(u.side, `${u.name} argued with ${t.name}: ${d} morale${crit ? ', a devastating point' : ''}.`);
        this.hit(t, d, u.side);
        if (!t.sulk && !t.gone && man(u.x, u.y, t.x, t.y) === 1) {
          const c = this.counterOf(t, u);
          this.say(t.side, `${t.name} answered back: ${c}.`);
          this.hit(u, c, t.side);
        }
        break;
      }
      case 'pickpocket':
        if (this.r() < this.pickChance(u) && t.cards.length && u.cards.length < A.CARRY) {
          const c = t.cards.splice(this.ri(t.cards.length), 1)[0];
          u.cards.push(c);
          this.say(u.side, `${u.name} lifted ${c.name} off ${t.name}.`);
        } else this.say(u.side, `${u.name} tried to pick ${t.name}'s pocket and got nothing.`);
        break;
      case 'desk': this.takeFromDesk(u, a.x, a.y); break;
      case 'closet': {
        this.map[a.y][a.x] = 'c';
        const got = [];
        for (let i = 0; i < 2; i++) { const c = { taste: this.ri(4), q: this.r() < 0.35 ? 3 : 2, name: this.pick(GOLD) }; got.push(c); }
        for (const c of got) { if (u.cards.length < A.CARRY) u.cards.push(c); else (this.loot[key(u.x, u.y)] ||= []).push(c); }
        this.say(u.side, `${u.name} raided a supply closet: ${got.map(c => `${c.name} (${TASTE[c.taste]}, q${c.q})`).join(', ')}.`);
        break;
      }
      case 'pitch': this.pitch(u, t, this.pitchAmt(u)); break;
      case 'ability': this.useAbility(u, a, t); break;
      case 'bank': this.bank[u.side].push(...u.cards); this.say(u.side, `${u.name} banked ${u.cards.length} card${u.cards.length === 1 ? '' : 's'} in the office.`); u.cards = []; break;
      case 'wait': if (this.turn >= A.HOLD_COST_FROM && u.morale > 1) u.morale--; break;
      case 'rig': this.rigged[other] = true; this.say(u.side, u.side === P ? 'You rigged their projector.' : 'Somebody has been at your projector.'); break;
      case 'check': this.rigged[u.side] = false; this.say(u.side, `${u.name} checked the projector and put it right.`); break;
      default: break;
    }
    this.checkRout();
  }
  lobby() { for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (this.map[y][x] === 'L') return [x, y]; return [15, 9]; }
  gadgetHand(u) { return u.job === RO.ENG || u.job === RO.IT; }
  takeFromDesk(u, x, y) {
    const t = DESKS[this.tile(x, y)];
    this.stock[key(x, y)]--;
    const c = { taste: t, q: t === 2 && this.gadgetHand(u) ? 2 : 1, name: this.pick(PROPS[t]) };
    u.cards.push(c);
    this.say(u.side, `${u.name} took ${c.name}.`);
  }
  pitch(u, n, amt) {
    const r = warmRule(n.amt, n.for, amt, u.side);
    n.amt = r[0]; n.for = r[1];
    const mine = u.side === P ? 'your' : 'their';
    if (n.kind === 'contractor') {
      const c = CONTRACTORS.find(c => c.id === n.cid);
      this.neutrals = this.neutrals.filter(x => x !== n);
      const v = this.mkUnit(u.side, -1, c.stats, false, 'contractor', { name: c.name, morale: c.morale, expires: this.turn + A.CONTRACT_TURNS });
      v.cid = c.id;
      this.placeNear(v, n.x, n.y);
      v.moved = v.acted = true;
      this.say(u.side, `${u.name} signed the ${c.name} for ${mine} party.`);
      return;
    }
    if (n.for === u.side && n.amt >= this.joinAt(n)) {
      if (n.kind === 'consultant') {
        if (n.side === u.side) return;
        const was = n.side;
        n.side = u.side; n.amt = CONSULT_AT;
        this.say(u.side, was === NONE ? `${n.name} now consults for ${mine} side.` : `${n.name} was poached: now consulting for ${mine} side.`);
      } else {
        this.neutrals = this.neutrals.filter(x => x !== n);
        this.crowd[u.side].push(n);
        this.say(u.side, `${n.name} (${ROLE_NAME[n.role]}, ${TASTE[n.taste]}) is now ${mine} follower.`);
      }
    } else this.say(u.side, `${u.name} pitched ${n.name}${n.kind === 'consultant' ? ` (${n.amt} of ${CONSULT_AT})` : ''}.`);
  }
  useAbility(u, a, t) {
    u.cd = A.CD;
    const other = this.other(u.side);
    switch (u.job) {
      case RO.CEO: for (const v of this.active(u.side)) if (v !== u && !v.moved && man(u.x, u.y, v.x, v.y) <= 3) v.bonus = 2; this.say(u.side, `${u.name} rallied the team: two more tiles for everyone who has not moved.`); break;
      case RO.ENG: u.cards.push({ taste: 2, q: 2, name: 'a working prototype' }); this.say(u.side, `${u.name} built a prototype.`); break;
      case RO.IT: {
        t.cd = A.CD;
        if (t.cards.length) { const c = t.cards.splice(this.ri(t.cards.length), 1)[0]; (this.loot[key(t.x, t.y)] ||= []).push(c); this.say(u.side, `${u.name} jammed ${t.name}; ${c.name} hit the floor.`); }
        else this.say(u.side, `${u.name} jammed ${t.name}.`);
        break;
      }
      case RO.HR: t.morale = Math.min(t.max, t.morale + 6); this.say(u.side, `${u.name} counselled ${t === u ? 'themself' : t.name}.`); break;
      case RO.MKT: {
        const hit = this.active(other).filter(e => man(u.x, u.y, e.x, e.y) <= 2);
        this.say(u.side, `${u.name} started a rumour. ${hit.length} took it personally.`);
        for (const e of hit) this.hit(e, 3, u.side);
        break;
      }
      case RO.SALES: this.pitch(u, t, this.pitchAmt(u, 2)); break;
      case RO.LEGAL: t.rooted = 1; this.say(u.side, `${u.name} served ${t.name} an injunction.`); break;
      case RO.INTERN: this.takeFromDesk(u, a.x, a.y); break;
    }
  }
  hit(t, d, bySide) {
    if (t.sulk || t.gone) return;
    t.morale -= d;
    if (t.morale > 0) return;
    t.morale = 0;
    if (t.cards.length) { (this.loot[key(t.x, t.y)] ||= []).push(...t.cards); }
    const dropped = t.cards.length;
    t.cards = [];
    this.breaks[bySide]++;
    if (t.kind === 'contractor') { t.gone = true; this.say(t.side, `${t.name} quit on the spot${dropped ? ', dropping ' + dropped + ' cards' : ''}.`); }
    else {
      t.sulk = this.fuse() ? 99 : this.has(t.side, 'pr') ? 1 : A.SULK;
      this.say(t.side, `${t.name} is demoralised and gone to sulk in the car park${dropped ? `, dropping ${dropped} card${dropped === 1 ? '' : 's'}` : ''}${this.fuse() ? '. Too late in the day to come back' : ''}.`);
    }
    t.lx = t.x; t.ly = t.y; t.x = -1; t.y = -1;
  }
  checkRout() {
    if (this.over) return;
    for (const side of [P, N]) {
      const staff = this.units.filter(u => u.side === side && u.kind === 'staff');
      if (staff.length && staff.every(u => u.sulk > 0)) {
        this.over = true; this.winner = this.other(side); this.how = 'rout';
        this.say(this.other(side), side === N ? 'Their whole party is in the car park. The office is yours.' : 'Your whole party is sulking in the car park. They take the office.');
      }
    }
  }

  // --- turns ---
  startTurn(side) {
    this.side = side;
    for (const u of this.units.filter(u => u.side === side && !u.gone)) {
      u.moved = false; u.acted = false; u.from = null; u.bonus = 0;
      if (u.cd > 0) u.cd--;
      if (u.kind === 'contractor' && this.turn >= u.expires) {
        u.gone = true;
        if (u.cards.length) (this.loot[key(u.x, u.y)] ||= []).push(...u.cards);
        u.cards = [];
        this.say(side, `The ${u.name}'s two turns are up. Back to the Lobby${u.x >= 0 ? ', cards left on the floor' : ''}.`);
        u.x = u.y = -1;
        this.addContractorNpc(CONTRACTORS.find(c => c.id === u.cid));
        continue;
      }
      if (u.sulk > 0) {
        if (u.sulk < 99) u.sulk--;
        if (u.sulk === 0) {
          const [sx, sy] = this.spawnTiles(side)[0];
          this.placeNear(u, sx, sy);
          u.morale = 2;
          this.say(side, `${u.name} is back from the car park, shaky, at ${u.morale} morale. Somebody had better look after them.`);
        } else { u.moved = u.acted = true; }
        continue;
      }
    }
  }
  endTurn() {
    for (const u of this.units) if (u.side === this.side && u.rooted > 0 && u.moved) u.rooted--;
    for (const u of this.units) if (u.side === this.side && u.rooted > 0 && !u.moved) u.rooted = 0;
    // Whoever opened this turn closes the next: the first-come hires and loot are not always theirs.
    const second = this.side !== this.first;
    if (second) { this.turn++; this.first = this.other(this.first); }
    if (this.turn > A.TURNS) return false;
    this.startTurn(second ? this.first : this.other(this.side));
    return true;
  }

  // --- the AI: one greedy plan per unit, the same numbers for either side ---
  goalField(u) {
    const other = this.other(u.side);
    const goals = [];
    const demand = this.demand(u.side);
    const room = u.cards.length < A.CARRY;
    for (const k in this.stock) if (this.stock[k] > 0 && room) { const [x, y] = k.split(',').map(Number); goals.push([x, y, 2 + 0.3 * demand[DESKS[this.tile(x, y)]]]); }
    for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (this.map[y][x] === 'C' && room && this.raidable(u.side, x)) goals.push([x, y, 6]);
    for (const k in this.loot) { const [x, y] = k.split(',').map(Number); goals.push([x, y, 2.5 * this.loot[k].length]); }
    for (const n of this.neutrals) {
      if (n.kind === 'consultant') { if (n.side !== u.side) goals.push([n.x, n.y, 3.2 + (n.side === other ? 0.8 : 0)]); }
      else if (n.kind === 'contractor') { if (this.turn <= A.TURNS - 2) goals.push([n.x, n.y, 3]); }
      else goals.push([n.x, n.y, 2.2 + (n.for === other ? 0.6 : 0)]);
    }
    for (const e of this.active(other)) goals.push([e.x, e.y, (u.stats[0] >= 2 ? 4.5 : 2.5) + 4 * (1 - e.morale / e.max) + e.cards.length * 1.2 + (e.leader ? 1 : 0)]);
    if (u.cards.length >= 2) for (const [x, y] of this.spawnTiles(u.side)) goals.push([x, y, 1.2 * u.cards.length]);
    if (!this.rigged[other] && this.turn >= 3 && this.turn < A.TURNS) for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (this.map[y][x] === 'R') goals.push([x, y, 2]);
    if (this.rigged[u.side]) for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) if (this.map[y][x] === 'R') goals.push([x, y, 4]);
    const field = new Float32Array(A.W * A.H);
    for (const [gx, gy, w] of goals) {
      const d = new Int16Array(A.W * A.H).fill(-1);
      const q = [];
      // goals that are furniture or people: start from the walkable tiles next to them
      if (WALK.has(this.tile(gx, gy)) && !this.neutralAt(gx, gy) && !this.unitAt(gx, gy)) { d[gy * A.W + gx] = 0; q.push([gx, gy]); }
      else for (const [x, y] of this.adj(gx, gy)) if (WALK.has(this.tile(x, y))) { d[y * A.W + x] = 0; q.push([x, y]); }
      for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i];
        const dd = d[y * A.W + x];
        const v = w * Math.pow(0.86, dd);
        if (v > field[y * A.W + x]) field[y * A.W + x] = v;
        if (dd > 24) continue;
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy;
          if (!WALK.has(this.tile(nx, ny)) || d[ny * A.W + nx] >= 0) continue;
          d[ny * A.W + nx] = dd + 1; q.push([nx, ny]);
        }
      }
    }
    return field;
  }
  danger(u, x, y) {
    let s = 0;
    for (const e of this.active(this.other(u.side))) {
      if (man(e.x, e.y, x, y) <= this.moveOf(e) + 1) s += this.dmgOf(e, u) + 0.5;
    }
    return s;
  }
  actValue(u, a) {
    const t = a.target !== undefined ? this.byId(a.target) : null;
    switch (a.kind) {
      case 'confront': {
        const d = this.dmgOf(u, t) + 0.5 + 0.05 * u.stats[1] * this.dmgOf(u, t);
        if (d >= t.morale) return 8 + 2 * t.cards.length + (t.leader ? 4 : 0);
        const c = this.counterOf(t, u);
        if (c >= u.morale) return -10;
        return d * 1.7 + (t.leader ? 1 : 0) - 0.5 * c + (d >= t.morale - 2 ? 1.5 : 0);
      }
      case 'pickpocket': return this.pickChance(u) * 3 * (u.cards.length < A.CARRY ? 1 : 0);
      case 'desk': return 2 + 0.3 * this.demand(u.side)[a.taste] + (a.taste === 2 && this.gadgetHand(u) ? 1 : 0);
      case 'closet': return 6;
      case 'pitch':
        if (t.kind === 'contractor') return this.turn <= A.TURNS - 2 ? 3.6 : 0;
        if (t.kind === 'consultant') return 2.5 + (this.wouldJoin(t, u.side, this.pitchAmt(u)) ? 3.5 : 0) + (t.side === this.other(u.side) ? 1 : 0);
        return 2 + (this.wouldJoin(t, u.side, this.pitchAmt(u)) ? 3 : 0) + (t.for === this.other(u.side) ? 0.5 : 0);
      case 'ability':
        switch (u.job) {
          case RO.CEO: return this.active(u.side).filter(v => v !== u && !v.moved && man(u.x, u.y, v.x, v.y) <= 3).length * 1.2;
          case RO.ENG: return 3;
          case RO.IT: return 1 + (t.cd === 0 ? 1.5 : 0) + (t.cards.length ? 2.5 : 0);
          case RO.HR: return Math.min(6, t.max - t.morale) * 0.8 + (t.leader ? 1 : 0);
          case RO.MKT: return this.active(this.other(u.side)).filter(e => man(u.x, u.y, e.x, e.y) <= 2).reduce((s, e) => s + (e.morale <= 3 ? 8 : 3), 0);
          case RO.SALES: return t.kind === 'contractor' ? 1 : 2.5 + (this.wouldJoin(t, u.side, this.pitchAmt(u, 2)) ? 3 : 0);
          case RO.LEGAL: return 1.5 + (this.danger(t, t.x, t.y) > 0 ? 1.5 : 0);
          case RO.INTERN: return 3;
        }
        return 0;
      case 'bank': return u.cards.length * (this.danger(u, u.x, u.y) > 0 ? 1.4 : 0.8) + (u.cards.length >= A.HEAVY_LOAD ? 1 : 0);
      case 'rig': return this.turn >= 2 ? 3.5 : 1;
      case 'check': return 5;
      case 'wait': return this.turn >= A.HOLD_COST_FROM ? -1.2 : 0;
      default: return 0;
    }
  }
  plan(u, policy = 'greedy') {
    const { tiles } = this.reach(u);
    const keys = Object.keys(tiles);
    if (policy === 'random') {
      const k = this.pick(keys);
      const [x, y] = k.split(',').map(Number);
      const ox = u.x, oy = u.y; u.x = x; u.y = y;
      const acts = this.actions(u);
      u.x = ox; u.y = oy;
      return { x, y, act: this.pick(acts) };
    }
    const field = this.goalField(u);
    let best = null, bv = -Infinity;
    const ox = u.x, oy = u.y;
    for (const k of keys) {
      const [x, y] = k.split(',').map(Number);
      u.x = x; u.y = y;
      const lootHere = (this.loot[k] || []).length;
      let pos = 2.5 * Math.min(lootHere, A.CARRY - u.cards.length) + field[y * A.W + x] * 0.35;
      const dg = this.danger(u, x, y);
      pos -= dg * (dg >= u.morale ? 0.7 : 0.15) * (u.leader ? 1.6 : 1);
      for (const a of this.actions(u)) {
        const v = pos + this.actValue(u, a) + this.r() * 0.05;
        if (v > bv) { bv = v; best = { x, y, act: a }; }
      }
    }
    u.x = ox; u.y = oy;
    return best;
  }
  // Order a side's units so the ones that can hit something go first.
  order(side) {
    return this.active(side).filter(u => !u.acted).sort((a, b) => b.stats[0] - a.stats[0] || a.id - b.id);
  }
  playSide(side, policy) {
    for (const u of this.order(side)) {
      if (this.over) return;
      if (u.sulk || u.gone) continue;
      const p = this.plan(u, policy);
      if (!p) continue;
      this.moveUnit(u, p.x, p.y);
      const a = this.actions(u).find(a => a.kind === p.act.kind && a.target === p.act.target && a.id === p.act.id && a.x === p.act.x && a.y === p.act.y) || { kind: 'wait' };
      this.act(u, a);
    }
  }

  // --- the final talk: three slides each, chosen blind, shown in turns ---
  hand(side) { return [...this.bank[side], ...this.active(side).flatMap(u => u.cards)]; }
  // All hands: whoever is still undecided goes with whichever party has more people standing next to them.
  allHands() {
    for (const n of this.neutrals.slice()) {
      if (n.kind !== 'n') continue;
      const near = { 0: 0, 1: 0 };
      for (const [x, y] of this.adj(n.x, n.y)) { const u = this.unitAt(x, y); if (u) near[u.side]++; }
      const side = near[0] > near[1] ? P : near[1] > near[0] ? N : NONE;
      if (side === NONE) continue;
      this.neutrals = this.neutrals.filter(x => x !== n);
      this.crowd[side].push(n);
      this.say(side, `All hands: ${n.name} went with ${side === P ? 'your' : 'their'} people.`);
    }
  }
  startTalk() {
    const T = { sides: {}, order: this.crowd[P].length <= this.crowd[N].length ? [N, P] : [P, N], lines: [], slot: 0, pending: null, last: null, done: false };
    for (const side of [P, N]) {
      const other = this.other(side);
      T.sides[side] = {
        audience: [...this.crowd[side].map(n => ({ taste: n.taste, name: n.name })), ...this.active(side).map(u => ({ taste: u.taste, name: u.name }))],
        booers: this.active(other), hand: this.hand(side).map(c => ({ ...c })), chosen: [], claps: 0, boos: 0, heckled: false, blanked: null,
      };
    }
    return T;
  }
  leader(side) { return this.units.find(u => u.side === side && u.leader); }
  fans(T, side, taste) { return T.sides[side].audience.filter(a => a.taste === taste).length; }
  slideClaps(T, side, c) {
    if (c.taste < 0) return 0;
    let v = c.q * (2 + 3 * this.fans(T, side, c.taste)) * (1 + 0.1 * this.leader(side).stats[0]);
    if (c.taste === 0 && this.has(side, 'data')) v *= 1.5;
    if (c.taste === 2 && this.gadgetHand(this.leader(side))) v += this.fans(T, side, 2);
    return Math.round(v) + (this.has(side, 'keynote') ? 3 : 0);
  }
  // Best three, no two of a taste in a row where it can be helped.
  aiPick(T, side) {
    const S = T.sides[side];
    const idx = S.hand.map((c, i) => i).sort((a, b) => this.slideClaps(T, side, S.hand[b]) - this.slideClaps(T, side, S.hand[a]));
    const out = [];
    while (out.length < Math.min(A.SLIDES, idx.length)) {
      const prev = out.length ? S.hand[out[out.length - 1]].taste : -9;
      const pick = idx.find(i => !out.includes(i) && S.hand[i].taste !== prev) ?? idx.find(i => !out.includes(i));
      out.push(pick);
    }
    return out;
  }
  chooseFor(T, side, idxs) {
    const S = T.sides[side];
    S.chosen = idxs.slice(0, A.SLIDES).map(i => S.hand[i]).filter(Boolean);
    if (this.rigged[side] && S.chosen.length) {
      let bi = 0;
      for (let i = 0; i < S.chosen.length; i++) if (this.slideClaps(T, side, S.chosen[i]) > this.slideClaps(T, side, S.chosen[bi])) bi = i;
      S.blanked = S.chosen[bi];
      S.chosen[bi] = { taste: -1, q: 0, name: A.DUD };
    }
  }
  slotsLeft(T) { return T.slot < A.SLIDES * 2; }
  playNext(T) {
    const side = T.order[T.slot % 2], i = Math.floor(T.slot / 2);
    const S = T.sides[side];
    T.slot++;
    const who = side === P ? 'You' : 'They';
    const c = S.chosen[i];
    if (!c) { T.lines.push(`${who} had no slide ${i + 1}.`); return; }
    const bored = T.last && c.taste >= 0 && T.last.taste === c.taste;
    const cl = bored ? 0 : this.slideClaps(T, side, c);
    const b = 2 * S.booers.length + (c.taste < 0 ? 4 : 0);
    S.claps += cl; S.boos += b;
    T.lines.push(c.taste < 0 ? `${who}: a blank slide. ${b} boos.`
      : `${who}: ${c.name} (${TASTE[c.taste]} q${c.q})${bored ? ', but the room just saw ' + TASTE[c.taste] + ': nothing' : `: ${cl} claps`}${b ? `, ${b} boos` : ''}.`);
    T.last = c;
    if (i === 1 && S.booers.length && !S.heckled) T.pending = side;
  }
  heckleOdds(side) { return Math.min(0.9, 0.55 + 0.05 * this.leader(side).stats[3]); }
  ignoreCost(side) { return Math.max(1, 5 - this.leader(side).stats[3]); }
  resolveHeckle(T, side, back) {
    const S = T.sides[side];
    S.heckled = true; T.pending = null;
    const who = side === P ? 'You' : 'They';
    if (back) {
      if (this.r() < this.heckleOdds(side)) { S.claps += 10; T.lines.push(`${who} clapped back and the room roared: +10.`); }
      else { S.boos += 6; T.lines.push(`${who} clapped back and it fell flat: +6 boos.`); }
    } else { const c = this.ignoreCost(side); S.boos += c; T.lines.push(`${who} let the heckle go: +${c} boos.`); }
  }
  finishTalk(T) {
    for (const side of [P, N]) { const S = T.sides[side]; S.score = S.claps - S.boos; this.say(side, `${side === P ? 'Your' : 'Their'} talk: ${S.claps} claps, ${S.boos} boos, ${S.score} all told.`); }
    T.done = true;
  }

  async run(agent, hooks = {}) {
    const H = async (k, ...a) => { if (hooks[k]) await hooks[k](...a); };
    await H('turnStart');
    while (!this.over) {
      if (this.side === P) await agent.playTurn(this);
      else {
        for (const u of this.order(N)) {
          if (this.over) break;
          if (u.sulk || u.gone || u.acted) continue;
          const p = this.plan(u);
          if (!p) continue;
          await H('enemyPlan', u, p);
          this.moveUnit(u, p.x, p.y);
          const a = this.actions(u).find(a => a.kind === p.act.kind && a.target === p.act.target && a.id === p.act.id && a.x === p.act.x && a.y === p.act.y) || { kind: 'wait' };
          this.act(u, a);
          await H('enemyActed', u, a);
        }
      }
      if (this.over) break;
      if (!this.endTurn()) break;
      await H('turnStart');
    }
    if (!this.over) {
      this.over = true;
      this.allHands();
      const T = this.startTalk();
      this.talk = T;
      await H('allHands', T);
      for (const side of [P, N]) this.chooseFor(T, side, side === P ? await agent.pickSlides(T, this) : this.aiPick(T, side));
      await H('talkStart', T);
      while (this.slotsLeft(T)) {
        this.playNext(T);
        await H('talkUpdate', T);
        if (T.pending !== null) {
          const side = T.pending;
          this.resolveHeckle(T, side, side === P ? await agent.chooseHeckle(T, this) : this.heckleOdds(N) >= 0.5);
          await H('talkUpdate', T);
        }
      }
      this.finishTalk(T);
      const a = T.sides[P].score, b = T.sides[N].score;
      this.scores = { 0: a, 1: b };
      this.how = 'talk';
      this.winner = a > b ? P : b > a ? N : this.crowd[P].length > this.crowd[N].length ? P : this.crowd[N].length > this.crowd[P].length ? N : NONE;
      await H('talkEnd', T);
    }
    await H('matchEnd');
    return { winner: this.winner, how: this.how, scores: this.scores, breaks: this.breaks, crowd: [this.crowd[P].length, this.crowd[N].length], consultants: this.consultants().filter(n => n.side !== NONE).length };
  }
}
if (typeof module !== 'undefined') module.exports = { Game, A, P, N, NONE, RO, PLAYABLE, ROLE_STATS, buildMap };
// ==/ENGINE==
