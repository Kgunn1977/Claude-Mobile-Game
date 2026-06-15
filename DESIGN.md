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

A **turn = one week**, opening on the **Monday Briefing**.

### 2.1 The Monday Briefing (four beats, one per line)
1. **The Week That Was** — every outcome from last week, *one event per line*.
2. **State of the Colony** — tangible numbers (see §4). Food & Water shown as
   **days of supply**.
3. **On Your Desk** — petitions and requests from colonists.
4. **Issue This Week's Orders** — go to Assignments.

Then you assign work, **Advance**, the week simulates with the dice, and next
Monday's briefing *is* the story.

### 2.2 Pages (swipe left → right)
`Briefing → Colony Stats → Colonist Stats → Assignments`
*(planned later: Chronicle (full story log), Events.)*

---

## 3. Command & resolution

### 3.1 Work points
- Each colonist's **work points available this week = current Stamina (0–100).**
- **Tasks** cost work points; you **scale the investment to scale the output**
  (Forage for 20 vs. Forage for 80 → very different yields).
- A colonist can split points across multiple task types in a week.
- **Decrees** cost no labor — they cost **standing** (paid in Happiness). This is
  where resistance is born (rationing, curfews, exile, taking in strangers).
- **Projects** have a `TotalWork`; multiple colonists contribute over multiple
  weeks; **workers are re-assigned every Monday**. Completion unlocks a benefit.

### 3.2 The roll (D&D-style, with degrees of success)
```
ROLL = d20 + Skill + TraitMods − ConditionPenalty   vs   DC
   DC:  easy 10 · medium 15 · hard 20 · brutal 25
   ConditionPenalty = −2 for each vital under 30 (stacking)
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
OUTPUT      = PointsInvested × YieldPerPoint[task] × SkillFactor × RollMultiplier
SkillFactor = 0.7 + Skill×0.06     (skill 0 → 0.7, 5 → 1.0, 10 → 1.3)
```
*All bracketed constants are tuning dials, calibrated in playtest.*

### 3.4 Stamina, work & recovery (replaces a separate "fatigue" stat)
```
Points available     = current Stamina (0–100)
Stamina_next         = clamp( Stamina − PointsUsed + Recovery , 0, 100 )
Recovery             = [60] × Wellbeing      (hungry/cold/sick/sad → far less)
Sustainable workload ≈ Recovery (~60/wk)
```
Push someone to 100 and they crash to ~60 next week → fewer points → overwork
punishes itself. Unspent capacity **is** rest; no Rest button needed.

---

## 4. The five vitals (per colonist, 0–100)

| Vital | Rises with | Falls with | At low (<30) |
|---|---|---|---|
| **Stamina** | rest / light weeks | working | poor output, error-prone (roll penalty) |
| **Hunger** *(100 = full)* | eating from Food stores | time passing | drains Health (starvation) |
| **Warmth** | shelter, heat, warm season | cold, winter, exposure | drains Health, hurts Happiness |
| **Health** | Heal tasks, medicine, rest | injury, sickness, cold, starvation | low Stamina recovery; **0 = death** |
| **Happiness** | fed/warm/healthy, good events, friends | neglect, grief, hated decrees | **mental breaks**; **resistance** |

There is **no Loyalty stat**. Resistance to leadership runs off **Happiness**:
unhappy colonists slack, refuse orders, sap others, and at the bottom break or
leave. The vitals web together — neglect food → Hunger → Health → Stamina won't
recover → work collapses → Happiness craters → breaks. One bad winter cascades.

---

## 5. Economy — Banished-based (locked)

We adopt the economy of **Banished** as-is (a proven, tightly-balanced colony
economy), with **two deliberate additions** — *Water* and *Stamina* — and a
**combat bolt-on** (Banished has no military; we do).

### 5.1 Resources
- **Food** — four diet types: **Grain · Fruit · Vegetable · Protein**.
  *Variety* (eating from several types) improves Health.
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
- **Storage:** Stockpile (bulky raw) · Barn (food & goods) · Market (distribution)
- **Living / Service:** Houses (burn Firewood for Warmth) · Tavern · Chapel ·
  School · Hospital · Trading Post
- **Our additions:** Weaponsmith · Watchtower · Wall · Well (drinking Water)

Survival = **keeping Food, Firewood, and Tools in surplus**; shortfalls cascade
(the Banished "death spiral").

