# RimWorld

A handful of survivors — often the castaways of a destroyed spaceship — find themselves stranded on a "rimworld": a remote, sparsely settled planet at the lawless edge of known space, far from the reach of any central authority. With little more than what they carried with them, they must establish a colony, survive, and ideally find a way off the planet.

The setting is science fiction with an unusually wide technological range. On a single world, neolithic tribes, medieval holdouts, industrial outlanders, and remnants of advanced spacefaring "glitterworld" technology can all coexist. This frontier is unpredictable and frequently hostile, populated by rival factions, raiders, dangerous wildlife, and harsh biomes and weather. The tone blends grim survival with dark comedy, and the experience is built around emergent storytelling — each colony's history of triumphs, disasters, betrayals, and losses becomes its own unfolding narrative.

## Resources

*Unit: all resources are counted in discrete **units** (whole items that stack in storage). Cooking and refining recipes are balanced internally by **nutrition** — most raw foods are 0.05 nutrition per unit.*

### Metals
- Steel
- Plasteel
- Silver
- Gold
- Uranium

### Stone (chunks → blocks)
- Sandstone
- Granite
- Limestone
- Slate
- Marble

### Other building materials
- Wood
- Jade

### Manufactured / crafted resources
- Components
- Advanced components
- Chemfuel
- Neutroamine (precursor; trade-only, cannot be crafted)
- Mortar shells: high-explosive, incendiary, EMP, smoke, antigrain warhead

### Textiles — Fabrics
- Cloth
- Synthread
- Devilstrand
- Hyperweave
- Wools: alpaca wool, bison wool, megasloth wool, muffalo wool, sheep's wool

### Textiles — Leathers (species-dependent; representative list)
- Plainleather
- Lightleather
- Patchleather
- Heavy fur
- Bearskin
- Birdskin
- Bluefur
- Camelhide
- Chinchilla fur
- Dog leather
- Elephant leather
- Foxfur
- Guinea pig fur
- Human leather
- Lizardskin
- Panthera fur
- Pigskin
- Rhinoceros leather
- Thrumbofur
- Wolfskin
- (additional leathers exist per animal species)

### Medicine
- Herbal medicine
- Medicine (industrial-tech)
- Glitterworld medicine

### Drugs (recreational & medical)
- Beer
- Smokeleaf joint
- Psychite tea
- Ambrosia
- Flake
- Yayo
- Wake-up
- Go-juice
- Penoxycyline
- Luciferium

### Food — Raw crops & plant matter
- Rice
- Corn
- Potatoes
- Strawberries
- Agave fruit
- Berries (wild)
- Cocoa / chocolate (raw)
- Hops (→ beer)
- Haygrass → hay
- Cotton (→ cloth)
- Healroot (→ herbal medicine)
- Psychoid (→ psychite drugs)
- Smokeleaf (→ joints)
- Nutrifungus
- Devilstrand (mushroom → fabric)

### Food — Meat & animal products
- Meat (many species-specific types)
- Human meat
- Insect meat
- Eggs (fertilized and unfertilized)
- Milk
- Insect jelly

### Food — Meals & preserved food
- Nutrient paste meal
- Simple meal
- Fine meal
- Lavish meal
- Survival meal (packaged; trade/quest only, not craftable)
- Pemmican
- Kibble
- Hay

## Production buildings & conversions

*Conversions are listed as inputs → outputs in **units**, except cooking, which is balanced by nutrition (most raw food = 0.05 nutrition/unit).*

### Extraction (no material input)
- **Growing zone / Hydroponics basin** — seed + soil/water + light + time → raw crop (units)
- **Deep drill** — labor + power → stone chunks, ore, steel, components, etc. (mined from deposits)

### Food preparation
- **Fueled stove / Electric stove**
  - ~0.5 nutrition raw food (≈10 units veg) → 1 simple meal
  - ~0.5 nutrition raw food, incl. meat/egg/milk → 1 fine meal
  - 0.5 nutrition veg + 0.5 nutrition meat (≈20 units) → 1 lavish meal
  - meat + plant → pemmican (preserved); meat + plant/hay → kibble (animal feed)
- **Campfire** — simple meals and pemmican (no power, slower)
- **Nutrient paste dispenser (+ hopper)** — 0.3 nutrition raw food → 1 nutrient paste meal
- **Butcher table / Butcher spot** — 1 animal corpse → meat (units) + leather (units); yield scales with body size

