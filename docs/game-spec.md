# Game Spec

*The build spec for our game — the actual design we are implementing, assembled one piece at a time. Separate from the three research docs (which describe Banished/RimWorld/ONI) and from vision.md (the story) and tech-stack.md (the tech). Pieces are added in no particular order.*

---

## Map

### Scope / phasing
- **v1 (testing, now):** a single fixed map — **512 × 512 tiles, all Meadow**, square grid.
- **Later:** **multiple map types**, each affecting how stats are calculated.
- **Eventually:** **procedurally generated** maps.

### Grid
- **Square grid, 512 × 512 = 262,144 tiles.** Coordinates run `(x, y)` from `(0,0)` at the top-left to `(511,511)` at the bottom-right (origin top-left, assumed — flag if you prefer otherwise).
- **Every tile has a terrain type.** In v1, every tile is **Meadow**.
- **Buildings occupy rectangular footprints** of one or more tiles (e.g. 1×1 small, up to ~4×6 large), placed by the player on the grid.

### Terrain & map types (future)
- A tile's **terrain type feeds the stat calculations** — most directly **travel speed** across it (which sets how fast resources are gathered with distance), and likely also harvest rates, building output, and comfort/temperature effects.
- A **"map type"** is the overall makeup of a generated map (e.g. meadow, forest, mountain) — it shifts which terrains dominate, and therefore the colony's whole stat profile, before procedural generation is even involved.
- **Meadow = the baseline terrain.** Proposed: treat Meadow as the neutral default (all terrain multipliers = 1.0) so every other terrain is tuned relative to it. (Decision to confirm.)

### Placement in the UI (navigation)
- The app's top level is a **horizontal swipe-paged interface** — full-screen pages the player swipes left/right between.
- The **Map is the first (leftmost) page.** The data screens occupy the pages to its right.
- On the Map page the player **views the grid and interacts with it to place buildings.** Because the grid is 512×512 on a phone, the map page needs **pan and pinch-zoom**.

### Open sub-decisions (to settle later)
- **Camera:** pan + pinch-zoom range, default zoom, and whether the full 512×512 is reachable by scrolling.
- **Terrain list & values:** the actual set of terrain types and their stat multipliers.
- **"Map type" meaning:** whether it's a biome preset (terrain mix), a set of global modifiers, or both.
- **Rendering:** how terrain is drawn (tile sprites vs. tinting) — ties into the Flame layer from tech-stack.md.
- **Coordinate origin:** top-left assumed; confirm.

---

## Characters (v1 scope)

- v1 has **no traits, backstories, or social systems** — workers have **skills only**. (Traits, life stories, and friends/enemies are deferred to a later version.)
- Workers are still individual and named, but in v1 they are mechanically defined **only by their skill levels**.

## Skills (v1) — 6

- **Cook** — operates the Kitchen (prepares food into meals).
- **Builder** — constructs **all** placed buildings (houses, Kitchen, Sawmill, Chopping Block — everything).
- **Miner** — harvests Stone nodes.
- **Logger** — harvests Tree nodes.
- **Forager** — harvests Berry Bush nodes.
- **Laborer** — operates processing buildings (Sawmill, Chopping Block).

*Proposed mechanic (to confirm): every worker can do any job, just slower without the matching skill; skill level scales the speed/yield of matching tasks and improves by doing that work. Exact leveling scale TBD.*

## Time & speed (v1)

- **1 in-game day = 10 real minutes at 1× speed** (600 seconds/day).
- **Speed controls:** **Pause, 1×, 2×, 5×.** Higher speeds run the same simulation faster (2× → 5 min/day; 5× → 2 min/day).
- All time-based rates (calorie burn, firewood heating, harvest, conversions) are defined **per in-game day** and scale with the active speed.

## Jobs & assignment (v1) — Banished style