### 5.5 Note on theme
Banished is medieval-pioneer in flavor (iron & coal mines, wool, ale). We keep
its mechanics literally for v1; a post-collapse **reskin** (e.g. Scrap-salvage in
place of mined Iron/Coal) is a later, cosmetic pass — not a v1 concern.

---

## 6. Colonists

### 6.1 Skills (0–10) — *expandable list*
Launch set (6): **Provision · Labor · Crafting · Building · Medicine · Combat.**
- **Provision** — all food: crops, orchards, pastures, gathering, hunting, fishing, herbs
- **Labor** — raw extraction: chop logs, quarry stone, mine iron/coal
- **Crafting** — refining: Firewood, Tools, Coats, Ale, Weapons/Ammo
- **Building** — constructing the projects/buildings
- **Medicine** — tend sick, Apothecary, Hospital
- **Combat** — defense, raids

(Scouting, Leadership, and a Farming/Foraging split are deferred to later builds.)

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
| Provision × Combat | Peaceful Provider (+Prov/−Cmb) | Scavenger (+Cmb/−Prov) |
| Labor × Crafting | Brute Force (+Lab/−Craft) | Fine Hands (+Craft/−Lab) |
| Labor × Building | Hauler (+Lab/−Build) | Foreman (+Build/−Lab) |
| Labor × Medicine | Hard Case (+Lab/−Med) | Soft-Spoken (+Med/−Lab) |
| Labor × Combat | Workhorse (+Lab/−Cmb) | Brawler (+Cmb/−Lab) |
| Crafting × Building | Detailer (+Craft/−Build) | Framer (+Build/−Craft) |
| Crafting × Medicine | Maker (+Craft/−Med) | Apothecary (+Med/−Craft) |
| Crafting × Combat | Pacifist (+Craft/−Cmb) | Gunsmith (+Cmb/−Craft) |
| Building × Medicine | Mason (+Build/−Med) | Mender (+Med/−Build) |
| Building × Combat | Engineer (+Build/−Cmb) | Bruiser (+Cmb/−Build) |
| Medicine × Combat | Medic (+Med/−Cmb) | Butcher (+Cmb/−Med) |

**Temperament traits** (e.g. *Hardy* +stamina, *Volatile* breaks easier,
*Night Owl*) are a separate, later group — they don't touch skills, so they stay
out of this matrix. Trait effects may also touch stamina, mood tendencies, and
mental-break behavior.

### 6.3 Generation
A single generator produces every colonist: **name → age → background archetype
(biases skills toward a legible identity, e.g. ex-soldier → Fight) → 1–3 traits →
vitals**. Population source varies the starting condition/flavor only.

### 6.4 Relationships
Opinion of each other colonist (−100…+100), crystallizing into ties: **friend,
rival, partner, family**. Deaths and breaks ripple through the web.

### 6.5 Mental breaks & resistance (off Happiness)
```
Happiness <35  on edge (risk)
          <20  minor break — lose their week / lash out / refuse an order
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
3. Begin at **Week 1, Monday Briefing.**

---

## 10. The Storyteller
First build ships a **Cassandra-style** storyteller: a moderate event cadence
that **scales gently with colony size/wealth** (more to lose → more knocking at
the gate), drawing from the location-biased event deck. **Emergent, not scripted
— no authored peaks or valleys.** The storyteller is a swappable module so
Phoebe (calm) / Randy (chaos) variants can drop in later.

---

## 11. Fail state & the chronicle
The run ends when **all colonists are dead or have left**. The game then
presents a **Chronicle** — a summary of the colony's life: how long it lasted,
who lived and died, the defining events. Every run is a story you can retell.

---

## 12. Content to seed for the first playable build
All flexible/data-driven; this is the starter content still to be specified:
- **Task catalog** — the weekly orders that run the Banished buildings (Gather,
  Hunt, Fish, Farm, Chop, Quarry, Mine, gather Herbs; refine at Woodcutter /
  Blacksmith / Tailor / Brewery / Weaponsmith; Tend Sick, Stand Watch, Scout).
- **Project catalog** — the buildings to construct (§5.4) with `TotalWork` costs.
- **Decrees** — leadership calls that cost standing (Ration, Curfew, Exile,
  Take in strangers…).
- **Event deck** — what randomly happens *to* you, biased by location.
- **Trait names & effect values** — the full 30-trait table.
- **Background archetypes** — skill-biasing colonist origins.

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

*End of locked design v1. Next: §12 starter content, then build on the
designated branch.*
