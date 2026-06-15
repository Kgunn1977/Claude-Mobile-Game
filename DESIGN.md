# DESIGN — *Hollow Frontier* (working title)
### A turn-based colony-leadership story generator

> Society has collapsed. People kill each other for what's left. You lead a small
> band to a secluded corner of North America to build something that lasts.
> You don't swing the hammer — you give the orders. The story is whatever your
> people, their flaws, and the dice make of them.

This document is the locked design for the first playable build. Content lists
(tasks, events, traits, locations) are **data-driven and meant to grow** — what's
here is the seed, not the ceiling.

> Note: an earlier text-adventure prototype (`index.html` / `play.html` —
> *SIGNAL*) lives in this repo. This design supersedes it as the project's
> direction; that prototype is kept only as reference.

---

## 1. Pillars

1. **You are the leader — the player *is* the character.** No separate leader
   stat sheet. You issue directives; colonists *act on them*.
2. **The story is emergent.** It's assembled from the success and failure of
   tasks, resolved by dice + traits + colony state. No scripted arc, no authored
   climaxes — sometimes white-knuckle, sometimes quiet base-keeping.
3. **Systems collide to make drama** (the RimWorld lesson). A miserable, hungry
   colonist with a volatile trait near the food stores is a *story*.
4. **Endless.** You play until the colony dies out or scatters. Then you get a
   chronicle of the run.
5. **Text-forward, dashboard-driven, mobile-first.** Stats and calculators under
   the hood; clean readable surface on a phone. Runs offline, no build step.

**Reference points:** RimWorld (emergent sim + AI storyteller), **Banished**
(the resource economy — adopted as-is; see §5), Dungeons & Dragons (d20
resolution with degrees of success).

---

## 2. The core loop

Turns are **variable length, set by Colony Health** (§2.3): a struggling colony
is managed hour-by-hour; a thriving one coasts a year at a time. Each turn the
sim advances by the current tier's duration, runs your **standing assignments**
(§3.1), resolves events, then opens the **Briefing**.

### 2.1 The Briefing (four beats, one per line)
1. **What happened** — every outcome over the elapsed span (1 hour … 1 year),
   *one event per line*.
2. **State of the Colony** — tangible numbers (see §4) + **Colony Health**.
   Food / Water / Firewood shown as **days of supply**.
3. **On Your Desk** — petitions and requests from colonists.
4. **Issue orders** — adjust standing assignments / decrees, then **Advance**.

Then the next span simulates with the dice, and the next briefing *is* the story.

### 2.2 Pages (swipe left → right)
`Briefing → Colony Stats → Colonist Stats → Assignments`
*(planned later: Chronicle (full story log), Events.)*

### 2.3 Time — variable turn length (driven by Colony Health)
**Colony Health (0–100)** is a meta-stat (distinct from a colonist's Health
vital) that aggregates: average colonist vitals (Hunger/Warmth/Health/Happiness),
resource cushion (days of Food/Water/Firewood), population trend, and pending
threat. It sets how much time each turn covers:

| Colony Health | Turn length |
|---|---|
| ~0 (founding / collapse) | **1 hour** |
| low | **1 day** |
| mid-low | **1 week** |
| mid-high | **1 month** |
| high | **1 season (≈3 months)** |
| ~100 (flourishing) | **1 year** |

The game opens at worst health → **1-hour turns** (a desperate founding), and time
opens up as you stabilize. Crises automatically pull you back to fine-grained
control; calm fast-forwards. No scripted pacing — **the clock *is* the colony's
state.** Colony Health is the master dial on the dashboard.

**Turn length is a *maximum*, not a fixed beat.** A **(choice)** event or a sudden
crisis interrupts the sim and opens the Briefing early — so a "1-year" turn is cut
to days the moment raiders appear. Between interruptions, if nothing meaningful
happens the sim **auto-advances and only halts when there's news or a decision**,
so fine-grained turns never become empty clicking.