### Materials processing
- **Stonecutter's table** — 1 stone chunk → 20 stone blocks
- **Electric smelter** — 1 steel slag chunk → 15 steel; metal weapon/armor → 25% of crafting materials back
- **Biofuel refinery** — 70 wood → 35 chemfuel, *or* 3.5 nutrition raw food → 35 chemfuel
- **Fabrication bench** — 12 steel → 1 component; 1 component + 20 steel + 10 plasteel + 3 gold → 1 advanced component; also high-tech items

### Crafting (workbenches)
- **Fueled smithy / Electric smithy** — stuff (metal/wood/stone) → melee weapons (units)
- **Machining table** — steel + components + chemfuel → ranged weapons and mortar shells (units)
- **Hand tailor bench / Electric tailor bench** — cloth / leather / wool (units) → apparel (units)

### Chemistry & medicine
- **Drug lab**
  - 3 cloth + 1 herbal medicine + 1 neutroamine → 1 medicine
  - psychoid leaves → psychite tea / flake / yayo (yayo produced in bulk)
  - yayo + neutroamine → wake-up; yayo + neutroamine → go-juice
  - neutroamine → penoxycyline
  - smokeleaf leaves → smokeleaf joint

### Brewing
- **Brewery** — hops → wort (units)
- **Fermenting barrel** — wort → beer (≈1:1, ferments over ~6 days)

### Disposal (no useful output)
- **Electric crematorium / campfire (burn)** — corpses / unwanted items → destroyed (no resource returned)

## Skills & traits

### Skills
Every pawn has 12 skills, each level **0–20**. Skills gain XP by doing related work and slowly decay over time. Performance (speed, quality, success/failure) scales with level.

- Shooting
- Melee
- Construction
- Mining
- Cooking
- Plants
- Animals
- Crafting
- Artistic
- Medical
- Social
- Intellectual

**Passion** (per skill, set at generation): None (35% XP gain) · Interested 🔥 (100% XP, + mood) · Burning 🔥🔥 (150% XP, more mood). A pawn's backstory or traits can also make them **incapable** of a whole work type (e.g. "incapable of Violence/Dumb Labor/Intellectual").

### Traits
Each pawn has **1–3 traits** (plus an optional sexuality trait), fixed at generation — adults cannot gain or lose them. Many come in mutually exclusive spectrums.

- **Work & learning:** Industrious / Hard Worker / Lazy / Slothful · Fast Learner / Slow Learner · Too Smart · Great Memory · Neurotic / Very Neurotic
- **Mood & nerves:** Sanguine / Optimist / Pessimist / Depressive · Iron-Willed / Steadfast / Nervous / Volatile
- **Combat:** Trigger-Happy / Careful Shooter · Brawler · Tough · Wimp · Nimble · Bloodlust
- **Social & personality:** Kind / Abrasive · Psychopath · Cannibal · Greedy · Jealous · Ascetic · Gourmand · Misogynist / Misandrist · Annoying Voice · Creepy Breathing · Tortured Artist
- **Body & habits:** Beautiful / Pretty / Ugly / Staggeringly Ugly · Super-Immune / Sickly · Jogger / Fast Walker / Slowpoke · Quick Sleeper · Night Owl · Undergrounder · Masochist · Pyromaniac · Nudist · Transhumanist / Body Purist · Teetotaler / Chemical Interest / Chemical Fascination · Psychically Hypersensitive / Sensitive / Dull / Deaf
- **Sexuality (extra slot):** Gay · Bisexual · Asexual

*Backstories (childhood + adulthood) separately add skill bonuses/penalties and can disable work types, working alongside traits.*

## Map & environment

### World & local map
- A whole procedurally generated **planet** (a globe of tiles). The player picks planet coverage and a landing tile, then plays on a local map of configurable size (default 250×250, up to ~350×350).
- Tile/world factors: **latitude** (temperature & growing period), **hilliness** (Flat / Small hills / Large hills / Mountainous), rivers, coast, and roads.
- Caravans can travel the world map to other tiles, settlements, and sites.

### Biomes (core 12)
Temperate Forest · Arid Shrubland · Boreal Forest · Tundra · Desert · Tropical Rainforest · Temperate Swamp · Tropical Swamp · Cold Bog · Extreme Desert · Ice Sheet · Sea Ice. *(Later base updates add a few more, e.g. Lava Field.)* Each biome sets temperature band, soil fertility, vegetation/wildlife density, disease frequency, and growing-season length.

### Terrain underfoot
- Soil / fertility types: rich soil, soil, gravel, sand, marsh, stony (affect plant growth and movement speed)
- Terrain affordance — some terrain (marsh, sand) can't support heavy buildings
- Water: shallow, deep, marshy, moving (movement penalty or impassable)
- Underground rock types and mineable ore veins (steel, components, plasteel, etc.)

