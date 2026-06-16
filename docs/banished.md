# Banished

A small group of travelers, exiled and banished from their homeland, arrives in a remote, untamed wilderness carrying only minimal supplies. With no way to return and no outside nation to support them, they must build a self-reliant settlement from nothing and survive as an isolated society.

The setting is a grounded, pre-industrial world — roughly medieval in technology, with no magic, no fantasy elements, and no currency-driven economy. The community lives off the land in a temperate wilderness defined by changing seasons, where harsh winters, failed harvests, disease, and natural disasters are constant threats. Survival is generational: the original settlers age, work, raise children, and die, and the town endures only as long as its people can sustain themselves through careful management of food, shelter, warmth, and labor across the years.

## Resources

*Unit: every resource in Banished is measured in discrete **units** (whole-number item counts shown in storage, e.g. "Logs: 234"). There is no mass or volume — food, materials, and goods are all simple integer stockpiles.*

### Raw materials (gathered or mined)
- Log (wood)
- Stone
- Iron
- Coal

### Processed / crafted goods
- Firewood (cut from logs)
- Tools (forged from iron + coal/wood; required by every worker)
- Leather (from hunted game and livestock)
- Wool (from sheep)
- Warm coats / clothing (made from leather or wool)
- Herbs (medicine, gathered by the herbalist)
- Ale (brewed at the tavern from wheat or fruit)

### Food — Grains
- Corn
- Wheat

### Food — Vegetables (farmed)
- Bean
- Cabbage
- Pepper
- Potato
- Pumpkin
- Squash

### Food — Vegetables (gathered)
- Onion
- Mushroom
- Root

### Food — Fruits & nuts (orchards)
- Apple
- Cherry
- Peach
- Pear
- Plum
- Walnut
- Pecan
- Chestnut

### Food — Fruit (gathered)
- Berry

### Food — Protein / meat
- Venison (hunted deer)
- Beef (cattle)
- Mutton (sheep)
- Chicken
- Fish
- Eggs

### Livestock (pasture animals)
- Cattle
- Sheep
- Chicken

*Note: citizen health depends on dietary variety across the four food groups — grain, vegetable, fruit, and protein.*

## Production buildings & conversions

*All conversions are in **units**. Most are per single work action, and yields depend on worker education — shown as **uneducated / educated** where they differ. Extraction buildings draw from the land and have no material input.*

### Resource extraction (land → units)
- **Forester Lodge** — 1 full-grown tree → 2 / 3 logs (also replants trees)
- **Gatherer's Hut** — forest → berry, mushroom, onion, root (food units)
- **Herbalist** — forest → herbs
- **Hunting Cabin** — 1 deer → 160 venison + 4 leather / 200 venison + 6 leather
- **Fishing Dock** — river/lake water → fish
- **Mine** — underground → iron or coal (and stone); 1 surface boulder → 1 / 2 stone or iron
- **Quarry** — ground → stone (with small amounts of iron and coal)

### Farming & livestock (seed/animal + time → units)
- **Crop Field** — seed + growing season → vegetables and grains (bean, cabbage, pepper, potato, pumpkin, squash, corn, wheat)
- **Orchard** — fruit/nut trees + several years → apple, cherry, peach, pear, plum, walnut, pecan, chestnut
- **Pasture** — cattle → beef + leather; sheep → mutton + wool; chickens → chicken + eggs

### Manufacturing (units → units)
- **Woodcutter** — 1 log → 3 / 4 firewood
- **Blacksmith** — 1 iron + 1 log → 1 / 2 iron tools; 1 iron + 1 log + 1 coal → 1 / 2 steel tools
- **Tailor** — 2 leather → 1 / 2 hide coats; 2 wool → 1 / 2 wool coats; 2 leather + 2 wool → 1 / 2 warm coats
- **Tavern** — wheat or fruit → ale

### Exchange (no production)
- **Trading Post** — barter goods with visiting merchants (any resource ↔ any resource at trade values; no currency)

## Skills & traits

*Banished has no per-citizen skill levels and no personality traits. Citizens are near-interchangeable labor; the only individual differentiator is education, plus a few tracked life states.*