**The 1-hour band is narrow and quickly escaped.** A fresh colony sits at the floor
(no shelter, no stores) → hour-by-hour. But Colony Health climbs fast once
immediate needs (water, a fire, food for the night) are met, so the founding
scramble is only a handful of turns before time opens to days, then weeks. Health
is **sensitive at the bottom** — a deliberate anti–doom-loop so a struggling colony
can always claw back to longer turns by fixing root causes. The aggregate weights
and band cutoffs are tuning dials.

---

## 3. Command & resolution

### 3.1 Standing assignments (the work model)
- You assign each colonist to a **job** (operate a building, build a project,
  stand watch, scout…) as a **persistent order** with an **effort level**.
  Assignments carry over between turns; you re-tune them at each briefing.
- The sim runs assignments for the turn's duration at **per-day rates**, so the
  same orders yield a little over a 1-hour turn and a lot over a 1-year turn.
- **Effort vs. Stamina:** effort above a colonist's sustainable line drains
  Stamina over the turn (§3.4); light effort restores it. Sustainable orders hold
  steady over long turns; unsustainable ones degrade — and the resulting shortfall
  is often what drops Colony Health and shortens the *next* turn.
- **Decrees** cost no labor — they cost **standing** (paid in Happiness):
  rationing, curfews, exile, taking in strangers, etc.
- **Projects** have a `TotalWork`; assigned builders contribute per-day until it
  completes and unlocks its benefit.

### 3.2 The roll (D&D-style, with degrees of success)
```
ROLL = d20 + Skill + TraitMods − ConditionPenalty   vs   DC
   DC:  easy 10 · medium 15 · hard 20 · brutal 25
   ConditionPenalty = −2 for each vital under 30 (stacking, capped at −6)
```

| Result | Condition | Output × | Narrative effect |
|---|---|---|---|
| **Critical Success** | ≥ DC+10, or natural 20 | **1.3×** | bonus + a new thread opens |
| **Success** | ≥ DC | **1.0×** | as ordered |
| **Partial** | within 4 under DC | **0.6×** | done, but at a cost |
| **Failure** | 5+ under DC | **0.2×** | mostly wasted effort |
| **Critical Failure** | natural 1, or 10+ under | **0×** | accident / new problem |

### 3.3 Output
```
OUTPUT/day  = Effort × YieldPerDay[job] × SkillFactor × RollMultiplier
TOTAL       = OUTPUT/day × days in the turn
SkillFactor = 0.7 + Skill×0.06     (skill 0 → 0.7, 5 → 1.0, 10 → 1.3)
```
Over long turns the sim **samples multiple rolls** across the elapsed time, so a
year is never decided by one lucky or unlucky die.
*All bracketed constants are tuning dials, calibrated in playtest.*

### 3.4 Stamina, effort & recovery (replaces a separate "fatigue" stat)
Stamina (0–100) is a colonist's energy reservoir, updated **per day** of the turn:
```
daily ΔStamina = Recovery − Effort
   Recovery = [base] × Wellbeing   (hungry/cold/sick/sad → far less)
   sustainable when Effort ≈ Recovery
```
Sustained over-effort drains Stamina → lower output and higher mishap chance;
light effort restores it. Over a long, healthy turn, sustainable assignments hold
steady; push too hard and the colony frays, Colony Health drops, and turns
shorten. Light effort **is** rest; no Rest button needed.

### 3.5 Decrees (locked — 18)
Leadership calls that cost no labor, only **standing (Happiness)**. *Policies*
toggle on/off; *actions* fire once.
- **Rationing (policies):** Ration Food · Ration Firewood · Ration Water ·
  Austerity (hold Ale)
- **Labor:** Mandatory Overtime *(policy)* · Day of Rest *(action)* ·
  Prioritize Construction *(policy)* · Prioritize Defense *(policy)*
