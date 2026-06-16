# Colony Game — Master Project Overview

*Everything decided so far, in one place, ready to hand to Claude Code. This is the consolidated source of truth. Deeper detail lives in the companion files (listed at the end). If anything here conflicts with an older file, this document wins.*

---

## 1. What the game is

A mobile **colony-management survival builder** — Android first, iPhone later. The long-term vision blends three games:

- **Banished** = the structural spine (wilderness survival, labor economy, seasons).
- **RimWorld** = the people and outside threats (named colonists, friends/enemies, hostile outsiders) — kept **light**, to allow colonies of dozens to hundreds.
- **Oxygen Not Included** = the resource/production accounting (running totals, conversion chains) — **not** its physics simulation.

**v1 strategy:** build the **Banished core loop first** as a clean, running game, then mutate it toward the blend. "The Banished core loop, on the phone, then grown."

### Premise (story flavor; names/places intentionally omitted)
The national government has collapsed after the economy was destroyed; foreign powers fight over the former nation's resources. An ordinary family man flees into the wilderness, loses a loved one to the elements, and realizes survival requires community. He leads a group of refugees deep into the forest to build a safe colony. They battle hunger, sickness, and hostile outsiders — and when a rumored new government turns out to be something darker, they face that the world has changed forever.

Themes: survival through community; refuge and rebuilding; pressure from within (hunger, sickness) and without (outsiders, a looming power); a permanently changed world.

---

## 2. How we build it (tech + workflow)

**Stack (decided — do not substitute):**
- **Flutter** (language: Dart) — one codebase → native Android now, iPhone later.
- **Flame** — 2D game engine on top of Flutter; handles the map, the game loop (clock), and animated sprites.
- **GitHub Actions** — free cloud builds that produce a **debug APK** the user downloads and installs by hand.
- Standard Flutter widgets for the data-screen UI.

**Workflow (phone-only development):**
- **This design chat** = the brain (specs, decisions). Holds all the docs.
- **Claude Code** (has GitHub connected) = the hands. It scaffolds the project, writes files into the repo, commits, pushes, and sets up the auto-build.
- The user never needs a computer: builds run in the cloud; the user downloads the APK from github.com's **Actions** tab in a phone browser and installs it (debug APKs need no store account; may need "install unknown apps" allowed once).
- **No paid services.** (Convenience tools like Shorebird/Codemagic were considered and dropped to stay free; the tradeoff is that every change goes through a full build + reinstall.)

**Costs:** $0 for all Android development and testing. Optional later: one-time **$25** Google Play account to publish; **$99/year** Apple account if/when doing the iPhone port.

**Architecture principles:**
- Real-time **simulation clock** that advances **only while the app is open**, with **pause + fast-forward**; **auto-pause when the app loses focus**.
- Keep the heavy simulation **separate from the UI** so tapping never stutters.
- Build systems **isolated and well-commented** (ECS-style is ideal) because an AI will edit one system at a time.
- The game is **mostly data screens** (Flutter UI) plus **one map layer** (Flame) that is static when viewed but redraws as things change; animated sprites come later.

---

## 3. v1 design spec (the Banished core loop)

All numbers below are **starter defaults meant to be tuned**, not final balance. The user has granted permission to pick sane defaults for anything unspecified.

### 3.1 Map
- **512 × 512 square grid**, every tile **Meadow** in v1 (a flat green field, for testing).
- Coordinates `(0,0)` top-left → `(511,511)` bottom-right.
- The map is the **leftmost page** of a **horizontal swipe-paged UI**; data screens are pages to its right.
- The map page supports **pan and pinch-zoom**; the whole grid is reachable.
- **Meadow = baseline terrain** (all terrain stat-multipliers = 1.0); other terrains will be tuned relative to it later.
- Buildings occupy **rectangular footprints** (1×1 up to several tiles).
- **Future:** multiple map types (each changing how stats are calculated), then **procedural generation**. (v1 uses a fixed meadow.)
- **Performance:** 262,144 tiles — do NOT make one component per tile; render the meadow as a batched/tiled background with a grid overlay.