### Environment variables
- **Temperature** — per-biome, with seasonal (axial tilt) and day/night swings; drives hypothermia/heatstroke, crop growth, and food spoilage. Rooms have their own indoor temperature.
- **Weather** — clear, fog, rain, foggy rain, dry thunderstorm (wildfire risk), rainy thunderstorm, snowfall
- **Seasons & growing period** — latitude-dependent; winter halts outdoor growing in many biomes
- **Day/night cycle** — light level affects work speed (darkness penalty), plant growth, solar output, and some mood
- **Room/area stats** — Beauty, Cleanliness, Space, Light, indoor vs outdoor, roofed vs unroofed

### Environmental events / game conditions
- **Eclipse** — blocks sunlight (no solar power)
- **Solar flare** — disables all electronics
- **Toxic fallout** — poisons the air, kills plants, inflicts toxic buildup
- **Volcanic winter** — dims the sun: colder, slower plant growth
- **Cold snap / Heat wave** — sudden temperature swings
- **Flashstorm** — lightning strikes that start fires
- **Aurora** — mood boost
- **Psychic drone / soothe** — psychic conditions that lower or raise mood

## Jobs / tasks / work / roles

### Model
Work is managed through the **Work tab**, a grid of pawns × work types. In **standard mode** each work type is a simple on/off checkbox; in **manual mode** each is given a priority **1–4** (1 = highest, blank = never). All work of a higher priority is done before lower; ties are broken left-to-right (the columns are already ordered most-critical to least). Each work type also contains internal sub-tasks with their own fixed order. Skill level sets speed/quality and passions set growth, so the player typically funnels each job to the most skilled/passionate pawn.

Pawns can be **incapable** of whole work categories via traits or backstory — e.g. incapable of Violence, Dumb Labor, Skilled Labor, Intellectual, Caring, Social, Artistic, Cooking, Construction, Mining, Plants, Animals, or Firefighting.

Beyond the Work tab: **Drafting** gives manual control for combat; the **Schedule/Restrict tab** sets per-pawn timetables (Anything, Work, Joy/Recreation, Sleep, Meditate); the **Assign tab** controls outfits, food, drugs, and allowed areas.

### Work types (20, ordered most → least critical)
- Firefight
- Patient
- Doctor
- Bed Rest (patient)
- Basic (flick switches, refuel, repair, deliver, etc.)
- Warden (prisoners)
- Handle (tame & train animals)
- Cook
- Hunt
- Construct
- Grow
- Mine
- Plant Cut
- Smith
- Tailor
- Art
- Craft
- Haul
- Clean
- Research

## Core needs

Each pawn has needs that decay over time: **Food**, **Rest** (sleep), **Recreation/Joy**, **Beauty** (of surroundings), **Comfort** (seating/beds), and **Outdoors** (or **Indoors** for Undergrounders). Unmet needs apply escalating mood penalties (unfulfilled → deprived → starved) and, for food/rest, eventual physical harm.

## Mood, mental breaks & inspirations

- **Mood** is 0–100%, the sum of many positive/negative **thoughts (moodlets)** from needs, environment (room beauty/impressiveness/space/cleanliness), social opinions, recent events (deaths, surgeries, fights), food quality, traits, and conditions.
- Each pawn has a **Mental Break Threshold**; falling below it risks a break: **Minor** (sad wandering, food/drug binge, social fight, insulting spree), **Major** (berserk, violent tantrum, daze, giving up), **Extreme** (murderous rage, run wild, permanent berserk/leaving).
- High mood can trigger positive **Inspirations** (inspired creativity, work frenzy, recruitment, etc.).

## Health & medicine

- Health is modeled at the **body-part level**: each part (organs, limbs, eyes) has HP and feeds capacities (consciousness, manipulation, moving, sight, breathing, blood pumping/filtration, etc.); damaging a part degrades the matching capacity.
- **Injuries:** cuts, gunshots, burns, frostbite, bruises, bites — plus blood loss, pain, and infection. **Diseases:** flu, plague, malaria, sleeping sickness, gut worms, muscle parasites, lung rot, fibrous/sensory mechanites, food poisoning; **chronic age conditions** (heart attack, cataracts, frailty, bad back, asthma, carcinoma).
- **Treatment:** a Doctor tends wounds/diseases; tend quality scales with Medicine skill × medicine tier — **Herbal (60%) → Industrial (100%) → Glitterworld (160%)**. Many diseases are an **immunity-vs-severity race** won by good tending + bed rest; **Penoxycyline** prevents malaria/plague/sleeping sickness.
- **Surgery:** amputations, organ transplants, and replacements — **Prosthetics** (reduced function) → **Bionics** (≈125%) → **Archotech** (≈150%). Clean hospital rooms, hospital beds, and vitals monitors raise outcomes.