- **Reserves & morale:** Strategic Reserve *(policy)* · Feast *(action)*
- **Population & social:** Curfew *(policy)* · Conscription *(policy)* ·
  Exile *(action, targeted)* · Open the Gates *(policy)*
- **Trade & enforcement:** Trade Policy *(policy)* · Seize Hoards *(action)*
- **Health:** Quarantine *(policy)* · Tonic Distribution *(action)*

### 3.6 Combat resolution (raids & predators)
A threat arrives with a **Strength** (scaled by colony wealth + storyteller). The
colony's **Defense** = Σ(assigned defenders' Combat rolls × effort) + **Weapons/
Ammo** bonus (Ammo is consumed) + **Wall / Watchtower** bonuses. Compare by margin,
using the same five degrees as §3.2:

- **Decisive win** → repelled, no losses (maybe captives → Conquest, later)
- **Win** → repelled, minor injuries
- **Partial** → repelled, but casualties and some stores stolen
- **Loss** → breach: injuries/deaths, significant theft or building damage
- **Rout** → colonists killed or taken; a possible run-ending blow

No defenders assigned = you rely on Walls alone. Combat is rare but consequential.

---

## 4. The five vitals (per colonist, 0–100)

| Vital | Rises with | Falls with | At low (<30) |
|---|---|---|---|
| **Stamina** | rest / light effort | working | poor output, error-prone (roll penalty) |
| **Hunger** *(100 = full)* | eating from Food stores | time passing | drains Health (starvation) |
| **Warmth** | shelter, heat, warm season | cold, winter, exposure | drains Health, hurts Happiness |
| **Health** | Heal tasks, medicine, rest | injury, sickness, cold, starvation | low Stamina recovery; **0 = death** |
| **Happiness** | fed/warm/healthy, good events, friends | neglect, grief, hated decrees | **mental breaks**; **resistance** |

There is **no Loyalty stat**. Resistance to leadership runs off **Happiness**:
unhappy colonists slack, refuse orders, sap others, and at the bottom break or
leave. The vitals web together — neglect food → Hunger → Health → Stamina won't
recover → work collapses → Happiness craters → breaks. One bad winter cascades.

**Water** has no per-colonist thirst bar — instead, when the colony's Water runs
dry, every colonist's **Health** drains (the same way Hunger causes starvation).

**ConditionPenalty cap:** the −2-per-low-vital roll penalty (§3.2) is capped at
**−6** so a neglected colonist is bad at their job, not mathematically hopeless.

---

## 5. Economy — Banished-based (locked)

We adopt the economy of **Banished** as-is (a proven, tightly-balanced colony
economy), with **two deliberate additions** — *Water* and *Stamina* — and a
**combat bolt-on** (Banished has no military; we do).

### 5.1 Resources
- **Food** — four diet types: **Grain · Fruit · Vegetable · Protein**. "Days of
  supply" = total Food ÷ daily consumption (drives Hunger); **variety** (how many
  types are stocked) is tracked separately and feeds **Health**.
- **Raw:** **Logs · Stone · Iron · Coal · Herbs · Leather · Wool**
- **Refined:** **Firewood · Tools · Coats · Ale**
- **Our additions:** **Water** (resource + survival need; shortage damages Health
  like starvation) and **Stamina** (per-colonist, §3.4)
- **Combat add-on:** **Weapons · Ammo**
- **Trade goods** — abstract, via the Trading Post

### 5.2 Refinement chains (Banished's full set + our combat chain)
1. Logs → **Firewood** (heat)
2. Iron (+Coal) → **Tools** (work efficiency)
3. Leather / Wool → **Coats** (warmth)
4. Grain / Fruit → **Ale** (happiness)
5. *(ours)* Iron + Coal → **Weapons / Ammo** (defense)

Chains stay **shallow (≤2 steps)** — refinement matters but reads on a phone.

### 5.3 How the economy feeds the vitals
`Hunger ← Food (variety→Health) · Warmth ← Firewood (housing) + Coats ·
Health ← Herbs/Hospital + diet variety · Happiness ← Ale/Tavern, Chapel, goods ·
Water ← wells/gather · Stamina ← work/rest (§3.4)`

