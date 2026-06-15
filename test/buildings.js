/* Focused test: every building does what it claims. node test/buildings.js */
const C = require("../src/core.js");
let fail = 0, pass = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { console.log("  ✗ " + msg); fail++; } };

function clone(s) { const o = JSON.parse(JSON.stringify({ ...s, rng: undefined })); o.rng = C.makeRng(1); return o; }
function freshWithBuilding(id, daySeason) {
  const s = C.newGame({ seed: 9, location: "oregon" });
  s.day = daySeason || 0;                       // control season
  s.buildings[id] = 1;
  // everyone rests by default
  s.colonists.forEach(c => s.assignments[c.id] = { job: "rest", effort: 0 });
  return s;
}
function staff(s, id, skill) {
  const c = s.colonists[0];
  if (skill) { c.skills[skill] = 8; c.traits = []; }  // strong, no negative traits
  c.hunger = c.warmth = c.health = c.happiness = c.stamina = 90;
  s.assignments[c.id] = { job: id, effort: 80 };
  return c;
}
// production = (output with worker) - (output with worker resting), via deterministic tickDay
function production(s, id, res, skill) {
  const work = clone(s); staff(work, id, skill);
  const rest = clone(s); rest.colonists.forEach(c => rest.assignments[c.id] = { job: "rest", effort: 0 });
  const b0 = work.store[res] || 0, r0 = rest.store[res] || 0;
  C.tickDay(work); C.tickDay(rest);
  return (work.store[res] || 0) - b0 - ((rest.store[res] || 0) - r0);
}

console.log("== Production buildings ==");
for (const [id, res, skill] of [
  ["gatherer", "fruit", "provision"], ["hunter", "protein", "provision"], ["fisher", "protein", "provision"],
  ["cropfield", "grain", "provision"], ["orchard", "fruit", "provision"], ["pasture", "protein", "provision"],
  ["forester", "logs", "labor"], ["quarry", "stone", "labor"], ["mine", "iron", "labor"],
  ["herbalist", "herbs", "provision"], ["well", "water", "building"],
]) {
  const s = freshWithBuilding(id, 120); // summer (crops active)
  ok(production(s, id, res, skill) > 0, `${id} should produce ${res} (got ${production(freshWithBuilding(id,120), id, res, skill).toFixed(2)})`);
}

console.log("== Refining buildings ==");
for (const [id, inp, out, skill] of [
  ["woodcutter", "logs", "firewood", "crafting"], ["blacksmith", "iron", "tools", "crafting"],
  ["tailor", "leather", "coats", "crafting"], ["brewery", "grain", "ale", "crafting"],
  ["weaponsmith", "iron", "weapons", "crafting"],
]) {
  const s = freshWithBuilding(id, 120);
  s.store.logs = 99; s.store.iron = 99; s.store.coal = 99; s.store.leather = 99; s.store.grain = 99;
  ok(production(s, id, out, skill) > 0, `${id} should make ${out}`);
  // input consumed
  const w = clone(s); staff(w, id, skill); const i0 = w.store[inp]; C.tickDay(w);
  ok(w.store[inp] < i0, `${id} should consume ${inp}`);
}

console.log("== Effect buildings ==");
// housing
let s = C.newGame({ seed: 1, location: "oregon" }); const h0 = C.housing(s); s.buildings.woodhouse = 1;
ok(C.housing(s) > h0, "woodhouse raises housing");
s.buildings.stonehouse = 1; ok(C.housing(s) > h0 + 2, "stonehouse raises housing");
// storage caps
s = C.newGame({ seed: 1, location: "oregon" }); const cap0 = C.capFor(s, "logs"); s.buildings.stockpile = 1;
ok(C.capFor(s, "logs") > cap0, "stockpile raises raw cap");
const fcap0 = C.capFor(s, "grain"); s.buildings.barn = 1; ok(C.capFor(s, "grain") > fcap0, "barn raises food cap");
// defense
s = C.newGame({ seed: 1, location: "oregon" }); const d0 = C.colonyDefense(s); s.buildings.watchtower = 1;
ok(C.colonyDefense(s) > d0, "watchtower raises defense");
s.buildings.wall = 1; ok(C.colonyDefense(s) > d0 + 5, "wall raises defense");
// hospital: a sick colonist heals faster with a hospital + tender
function healRate(withHosp) {
  const s = C.newGame({ seed: 2, location: "oregon" });
  if (withHosp) s.buildings.hospital = 1;
  const c = s.colonists[0]; c.health = 50; c.sick = 5;
  s.colonists.forEach(x => s.assignments[x.id] = { job: "rest", effort: 0 });
  s.store.herbs = 50;
  if (withHosp) s.assignments[c.id] = { job: "hospital", effort: 60 };
  const h = c.health; C.tickDay(s); return c.health - h;
}
ok(healRate(true) > healRate(false), `hospital should heal sick faster (hosp ${healRate(true).toFixed(1)} vs none ${healRate(false).toFixed(1)})`);
// tavern amenity (needs ale)
s = C.newGame({ seed: 1, location: "oregon" }); s.buildings.tavern = 1; s.store.ale = 20;
const amenityFn = C; // amenity not exported; test via happiness target indirectly
// stonehouse firewood: less firewood burned
console.log("== Notes ==");
ok(C.BUILDINGS.tradingpost && C.BUILDINGS.tradingpost.trade, "trading post exists (trade effect TBD)");

console.log(`\n${fail ? "FAILED " + fail + " checks, " + pass + " passed" : "ALL " + pass + " BUILDING CHECKS PASSED ✓"}`);
process.exit(fail ? 1 : 0);
