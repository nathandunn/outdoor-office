const { Game, A, P, N, PLAYABLE, ROLE_STATS } = require('./engine.js');
const policy = process.env.POLICY || 'greedy';
const M = +(process.env.MATCHES || 40);
const party = +(process.env.PARTY || 4);
let w = 0, t = 0, l = 0, routs = 0, turns = 0, breaks = 0, crowd = 0, err = 0, hires = 0;
(async () => {
  for (let i = 0; i < M; i++) {
    const g = new Game(5000 + i * 7919);
    const role = PLAYABLE[g.ri(8)];
    const stats = ROLE_STATS[role].slice();
    for (let k = 0; k < A.FREE_POINTS; k++) { let j = g.ri(4); if (stats[j] >= A.STAT_MAX) j = (j + 1) % 4; stats[j]++; }
    g.setup({ role, stats, party: Array.from({ length: party }, () => PLAYABLE[g.ri(8)]) });
    const agent = {
      async playTurn(gg) { gg.playSide(P, policy); },
      chooseSlide(tk, gg) { return policy === 'random' ? gg.ri(tk.hand.length) : gg.bestSlide(tk); },
      chooseHeckle(tk, gg) { return policy === 'random' ? gg.r() < 0.5 : true; },
    };
    try {
      const r = await g.run(agent);
      if (r.winner === P) w++; else if (r.winner === N) l++; else t++;
      if (r.how === 'rout') routs++;
      turns += g.turn; breaks += r.breaks[0] + r.breaks[1]; crowd += r.crowd[0] + r.crowd[1];
      hires += g.consultants.filter(c => c.side !== -1).length;
      if (process.env.V) console.log(i, r.how, 'winner', r.winner, 'scores', JSON.stringify(r.scores), 'breaks', r.breaks, 'crowd', r.crowd, 'turn', g.turn, 'budget', g.budget);
    } catch (e) { err++; console.error(e); }
  }
  console.log(`${policy} party=${party}: ${w}W ${t}T ${l}L  routs ${routs}  breaks/match ${(breaks / M).toFixed(1)}  crowd/match ${(crowd / M).toFixed(1)}  consultants hired/match ${(hires / M).toFixed(1)}  errors ${err}`);
})();