## Temperature

- Every tile and room has a **temperature**; pawns have a comfortable range and suffer **hypothermia** (cold) or **heatstroke** (hot) outside it.
- Managed with heaters, coolers, campfires, passive coolers, wall insulation, and **clothing** (cold/heat insulation values). Coolers make **freezers** that stop food spoilage. Heat waves, cold snaps, and **solar flares** (which kill power) all threaten temperature control.

## Base building

- Walls, doors, floors; **rooms** are scored for **Beauty, Space, Cleanliness, and Impressiveness**, which feed mood (bedrooms, dining rooms, rec rooms, throne rooms, hospitals, prison cells).
- Furniture (beds, chairs, tables, dressers, art), lighting, temperature fixtures, and defenses (sandbags, barricades, embrasures, traps, turrets).

## Power

- An electricity network: **generators** (wood-fired, chemfuel, watermill, wind turbine, solar, geothermal) → **power conduits** → **batteries** (store charge) → consumers.
- Requires watt budgeting; batteries can **short-circuit** (the "Zzzt" event), and **solar flares** disable all electronics temporarily.

## Research & technology

- A tech tree researched at the **Simple research bench → Hi-tech research bench** (advanced projects need a multi-analyzer; some need techprints).
- Unlocks electricity, refrigeration, weapons/armor, medicine production, advanced construction, and ship parts (for the escape ending). **Tribal** starts begin pre-electricity and must research up.

## Animals

- Wild animals roam each biome; **predators** can hunt pawns/livestock and **manhunter packs** are a direct threat. Pawns with the Animals skill can **tame and train** (obedience, release, haul, rescue).
- Domestic animals provide meat, milk, wool, eggs, hauling, transport, and combat; they breed, age, and need food/temperature like pawns. Hunting yields meat + leather.

## Population & recruitment

- Colonists arrive via the **starting scenario, recruitment of prisoners/refugees, wanderers joining, quest rewards, births**, and capture/conversion.
- **Prisoners** are held in cells and recruited over time by **Wardens** (or used for other ends). Pawns form relationships, **marry, and have children** who age over years; families and rivalries persist.

## Trade & economy

- **Silver** is the currency. Trade with **visiting caravans**, **orbital trade ships** (comms console + trade beacon), and **other settlements** (by sending your own **caravans** across the world map).
- Trader types carry different goods (bulk, combat, exotic, slaver, etc.); the player sells surplus crafts, drugs, and art. Caravans also enable world-map travel, raiding, and quests.

## Factions & diplomacy

- The planet hosts multiple AI **factions** — outlander unions, tribes, pirate bands, and (base game) **mechanoid** and **insect** threats — each with a **goodwill** value (ally ↔ hostile).
- Goodwill shifts through trade, gifts, quests, and combat; allies can send aid, hostiles raid. Managed mostly via the comms console and the world map (quests, sites, bandit camps, items stashes).

## AI Storyteller, events & combat

- The defining system: an **AI Storyteller** paces all events — **Cassandra Classic** (steady escalation), **Phoebe Chillax** (slow, gentler, more good events), **Randy Random** (chaotic). Difficulty's **threat scale** plus **colony wealth** drive raid size — success itself makes attacks harder.
- **Threats:** raids (ranged/melee, sappers, mortar sieges, drop-pod assaults), **manhunter** animal packs, **infestations** (insect hives under mountain roofs), and **mechanoid** clusters/raids — alongside good/neutral events (drop pods, wanderers, trade, psychic phenomena).
- **Combat** uses cover and line-of-sight, ranged + melee, a **downed (capturable) state** rather than instant death, **drafting** for manual control, and defenses (turrets, traps, killboxes, EMP vs mechs).

## Apparel, weapons & quality

