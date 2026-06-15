/* Headless balance harness. Run: node sim/harness.js [seedsPerLoc] [dayCap] */
const C = require("../src/core.js");

const SEEDS = parseInt(process.argv[2] || "60", 10);
const DAY_CAP = parseInt(process.argv[3] || "1800", 10); // ~5 years
const LOCS = Object.keys(C.LOCATIONS);

/* ---------------- bots ---------------- */
function botNaive(s) {
  const jobs = ["forage", "fetchwater", "chopwood", "build"];
  s.colonists.filter(c => c.alive).forEach(c => { s.assignments[c.id] = { job: jobs[Math.floor(s.rng() * jobs.length)], effort: 40 }; });
}

function botBalanced(s) {
  const live = s.colonists.filter(c => c.alive);
  const B = s.buildings, store = s.store, loc = C.LOCATIONS[s.location];
  const winterish = C.season(s) === "Winter" || C.season(s) === "Autumn";
  const pop = live.length;

  // ---- project queue (build essentials, then defense, then growth)
  if (s.projects.length === 0) {
    const order = loc.hasWater === false
      ? ["well", "forester", "gatherer", "quarry", "woodhouse", "watchtower", "barn", "well", "wall", "hunter", "stonehouse", "hospital"]
      : ["forester", "gatherer", "well", "woodcutter", "quarry", "barn", "woodhouse", "watchtower", "hunter", "wall", "woodhouse", "herbalist", "stonehouse", "hospital", "tavern", "stockpile", "chapel"];
    for (const id of order) {
      const bd = C.BUILDINGS[id];
      const gate = (loc.buildings && loc.buildings[id] != null) ? loc.buildings[id] : 1;
      if (gate <= 0) continue;
      const built = B[id] || 0;
      const cap = (id === "woodhouse") ? 4 : (id === "forester" || id === "gatherer" || id === "well") ? 2 : 1;
      if (built >= cap) continue;
      // build more housing only if near cap
      if (id === "woodhouse" && C.housingFree(s) > 1) continue;
      let canAfford = true; for (const r in bd.build.mats) if ((store[r] || 0) < bd.build.mats[r]) canAfford = false;
      if (canAfford) { C.startProject(s, id); break; }
    }
  }

  // ---- quotas (location-aware, with buffer)
  const need = [];
  const EFF = 0.45 * 0.95; // effort * avg skillFactor estimate
  const waterJob = B.well ? "well" : "fetchwater";
  const waterPerWorker = (B.well ? 34 : 22) * EFF * loc.water;
  const waterWorkers = Math.max(1, Math.ceil(pop * C.CONFIG.waterPerDay * 1.3 / waterPerWorker));
  for (let i = 0; i < waterWorkers; i++) need.push(waterJob);
  const foodJob = B.gatherer ? "gatherer" : "forage";
  const foodPerWorker = (B.gatherer ? 18 : 12) * EFF * loc.foodMult;
  const foodWorkers = Math.max(1, Math.ceil(pop * C.CONFIG.foodPerDay * 1.3 / foodPerWorker));
  for (let i = 0; i < foodWorkers; i++) need.push(foodJob);
  if (B.hunter) need.push("hunter");
  if (winterish && B.woodcutter && (store.logs || 0) > 5) need.push("woodcutter");
  // defense: scale with pop, more if no wall
  const wantWatch = Math.min(3, Math.max(1, Math.floor(pop / 3)) + (B.wall ? 0 : 1));
  for (let i = 0; i < wantWatch; i++) need.push("watch");
  if (s.projects.length) { need.push("build"); if (pop > 6) need.push("build"); }
  const logJob = B.forester ? "forester" : "chopwood";
  need.push(logJob);
  need.push(B.quarry ? "quarry" : "quarrystone");
  if (B.herbalist && live.some(c => c.sick > 0)) need.push("herbalist");
  if (live.some(c => c.health < 50)) need.push(B.hospital ? "hospital" : "tend");

  // ---- assign by skill fit
  const assigned = {}; const avail = live.slice();
  for (const job of need) {
    if (!avail.length) break;
    const def = C.MANUAL_JOBS[job] || C.BUILDINGS[job]; const skl = def && def.skill;
    if (skl) avail.sort((a, b) => C.effectiveSkill(b, skl) - C.effectiveSkill(a, skl));
    assigned[avail.shift().id] = { job, effort: 45 };
  }
  for (const c of avail) assigned[c.id] = { job: logJob, effort: 40 };
  s.assignments = assigned;
}

/* ---------------- run one game ---------------- */
function run(bot, loc, seed) {
  const s = C.newGame({ seed, location: loc });
  let peakCH = 0, peakPop = s.colonists.length;
  while (!s.over && s.day < DAY_CAP) {
    bot(s); C.advanceTurn(s);
    peakCH = Math.max(peakCH, s.colonyHealth);
    peakPop = Math.max(peakPop, s.colonists.filter(c => c.alive).length);
  }
  const causes = {}; for (const d of s.dead) causes[d.cause] = (causes[d.cause] || 0) + 1;
  return { days: s.day, reached1y: s.day >= 360, reached3y: s.day >= 1080, reached5y: s.day >= DAY_CAP,
    thrived: peakCH >= 70, peakCH, peakPop, finalPop: s.colonists.filter(c => c.alive).length, causes };
}

/* ---------------- sweep ---------------- */
function sweep(name, bot) {
  console.log(`\n=== ${name} (${SEEDS} seeds/loc, dayCap ${DAY_CAP}) ===`);
  const allCauses = {};
  for (const loc of LOCS) {
    let r1 = 0, r3 = 0, r5 = 0, thr = 0; const days = []; const chs = []; const pops = [];
    for (let i = 0; i < SEEDS; i++) {
      const r = run(bot, loc, (i + 1) * 101 + loc.length);
      if (r.reached1y) r1++; if (r.reached3y) r3++; if (r.reached5y) r5++; if (r.thrived) thr++;
      days.push(r.days); chs.push(r.peakCH); pops.push(r.peakPop);
      for (const k in r.causes) allCauses[k] = (allCauses[k] || 0) + r.causes[k];
    }
    const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
    const pct = n => (n / SEEDS * 100).toFixed(0).padStart(3);
    console.log(`  ${C.LOCATIONS[loc].name.padEnd(18)} 1yr ${pct(r1)}%  3yr ${pct(r3)}%  5yr ${pct(r5)}%  thrived ${pct(thr)}%  peakPop ${mean(pops).toFixed(1)}  peakCH ${mean(chs).toFixed(0)}  [${C.LOCATIONS[loc].difficulty}]`);
  }
  console.log("  causes:", allCauses);
}

sweep("NAIVE bot", botNaive);
sweep("BALANCED bot", botBalanced);
