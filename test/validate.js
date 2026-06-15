/* Content validator + runtime invariants. Run: node test/validate.js  */
const C = require("../src/core.js");
let errors = 0, warns = 0;
const err = m => { console.log("  ✗ " + m); errors++; };
const warn = m => { console.log("  ! " + m); warns++; };
const has = (arr, x) => arr.includes(x);

console.log("== Content validation ==");

// resources unique
if (new Set(C.RESOURCES).size !== C.RESOURCES.length) err("duplicate resource ids");

// buildings
for (const id in C.BUILDINGS) {
  const b = C.BUILDINGS[id];
  if (b.skill && !has(C.SKILLS, b.skill)) err(`building ${id}: bad skill ${b.skill}`);
  if (b.build) for (const r in b.build.mats) if (!has(C.RESOURCES, r)) err(`building ${id}: build mat ${r} not a resource`);
  if (b.produce) for (const r in b.produce) if (!has(C.RESOURCES, r)) err(`building ${id}: produces unknown ${r}`);
  if (b.recipe) {
    for (const r in b.recipe.in) if (!has(C.RESOURCES, r)) err(`building ${id}: recipe in ${r} unknown`);
    for (const r in b.recipe.out) if (!has(C.RESOURCES, r)) err(`building ${id}: recipe out ${r} unknown`);
    // refinement should not create from literally nothing
    if (!Object.keys(b.recipe.in).length) err(`building ${id}: recipe has no inputs (creates from nothing)`);
  }
  if (b.consumes) for (const r in b.consumes) if (!has(C.RESOURCES, r)) err(`building ${id}: consumes unknown ${r}`);
}

// manual jobs
for (const id in C.MANUAL_JOBS) {
  const j = C.MANUAL_JOBS[id];
  if (j.skill && !has(C.SKILLS, j.skill)) err(`manual job ${id}: bad skill ${j.skill}`);
  if (j.produce) for (const r in j.produce) if (!has(C.RESOURCES, r)) err(`manual job ${id}: produces unknown ${r}`);
  if (j.consumes) for (const r in j.consumes) if (!has(C.RESOURCES, r)) err(`manual job ${id}: consumes unknown ${r}`);
}

// traits: count + math + symmetry
const traitNames = Object.keys(C.TRAITS);
if (traitNames.length !== 42) err(`expected 42 traits, found ${traitNames.length}`);
let singles = 0, tradeoffs = 0;
for (const name of traitNames) {
  const t = C.TRAITS[name];
  const mods = Object.entries(t.mods);
  for (const [sk] of mods) if (!has(C.SKILLS, sk)) err(`trait ${name}: bad skill ${sk}`);
  if (mods.length === 1) { singles++; if (Math.abs(mods[0][1]) !== 3) err(`single trait ${name}: magnitude ${mods[0][1]} (want ±3)`); }
  else if (mods.length === 2) { tradeoffs++; const vals = mods.map(m => m[1]).sort(); if (vals[0] !== -2 || vals[1] !== 2) err(`tradeoff ${name}: ${vals} (want +2/-2)`); }
  else err(`trait ${name}: ${mods.length} skill mods`);
  // symmetry of incompatibility
  for (const inc of (t.incompatible || [])) {
    if (!C.TRAITS[inc]) err(`trait ${name}: incompatible with unknown ${inc}`);
    else if (!(C.TRAITS[inc].incompatible || []).includes(name)) err(`trait ${name}<->${inc}: incompatibility not symmetric`);
  }
}
if (singles !== 12) err(`expected 12 single-skill traits, found ${singles}`);
if (tradeoffs !== 30) err(`expected 30 trade-off traits, found ${tradeoffs}`);

// archetypes
for (const a of C.ARCHETYPES) {
  for (const sk in a.bias) if (!has(C.SKILLS, sk)) err(`archetype ${a.id}: bad bias skill ${sk}`);
  for (const t of (a.traitOdds || [])) if (!C.TRAITS[t]) err(`archetype ${a.id}: traitOdds references unknown trait ${t}`);
}

// locations gate real buildings
for (const id in C.LOCATIONS) {
  const l = C.LOCATIONS[id];
  for (const bid in (l.buildings || {})) if (!C.BUILDINGS[bid]) err(`location ${id}: gates unknown building ${bid}`);
}

// events unique ids
const evIds = C.EVENTS.map(e => e.id);
if (new Set(evIds).size !== evIds.length) err("duplicate event ids");

console.log(`  ${errors ? errors + " errors" : "content OK"}${warns ? ", " + warns + " warnings" : ""}`);

// ---- runtime invariants: run sims and assert ----
console.log("== Runtime invariants ==");
let invFail = 0;
for (let seed = 1; seed <= 20; seed++) {
  for (const loc of Object.keys(C.LOCATIONS)) {
    const s = C.newGame({ seed: seed * 31 + 1, location: loc });
    for (let t = 0; t < 120 && !s.over; t++) {
      // dumb policy: keep ~half foraging/water, rest build/chop
      autopilotMinimal(C, s);
      C.advanceTurn(s);
      for (const r of C.RESOURCES) {
        const v = s.store[r];
        if (v < -1e-6) { console.log(`  ✗ seed ${seed} ${loc}: negative ${r}=${v}`); invFail++; }
        if (Number.isNaN(v) || !Number.isFinite(v)) { console.log(`  ✗ seed ${seed} ${loc}: bad ${r}=${v}`); invFail++; }
      }
      if (s.colonyHealth < 0 || s.colonyHealth > 100 || Number.isNaN(s.colonyHealth)) { console.log(`  ✗ seed ${seed} ${loc}: colonyHealth=${s.colonyHealth}`); invFail++; }
      for (const c of s.colonists) for (const k of ["stamina", "hunger", "warmth", "health", "happiness"]) {
        if (Number.isNaN(c[k]) || c[k] < -1e-6 || c[k] > 100.001) { console.log(`  ✗ seed ${seed} ${loc}: ${c.name}.${k}=${c[k]}`); invFail++; }
      }
      if (invFail > 10) break;
    }
    // save round-trip
    const json = C.serialize(s); const s2 = C.deserialize(json);
    if (s2.colonists.length !== s.colonists.length) { console.log("  ✗ save round-trip colonist mismatch"); invFail++; }
    if (invFail > 10) break;
  }
  if (invFail > 10) break;
}
console.log(`  ${invFail ? invFail + " invariant failures" : "invariants OK"}`);

function autopilotMinimal(C, s) {
  const live = s.colonists.filter(c => c.alive);
  live.forEach((c, i) => {
    let job = "forage";
    if (i % 3 === 1) job = "fetchwater";
    else if (i % 3 === 2) job = "chopwood";
    s.assignments[c.id] = { job, effort: 40 };
  });
}

const total = errors + invFail;
console.log(total ? `\nFAILED: ${total} problem(s)` : "\nALL CHECKS PASSED ✓");
process.exit(total ? 1 : 0);
