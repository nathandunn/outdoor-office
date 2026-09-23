const E = require('./engine.js');
const { Game, A, P, N, PLAYABLE, ROLE_STATS } = E;
const policy = process.env.POLICY || 'greedy';
const M = +(process.env.MATCHES || 32);
let w = 0, t = 0, l = 0, margin = 0, lc = 0, dec = 0, seen = 0, blocked = 0, errs = 0;
const kinds = {};
(async () => {
  for (let i = 0; i < M; i++) {
    const g = new Game(1000 + i * 7919);
    const rr = Math.random;
    const role = PLAYABLE[g.ri(8)];
    const stats = ROLE_STATS[role].slice();
    for (let k = 0; k < A.FREE_POINTS; k++) { let j = g.ri(4); if (stats[j] >= A.STAT_MAX) j = (j + 1) % 4; stats[j]++; }
    const party = [0, 1, 2, 3].map(() => PLAYABLE[g.ri(8)]);
    g.setup({ role, stats, party });
    const agent = {
      chooseMove(opts) {
        dec++;
        const en = opts.filter(o => o.enabled);
        seen += opts.length; blocked += opts.length - en.length;
        let c;
        if (policy === 'random') c = en[g.ri(en.length)];
        else {
          let bv = -Infinity;
          for (const o of en) {
            if (o.kind === 'present' && g.move < A.MOVES && g.satchel[P].length < A.SLIDES) continue;
            if (o.value > bv) { bv = o.value; c = o; }
          }
        }
        c = c || en[0];
        kinds[c.kind] = (kinds[c.kind] || 0) + 1;
        return c;
      },
      chooseSlide(tk, gg) { dec++; return policy === 'random' ? gg.ri(tk.hand.length) : gg.aiSlide(tk); },
      chooseHeckle(tk, gg) { dec++; return policy === 'random' ? gg.r() < 0.5 : true; },
    };
    try {
      const r = await g.run(agent);
      if (r.margin > 0) w++; else if (r.margin === 0) t++; else l++;
      margin += Math.abs(r.margin); lc += r.leadChanges;
      if (process.env.V) console.log(`match ${i}: you ${r.you} them ${r.them} pts ${r.pts}`);
    } catch (e) { errs++; console.error(e); }
  }
  console.log(`${policy}: ${w}W ${t}T ${l}L  |margin| ${(margin / M).toFixed(2)}  lead changes ${(lc / M).toFixed(2)}  decisions ${(dec / M).toFixed(1)}  blocked ${(100 * blocked / seen).toFixed(0)}%  errors ${errs}`);
  console.log(JSON.stringify(kinds));
})();