- Weapons (melee + ranged) and apparel/armor are crafted from "**stuff**" with material modifiers, and every made item carries a **quality tier**: awful → poor → normal → good → excellent → masterwork → legendary, affecting stats, value, and (for art/apparel) mood.
- Apparel provides **temperature insulation** and **armor** (sharp/blunt/heat); pawns react to what they wear (tainted or dead-man's apparel lowers mood; style/ideology can matter).

## Drugs & addiction

- Recreational/medical **drugs** — beer, smokeleaf, psychite tea, flake, yayo, wake-up, go-juice, ambrosia, penoxycyline, **luciferium** — give effects but risk **tolerance, addiction, overdose, and withdrawal**.
- **Drug policies** schedule safe usage; traits (Chemical Interest/Fascination, Teetotaler) interact strongly. Luciferium is **permanently addictive** (withdrawal is fatal).

## Time, speed & win condition

- Time runs in **days, quadrums (15-day seasons), and years**; growing periods depend on latitude/biome.
- **Game speed:** pause + three fast-forward speeds. The classic **win condition** is escaping the planet (build & launch a ship, or reach an existing ship), among several alternate endings.

## Logistics & storage

- **Hauling** is a work type: pawns (and animals trained to haul) carry items **one at a time** to valid storage. Hauling priority and "Haul Urgently" orders move sensitive goods first.
- **Stockpile zones** — painted areas with a **priority** (Low → Normal → Preferred → Important → Critical) and **filters**: allowed item types, quality range, and hit-points range. Haulers fill the highest-priority valid stockpile first, so priority pulls goods where you want them.
- **Storage buildings** — shelves (and similar) hold items off the ground, protect them from weather, and use the same priority/filter settings.
- **Deterioration & spoilage** — items left outdoors/unroofed deteriorate; food rots unless kept in a **freezer** (a cooled room), making roofed, refrigerated, organized storage a genuine design concern.
- **Dumping stockpiles** handle low-value debris (rock chunks, slag, corpses).

## Balancing (availability · production · consumption)

### Overarching philosophy
RimWorld's defining balancing mechanism is **dynamic difficulty driven by colony wealth**, paced by the AI Storyteller. The game doesn't hand out fixed challenges — it **scales threats to your success**, so progress generates its own danger. It's tuned as a *story generator*, balanced around the expectation that you'll lose roughly **one pawn every 20–30 days**, not around a clean "win."

### Wealth → threat scaling (the central lever)
- **Colony wealth** = market value of all items + buildings (counted at **50%**) + pawns → becomes **"Storyteller Wealth."**
- Storyteller Wealth converts to **raid points**: ~0 at 14k wealth, 2,400 at 400k, capped ~4,200 around 1M. Each colonist adds **pawn points** (~45 each). Rough rule below 400k: 1 raid point ≈ 3,120 wealth ÷ colonist count.
- Raid points are then × **difficulty threat scale** × an **Adaptation factor** (a rubber-band that *eases* threats after losses and *hardens* them during peaceful streaks), then spent 1:1 on raiders by combat power (tribal ≈ 45, scyther = 150).
- **Storyteller personality** sets pacing: **Cassandra** (steady escalation), **Phoebe** (long gaps, gentler), **Randy** (chaotic, 0.5×–1.5× random multiplier). Raids drop loot, which *adds wealth* — a feedback loop.

### Availability — how resources enter
- **Finite, non-renewing on-map:** ore veins (steel, components, plasteel, uranium, gold, jade) and chunks; deep drilling reaches buried deposits but is also exhaustible.
- **Renewable:** growing zones/hydroponics, foraging, hunting, and animal breeding — the sustainable food/material base.
- **Scarce/external:** **Components** are a deliberate early bottleneck (mined/traded until you research the fabrication bench); advanced components, neutroamine, glitterworld medicine, and bionics come mostly via **trade (silver), raid loot, and quests**.

### Production — the conversion economy
- **Skill-gated:** the 0–20 skill curve plus the quality tiers (awful→legendary) mean *who* does the work matters as much as the recipe; passions accelerate skill growth.
- Conversions reward processing: cooking yields **180% nutrition efficiency** (a 0.5-nutrition simple meal gives 0.9 eaten); 1 chunk → 20 blocks; 1 slag → 15 steel; 12 steel → 1 component.
- **Power** softly gates electric benches (batteries can short out; solar flares cut power) and **temperature** gates food storage (freezers) and pawn output.

### Consumption — the per-capita drains
- **Food:** an adult pawn needs **1.6 nutrition/day** (~2 meals, ~32 raw units/day; Gourmands 2.4); meals spoil unless refrigerated.
- **Medicine** is consumed per tending action by tier; many diseases are an **immunity-vs-severity race** balanced around tend quality.
- **Apparel/weapons** deteriorate; **drugs** create tolerance/addiction loops; chemfuel/components are burned by power and crafting.
- **Mood/recreation** are continuous "soft consumption" — unmet needs erode mood toward mental breaks.

### Dominant pressure
The signature tension is the **wealth trap**: a richer, comfier colony directly summons bigger raids, so the player constantly weighs *capability vs. the threats that capability creates*. Failure usually comes from a raid (or a mood spiral) overwhelming a colony that outgrew its defenses.