- Labor is assigned by **headcount per job**, not per individual: the player sets *how many* colonists fill each role, and the game **auto-assigns** who does what.
- Jobs map to the 6 skills: Cook, Builder, Miner, Logger, Forager, Laborer.
- **No priority grid** (that's RimWorld/ONI-style); just counts per role.
- *(Open: whether unassigned colonists form an idle/flex pool. Note the naming overlap — here "Laborer" is the processing-building operator, whereas in Banished it's the flex/haul pool. Confirm intended behavior for leftover colonists.)*

## Resource nodes (v1) — 3

- **Stone** — harvested by **Miner** → yields **Stone**.
- **Trees** — harvested by **Logger** → yields **Logs** (raw wood).
- **Berry Bush** — harvested by **Forager** → yields **Berries** (raw food).

All nodes are **infinite supply in v1**. Harvest speed scales with **travel distance (terrain)** and **worker skill**.

## Buildings (v1) — 6

Raw gathering happens at nodes; the Builder constructs all of these. They process goods, provide housing, or store resources:

- **Kitchen** — operated by **Cook**; converts **Berries → Meals** (calorie system, see *Food & calories* below).
- **Sawmill** — operated by **Laborer**; converts **Logs → Lumber**.
- **Chopping Block** — operated by **Laborer**; converts **Logs → Firewood**.
- **Wood House** — housing; built from Lumber (see *Housing* below).
- **Stone House** — housing; built from Stone (see *Housing* below).
- **Storage Area** — **instant build** (no construction time); stores the colony's resources. *(Likely also the drop-off/anchor point that gathering distance is measured to — to confirm. Cost & capacity TBD; assume unlimited in v1.)*

## Implied resource list (v1)

- **Raw:** Stone, Logs, Berries
- **Processed:** Lumber (Sawmill), Firewood (Chopping Block), Meals (Kitchen)

## Resources & logistics (v1)

- Each resource is a **single global total** (one running number per resource for the whole colony). Production **adds** to the total; consumption/building **subtracts** from it.
- **No hauling simulation in v1** — goods are not physically carried between buildings or storage; totals just update in place. *(Hauling — carts, workers moving goods, storage logistics — is a future version.)*
- **Distance still matters for gathering:** a gathering worker's harvest rate is reduced by the terrain-weighted distance from their assigned node back to the colony. (Distance acts as a math modifier on rate; whether workers are visibly animated traveling in v1, or that arrives with the hauling/animation system, is TBD.)

## Food & calories (v1) — ONI-style

Food energy is measured in **kilocalories (kcal)**, using ONI's calorie model adapted to our real-time clock.

- **Worker consumption:** each worker burns **1,000 kcal per in-game day** (ONI's per-cycle baseline). *(The length of an in-game "day" in real seconds is tied to the sim clock — TBD when we design the engine.)*
- **Belly/reserve:** each worker holds a personal calorie reserve up to **4,000 kcal** (ONI's belly size). They eat from colony food stores when the reserve runs low; at **0 kcal** they are starving. *(Starvation consequence — health/death — is deferred until a health system exists; for now it's a flagged "starving" state.)*
- **Food values (proposed defaults, tunable):**
  - **Berry (raw):** 500 kcal each — edible raw if no Meals are available.
  - **Kitchen recipe:** **4 Berries → 1 Meal**, where 1 Meal = **3,000 kcal** (≈1.5× the raw calories — cooking stretches food, the v1 reason to build a Kitchen).
- **Loop check:** 1 worker needs 1,000 kcal/day = **2 raw Berries/day**, or **1 Meal feeds a worker for 3 days**. So cooking cuts Berry demand by a third.
- **Working-home gate:** a colonist can only **consume calories if they live in a working (heated) home** (see Housing). No working home → they cannot eat → they go hungry and starve, regardless of how much food the colony has stored.

## Housing (v1)

Houses shelter colonists, and a colonist **must live in a working (heated) home to eat** (see Food). A home only "works" while it is being heated with **Firewood** — this is what Firewood is for.

- **Both house types are 2×2 and hold 4 colonists.**
- **Wood House** — built from **Lumber** (proposed: 20 Lumber). Cheaper to build; **full firewood heating cost**.
- **Stone House** — built from **Stone** (proposed: 30 Stone + 10 Lumber). Pricier to build, but **uses half the firewood** to stay warm.
- **Heating:** each working home consumes **Firewood** over time (Wood House = full rate; Stone House = half rate). If a home runs out of firewood it **stops working**, and its occupants can no longer consume calories until it's heated again.
- **The core tradeoff:** Wood Houses are cheap up front but expensive to keep warm; Stone Houses cost more to build but halve the ongoing firewood drain.

*(Future: warmth tied to seasons/temperature, comfort, and reproduction. In v1, heating is a constant firewood requirement on every home.)*

### Population (v1)

- **Founders only** — v1 starts with a fixed group of founder colonists and **no new arrivals** (no refugees, no reproduction yet). Founder count is a starting parameter *(TBD — propose 5–8)*.
- So the housing challenge in v1 is simply: build and **keep heated** enough homes (4 slots each) for all your founders, or the unhoused/cold ones starve.

All build costs and rates above are **starter defaults meant to be tuned**, not final balance.

## Open questions for v1 content

*Resolved:* building conversions; Builder builds everything; resources are global totals with no hauling in v1; **Firewood heats homes** (a home must be heated to function, and a colonist must live in a working home to eat); Wood vs Stone houses both 2×2 / hold 4, Stone uses half the firewood; **v1 is founders-only**; **1 day = 10 min @ 1×, speeds Pause/1×/2×/5×**; **Banished-style headcount job assignment**; **Storage Area** building added (instant build).

*Still open:*
1. **Sawmill & Chopping Block rates** — Logs in → Lumber/Firewood out per day (and how skill scales it).
2. **Firewood heating rate** — how much firewood a Wood House burns per day (Stone House = half).
3. **Founder count** — how many colonists you start with *(proposed 5–8)*.
4. **House build costs** — confirm the proposed 20 Lumber / (30 Stone + 10 Lumber).
5. **Storage Area** — is it the distance anchor for gathering? Cost/capacity (assume unlimited v1)?
6. **Idle/flex colonists** — behavior of unassigned colonists.
7. **Distance/harvest formula** — exact rule (still the biggest undefined mechanic).
8. **Worker travel animation in v1** vs. deferred with the hauling system.
