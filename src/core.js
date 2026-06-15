/* ============================================================================
   HOLLOW FRONTIER — core (data + engine)
   UMD module: works in Node (require) and browser (window.CORE).
   Pure, deterministic simulation. No DOM, no I/O. Balance lives in CONFIG/DATA.
   ============================================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CORE = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------------------------------------------------------- CONFIG */
  const CONFIG = {
    HOURS_PER_DAY: 24,
    DAYS_PER_SEASON: 90,
    SEASONS: ["Spring", "Summer", "Autumn", "Winter"],
    DAYS_PER_YEAR: 360,

    START_FOUNDERS: 6,
    REROLLS: 5,

    // consumption (per person per day)
    foodPerDay: 1.0,
    waterPerDay: 0.8,
    firewoodPerDayCold: 0.35,   // only burned when it's cold

    // stamina / effort
    recoveryBase: 40,           // stamina/day at full wellbeing
    effortDefault: 40,          // sustainable default
    effortMax: 100,

    // vitals dynamics (per day deltas)
    eatGain: 28, starveLoss: 20,
    warmthApproach: 0.30,
    coldHealthLoss: 10, starveHealthLoss: 10, thirstHealthLoss: 12, sickHealthLoss: 8,
    healRest: 3, healHospital: 9, healHerbTonic: 6,
    happinessApproach: 0.25,
    varietyBonus: 6,            // health/happiness lift when diet is varied (>=3 types)

    // colony-health weights (establishment dominates so a bare camp reads low ->
    // tense fine-grained founding that opens up as you build out the colony)
    chWeights: { vitals: 0.25, cushion: 0.12, establish: 0.55, pop: 0.08 },
    chCushionTargetDays: 20,    // days of supply that counts as "full" cushion

    // turn length: [colonyHealth <, hours]. Floor is 1 day (the sim's smallest step).
    turnBands: [[30, 24], [50, 168], [70, 720], [88, 2160], [101, 8640]],

    // storage
    baseCap: 120,               // camp baseline cap per resource
    stockpileCap: 350, barnCap: 350,
    spoilNoBarn: 0.02,          // fraction/day of food lost without a Barn

    // tools / coats wear
    toolUsePerWorkerDay: 0.02,  // tools consumed per working colonist per day
    noToolPenalty: 0.7,         // output multiplier when out of tools
    coatUsePerColdDay: 0.01,

    // storyteller
    eventChancePerDay: 0.035,   // base; scaled by wealth/pop
    raidPopScale: 0.6,
    baseHousing: 6,             // the Camp shelters the founders

    // mental breaks / health thresholds
    breakEdge: 35, breakMinor: 20, breakMajor: 10,
    lowVital: 30, conditionPenaltyCap: 6,
  };

  /* ------------------------------------------------------------- RESOURCES */
  const FOOD_TYPES = ["grain", "fruit", "veg", "protein"];
  const RESOURCES = [
    ...FOOD_TYPES,
    "water", "logs", "stone", "iron", "coal", "herbs", "leather", "wool",
    "firewood", "tools", "coats", "ale", "weapons", "ammo",
  ];

  /* ---------------------------------------------------------------- SKILLS */
  const SKILLS = ["provision", "labor", "crafting", "building", "medicine", "combat"];
  const SK = { provision: "Prov", labor: "Lab", crafting: "Craft", building: "Build", medicine: "Med", combat: "Cmb" };

  /* ---------------------------------------------------------------- TRAITS */
  // single-skill (+3 / -3)
  const SINGLE_TRAITS = {
    provision: ["Forager's Eye", "Town-Bred"],
    labor: ["Ox", "Soft Hands"],
    crafting: ["Artisan", "Ham-Fisted"],
    building: ["Master Builder", "All Thumbs"],
    medicine: ["Healer's Hands", "Squeamish"],
    combat: ["Fierce", "Timid"],
  };
  // trade-off (+2 / -2) — [skillUp, skillDown, name]
  const TRADEOFF_TRAITS = [
    ["provision", "labor", "Woodsman"], ["labor", "provision", "Drudge"],
    ["provision", "crafting", "Field Hand"], ["crafting", "provision", "Benchwright"],
    ["provision", "building", "Rover"], ["building", "provision", "Homesteader"],
    ["provision", "medicine", "Hunter's Heart"], ["medicine", "provision", "Nurturer"],
    ["provision", "combat", "Peaceful Provider"], ["combat", "provision", "Marauder"],
    ["labor", "crafting", "Brute Force"], ["crafting", "labor", "Fine Hands"],
    ["labor", "building", "Hauler"], ["building", "labor", "Foreman"],
    ["labor", "medicine", "Hard Case"], ["medicine", "labor", "Soft-Spoken"],
    ["labor", "combat", "Workhorse"], ["combat", "labor", "Brawler"],
    ["crafting", "building", "Detailer"], ["building", "crafting", "Framer"],
    ["crafting", "medicine", "Maker"], ["medicine", "crafting", "Folk Healer"],
    ["crafting", "combat", "Pacifist"], ["combat", "crafting", "Gunsmith"],
    ["building", "medicine", "Mason"], ["medicine", "building", "Mender"],
    ["building", "combat", "Architect"], ["combat", "building", "Bruiser"],
    ["medicine", "combat", "Medic"], ["combat", "medicine", "Butcher"],
  ];
  // unified trait registry: name -> { mods:{skill:delta}, incompatible:[names] }
  const TRAITS = {};
  for (const sk of SKILLS) {
    const [pos, neg] = SINGLE_TRAITS[sk];
    TRAITS[pos] = { name: pos, mods: { [sk]: 3 }, incompatible: [neg] };
    TRAITS[neg] = { name: neg, mods: { [sk]: -3 }, incompatible: [pos] };
  }
  for (const [up, down, name] of TRADEOFF_TRAITS) {
    TRAITS[name] = { name, mods: { [up]: 2, [down]: -2 }, incompatible: [] };
  }
  // mark mirror trade-offs incompatible (can't have +Prov/-Lab and +Lab/-Prov)
  for (const [up, down, name] of TRADEOFF_TRAITS) {
    const mirror = TRADEOFF_TRAITS.find(t => t[0] === down && t[1] === up);
    if (mirror) TRAITS[name].incompatible.push(mirror[2]);
  }

  /* ----------------------------------------------------------- ARCHETYPES */
  // bias: { skill: amount }  (primary ~3, exceptional ~5, secondary ~1-2)
  const ARCHETYPES = [
    { id: "farmer", name: "Farmer", bias: { provision: 3 }, traitOdds: ["Forager's Eye", "Homesteader"] },
    { id: "hunter", name: "Hunter-Trapper", bias: { provision: 3, combat: 1 }, traitOdds: ["Hunter's Heart", "Fierce"] },
    { id: "laborer", name: "Laborer", bias: { labor: 3 }, traitOdds: ["Ox", "Drudge"] },
    { id: "miner", name: "Miner", bias: { labor: 3, building: 1 }, traitOdds: ["Ox", "Hard Case"] },
    { id: "mechanic", name: "Mechanic", bias: { crafting: 3 }, traitOdds: ["Artisan", "Fine Hands"] },
    { id: "smith", name: "Smith / Machinist", bias: { crafting: 3, labor: 1 }, traitOdds: ["Artisan", "Brute Force"] },
    { id: "carpenter", name: "Carpenter", bias: { building: 3 }, traitOdds: ["Master Builder", "Framer"] },
    { id: "engineer", name: "Engineer", bias: { building: 3, crafting: 1 }, traitOdds: ["Master Builder", "Detailer"] },
    { id: "nurse", name: "Nurse / Paramedic", bias: { medicine: 3 }, traitOdds: ["Healer's Hands", "Soft-Spoken"] },
    { id: "doctor", name: "Doctor", bias: { medicine: 5 }, traitOdds: ["Healer's Hands", "Folk Healer"] },
    { id: "soldier", name: "Soldier / Veteran", bias: { combat: 3 }, traitOdds: ["Fierce", "Brawler"] },
    { id: "guard", name: "Police / Guard", bias: { combat: 3, labor: 1 }, traitOdds: ["Fierce", "Workhorse"] },
    { id: "survivalist", name: "Survivalist", bias: { provision: 3, combat: 1 }, traitOdds: ["Forager's Eye", "Marauder"] },
    { id: "scavenger", name: "Scavenger / Drifter", bias: { labor: 3, combat: 1 }, traitOdds: ["Workhorse", "Marauder"] },
    { id: "townie", name: "Townie", bias: {}, learns: 2, traitOdds: ["Town-Bred", "Soft Hands"] },
  ];

  /* ------------------------------------------------------------- BUILDINGS */
  // produce: per-100-effort/day outputs (no input). recipe: {in,out} per-100-effort/day.
  // slots: max workers. needs: gating flags. seasonal: 0-mult per season override.
  const W = (work, mats) => ({ work, mats: mats || {} });
  const BUILDINGS = {
    // food
    gatherer:   { name: "Gatherer's Hut", skill: "provision", slots: 3, build: W(120, { logs: 20 }), produce: { fruit: 9, veg: 9 } },
    hunter:     { name: "Hunting Cabin", skill: "provision", slots: 2, build: W(140, { logs: 25 }), produce: { protein: 17, leather: 1 } },
    fisher:     { name: "Fishing Dock", skill: "provision", slots: 2, build: W(150, { logs: 30 }), produce: { protein: 20 }, needs: "water" },
    cropfield:  { name: "Crop Field", skill: "provision", slots: 3, build: W(100, { logs: 10 }), produce: { grain: 16, veg: 8 }, seasonal: { Winter: 0, Spring: 0.6, Summer: 1.2, Autumn: 1.4 } },
    orchard:    { name: "Orchard", skill: "provision", slots: 2, build: W(120, { logs: 15 }), produce: { fruit: 16 }, seasonal: { Winter: 0, Spring: 0.3, Summer: 1.3, Autumn: 1.4 } },
    pasture:    { name: "Pasture", skill: "provision", slots: 2, build: W(160, { logs: 30 }), produce: { protein: 10, leather: 1, wool: 1 }, needs: "livestock" },
    // extraction
    forester:   { name: "Forester", skill: "labor", slots: 3, build: W(120, { logs: 20 }), produce: { logs: 16 } },
    quarry:     { name: "Quarry", skill: "labor", slots: 3, build: W(200, { logs: 30 }), produce: { stone: 12 } },
    mine:       { name: "Mine", skill: "labor", slots: 3, build: W(250, { logs: 40, stone: 20 }), produce: { iron: 7, coal: 7 }, needs: "ore" },
    herbalist:  { name: "Herbalist Hut", skill: "provision", slots: 2, build: W(100, { logs: 15 }), produce: { herbs: 10 } },
    // refining
    woodcutter: { name: "Woodcutter", skill: "crafting", slots: 2, build: W(100, { logs: 20 }), recipe: { in: { logs: 8 }, out: { firewood: 20 } } },
    blacksmith: { name: "Blacksmith", skill: "crafting", slots: 2, build: W(220, { logs: 30, stone: 40 }), recipe: { in: { iron: 3, coal: 3 }, out: { tools: 4 } } },
    tailor:     { name: "Tailor", skill: "crafting", slots: 2, build: W(140, { logs: 25 }), recipe: { in: { leather: 3 }, out: { coats: 4 } } },
    brewery:    { name: "Brewery", skill: "crafting", slots: 2, build: W(160, { logs: 30, stone: 20 }), recipe: { in: { grain: 4 }, out: { ale: 5 } } },
    weaponsmith:{ name: "Weaponsmith", skill: "crafting", slots: 2, build: W(240, { logs: 30, stone: 50 }), recipe: { in: { iron: 3, coal: 3 }, out: { weapons: 2, ammo: 4 } } },
    // storage
    stockpile:  { name: "Stockpile", skill: "building", slots: 0, build: W(40, {}), cap: { _raw: CONFIG.stockpileCap } },
    barn:       { name: "Barn", skill: "building", slots: 0, build: W(120, { logs: 30 }), cap: { _food: CONFIG.barnCap } },
    // living/service
    woodhouse:  { name: "Wood House", skill: "building", slots: 0, build: W(120, { logs: 20 }), housing: 3, firewoodMult: 1.0 },
    stonehouse: { name: "Stone House", skill: "building", slots: 0, build: W(160, { stone: 40 }), housing: 3, firewoodMult: 0.5 },
    tavern:     { name: "Tavern", skill: "building", slots: 1, build: W(200, { logs: 40, stone: 20 }), amenity: { happiness: 8 }, consumes: { ale: 2 } },
    chapel:     { name: "Chapel", skill: "building", slots: 0, build: W(250, { stone: 60 }), amenity: { happiness: 5 } },
    school:     { name: "School", skill: "building", slots: 1, build: W(200, { logs: 40 }), learnMult: 2 },
    hospital:   { name: "Hospital", skill: "medicine", slots: 2, build: W(220, { logs: 40, stone: 30 }), heal: true },
    tradingpost:{ name: "Trading Post", skill: "building", slots: 1, build: W(180, { logs: 40 }), trade: true },
    // combat + water
    well:       { name: "Well", skill: "building", slots: 2, build: W(80, { stone: 30 }), produce: { water: 34 } },
    watchtower: { name: "Watchtower", skill: "building", slots: 1, build: W(160, { logs: 30, stone: 20 }), defense: 6 },
    wall:       { name: "Wall", skill: "building", slots: 0, build: W(300, { stone: 80 }), defense: 12 },
  };

  /* ------------------------------------------------------- MANUAL (base) JOBS */
  // available without buildings; lower yield. resolved by `skill`.
  const MANUAL_JOBS = {
    forage:     { name: "Forage", skill: "provision", produce: { fruit: 6, veg: 6 } },
    fetchwater: { name: "Fetch Water", skill: "provision", produce: { water: 22 } },
    chopwood:   { name: "Chop Wood", skill: "labor", produce: { logs: 9 } },
    quarrystone:{ name: "Gather Stone", skill: "labor", produce: { stone: 6 } },
    build:      { name: "Build", skill: "building", isBuild: true },
    watch:      { name: "Stand Watch", skill: "combat", defense: 4 },
    scout:      { name: "Scout", skill: "provision", scout: true },
    tend:       { name: "Tend Sick", skill: "medicine", heal: true, consumes: { herbs: 1 } },
    rest:       { name: "Rest", skill: null, effort: 0 },
  };

  /* --------------------------------------------------------------- DECREES */
  // effects applied while active (policies) or once (actions)
  const DECREES = {
    ration_food: { name: "Ration Food", type: "policy", consumeMult: { food: 0.6 }, happiness: -8, desc: "Eat less — stretches food, lowers spirits." },
    ration_firewood: { name: "Ration Firewood", type: "policy", consumeMult: { firewood: 0.6 }, warmth: -8, happiness: -5, desc: "Burn less — saves fuel, but colder and glum." },
    ration_water: { name: "Ration Water", type: "policy", consumeMult: { water: 0.6 }, happiness: -6, desc: "Stretch water — lowers spirits." },
    austerity: { name: "Austerity", type: "policy", noAle: true, happiness: -6, desc: "Hold back the ale — lowers spirits." },
    overtime: { name: "Mandatory Overtime", type: "policy", effortBonus: 25, happiness: -7, desc: "Everyone pushes harder — more output, drains stamina & spirits." },
    day_of_rest: { name: "Day of Rest", type: "action", restAll: true, happiness: 6, desc: "A day off — lifts spirits." },
    prio_build: { name: "Prioritize Construction", type: "policy", desc: "Favor building projects." },
    prio_defense: { name: "Prioritize Defense", type: "policy", defenseBonus: 3, desc: "Favor watch & weapons (+defense)." },
    reserve: { name: "Strategic Reserve", type: "policy", reserveDays: 10, happiness: -3, desc: "Hold a food/fuel reserve as insurance." },
    feast: { name: "Feast", type: "action", happiness: 18, spend: { protein: 8, ale: 6 }, desc: "Spend food & ale for a big morale boost." },
    curfew: { name: "Curfew", type: "policy", defense: 4, happiness: -6, desc: "Lockdown — safer from raids, lowers spirits." },
    conscription: { name: "Conscription", type: "policy", happiness: -8, desc: "Press more colonists into defense." },
    exile: { name: "Exile", type: "action", happiness: -10, desc: "Banish a colonist — frees a mouth, wounds morale." },
    open_gates: { name: "Open the Gates", type: "policy", desc: "Welcome any wanderer who arrives." },
    trade_policy: { name: "Trade Policy", type: "policy", desc: "Auto-trade surplus at the Trading Post." },
    seize: { name: "Seize Hoards", type: "action", happiness: -12, desc: "Confiscate private stores — gain goods, anger people." },
    quarantine: { name: "Quarantine", type: "policy", diseaseSlow: 0.5, happiness: -6, desc: "Isolate the sick — slows disease, lowers spirits." },
    tonic: { name: "Tonic Distribution", type: "action", spend: { herbs: 8 }, healAll: 6, desc: "Spend herbs to heal everyone a little." },
  };

  /* ---------------------------------------------------------------- EVENTS */
  // weighted by location/season/state. effect(state) mutates and returns a log line.
  const EVENTS = [
    { id: "cold_snap", w: 1.0, loc: ["rockies"], season: ["Autumn", "Winter"], cat: "weather",
      effect: s => { s._coldShock = 25; return "A cold snap bites — Warmth plummets."; } },
    { id: "mild_spell", w: 0.8, cat: "weather", minor: true,
      effect: s => { s._warmShock = 15; return "A mild spell — fuel goes further, spirits lift."; } },
    { id: "heatwave", w: 1.0, loc: ["desert"], season: ["Summer"], cat: "weather",
      effect: s => { drain(s, "water", 8 * s.colonists.length); return "A heatwave — water vanishes."; } },
    { id: "drought", w: 0.9, loc: ["desert"], season: ["Summer", "Autumn"], cat: "weather",
      effect: s => { drain(s, "water", 12 * s.colonists.length); return "Drought. The wells and crops run dry."; } },
    { id: "flood", w: 0.9, loc: ["delta"], cat: "weather",
      effect: s => { drainFood(s, 0.12); return "Floodwaters spoil part of the stores."; } },
    { id: "bumper", w: 0.7, cat: "weather", minor: true,
      effect: s => { add(s, "grain", 20); add(s, "veg", 15); return "A bumper harvest fills the barn."; } },
    { id: "fever", w: 1.0, loc: ["jungle", "delta"], cat: "disease", choice: true,
      effect: s => { sicken(s, 2); return "Fever spreads through the colony."; } },
    { id: "plague", w: 0.4, cat: "disease",
      effect: s => { sicken(s, 3); return "A plague takes hold."; } },
    { id: "raid", w: 0.55, cat: "human",
      effect: s => raid(s, 6 + Math.min(26, Math.floor(wealth(s) / 75))) },
    { id: "predator", w: 0.8, loc: ["rockies", "jungle"], cat: "wildlife",
      effect: s => raid(s, 5, true) },
    { id: "trader", w: 0.7, cat: "arrival", minor: true, choice: true,
      effect: s => { add(s, "tools", 4); return "A wandering trader passes through; we barter for tools."; } },
    { id: "wanderer", w: 1.3, cat: "arrival", minor: true, choice: true,
      effect: s => { if (housingFree(s) > 0) { s.colonists.push(makeColonist(s.rng, s.location, "wanderer")); return "A wanderer asks to join — and is taken in."; } return null; } },
    { id: "cache", w: 0.6, cat: "discovery", minor: true,
      effect: s => { add(s, "iron", 10); add(s, "tools", 3); return "A scout turns up an old cache."; } },
    { id: "oasis", w: 0.6, loc: ["desert"], cat: "discovery", minor: true,
      effect: s => { add(s, "water", 40); return "An oasis is found — water for weeks."; } },
    { id: "pests", w: 0.6, cat: "wildlife", minor: true,
      effect: s => { drainFood(s, 0.08); return "Pests get into the grain."; } },
    { id: "death_old_age", w: 0.13, cat: "population",
      effect: s => { const c = oldest(s); if (c && c.age >= 50 && s.colonists.filter(x => x.alive).length > 4) { kill(s, c, "old age"); return `${c.name} passes peacefully of old age.`; } return null; } },
  ];

  /* ------------------------------------------------------------- LOCATIONS */
  const LOCATIONS = {
    rockies: { name: "Canadian Rockies", coldness: 1.1, water: 1.0, foodMult: 0.9, hasWater: true, hasOre: true,
      buildings: { fisher: 0.4 }, difficulty: "Medium" },
    jungle: { name: "Yucatán Jungle", coldness: 0.2, water: 1.0, foodMult: 1.3, hasWater: true, hasOre: false, tainted: true,
      buildings: { mine: 0, quarry: 0.6 }, difficulty: "Medium" },
    desert: { name: "Sonoran Desert", coldness: 0.7, water: 0.5, foodMult: 0.65, hasWater: false, hasOre: true,
      buildings: { fisher: 0, forester: 0.4 }, difficulty: "Hard" },
    oregon: { name: "Coastal Oregon", coldness: 0.8, water: 1.2, foodMult: 1.2, hasWater: true, hasOre: false,
      buildings: { mine: 0 }, difficulty: "Easy" },
    delta: { name: "Mississippi Delta", coldness: 0.5, water: 1.1, foodMult: 1.25, hasWater: true, hasOre: false, tainted: true,
      buildings: { mine: 0, quarry: 0.5 }, difficulty: "Med-Hard" },
  };

  /* ---------------------------------------------------------------- NAMES */
  const FIRST = ["Mara", "Tomas", "Devi", "Cole", "Okoro", "Ines", "Silas", "Pena", "Rhea", "Joon", "Vex", "Asha", "Bram", "Lior", "Nadia", "Cyrus", "Wren", "Hale", "Suri", "Dao"];
  const LAST = ["Okoro", "Vance", "Reyes", "Stryker", "Bell", "Cho", "Ndiaye", "Frost", "Aldridge", "Marsh", "Quill", "Vasquez", "Tran", "Oduya", "Kerr"];

  /* ============================================================ RNG (seeded) */
  function makeRng(seed) {
    let s = (seed >>> 0) || 123456789;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  /* ============================================================ HELPERS */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isFood = r => FOOD_TYPES.includes(r);
  function add(s, res, n) { s.store[res] = clamp((s.store[res] || 0) + n, 0, capFor(s, res)); }
  function drain(s, res, n) { s.store[res] = Math.max(0, (s.store[res] || 0) - n); }
  function totalFood(s) { return FOOD_TYPES.reduce((a, r) => a + (s.store[r] || 0), 0); }
  function foodVariety(s) { return FOOD_TYPES.filter(r => (s.store[r] || 0) > 0.5).length; }
  function drainFood(s, frac) { for (const r of FOOD_TYPES) s.store[r] = (s.store[r] || 0) * (1 - frac); }
  function wealth(s) { return RESOURCES.reduce((a, r) => a + (s.store[r] || 0), 0) + Object.keys(s.buildings).length * 30; }
  function capFor(s, res) {
    let cap = CONFIG.baseCap;
    for (const id in s.buildings) {
      const b = BUILDINGS[id]; if (!b || !b.cap) continue;
      if (b.cap._raw && !isFood(res)) cap += b.cap._raw;
      if (b.cap._food && isFood(res)) cap += b.cap._food;
    }
    return cap;
  }
  function housing(s) { let h = CONFIG.baseHousing; for (const id in s.buildings) { const b = BUILDINGS[id]; if (b && b.housing) h += b.housing * s.buildings[id]; } return h; }
  function housingFree(s) { return housing(s) - s.colonists.length; }
  function season(s) { return CONFIG.SEASONS[Math.floor((s.day % CONFIG.DAYS_PER_YEAR) / CONFIG.DAYS_PER_SEASON)]; }
  function oldest(s) { return s.colonists.slice().sort((a, b) => b.age - a.age)[0]; }

  function effectiveSkill(c, skill) {
    let v = c.skills[skill] || 0;
    for (const t of c.traits) { const tr = TRAITS[t]; if (tr && tr.mods[skill]) v += tr.mods[skill]; }
    return clamp(v, 0, 12);
  }
  const skillFactor = sk => 0.7 + Math.min(sk, 10) * 0.06;
  const wellbeing = c => (c.hunger + c.warmth + c.health + c.happiness) / 400;

  /* ============================================================ GENERATION */
  function makeColonist(rng, locId, origin) {
    const arch = pick(rng, ARCHETYPES);
    const skills = {};
    for (const sk of SKILLS) skills[sk] = ri(rng, 0, 3) + (arch.bias[sk] || 0);
    // traits: 1-3, archetype-biased, no incompatibles
    const traits = [];
    const want = ri(rng, 1, 3);
    const pool = [...(arch.traitOdds || []), ...Object.keys(TRAITS)];
    let guard = 0;
    while (traits.length < want && guard++ < 40) {
      const t = pick(rng, pool);
      if (traits.includes(t)) continue;
      if (traits.some(x => (TRAITS[x].incompatible || []).includes(t))) continue;
      traits.push(t);
    }
    const startH = origin === "rescue" ? 60 : 90;
    return {
      id: rng().toString(36).slice(2, 8), name: pick(rng, FIRST) + " " + pick(rng, LAST),
      age: ri(rng, 17, 55), archetype: arch.id, learns: arch.learns || 1, traits, skills,
      stamina: 100, hunger: 70, warmth: 55, health: startH, happiness: 62,
      sick: 0, origin: origin || "founder", alive: true,
    };
  }

  /* ============================================================ NEW GAME */
  function newGame(opts) {
    opts = opts || {};
    const seed = opts.seed || 12345;
    const location = opts.location || "oregon";
    const rng = makeRng(seed);
    const s = {
      seed, location, rng, day: 0, hour: 0, turn: 0,
      colonists: [], store: {}, buildings: {}, projects: [], assignments: {},
      decrees: {}, log: [], dead: [], over: false, ending: null,
    };
    for (const r of RESOURCES) s.store[r] = 0;
    // starting cache
    Object.assign(s.store, { grain: 30, fruit: 14, veg: 10, protein: 16, water: 35, logs: 40, tools: 8 });
    s.buildings.camp = 1; // baseline shelter/storage (virtual)
    for (let i = 0; i < CONFIG.START_FOUNDERS; i++) s.colonists.push(makeColonist(rng, location, "founder"));
    for (const c of s.colonists) s.assignments[c.id] = { job: "forage", effort: CONFIG.effortDefault };
    s.colonyHealth = computeColonyHealth(s);
    return s;
  }

  /* ===================================================== COLONY HEALTH */
  // establishment: how built-out the colony is (0 at a bare camp, 100 fully set up)
  function establishment(s) {
    const B = s.buildings, any = ids => ids.some(id => B[id]);
    let n = 0;
    if (any(["gatherer", "hunter", "fisher", "cropfield", "orchard", "pasture"])) n++; // food production
    if (B.well) n++;                                                                   // a water source
    if (any(["woodhouse", "stonehouse"])) n++;                                         // real shelter
    if (B.woodcutter || LOCATIONS[s.location].coldness < 0.4) n++;                     // heat (or warm enough)
    if (any(["barn", "stockpile"])) n++;                                               // storage
    return n / 5 * 100;
  }
  function computeColonyHealth(s) {
    const live = s.colonists.filter(c => c.alive);
    if (!live.length) return 0;
    const pop = live.length, w = CONFIG.chWeights;
    const vit = live.reduce((a, c) => a + (c.hunger + c.warmth + c.health + c.happiness) / 4, 0) / pop;
    const cush = d => clamp(d / CONFIG.chCushionTargetDays, 0, 1) * 100;
    const foodC = cush(totalFood(s) / pop / CONFIG.foodPerDay);
    const waterC = cush((s.store.water || 0) / pop / CONFIG.waterPerDay);
    const cushion = season(s) === "Winter"
      ? (foodC + waterC + cush((s.store.firewood || 0) / (pop * CONFIG.firewoodPerDayCold * LOCATIONS[s.location].coldness))) / 3
      : (foodC + waterC) / 2;
    const popC = clamp(pop / 8, 0, 1) * 100;
    const ch = w.vitals * vit + w.cushion * cushion + w.establish * establishment(s) + w.pop * popC;
    return clamp(Math.round(ch), 0, 100);
  }

  function turnHours(ch) { for (const [lt, hrs] of CONFIG.turnBands) if (ch < lt) return hrs; return 8640; }

  /* ===================================================== COMBAT */
  function colonyDefense(s) {
    let d = 0;
    for (const c of s.colonists) {
      if (!c.alive) continue;
      const a = s.assignments[c.id];
      if (a && (a.job === "watch" || a.job === "watchtower")) d += effectiveSkill(c, "combat") + 4;
    }
    for (const id in s.buildings) { const b = BUILDINGS[id]; if (b && b.defense) d += b.defense * s.buildings[id]; }
    if (s.decrees.curfew) d += 4;
    if (s.decrees.prio_defense) d += 3;
    // weapons/ammo
    if ((s.store.weapons || 0) > 0) { d += Math.min(s.store.weapons, s.colonists.length) * 2; }
    if ((s.store.ammo || 0) > 0) { d += 3; drain(s, "ammo", 2); }
    return d;
  }
  function raid(s, strength, isAnimal) {
    const def = colonyDefense(s) + ri(s.rng, 1, 20);
    const margin = def - (strength + 10);
    let line;
    if (margin >= 10) line = isAnimal ? "Predators driven off cleanly." : "Raiders repelled without loss.";
    else if (margin >= 0) { hurtRandom(s, 1); line = "Attack repelled — minor injuries."; }
    else if (margin >= -5) { hurtRandom(s, 1); stealStores(s, 0.1); line = "Attackers break through — wounded, and stores stolen."; }
    else if (margin >= -10) { const c = hurtRandom(s, 2); stealStores(s, 0.2); line = "A breach — casualties and heavy theft."; }
    else { const c = killRandom(s); stealStores(s, 0.3); line = `Disaster: ${c ? c.name + " is lost" : "lives lost"} and the stores ransacked.`; }
    return line;
  }
  function hurtRandom(s, n) { const live = s.colonists.filter(c => c.alive); for (let i = 0; i < n && live.length; i++) { const c = pick(s.rng, live); c.health = Math.max(1, c.health - 35); } }
  function killRandom(s) { const live = s.colonists.filter(c => c.alive); if (live.length <= 0) return null; const c = pick(s.rng, live); kill(s, c, "raid"); return c; }
  function stealStores(s, frac) { for (const r of RESOURCES) s.store[r] = (s.store[r] || 0) * (1 - frac); }
  function sicken(s, n) { const live = s.colonists.filter(c => c.alive); for (let i = 0; i < n && live.length; i++) { const c = pick(s.rng, live); c.sick = Math.max(c.sick, 6); } }
  function kill(s, c, cause) { c.alive = false; c.cause = cause; s.dead.push(c); delete s.assignments[c.id]; }

  /* ===================================================== ONE DAY TICK */
  function tickDay(s) {
    const live = () => s.colonists.filter(c => c.alive);
    const colds = season(s) === "Winter" ? CONFIG.firewoodPerDayCold * (LOCATIONS[s.location].coldness) : 0;
    const events = [];

    // ---- production
    const haveTools = (s.store.tools || 0) > 0;
    for (const c of live()) {
      const a = s.assignments[c.id]; if (!a) continue;
      let effort = a.effort != null ? a.effort : CONFIG.effortDefault;
      if (s.decrees.overtime) effort = Math.min(CONFIG.effortMax, effort + 25);
      if (s.decrees.day_of_rest) effort = 0;
      const jobDef = MANUAL_JOBS[a.job] ? MANUAL_JOBS[a.job] : (s.buildings[a.job] ? BUILDINGS[a.job] : MANUAL_JOBS.forage);
      const skl = jobDef.skill;
      const sf = skl ? skillFactor(effectiveSkill(c, skl)) : 1;
      const eff = (effort / 100) * sf * (haveTools ? 1 : CONFIG.noToolPenalty);

      // building output
      if (jobDef.isBuild) { addBuildProgress(s, c, eff * 60); }
      else if (jobDef.produce) {
        const L = LOCATIONS[s.location];
        const seas = jobDef.seasonal ? (jobDef.seasonal[season(s)] != null ? jobDef.seasonal[season(s)] : 1) : 1;
        for (const r in jobDef.produce) {
          let m = eff * seas;
          if (isFood(r)) m *= L.foodMult;
          if (r === "water") m *= L.water;
          add(s, r, jobDef.produce[r] * m);
        }
      } else if (jobDef.recipe) {
        const scale = recipeScale(s, jobDef.recipe, eff);
        for (const r in jobDef.recipe.in) drain(s, r, jobDef.recipe.in[r] * scale);
        for (const r in jobDef.recipe.out) add(s, r, jobDef.recipe.out[r] * scale);
      } else if (jobDef.heal) {
        // handled in vitals (medic)
      }
      // tool wear
      if (haveTools && effort > 0) drain(s, "tools", CONFIG.toolUsePerWorkerDay);
      // learning by doing
      if (skl && effort > 0) c.skills[skl] = Math.min(10, c.skills[skl] + 0.01 * c.learns);
      // stamina
      const rec = CONFIG.recoveryBase * wellbeing(c);
      c.stamina = clamp(c.stamina + rec - effort, 0, 100);
    }

    // building passive consumption (tavern uses ale)
    for (const id in s.buildings) { const b = BUILDINGS[id]; if (b && b.consumes) for (const r in b.consumes) drain(s, r, b.consumes[r] * s.buildings[id]); }

    // ---- consumption: food
    const pop = live().length;
    let foodMult = s.decrees.ration_food ? 0.6 : 1;
    let need = pop * CONFIG.foodPerDay * foodMult;
    const fed = consumeFood(s, need);
    const variety = foodVariety(s);
    // water
    let waterNeed = pop * CONFIG.waterPerDay * (s.decrees.ration_water ? 0.6 : 1);
    const waterOK = (s.store.water || 0) >= waterNeed; drain(s, "water", waterNeed);
    // firewood (cold)
    let fireShort = false;
    if (colds > 0) {
      let fwMult = 1; for (const id in s.buildings) { const b = BUILDINGS[id]; if (b && b.firewoodMult != null) fwMult = Math.min(fwMult, b.firewoodMult); }
      let fwNeed = pop * colds * fwMult * (s.decrees.ration_firewood ? 0.6 : 1);
      fireShort = (s.store.firewood || 0) < fwNeed; drain(s, "firewood", fwNeed);
    }

    // ---- vitals per colonist
    const amenityHappy = amenity(s);
    const hospital = !!s.buildings.hospital;
    for (const c of live()) {
      // hunger
      if (fed >= 1) c.hunger = clamp(c.hunger + CONFIG.eatGain, 0, 100);
      else c.hunger = clamp(c.hunger - CONFIG.starveLoss * (1 - fed), 0, 100);
      // warmth target
      let target = 80;
      if (colds > 0) {
        const noFire = clamp(70 - LOCATIONS[s.location].coldness * 45, 5, 70); // mild climates stay survivable
        target = fireShort ? noFire : 74;
        if ((s.store.coats || 0) > 0) { target += 14; drain(s, "coats", CONFIG.coatUsePerColdDay); }
      } else target = 85;
      if (s.decrees.ration_firewood) target -= 8;
      c.warmth = clamp(c.warmth + (target - c.warmth) * CONFIG.warmthApproach, 0, 100);
      // sickness
      if (c.sick > 0) { c.sick -= (s.decrees.quarantine ? 1.5 : 1); }
      // health
      let dh = 0; let drainCause = null; let worst = 0;
      const note = (loss, cause) => { dh -= loss; if (loss > worst) { worst = loss; drainCause = cause; } };
      if (c.hunger < 25) note(CONFIG.starveHealthLoss, "starvation");
      if (c.warmth < 25) note(CONFIG.coldHealthLoss, "exposure");
      if (!waterOK) note(CONFIG.thirstHealthLoss, "thirst");
      if (c.sick > 0) note(CONFIG.sickHealthLoss * (hospital ? 0.4 : 1), "sickness");
      if (dh === 0) { dh += CONFIG.healRest; if (hospital) dh += CONFIG.healHospital * 0.3; if (variety >= 3) dh += 2; }
      else c._lastDrain = drainCause;
      c.health = clamp(c.health + dh, 0, 100);
      // happiness
      let ht = wellbeing(c) * 100 * 0.6 + amenityHappy;
      if (variety >= 3) ht += CONFIG.varietyBonus;
      ht -= decreeHappy(s);
      c.happiness = clamp(c.happiness + (ht - c.happiness) * CONFIG.happinessApproach, 0, 100);
      // death
      if (c.health <= 0) { kill(s, c, c._lastDrain || "illness"); events.push(`${c.name} has died (${c.cause}).`); }
    }

    // spoilage without barn
    if (!s.buildings.barn) for (const r of FOOD_TYPES) s.store[r] = (s.store[r] || 0) * (1 - CONFIG.spoilNoBarn);

    // ---- medic healing (tend job / hospital)
    for (const c of live()) { const a = s.assignments[c.id]; if (a && (a.job === "tend" || a.job === "hospital") && (s.store.herbs || 0) > 0) { drain(s, "herbs", 1); const sickest = live().sort((x, y) => x.health - y.health)[0]; if (sickest) sickest.health = clamp(sickest.health + CONFIG.healHerbTonic, 0, 100); } }

    s.day++;
    return events;
  }

  function consumeFood(s, need) {
    const have = totalFood(s); if (have <= 0) return 0;
    const ratio = Math.min(1, need / have);
    let consumed = 0;
    for (const r of FOOD_TYPES) { const take = (s.store[r] || 0) * ratio; s.store[r] -= take; consumed += take; }
    return Math.min(1, consumed / Math.max(0.001, need));
  }
  function recipeScale(s, recipe, eff) {
    let scale = eff;
    for (const r in recipe.in) { const avail = s.store[r] || 0; const want = recipe.in[r] * eff; if (want > avail) scale = Math.min(scale, (avail / recipe.in[r]) || 0); }
    return Math.max(0, scale);
  }
  function amenity(s) { let h = 0; for (const id in s.buildings) { const b = BUILDINGS[id]; if (b && b.amenity && b.amenity.happiness) { if (id === "tavern" && (s.store.ale || 0) <= 0) continue; h += b.amenity.happiness * s.buildings[id]; } } return h; }
  function decreeHappy(s) { let p = 0; for (const id in s.decrees) { if (!s.decrees[id]) continue; const d = DECREES[id]; if (d && d.happiness && d.happiness < 0) p += -d.happiness; } return p; }
  function addBuildProgress(s, c, amt) {
    const proj = s.projects.find(p => p.active) || s.projects[0];
    if (!proj) return;
    proj.work += amt;
    if (proj.work >= BUILDINGS[proj.id].build.work) finishProject(s, proj);
  }
  function finishProject(s, proj) {
    s.buildings[proj.id] = (s.buildings[proj.id] || 0) + 1;
    s.projects = s.projects.filter(p => p !== proj);
    s.log.push(`Built: ${BUILDINGS[proj.id].name}.`);
    // reassign builders to operate? leave to controller
  }
  function startProject(s, id) {
    const b = BUILDINGS[id]; if (!b) return false;
    for (const r in b.build.mats) if ((s.store[r] || 0) < b.build.mats[r]) return false;
    for (const r in b.build.mats) drain(s, r, b.build.mats[r]);
    s.projects.push({ id, work: 0, active: true });
    return true;
  }

  /* ===================================================== ADVANCE TURN */
  function advanceTurn(s) {
    if (s.over) return { over: true };
    const hours = turnHours(s.colonyHealth);
    const maxDays = hours < 24 ? 1 : Math.round(hours / 24);
    const startDay = s.day, startSeason = season(s); const logs = [];
    for (let d = 0; d < maxDays; d++) {
      const ev = tickDay(s);
      logs.push(...ev);
      let stop = ev.length > 0;            // a death this day
      if (s.rng() < eventChance(s)) {
        const e = pickEvent(s);
        if (e) { const line = e.effect(s); if (line) logs.push(line); if (!e.minor) stop = true; }
      }
      if (s.colonists.filter(c => c.alive).length === 0) { s.over = true; break; }
      if (season(s) !== startSeason) stop = true;   // re-plan at each season change
      if (stop) break;
    }
    s.turn++; s.hour += (s.day - startDay) * 24;
    s.colonyHealth = computeColonyHealth(s);
    if (s.colonists.filter(c => c.alive).length === 0) { s.over = true; s.ending = s.ending || "The colony is gone."; }
    return { over: s.over, turnHours: hours, daysElapsed: s.day - startDay, season: season(s), log: logs, colonyHealth: s.colonyHealth };
  }
  function eventChance(s) { return CONFIG.eventChancePerDay * (0.5 + wealth(s) / 700) * (0.7 + s.colonists.length * 0.06); }
  function pickEvent(s) {
    const seas = season(s), loc = s.location;
    const pool = EVENTS.filter(e => (!e.loc || e.loc.includes(loc)) && (!e.season || e.season.includes(seas)));
    if (!pool.length) return null;
    const total = pool.reduce((a, e) => a + e.w, 0); let r = s.rng() * total;
    for (const e of pool) { r -= e.w; if (r <= 0) return e; }
    return null;
  }

  /* ===================================================== SAVE / LOAD */
  const SAVE_VERSION = 1;
  function serialize(s) { const { rng, ...rest } = s; return JSON.stringify({ v: SAVE_VERSION, seed: s.seed, rngState: null, state: rest }); }
  function deserialize(json) {
    const o = JSON.parse(json); const s = o.state; s.rng = makeRng((s.seed || 1) + s.turn * 7 + s.day * 13); return s;
  }

  return {
    CONFIG, RESOURCES, FOOD_TYPES, SKILLS, TRAITS, ARCHETYPES, BUILDINGS, MANUAL_JOBS,
    DECREES, EVENTS, LOCATIONS,
    makeRng, newGame, advanceTurn, tickDay, computeColonyHealth, turnHours,
    startProject, effectiveSkill, skillFactor, season, totalFood, foodVariety,
    housing, housingFree, wealth, colonyDefense, makeColonist, serialize, deserialize,
    capFor, SAVE_VERSION,
  };
}));
