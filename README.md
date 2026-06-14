# SIGNAL // The Meridian Incident

A story-rich **sci-fi mystery RPG** built to run on a phone, offline, with no build step.

> A drifting research vessel. A crew that vanished. A voice in the dark that knows your name.

## Play it

Open **`index.html`** in any browser (mobile or desktop). That's it — no install, no server, no internet required. Your progress saves automatically to the device.

On a phone: download the four files (`index.html`, `game.css`, `game.js`, `story.js`) into one folder and open `index.html`.

## What's in it

- **4 specializations** (Engineer, Medic, Security, Analyst) — each changes which skill checks you pass and what you can discover.
- **Branching investigation** across the cryo bay, medbay, maintenance, and command deck.
- **Skill checks** (Tech / Logic / Bio / Nerve) with transparent dice rolls.
- **Inventory & usable items** (medkits, stims, keycard, override rod…).
- **Health + Composure** survival stats — let either hit zero and you're lost.
- **Investigation Log** that tracks every clue you uncover.
- **5 distinct endings** shaped by what you learned and the choices you made.
- **Auto-save** via `localStorage`; "Continue" resumes your run.

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | Screens (title, character creation, game, overlays) |
| `game.css` | Mobile-first dark sci-fi styling |
| `game.js` | Engine: state, skill checks, save/load, UI |
| `story.js` | All content — scenes, choices, items, classes (data-driven) |

### Adding to the story

Everything narrative lives in `story.js`. A scene looks like:

```js
scene_id: {
  art: { glyph: "🔧", color: "#41e0c4" },   // optional banner
  text: `<p>What the player reads.</p>`,
  onEnter: (S) => { S.flags.something = true; }, // optional
  choices: [
    { text: "A plain choice", to: "next_scene" },
    { text: "A skill check", check: { skill: "tech", dc: 8, success: "win", fail: "lose" }, tag: "skill" },
    { text: "Needs an item", to: "secret", requires: { item: "keycard" }, tag: "item" },
    { text: "Has a side effect", to: "x", effect: { addItem: "stim", comp: -5, toast: "..." } },
  ],
}
```

Run the link-checker any time after editing:

```bash
node -e 'require("./story.js")'   # (or the validator used during development)
```

## Roadmap ideas

- Chapter 2: descend to the anomaly itself.
- Companion system (Vance as an ally with her own arc).
- Sound design (ambient hum + the three-second signal).
- More skill-gated lore for replay value across the four classes.