### 3.2 Time & speed
- **1 in-game day = 10 real minutes at 1× speed** (600 seconds/day).
- Speed controls: **Pause, 1×, 2×, 5×** (2× → 5 min/day; 5× → 2 min/day).
- All time-based rates (calorie burn, firewood heating, harvest, conversions) are defined **per in-game day** and scale with the active speed.

### 3.3 Colonists (v1 = skills only)
- **No traits, backstories, or social systems in v1.** Colonists are individual and named but defined only by **skill levels**. (Traits/social are a later version.)
- **Population: founders only** — a fixed starting group, **no new arrivals and no reproduction** in v1. Founder count TBD *(propose 5–8)*.

### 3.4 Skills (6)
- **Cook** — operates the Kitchen.
- **Builder** — constructs **all** placed buildings.
- **Miner** — harvests Stone nodes.
- **Logger** — harvests Tree nodes.
- **Forager** — harvests Berry Bush nodes.
- **Laborer** — operates processing buildings (Sawmill, Chopping Block).
- **Proposed mechanic:** everyone can do any job, just slower without the matching skill; skill level scales speed/yield and improves by doing the work. Level scale TBD *(propose 0–10)*.

### 3.5 Jobs & assignment — Banished style
- Assign labor by **headcount per job** (set *how many* colonists fill each role); the game **auto-assigns** who does what.
- **No priority grid.** Just counts per role.
- *(Open: behavior of unassigned/idle colonists; note the naming overlap where "Laborer" here is a processing operator, not Banished's flex pool.)*

### 3.6 Resource nodes (3) — infinite supply in v1
- **Stone node** — Miner → **Stone**.
- **Tree node** — Logger → **Logs**.
- **Berry Bush node** — Forager → **Berries**.
- Harvest speed scales with **travel distance (terrain)** and **worker skill**.

### 3.7 Buildings (6) — Builder constructs all
- **Kitchen** (Cook): **Berries → Meals** (calorie system, see 3.9).
- **Sawmill** (Laborer): **Logs → Lumber**. *(rate TBD)*
- **Chopping Block** (Laborer): **Logs → Firewood**. *(rate TBD)*
- **Wood House**: built from **Lumber** *(propose 20)*; **2×2**, holds **4**; **full** firewood heating cost.
- **Stone House**: built from **Stone** *(propose 30 Stone + 10 Lumber)*; **2×2**, holds **4**; **half** firewood heating cost.
- **Storage Area**: **instant build** (no construction time); stores the colony's resources. Likely also the **distance anchor** that gathering travel is measured to. *(cost/capacity TBD; assume unlimited in v1)*

### 3.8 Resources & logistics (v1)
- Resource list — **Raw:** Stone, Logs, Berries. **Processed:** Lumber, Firewood, Meals.
- Each resource is a **single global total** (one number per resource for the whole colony); production adds, consumption subtracts.
- **No hauling simulation in v1** — goods are not physically carried between buildings/storage; totals update in place. (Hauling — carts, moving goods, storage logistics — is a later version.)
- **Distance still matters for gathering** (see 3.10).
- **Note:** Logs are the chokepoint resource — they feed the Sawmill (→ Lumber → Wood Houses) *and* the Chopping Block (→ Firewood → heating). Gate logs and people both freeze and can't expand.

### 3.9 Food & calories (ONI-style)
- Food energy in **kilocalories (kcal)**.
- **Each worker burns 1,000 kcal per in-game day.**
- Personal calorie **reserve up to 4,000 kcal** (a "belly"); they eat from colony stores when low; at **0 kcal** they are **starving**.
- **Berry (raw)** = **500 kcal**, edible raw if no Meals available.
- **Kitchen recipe:** **4 Berries → 1 Meal**, 1 Meal = **3,000 kcal** (~1.5× the raw calories — cooking stretches food; the v1 reason to build a Kitchen).
- Loop check: 1 worker/day = 1,000 kcal = **2 raw Berries**, or **1 Meal feeds a worker for 3 days**.
- **Working-home gate:** a colonist can only consume calories **if they live in a working (heated) home** (see 3.10). No working home → they cannot eat → they starve, regardless of stored food.

### 3.10 Housing & heating (the core survival rule)
- Both house types are **2×2 and hold 4 colonists**.
- A home only **"works" while it is being heated with Firewood.** This is what Firewood is for.
- **Wood House** = full firewood burn rate; **Stone House** = **half** the firewood burn rate (costs more to build, cheaper to keep warm — the central tradeoff).
- If a home runs out of firewood it **stops working**, and its occupants **can no longer eat** until it's heated again.
- *(Future: heating tied to seasons/temperature, plus comfort and reproduction. In v1, heating is a constant firewood requirement on every home.)*

### 3.11 Distance / harvest model — Banished system
- Faithful to Banished: a gathering worker **travels to the resource and back to the nearest Storage Area**, and that **travel time is the cost** (the farther the node, the slower the effective gather rate).
- Formula shape: **effective harvest rate = yield per trip ÷ (gather time + round-trip travel time)**, where travel time = **path distance × terrain movement cost** (Meadow = baseline). Roads/faster terrain reduce it later.
- **v1 implementation:** compute travel time as **math** so distant nodes genuinely produce slower; **do not** yet animate workers walking (that arrives with the hauling/animation system). *(Confirm if you'd rather animate from day one.)*

### 3.12 Lose condition (implied — needs teeth)
- Failure = colonists **starving/freezing out** (no food, or no heated homes). Exact consequence of "starving" (stop working → eventually leave/die) is **TBD** because there's no health system in v1; it needs *some* teeth so failure is reachable.

---

## 4. Staged build plan

Each stage produces a fresh APK the user installs and tests; we don't advance until the prior one works on the device.

- **Stage 0 — Pipeline:** Claude Code scaffolds the Flutter+Flame project in the repo and sets up GitHub Actions to output a debug APK.
- **Stage 1 — "It opens":** app launches; map (meadow) with pan/zoom as the leftmost swipe page; a second placeholder page; the clock running with Pause/1×/2×/5×; auto-pause on focus loss. *(Detailed in stage1-build-brief.md.)*
- **Stage 2 — Place + assign:** place the 6 buildings on the grid (footprints, Builder-constructed); Banished-style headcount job assignment.
- **Stage 3 — The economy lives:** nodes harvested (distance-weighted), conversions run, global totals move, calorie burn + firewood heating tick, the working-home gate enforced.
- **Stage 4 — Readout + save:** at least one real data screen showing totals and rates (in/out per day), plus save/load.

---

## 5. Open / tunable items (none are blocking; defaults are fine to start)

1. Founder count *(propose 5–8)*.
2. House build costs *(propose 20 Lumber / 30 Stone + 10 Lumber)*.
3. Sawmill & Chopping Block conversion rates (Logs → Lumber/Firewood per day; how skill scales them).
4. Firewood heating rate per Wood House per day (Stone House = half).
5. Skill leveling curve *(propose 0–10, improve-by-doing)* and how level maps to speed/yield.
6. Storage Area: confirm it's the distance anchor; cost/capacity (assume unlimited v1).
7. Idle/unassigned colonist behavior.
8. Lose-condition teeth (what "starving" actually does without a health system).
9. Worker travel animation in v1 vs. deferred.
10. A real data-screen list (which screens exist; what each shows).

---

## 6. Companion files (deeper detail)

- **stage1-build-brief.md** — the exact instructions to paste into Claude Code to build Stage 1.
- **game-spec.md** — the working build spec (same v1 content, with running notes/history).
- **tech-stack.md** — full plain-language tech + cost + workflow rationale.
- **vision.md** — the premise and themes.
- **banished.md / rimworld.md / oxygen-not-included.md** — deep research on all three source games (systems, resources, production, balancing). Reference material for when we grow past v1.
