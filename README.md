# Hollow Frontier

A turn-based **colony-leadership story generator** for mobile. Society has
collapsed; you lead a small band to a hidden corner of North America and give the
orders — your people, their flaws, and the dice make the story.

> Inspired by **Banished** (the resource economy), **RimWorld** (emergent,
> trait-driven drama), and **D&D** (d20 resolution). Runs offline, no build step.

## Play it
Open **`play.html`** in any browser — it's a single self-contained file (download
it from GitHub onto your phone and open it). Progress auto-saves to the device.

For development, `index.html` loads the same game from `src/`.

## What's here

| Path | Purpose |
|------|---------|
| `DESIGN.md` | The full locked design spec |
| `src/core.js` | Data-driven simulation engine (economy, colonists, turns) — runs in Node *and* the browser |
| `src/ui.js` | Mobile UI controller (setup, the four pages, assignments, advance) |
| `index.html` | App shell + styling |
| `build.js` | Inlines core + ui into the single-file `play.html` |
| `play.html` | **The game** — single-file, offline |
| `test/validate.js` | Content integrity + runtime invariants |
| `sim/harness.js` | Headless balance harness: autopilot bots + Monte-Carlo sweep |
| `prototype-signal/` | An earlier text-adventure prototype, kept for reference |

## The loop
- Turns are **variable length, set by Colony Health** — a struggling colony is
  managed hour-by-hour; a thriving one coasts a year at a time.
- Each turn opens on the **Briefing** (what happened). Set **standing job
  assignments** and **decrees**, then **Advance**.
- Survive the seasons: food (4 diet types), water, firewood for winter, defense
  against raids — and keep your people fed, warm, healthy, and content.

## Develop / test
```bash
node test/validate.js     # content + invariants (must pass)
node sim/harness.js        # balance sweep across locations
node build.js              # regenerate play.html
```
The harness is the balance safety net: a competent autopilot bot should survive,
a naive one should fail. Re-run it after any change to numbers or content.

## Status
Playable v1: setup (location + founder rerolls), the full economy, colonists with
skills/traits/vitals, buildings & projects, decrees, seasons, events, raids, and
save/load. Deferred: interactive event choices, births, conquest, trade depth,
and the Chronicle screen.