### 5.4 Buildings (Banished set, abstracted — no map or hauling)
- **Food:** Gatherer · Hunter · Fisher · Crop Field · Orchard · Pasture
- **Materials:** Forester · Woodcutter · Quarry · Mine · Herbalist
- **Refining:** Blacksmith · Tailor · Brewery
- **Storage:** Stockpile (bulky raw) · Barn (food & goods)
- **Living / Service:** Houses (burn Firewood for Warmth) · Tavern · Chapel ·
  School · Hospital · Trading Post
- **Our additions:** Weaponsmith · Watchtower · Wall · Well (drinking Water)

Survival = **keeping Food, Firewood, and Tools in surplus**; shortfalls cascade
(the Banished "death spiral").

### 5.5 Note on theme
Banished is medieval-pioneer in flavor (iron & coal mines, wool, ale). We keep
its mechanics literally for v1; a post-collapse **reskin** (e.g. Scrap-salvage in
place of mined Iron/Coal) is a later, cosmetic pass — not a v1 concern.

### 5.6 Project catalogue (locked — 27 buildings)
All buildings are constructed as multi-turn projects (Building skill; multiple
workers, re-assigned each Briefing). Costs = work units (w, accumulated from
builders' per-day effort) + materials; the operating skill / effect is noted. All
numbers are tuning dials.

- **Food (Provision):** Gatherer's Hut 120w+20 Logs (Fruit/Veg) · Hunting Cabin
  140w+25 Logs (Protein+Leather) · Fishing Dock 150w+30 Logs *(needs water)*
  (Protein) · Crop Field 100w+10 Logs (Grain/Veg, seasonal) · Orchard
  120w+15 Logs *(matures slowly)* (Fruit) · Pasture 160w+30 Logs+livestock
  (Protein+Leather/Wool)
- **Extraction (Labor):** Forester 120w+20 Logs (Logs) · Quarry 200w+30 Logs
  (Stone) · Mine 250w+40 Logs+20 Stone (Iron+Coal) · Herbalist Hut 100w+15 Logs
  (Herbs)
- **Refining (Crafting):** Woodcutter 100w+20 Logs (Logs→Firewood) · Blacksmith
  220w+30 Logs+40 Stone (Iron+Coal→Tools) · Tailor 140w+25 Logs
  (Leather/Wool→Coats) · Brewery 160w+30 Logs+20 Stone (Grain/Fruit→Ale) ·
  Weaponsmith 240w+30 Logs+50 Stone (Iron+Coal→Weapons/Ammo)
- **Storage:** Stockpile 40w (caps raw goods) · Barn 120w+30 Logs (caps
  food/goods, slows spoilage)
- **Living/Service:** Wood House 120w+20 Logs (+pop cap, burns more Firewood) ·
  Stone House 160w+40 Stone (+pop cap, ~½ Firewood) · Tavern 200w+40 Logs+20 Stone
  (Happiness, consumes Ale) · Chapel 250w+60 Stone (Happiness) · School
  200w+40 Logs (faster skill growth, *later*) · Hospital 220w+40 Logs+30 Stone
  (treats disease, boosts Medicine) · Trading Post 180w+40 Logs (trade)
- **Combat + Water (ours):** Well 80w+30 Stone (Water) · Watchtower
  160w+30 Logs+20 Stone (lowers raid success, early warning) · Wall 300w+80 Stone
  (major defense)

The **Wood vs Stone House** Firewood trade-off (Banished's signature) is in.

---

## 6. Colonists

### 6.1 Skills (0–10) — *expandable list*
Launch set (6): **Provision · Labor · Crafting · Building · Medicine · Combat.**
- **Provision** — all food: crops, orchards, pastures, gathering, hunting, fishing, herbs
- **Labor** — raw extraction: chop logs, quarry stone, mine iron/coal
- **Crafting** — refining: Firewood, Tools, Coats, Ale, Weapons/Ammo
- **Building** — constructing the projects/buildings
- **Medicine** — tend the sick at the Herbalist & Hospital (Herbs are the
  consumable — there is **no separate Medicine resource**)
- **Combat** — defense, raids

(Scouting, Leadership, and a Farming/Foraging split are deferred to later builds.)

**Learning by doing:** working a job slowly raises that skill — Townies fastest, and
a School (later) accelerates everyone. So a colony organically gets better at what
it repeatedly does.

### 6.2 Traits — 42 total, `incompatibleWith` enforced, 1–3 per colonist

Generated from the 6 skills: **N×(N+1) = 42** = 12 single-skill + 30 trade-off.
Magnitudes: single **±3**, trade-off **+2 / −2**. Compatible mods stack (capped);
`incompatibleWith` blocks contradictions (no positive+negative on the same skill,
no opposing trade-off pair on one colonist).

**Single-skill (12, ±3):**

| Skill | Positive (+3) | Negative (−3) |
|---|---|---|
| Provision | Forager's Eye | Town-Bred |
| Labor | Ox | Soft Hands |
| Crafting | Artisan | Ham-Fisted |
| Building | Master Builder | All Thumbs |
| Medicine | Healer's Hands | Squeamish |
| Combat | Fierce | Timid |

**Trade-off (30, +2 / −2)** — both directions for each of the 15 skill pairs:

| Pair | Trait A | Trait B |
|---|---|---|
| Provision × Labor | Woodsman (+Prov/−Lab) | Drudge (+Lab/−Prov) |
| Provision × Crafting | Field Hand (+Prov/−Craft) | Benchwright (+Craft/−Prov) |
| Provision × Building | Rover (+Prov/−Build) | Homesteader (+Build/−Prov) |
| Provision × Medicine | Hunter's Heart (+Prov/−Med) | Nurturer (+Med/−Prov) |
| Provision × Combat | Peaceful Provider (+Prov/−Cmb) | Marauder (+Cmb/−Prov) |
| Labor × Crafting | Brute Force (+Lab/−Craft) | Fine Hands (+Craft/−Lab) |
| Labor × Building | Hauler (+Lab/−Build) | Foreman (+Build/−Lab) |
| Labor × Medicine | Hard Case (+Lab/−Med) | Soft-Spoken (+Med/−Lab) |
| Labor × Combat | Workhorse (+Lab/−Cmb) | Brawler (+Cmb/−Lab) |
| Crafting × Building | Detailer (+Craft/−Build) | Framer (+Build/−Craft) |
| Crafting × Medicine | Maker (+Craft/−Med) | Folk Healer (+Med/−Craft) |
| Crafting × Combat | Pacifist (+Craft/−Cmb) | Gunsmith (+Cmb/−Craft) |
| Building × Medicine | Mason (+Build/−Med) | Mender (+Med/−Build) |
| Building × Combat | Architect (+Build/−Cmb) | Bruiser (+Cmb/−Build) |
| Medicine × Combat | Medic (+Med/−Cmb) | Butcher (+Cmb/−Med) |

**Temperament traits** (e.g. *Hardy* +stamina, *Volatile* breaks easier,
*Night Owl*) are a separate, later group — they don't touch skills, so they stay
out of this matrix. Trait effects may also touch stamina, mood tendencies, and
mental-break behavior.

### 6.3 Generation & background archetypes
A single generator produces every colonist: **name → age → background archetype
→ 1–3 traits → vitals**. Base skills roll low/random; the archetype applies a bias
and tilts trait odds (Soldier → *Fierce*; Doctor → *Healer's Hands*). Skills cap at
10. Population source (§7) varies only the starting condition/flavor.

Bias notation: **++** ≈ +3 to a primary skill · **+** ≈ +1–2 to a secondary ·
**+++** = exceptional (~+5, e.g. the Doctor).

**Archetypes (15, locked):**

| Archetype | Skill bias | Flavor |
|---|---|---|
| Farmer | ++Provision | worked the land before it fell apart |
| Hunter-Trapper | +Provision +Combat | tracks and trigger discipline |
| Laborer | ++Labor | strong back, few questions |
| Miner | +Labor +Building | at home underground |
| Mechanic | ++Crafting | fixes anything with parts and spite |
| Smith / Machinist | +Crafting +Labor | shapes metal into what's needed |
| Carpenter | ++Building | raises walls fast and square |
| Engineer | +Building +Crafting | designs the thing, then builds it |
| Nurse / Paramedic | ++Medicine | steady hands, hard stomach |
| Doctor | +++Medicine | rare and precious |
| Soldier / Veteran | ++Combat | trained for the worst |
| Police / Guard | +Combat +Labor | holds the line and the rules |
| Survivalist | +Provision +Combat | planned for this |
| Scavenger / Drifter | +Labor +Combat | lives off the bones of the old world |
| Townie | no skill bias, but **learns any job fastest** | soft hands, sharp mind |

### 6.4 Relationships
Opinion of each other colonist (−100…+100), crystallizing into ties: **friend,
rival, partner, family**. Deaths and breaks ripple through the web.

### 6.5 Mental breaks & resistance (off Happiness)
```
Happiness <35  on edge (risk)
          <20  minor break — stop working a while / lash out / refuse an order
          <10  major break — sabotage, fight, or flee        [trait-modified]
```

---

## 7. Population sources

| Source | When | Start condition | Flavor / risk |
|---|---|---|---|
| **Founders** | game start (6, see §9) | healthy, willing | the hand you're dealt |
| **Wanderers** | random event | neutral; traits partly hidden | gem or saboteur |
| **Rescues** | scouting / events | grateful (high Happiness) | often arrive hurt or sick |
| *Births* | *later build* | very high | child = years till useful, +1 mouth now |
| *Conquest* | *later build* | very low | win them over; betrayal risk |

**At launch:** Founders + Wanderers + Rescues. Births & Conquest come later.

---

## 8. Starting location (chosen at setup)

One pick at game start sets **environmental modifiers**, **biases the event
deck**, nudges **founder backgrounds**, and tunes **difficulty**. *Expandable.*

| Location | Climate / Warmth | Water | Food | Materials | Disease | Concealment → raids | Signature events | Difficulty |
|---|---|---|---|---|---|---|---|---|
| **Canadian Rockies** | Brutal winters (big Warmth drain) | Abundant | Moderate, seasonal | Abundant timber & stone | Low | Excellent → rare | Blizzard, avalanche, predators, frozen pass | Medium — *winter is the enemy* |
| **Yucatán Jungle** | Warm year-round | Abundant but tainted | Abundant (+Forage) | Wood plentiful, stone scarce | **High** | Good, but predators | Fever outbreak, ruins/loot, jaguar, deluge | Medium — *fed & warm, sickness kills* |
| **Sonoran Desert** | Hot days / cold nights, heat risk | **Scarce** (constant crisis) | Scarce (low yield) | Little wood; stone/adobe | Low | Open ground → see raiders coming (+defense) | Drought, dust storm, heatwave, oasis cache | Hard — *scarcity start* |
| **Coastal Oregon** | Mild, wet | Abundant | Abundant (sea+forest) | Abundant timber | Moderate | By sea → traders & sea-raiders | Storm, shipwreck salvage, sea-raid, trader landfall | Easy — *the balanced biome* |
| **Mississippi Delta** | Warm, humid | Abundant but tainted | Abundant (+Forage) | Scarce dry ground, flood-prone | **High** | Waterway maze, but floods | Flood, fever, frequent wanderers **and** raiders | Med-Hard — *abundance vs. disease & people* |

---

## 9. Setup flow
1. **Choose a starting location** (§8).
2. **Generate 6 founders.** Each founder slot can be **rerolled up to 5×** —
   you play a hand, but never a hopeless one.
3. **Start cache** (location-dependent): a few days of mixed Food, some Logs and
   Tools, and a makeshift **Camp** giving minimal shelter/Warmth.
4. Begin the **founding** — Day 1, the first Briefing, at 1-hour turns (§2.3).

---

## 10. The Storyteller
First build ships a **Cassandra-style** storyteller: a moderate event cadence
that **scales gently with colony size/wealth** (more to lose → more knocking at
the gate), drawing from the location-biased event deck. **Emergent, not scripted
— no authored peaks or valleys.** The storyteller is a swappable module so
Phoebe (calm) / Randy (chaos) variants can drop in later.

### 10.1 Event deck (locked — 35)
Drawn weighted by location, season, and colony state. `[ ]` = location bias;
**(choice)** = pauses for a decision, others resolve automatically.

- **Weather/season:** Cold Snap [Rockies] · Mild Spell · Heatwave [Desert] ·
  Drought [Desert] · Flood [Delta] · Monsoon [Jungle] · Coastal Storm [Oregon] ·
  Bumper Harvest
- **Disease/health:** Fever Outbreak [Jungle/Delta] **(choice)** · Plague ·
  Tainted Water [Jungle/Delta] · Infected Wound
- **Wildlife:** Predator Attack [Rockies/Jungle/Any] · Manhunter Pack ·
  Pests/Locusts
- **Human threats:** Raiders · Bandit Tribute **(choice)** · Sea-Raiders [Oregon]
- **Arrivals:** Wandering Trader **(choice)** · Refugees at the Gate **(choice)** ·
  Lone Wanderer **(choice)** · Rival Colony Contact **(choice)**
- **Internal/social:** Colonist Dispute **(choice)** · Romance Blossoms ·
  Theft from Stores **(choice)** · Despair · Leadership Challenge **(choice)**
- **Discovery:** Ruins/Cache [Jungle/Scout] · Oasis Found [Desert] · Old Stockpile
- **Infrastructure/population:** Fire! **(choice)** · Vermin in the Stores ·
  Tool Breakage · Death of Old Age · A Colonist Wishes to Leave **(choice)**

---

## 11. Fail state & the chronicle
The run ends when **all colonists are dead or have left**. The game then
presents a **Chronicle** — a summary of the colony's life: how long it lasted,
who lived and died, the defining events. Every run is a story you can retell.

---

## 12. Content to seed for the first playable build
All flexible/data-driven. Status:
- **Project catalog** — ✓ locked, see §5.6 (27 buildings).
- **Decrees** — ✓ locked, see §3.5 (18).
- **Trait table** — ✓ locked, see §6.2 (42 traits).
- **Event deck** — ✓ locked, see §10.1 (35 events).
- **Background archetypes** — ✓ locked, see §6.3 (15).
- **Job/assignment catalog** — standing jobs = one per building (§5.6) plus four
  non-building jobs with their resolving skill: **Build → Building · Stand Watch →
  Combat · Tend Sick → Medicine · Scout → Provision** (Scout uses Provision until a
  dedicated Scouting skill is added). *(fully derived from the above — no new content.)*

**The design is fully spec'd and ready to build.**

---

## 13. Technical shape
- **HTML / CSS / JS, mobile-first, offline, no build step.** Open a file, play.
- **Data-driven content** (skills, traits, tasks, events, locations, names) kept
  in separate data modules, distinct from the engine, so content can grow without
  touching game logic.
- **Save** via `localStorage`; the run persists on-device.
- **Architecture goals:** storyteller as a module; tasks/events/traits as
  registries; deterministic, inspectable resolution (so outcomes can be narrated).
```
engine/      loop, resolution, save
data/        skills, traits, tasks, events, locations, names, archetypes
ui/          briefing, colony, colonists, assignments pages
```

---

*End of locked design v1 — fully spec'd. Next: build on the designated branch.*