### Education (the only "skill" modifier)
- **Educated** vs **Uneducated** — children who attend a School become educated adults. Educated workers produce more per action (e.g. 4 vs 3 firewood, 2 vs 1 tools, 2 vs 1 stone/iron per boulder) and are better at every job. Uneducated workers are slower and waste more tools.

### Tracked individual states (not skills)
- **Age** — child → student → working adult → elderly (affects labor pool and mortality)
- **Health** — driven by food variety (four food groups) and access to herbs/hospitals
- **Happiness** — driven by housing quality, taverns/ale, town services (markets, wells, churches, cemeteries), and exposure to death/disaster
- **Profession** — the currently assigned job slot

*There are no traits, named skills, passions, or experience levels.*

## Map & environment

### Map
- A single, finite, procedurally generated map. There is no world map or off-map travel — the only outside contact is traders (by river) and nomads who arrive at the edges.
- Map-generation options set at start: **Town Name**; **Map Seed**; **Terrain Type** (Valleys / Mountains); **Terrain Size** (Small / Medium / Large); **Climate** (Mild / Fair / Harsh); **Disasters** (On / Off); **Starting Conditions** (Easy / Medium / Hard).

### Terrain features
- Valleys vs Mountains determine how much flat, buildable, farmable land exists (valleys = more usable land; mountains = less)
- Forests — trees regrow; required by foresters, gatherers, herbalists, and hunters
- Rivers, streams, and lakes — fishing, trading-post placement, bridges
- Surface stone & iron (hand-gathered) and finite underground deposits of stone, iron, and coal (mined)
- Fertile ground for crop fields and orchards

### Environment variables
- **Seasons** (Spring, Summer, Autumn, Winter) — drive the farming calendar (plant in spring, harvest by late autumn) and warmth needs
- **Climate / temperature** (Mild / Fair / Harsh) — sets winter length and severity, frost risk to fragile crops, and how much firewood + clothing citizens consume
- **Renewable vs finite populations** — deer and fish can be over-harvested to local extinction; trees regrow; ore/stone/coal deposits do not replenish

### Hazards & disasters (Disasters toggle)
- **Tornado** — destroys buildings and crops, kills citizens and livestock (slightly likelier in harsh climates)
- **Fire** — spreads building-to-building
- **Crop infestation / blight** — field disease that can spread to adjacent fields growing the same crop
- **Livestock infestation** — parasites that kill pasture animals
- **Disease / epidemic** — illness among citizens; occurs **regardless of the Disasters toggle**, with risk raised by trade, incoming nomads, and poor health

## Jobs / tasks / work / roles

### Model
Work is managed at the **profession** level, not the individual. Through the Professions window (or Town Hall) the player sets *how many* citizens hold each profession; the game auto-assigns and the citizens work without direct orders. Any unassigned citizen is a **Laborer** — the flexible pool that hauls goods, constructs queued buildings, clears land, and gathers surface stone/iron. A professional with no current work (a farmer in winter, a builder with nothing queued) automatically falls back to laborer tasks, then resumes their profession when work returns. There is **no priority grid** — only headcounts per profession and each building's worker-slot limit. Education raises efficiency; children become students, then enter the workforce.

### Professions (20)
- Laborer (default flex pool)
- Builder
- Farmer
- Herdsman (pasture / livestock)
- Gatherer
- Fisherman
- Hunter
- Woodcutter
- Forester
- Herbalist
- Blacksmith
- Brewer
- Tailor
- Vendor (staffs markets)
- Trader (staffs the trading post)
- Miner
- Stonecutter (quarry)
- Teacher (school)
- Physician (hospital)
- Cleric (church)

## Core survival needs

