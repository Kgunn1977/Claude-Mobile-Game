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

**Reference points:** RimWorld (emergent sim + AI storyteller), Dungeons &
Dragons (d20 resolution with degrees of success).

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

## 5. Colonists

### 5.1 Skills (0–10) — *expandable list*
Launch set: **Build · Forage · Heal · Fight · Scout.**
(Craft, Farm, Lead, etc. added later.)

### 5.2 Traits — 30 total, `incompatibleWith` enforced, 1–3 per colonist
- **10 single-skill traits** — one positive + one negative per skill:
  - Build: *Natural Builder* / *All Thumbs*
  - Forage: *Forager's Eye* / *City-Born*
  - Heal: *Healer's Hands* / *Squeamish*
  - Fight: *Fierce* / *Timid*
  - Scout: *Pathfinder* / *Homebody*
- **20 trade-off traits** — both directions for each of the 10 skill pairs
  (raises one skill, lowers another). E.g. *Pacifist* (Build↑/Fight↓) and its
  mirror *Warmonger* (Fight↑/Build↓); *Wildling* (Forage↑/Build↓), etc.

Trait effects may touch: stamina, skill mods, per-task roll mods, mood
tendencies, and mental-break behavior.

### 5.3 Generation
A single generator produces every colonist: **name → age → background archetype
(biases skills toward a legible identity, e.g. ex-soldier → Fight) → 1–3 traits →
vitals**. Population source varies the starting condition/flavor only.

### 5.4 Relationships
Opinion of each other colonist (−100…+100), crystallizing into ties: **friend,
rival, partner, family**. Deaths and breaks ripple through the web.

### 5.5 Mental breaks & resistance (off Happiness)
```
Happiness <35  on edge (risk)
          <20  minor break — lose their week / lash out / refuse an order
          <10  major break — sabotage, fight, or flee        [trait-modified]
```

---

## 6. Population sources

| Source | When | Start condition | Flavor / risk |
|---|---|---|---|
| **Founders** | game start (6, see §8) | healthy, willing | the hand you're dealt |
| **Wanderers** | random event | neutral; traits partly hidden | gem or saboteur |
| **Rescues** | scouting / events | grateful (high Happiness) | often arrive hurt or sick |
| *Births* | *later build* | very high | child = years till useful, +1 mouth now |
| *Conquest* | *later build* | very low | win them over; betrayal risk |

**At launch:** Founders + Wanderers + Rescues. Births & Conquest come later.

---

## 7. Starting location (chosen at setup)

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

## 8. Setup flow
1. **Choose a starting location** (§7).
2. **Generate 6 founders.** Each founder slot can be **rerolled up to 5×** —
   you play a hand, but never a hopeless one.
3. Begin at **Week 1, Monday Briefing.**

---

## 9. The Storyteller
First build ships a **Cassandra-style** storyteller: a moderate event cadence
that **scales gently with colony size/wealth** (more to lose → more knocking at
the gate), drawing from the location-biased event deck. **Emergent, not scripted
— no authored peaks or valleys.** The storyteller is a swappable module so
Phoebe (calm) / Randy (chaos) variants can drop in later.

---

## 10. Fail state & the chronicle
The run ends when **all colonists are dead or have left**. The game then
presents a **Chronicle** — a summary of the colony's life: how long it lasted,
who lived and died, the defining events. Every run is a story you can retell.

---

## 11. Content to seed for the first playable build
All flexible/data-driven; this is the starter content still to be specified:
- **Task & project catalog** — the orders you can give (Forage, Build Shelter,
  Tend Sick, Scout, Fortify, Gather Water, projects like Watchtower/Greenhouse…).
- **Decrees** — leadership calls that cost standing (Ration, Curfew, Exile,
  Take in strangers…).
- **Event deck** — what randomly happens *to* you, biased by location.
- **Trait names & effect values** — the full 30-trait table.
- **Background archetypes** — skill-biasing colonist origins.

---

## 12. Technical shape
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

*End of locked design v1. Next: §11 starter content, then build on the
designated branch.*