Each citizen continuously requires: **Food** (≈100 units/year, ideally across all four food groups), **Shelter** (a home — the homeless don't reproduce and fare poorly), **Warmth** (a heated home plus clothing in winter), **Tools** (consumed as they work — without tools, work efficiency drops sharply), and **Clothing** (wears out over time). Health and Happiness are derived states layered on top of these.

## Population & lifecycle

- Citizens are named individuals who marry, live in family homes, work, and die. The townsfolk are the game's "primary resource."
- **Aging:** citizens age ~5 steps per in-game year: child → student (if schooled) → working adult → elderly → death of old age.
- **Reproduction:** a married couple with their own home and space has children. **Housing is the lever** — too few homes (families bunched together) *or* too many (people living alone) both suppress births. Each home holds one family (up to ~8 people); vacancies open when elders die.
- **Nomads:** groups periodically request to join at the Town Hall — a way to offset population gaps, but they can carry disease.
- **Schooling** trades efficiency for slower reproduction (educated couples marry/breed later).
- **Death:** old age, starvation, freezing, disease, childbirth (female only), accidents, disasters.
- The **population pyramid** must be actively managed — a wave of same-age citizens causes a later wave of simultaneous old-age deaths and labor collapse.

## Health & disease

- Health is a **0–5 "hearts"** rating per citizen, driven mainly by **dietary variety** across the four food groups; **herbs** (from an herbalist) supplement a poor diet.
- Healthy citizens resist disease; poor health raises infection risk.
- **Epidemics** strike periodically (independent of the Disasters toggle), with risk raised by trade and incoming nomads. A **Hospital** staffed by a **Physician** reduces spread and death rate.

## Happiness

- A **0–5 "smiley"** rating. **Raised by** nearby Markets, Wells, Taverns (ale), Trading Posts, Cemeteries (proper burials), and Chapels — plus births and marriages.
- **Lowered by** homelessness, shortages of food/firewood/clothing, sickness, starvation, freezing, exposure to death (especially with no cemetery), and living near Mines/Quarries.
- Effect is **soft**: unhappy citizens idle more, lowering production — but happiness is not directly lethal.

## Temperature & warmth

- Warmth is a winter survival requirement with two components: a **heated home** (firewood or coal) and **clothing** (coats).
- **Wooden houses** need more fuel; **stone houses** use ~1/3 less and provide more warmth. **Coal** is a more efficient fuel than firewood.
- Cold citizens return home to warm up; without a heated home in winter they can **freeze to death**. Clothing lets them stay outdoors (working) longer in the cold and reduces fuel demand.

## Base building & non-production buildings

Beyond the production buildings already listed:
- **Housing:** wooden houses, stone houses, boarding houses (temporary shelter for the homeless/nomads)
- **Storage:** stockpiles (open-air), barns (food/goods), markets (a vendor restocks goods near homes, extending reach)
- **Services:** well (fire safety + happiness), school, hospital, chapel/church (cleric), cemetery, town hall (statistics, professions, nomads)
- **Infrastructure:** dirt and stone roads (faster movement → higher efficiency), bridges, tunnels
- **Trading post** (see Trade & economy)

## Farming, orchards & livestock

- **Crop fields:** one crop type per field; rotate crops to limit blight. Farming runs spring → autumn (idle in winter).
- **Orchards:** fruit/nut trees that take several years to mature, then yield annually.
- **Pastures:** raise cattle, sheep, or chickens (bought from traders) for beef/leather, mutton/wool, and chicken/eggs.
- Hunting (deer), gathering (wild foods), and fishing supplement farmed food but draw on finite/renewable wild populations.

## Trade & economy

- **No currency** — all exchange is barter through a **Trading Post** staffed by a Trader.
- Merchants arrive by **river** with goods; the player sets standing orders and pays in surplus resources at each item's trade value (e.g. log = 2, firewood = 4).
- Trade is the only way to obtain new **seeds, livestock**, and goods the town can't produce — and a key sink for surplus.

## Time, seasons & speed

- Time runs in **years** divided into four **seasons** (Spring, Summer, Autumn, Winter); citizens age ~5×/year.
- Seasons drive the loop: plant in spring, harvest by late autumn, survive winter on stockpiled food + fuel.
- **Game speed:** pause + multiple fast-forward speeds. The game is **open-ended — no win condition**; it ends only when the last citizen dies.

## Events & disasters

- Banished has **no event "director"** — adverse events fire **randomly and infrequently** (toggled by the Disasters setting at world creation), in contrast to RimWorld's directed storyteller.
- Types: tornado, fire (spreads building-to-building), crop blight/infestation, livestock infestation; disease/epidemics occur regardless of the toggle.
- In practice the main recurring "events" are simply **winter** and the **arrival of nomads**.

## Recreation & ale

- The only recreation/intoxicant system is the **Tavern**: a Brewer turns wheat or fruit into **Ale**, and citizens who live near a tavern and drink gain happiness. There is no other leisure or drug system.

## Logistics & storage

- **Hauling** is passive: when a worker produces a good, a Laborer (or the worker themselves) carries it to the nearest storage with space, pausing their job — so **storage proximity directly affects output** ("more walking = less working").
- **Stockpiles** — open-air; hold raw/bulk materials (logs, stone, iron, coal, firewood, tools, tradeable goods).
- **Barns** — enclosed; hold food and finished goods (food, firewood, tools, clothing, herbs, ale).
- **Markets** — distribution hubs. A **Vendor** actively gathers a balanced variety of goods from barns/stockpiles (using wheelbarrows, more per trip) and stocks the market; citizens within its radius shop there, taking only what they need, instead of hoarding or trekking to distant barns. Markets also curb hoarding and are a prerequisite for nomads.
- **Homes** keep a small personal supply of food (plus tools/clothing) that occupants draw from.
- **Trading Post** holds goods set aside for trade.
- There are **no player-set storage filters or priorities** in vanilla — assignment is automatic and proximity-based. The intended pattern is decentralized "nodes" (workplaces + a nearby barn/stockpile) feeding a central market.

## Balancing (availability · production · consumption)

### Overarching philosophy
Banished is a **closed, currency-free labor economy** whose permanent bottleneck is **people**. Every good is produced by worker-hours, so the real game is allocating a finite, slowly-growing population across competing needs. There is no threat-scaling and no tech tree — difficulty comes entirely from sustaining the population loop against seasonal and demographic pressure. It is balanced around **sustainability and foresight**, not combat or growth.

### Availability — how resources enter
- **Finite, non-renewing:** underground stone, iron, and coal deposits (deplete permanently); surface stone/iron is a limited early bonus.
- **Renewable but exhaustible:** forests (regrow if foresters replant); wild deer and fish (reproduce, but over-harvesting causes local extinction).
- **Seasonal/renewable:** farmed crops, orchards, pasture livestock — annual, weather-dependent yields, idle in winter.
- **External:** the **Trading Post** is the only source of things you can't make (new seeds, livestock, bulk goods), paid for in surplus by barter. **People** arrive via births and nomad groups.

### Production — the conversion economy
- Output is gated by **labor**: each building has worker slots, and a worker pauses production to haul goods, so **storage proximity is itself a production multiplier**.
- **Education** is the main efficiency lever: schooled workers are ~**30% more productive** (more for stationary jobs like blacksmith/tailor) and waste fewer tools — but schooling delays their entry to work and their childbearing.
- Conversion ratios are fixed and small (1 log → 3–4 firewood; 2 leather → 1–2 coats), so scaling output means scaling *workers + buildings*, which means scaling *food + housing + warmth* — a tightly coupled web.

### Consumption — the per-capita drains
- **Food:** ~**100 units/person/year** (children included), eaten at home; health requires *variety* across the four food groups.
- **Warmth:** firewood/coal burned per home each winter; **stone houses use ~⅓ less fuel** than wooden ones; harsher climates raise the burn rate.
- **Tools:** consumed steadily by work (faster in mining/farming); without tools, efficiency collapses, so a blacksmith chain is mandatory.
- **Clothing:** wears out over time; coats extend cold-weather working time and cut fuel demand.

### Dominant pressure
The lethal failure is the **demographic/seasonal spiral**: a winter shortfall (food, fuel, or clothing) or a lopsided population pyramid (a wave of elders dying together) collapses the labor force → collapses production → deepens the shortage. Playing well means holding buffers (a year+ of food and fuel) and a smooth age distribution.
