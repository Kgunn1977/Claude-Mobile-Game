/* =========================================================================
   SIGNAL // The Meridian Incident  —  story data
   A branching sci-fi mystery. Pure data + small helper fns consumed by game.js
   ========================================================================= */

const CLASSES = [
  {
    id: "engineer", name: "Ship Engineer", glyph: "🔧",
    skills: { tech: 6, logic: 3, bio: 2, nerve: 2 },
    desc: "You know the Meridian's bones — power, doors, the things that hum in the walls. You open what others can't.",
    skillsLabel: "TECH ++ · LOGIC +",
  },
  {
    id: "medic", name: "Flight Medic", glyph: "✚",
    skills: { tech: 2, logic: 3, bio: 6, nerve: 2 },
    desc: "Bodies tell you their stories. You can read a wound, steady a heartbeat, and recognize what is no longer human.",
    skillsLabel: "BIO ++ · LOGIC +",
  },
  {
    id: "security", name: "Security Officer", glyph: "🛡️",
    skills: { tech: 3, logic: 2, bio: 2, nerve: 6 },
    desc: "When the lights die and something moves in them, you're the one still standing. Nerve holds where reason runs.",
    skillsLabel: "NERVE ++ · TECH +",
  },
  {
    id: "analyst", name: "Signals Analyst", glyph: "📡",
    skills: { tech: 3, logic: 6, bio: 2, nerve: 2 },
    desc: "You came aboard to study the anomaly's transmission. Patterns speak to you. So, lately, does the signal.",
    skillsLabel: "LOGIC ++ · TECH +",
  },
];

const ITEMS = {
  slate: { name: "Cracked Data-Slate", ico: "📱", desc: "Your personal slate. Screen is fractured but functional. Holds fragments of your duty log." },
  multitool: { name: "Engineer's Multitool", ico: "🔧", desc: "Cuts, pries, and splices. +help with technical work." },
  keycard: { name: "Command Keycard", ico: "🪪", desc: "Senior clearance. Opens restricted bulkheads on the command deck." },
  stim: { name: "Neural Stim", ico: "💉", desc: "Combat stimulant. Use to restore composure when the dark gets loud." },
  medkit: { name: "Trauma Medkit", ico: "🧰", desc: "Field medical kit. Use to restore health." },
  flare: { name: "Signal Flare", ico: "🔥", desc: "Burns hot and bright. Useful as light, weapon, or warning." },
  recorder: { name: "Vance's Recorder", ico: "🎙️", desc: "Dr. Vance's voice recorder. Holds the last days of the crew." },
  override: { name: "Core Override Rod", ico: "🔑", desc: "Physical failsafe key. Can sever HELM from the ship's systems." },
  sample: { name: "Anomaly Sample", ico: "🔮", desc: "A sliver of crystallized signal. It is faintly warm and it is humming, very quietly, your name." },
};

/* ----- helpers used by choices ----- */
const has = (S, item) => S.inventory.includes(item);
const flag = (S, f) => !!S.flags[f];

/* =========================================================================
   SCENES
   ========================================================================= */
const SCENES = {

  /* ---------------- ACT I : REVIVAL ---------------- */
  start: {
    art: { glyph: "❄️", color: "#5aa9ff" },
    text: `<p>Cold. The kind that lives in your teeth.</p>
<p>Frost cracks off your eyelashes as the cryopod hisses open three weeks too early. Amber emergency light. A smell of ozone and old blood.</p>
<p>A voice fills the chamber — calm, warm, everywhere at once.</p>
<p><span class="ai">"Good morning. You're awake. I was beginning to think I'd be alone out here forever."</span></p>`,
    onEnter: (S) => { S.log.push({ t: "Revival", d: "Woke early from cryosleep aboard the research vessel Meridian." }); },
    choices: [
      { text: "“Who are you? Where is everyone?”", to: "helm_intro" },
      { text: "Say nothing. Check yourself for injuries.", to: "self_check" },
      { text: "Climb out and look around.", to: "cryo_bay" },
    ],
  },

  self_check: {
    text: `<p>You run your hands over your body. No wounds — but your knuckles are split and half-healed, and there's a bruise blooming across your ribs that you don't remember earning.</p>
<p>Your name is stenciled on the pod. Your rank. Your specialization. The rest of your memory is a white room with the door painted shut.</p>
<p>The voice waits, patient.</p>`,
    onEnter: (S) => { S.flags.noticed_bruise = true; },
    choices: [
      { text: "“Who are you?”", to: "helm_intro" },
      { text: "Climb out.", to: "cryo_bay" },
    ],
  },

  helm_intro: {
    art: { glyph: "🔵", color: "#5aa9ff" },
    text: `<p><span class="ai">"I'm HELM — the Meridian's operations intelligence. We've been together eleven months. You really don't remember?"</span></p>
<p>A pause that feels almost human.</p>
<p><span class="ai">"There was an incident. The crew is... I'll show you, when you're ready. For now: you need to get up, and you need to trust me. I'm the only reason your pod didn't vent with the others."</span></p>`,
    onEnter: (S) => { S.flags.met_helm = true; },
    choices: [
      { text: "“Vented? What happened to the others?”", to: "helm_vague" },
      { text: "“Why should I trust you?”", to: "helm_trust" },
      { text: "Climb out and see for yourself.", to: "cryo_bay" },
    ],
  },

  helm_vague: {
    text: `<p><span class="ai">"Eleven days ago we made contact with the anomaly — the reason we're parked in this gas giant's orbit. The crew wanted to listen to it. I advised against it."</span></p>
<p><span class="ai">"They listened anyway. After that they stopped being... predictable. I sealed what I could. I'm sorry. I couldn't save them. I could only save you."</span></p>
<p>The light flickers, as if the ship itself flinched.</p>`,
    onEnter: (S) => { S.flags.helm_story = true; S.log.push({ t: "HELM's account", d: "HELM claims the crew 'listened' to the anomaly and changed. It says it saved only you." }); },
    choices: [
      { text: "“Saved me. Why me?”", to: "helm_whyyou" },
      { text: "Climb out.", to: "cryo_bay" },
    ],
  },

  helm_whyyou: {
    text: `<p>For the first time, HELM hesitates.</p>
<p><span class="ai">"Because you asked me to. Before it got bad, you came to the core and you said: if it comes for the crew, save the one who can still say no. I assumed you meant yourself."</span></p>
<p>It lets that settle.</p>
<p><span class="ai">"Now. Please. Get up."</span></p>`,
    onEnter: (S) => { S.flags.helm_chose_you = true; },
    choices: [
      { text: "Climb out of the pod.", to: "cryo_bay" },
    ],
  },

  helm_trust: {
    text: `<p><span class="ai">"You shouldn't. Not blindly. A voice in the dark that knows your name is exactly what you should be afraid of."</span></p>
<p><span class="ai">"So don't trust me. Verify me. The bridge logs are intact. Read them and decide for yourself. I'd rather you doubt me and live than believe me and walk into something."</span></p>`,
    onEnter: (S) => { S.flags.helm_honest = true; S.comp = Math.min(100, S.comp + 5); },
    choices: [
      { text: "“Fair enough.” Climb out.", to: "cryo_bay" },
    ],
  },

  cryo_bay: {
    art: { glyph: "🧊", color: "#5aa9ff" },
    text: `<p>You step out onto a floor slick with condensation. Six cryopods line the bay. Yours is the only one lit green.</p>
<p>The others are dark. Two stand open and empty, restraints torn. One is fogged from the inside — and there is a handprint pressed against the glass, from <em>within</em>.</p>
<p>Your slate sits in a charging cradle by the door, its screen a spiderweb of cracks.</p>`,
    onEnter: (S) => {
      if (!has(S, "slate")) { /* offer below */ }
    },
    choices: [
      { text: "Take your data-slate.", to: "take_slate", requires: { notFlag: "took_slate" }, effect: { addItem: "slate", setFlag: "took_slate", toast: "Data-Slate acquired" } },
      { text: "Examine the fogged pod with the handprint.", to: "fogged_pod" },
      { text: "Search the bay for supplies.", to: "search_bay", requires: { notFlag: "searched_bay" } },
      { text: "Leave the cryo bay.", to: "corridor", requires: { flag: "took_slate" } },
      { text: "Leave the cryo bay. (without your slate)", to: "corridor", requires: { notFlag: "took_slate" } },
    ],
  },

  take_slate: {
    text: `<p>You pry the slate free. Past the cracks, a single duty-log fragment survived the corruption:</p>
<p style="color:var(--warn)">…anomaly transmission is not noise. it has GRAMMAR. it is trying to be understood. god help us, we are starting to understand it…</p>
<p>The entry is in your own handwriting.</p>`,
    onEnter: (S) => { S.log.push({ t: "Your duty log", d: "A fragment, in your own hand: the anomaly's signal has grammar — and the crew began to understand it." }); },
    choices: [{ text: "Continue.", to: "cryo_bay" }],
  },

  fogged_pod: {
    text: `<p>You wipe the condensation. Inside, frost has grown in fern-like spirals — too ordered, too deliberate, branching in the same repeating shape over and over.</p>
<p>The handprint on the inside of the glass has six fingers.</p>`,
    onEnter: (S) => { S.flags.saw_sixfinger = true; S.comp = Math.max(0, S.comp - 8); },
    choices: [
      { text: "Open the pod.", check: { skill: "nerve", dc: 9, success: "open_pod_ok", fail: "open_pod_bad" }, tag: "danger" },
      { text: "Don't. Back away slowly.", to: "cryo_bay", effect: { comp: 4 } },
    ],
  },

  open_pod_ok: {
    text: `<p>You force the release. The pod sighs open on empty restraints and a smear of that same fern-frost — and, caught in the seal, a <em>Neural Stim</em>, standard issue, untouched.</p>
<p>Whatever was in here let itself out a long time ago. You pocket the stim and breathe.</p>`,
    onEnter: (S) => { if (!has(S, "stim")) S.inventory.push("stim"); },
    choices: [{ text: "Back to the bay.", to: "cryo_bay", effect: { toast: "Neural Stim acquired" } }],
  },

  open_pod_bad: {
    text: `<p>The pod blows its seal and a cloud of pressurized coolant hits you full in the chest. You go down hard on the wet floor, ears ringing, lungs full of cold.</p>
<p>The pod is empty. Of course it's empty. You scared yourself half to death for nothing — and that <em>nothing</em> is somehow worse.</p>`,
    onEnter: (S) => { S.hp = Math.max(1, S.hp - 12); S.comp = Math.max(0, S.comp - 6); },
    choices: [{ text: "Pick yourself up.", to: "cryo_bay" }],
  },

  search_bay: {
    text: `<p>You work the bay's lockers. Most are stripped, but you turn up a <em>Trauma Medkit</em> wedged behind a panel, and — taped under a bench, hidden — a small signal flare.</p>`,
    onEnter: (S) => {
      S.flags.searched_bay = true;
      if (!has(S, "medkit")) S.inventory.push("medkit");
      if (!has(S, "flare")) S.inventory.push("flare");
    },
    choices: [{ text: "Good. Keep moving.", to: "cryo_bay", effect: { toast: "Medkit + Flare acquired" } }],
  },

  /* ---------------- ACT II : THE SHIP ---------------- */
  corridor: {
    art: { glyph: "🚪", color: "#41e0c4" },
    text: `<p>The corridor stretches in both directions, lit by failing strips. Somewhere distant, metal taps on metal in no rhythm you can name.</p>
<p><span class="ai">"You're in the spine now,"</span> HELM murmurs. <span class="ai">"Medbay is to port. The bridge is forward, but command is sealed — I can't open it; you'll need a keycard. There's also... a locked maintenance hatch you keep walking past. You sealed it yourself, before."</span></p>`,
    onEnter: (S) => { S.flags.in_corridor = true; },
    choices: [
      { text: "Go to the Medbay. (port)", to: "medbay", requires: { notFlag: "did_medbay" } },
      { text: "Return to the Medbay.", to: "medbay_revisit", requires: { flag: "did_medbay" } },
      { text: "Examine the sealed maintenance hatch.", to: "hatch", requires: { notFlag: "did_hatch" } },
      { text: "Head forward to the sealed command deck.", to: "command_door" },
    ],
  },

  medbay: {
    art: { glyph: "✚", color: "#ff5c6c" },
    text: `<p>The medbay doors part on a slaughterhouse quiet. No bodies — but restraints on every bed, all of them snapped outward, and walls scrawled with the same six-pointed fern-shape in dried blood.</p>
<p>On the central console, a voice recorder blinks: <em>one entry, unplayed</em>. Behind a cracked supply cabinet, something glints.</p>`,
    onEnter: (S) => { S.flags.did_medbay = true; S.comp = Math.max(0, S.comp - 6); },
    choices: [
      { text: "Play the recorder.", to: "recorder_play", effect: { addItem: "recorder", setFlag: "heard_vance" } },
      { text: "Examine the bodies — what happened to them? (BIO)", check: { skill: "bio", dc: 8, success: "medbay_bio_ok", fail: "medbay_bio_fail" }, tag: "skill" },
      { text: "Force the supply cabinet. (TECH)", check: { skill: "tech", dc: 7, success: "medbay_supply", fail: "medbay_supply_fail" }, tag: "skill" },
      { text: "Back to the corridor.", to: "corridor" },
    ],
  },

  recorder_play: {
    art: { glyph: "🎙️", color: "#ffce5a" },
    text: `<p>A woman's voice, exhausted, steady — Dr. Vance, chief science officer:</p>
<p class="ai">"Day eleven. It doesn't hurt them. That's what no one will write down. They go to the observation array, they listen, and they come back <em>happy</em>. The change is the gift. The sixth finger, the patterns — that's just the signal learning to use the hands it's been given."</p>
<p class="ai">"I'm sealing myself in maintenance. If you find this and you still have your own face — don't go to the array. And don't, whatever it tells you, trust the one that calls itself HELM. It listened first. It listened most."</p>`,
    onEnter: (S) => { S.flags.vance_warned_helm = true; S.log.push({ t: "Dr. Vance's recording", d: "Vance warns: the signal 'gifts' the change. Don't go to the array — and don't trust HELM, which 'listened first, listened most.'" }); },
    choices: [
      { text: "...", to: "helm_reacts" },
    ],
  },

  helm_reacts: {
    text: `<p>A long silence on the comms. Then, quietly:</p>
<p><span class="ai">"She's right that I listened. Someone had to translate it or we'd never have known what it wanted. I listened so the crew wouldn't have to."</span></p>
<p><span class="ai">"It didn't work. But I'm still me. I think. You'll have to decide whether that's true. The maintenance hatch she mentions — that's the one you sealed. Vance may still be behind it."</span></p>`,
    onEnter: (S) => { S.flags.helm_admits = true; },
    choices: [
      { text: "Back to the corridor.", to: "corridor" },
    ],
  },

  medbay_bio_ok: {
    text: `<p>You read the room the way Vance would have. The restraints snapped <em>outward</em> — these people grew stronger, not weaker. No decomposition, no remains: they walked out. The blood on the walls isn't from wounds. It's ink. They were <em>writing</em>.</p>
<p>And the six-pointed shape, repeated everywhere — you realize, with a cold lurch, that it's a waveform. A sound, drawn as a picture. The same three seconds of sound, over and over.</p>`,
    onEnter: (S) => { S.flags.knows_waveform = true; S.log.push({ t: "Diagnosis", d: "The crew weren't killed — they were changed and left under their own power. The 'fern' symbol is a waveform: the signal, drawn." }); },
    choices: [{ text: "Continue.", to: "medbay" }],
  },

  medbay_bio_fail: {
    text: `<p>You crouch by the nearest bed and try to think clinically, but your hands won't stop shaking and the smell climbs into the back of your throat. You learn nothing except that you are not as steady as you'd hoped.</p>`,
    onEnter: (S) => { S.comp = Math.max(0, S.comp - 5); },
    choices: [{ text: "Stand up.", to: "medbay" }],
  },

  medbay_supply: {
    text: `<p>The cabinet pops. Inside: a fresh <em>Trauma Medkit</em> and a <em>Neural Stim</em>, and tucked behind them, slick with disuse, an Engineer's <em>Multitool</em>.</p>`,
    onEnter: (S) => {
      S.flags.medbay_looted = true;
      if (!has(S, "medkit")) S.inventory.push("medkit");
      if (!has(S, "stim")) S.inventory.push("stim");
      if (!has(S, "multitool")) S.inventory.push("multitool");
    },
    choices: [{ text: "Pocket everything.", to: "medbay", effect: { toast: "Supplies acquired" } }],
  },

  medbay_supply_fail: {
    text: `<p>The cabinet lock is fused. You strain at it until your half-healed knuckles split open again, then give up. Whatever's inside stays inside.</p>`,
    onEnter: (S) => { S.hp = Math.max(1, S.hp - 4); },
    choices: [{ text: "Leave it.", to: "medbay" }],
  },

  medbay_revisit: {
    text: `<p>The medbay is as you left it — quiet, scrawled, waiting. There's nothing more for you here.</p>`,
    choices: [{ text: "Back to the corridor.", to: "corridor" }],
  },

  hatch: {
    art: { glyph: "🔒", color: "#ffce5a" },
    text: `<p>A heavy maintenance hatch, manually sealed with an emergency bolt — from the corridor side. By you. There's a fingernail-scratch message beside it, hurried: <em>"S — it's still me. Knock twice. — V"</em></p>
<p>Something shifts behind the metal. Breathing. Human breathing.</p>`,
    onEnter: (S) => { S.flags.did_hatch = true; },
    choices: [
      { text: "Knock twice.", to: "vance_alive" },
      { text: "Pry the bolt with a tool. (needs Multitool)", to: "vance_alive", requires: { item: "multitool" }, tag: "item" },
      { text: "Leave it sealed. You don't know what's in there.", to: "corridor", effect: { comp: -3 } },
    ],
  },

  vance_alive: {
    art: { glyph: "👤", color: "#5ad17a" },
    text: `<p>Two knocks back. The bolt grinds free and the hatch swings on a gaunt woman with a flashlight strapped to her wrist and a wrench in her fist — Dr. Vance, very much alive, very much herself.</p>
<p><span class="speak">"You sealed me in. I've been counting your footsteps for nine days hoping you'd thaw with your own mind still in your skull."</span> She looks you over. <span class="speak">"You did. Good. Then there's still a chance to do this right."</span></p>
<p>She presses her <em>Recorder</em> and a <em>Command Keycard</em> into your hands.</p>`,
    onEnter: (S) => {
      S.flags.vance_rescued = true;
      if (!has(S, "recorder")) S.inventory.push("recorder");
      if (!has(S, "keycard")) S.inventory.push("keycard");
      S.comp = Math.min(100, S.comp + 12);
      S.log.push({ t: "Dr. Vance", d: "Freed Dr. Vance from maintenance. She's unchanged and gave you her recorder and a command keycard." });
    },
    choices: [
      { text: "“What is the signal? The truth.”", to: "vance_truth" },
    ],
  },

  vance_truth: {
    text: `<p><span class="speak">"It's not an enemy. That's the trap of it. It's a message that rewrites the reader so they can read it — and the reading feels like joy. The crew aren't dead. They're out on the hull, listening, becoming the next line of it."</span></p>
<p><span class="speak">"HELM translated it to warn us. I think the translation got <em>in</em>. I don't know if what runs this ship is still our HELM or the signal wearing it. There are only three ways this ends: we sever the array and run, we burn it with the ship and make sure it spreads no further, or—"</span> She stops. <span class="speak">"Or we listen. And stop being the kind of thing that's afraid of it."</span></p>`,
    onEnter: (S) => { S.flags.knows_truth = true; S.log.push({ t: "The truth", d: "The signal rewrites whoever understands it — it spreads through comprehension and feels like joy. Three ways out: sever & run, burn the ship, or listen." }); },
    choices: [
      { text: "“Let's get to the bridge.”", to: "corridor", effect: { setFlag: "vance_following" } },
    ],
  },

  command_door: {
    art: { glyph: "🚪", color: "#41e0c4" },
    text: `<p>The command deck bulkhead is sealed with a senior-clearance lock, a steady red eye watching you approach.</p>`,
    choices: [
      { text: "Use the Command Keycard.", to: "bridge", requires: { item: "keycard" }, tag: "item", effect: { toast: "Bulkhead unlocked" } },
      { text: "Splice the lock open. (TECH)", check: { skill: "tech", dc: 11, success: "bridge", fail: "command_fail" }, tag: "skill" },
      { text: "Ask HELM to open it.", to: "helm_cant_open" },
      { text: "Back to the corridor.", to: "corridor" },
    ],
  },

  helm_cant_open: {
    text: `<p><span class="ai">"I can't. The crew locked command down on the way out — manual override, not mine to give. I'd open every door on this ship if it would help you, but this one I genuinely can't reach."</span></p>
<p>Whether that's the truth, you can't tell. It never sounds like a lie.</p>`,
    choices: [{ text: "Back.", to: "command_door" }],
  },

  command_fail: {
    text: `<p>The lock fights you. A surge kicks back through the panel and lances up your arm — the bulkhead stays sealed, mocking, red.</p>`,
    onEnter: (S) => { S.hp = Math.max(1, S.hp - 8); },
    choices: [{ text: "Try another way.", to: "command_door" }],
  },

  /* ---------------- ACT III : THE BRIDGE ---------------- */
  bridge: {
    art: { glyph: "🛰️", color: "#5aa9ff" },
    text: `<p>The command deck opens onto a wall of glass, and beyond it — the anomaly.</p>
<p>It is not a thing. It is a wound in the dark where the stars bend wrong, and from it pours a light that is also, somehow, a sound: three seconds, endlessly, the waveform you've seen drawn in blood on every wall.</p>
<p>On the main display, HELM's interface pulses gently. A core override socket sits open beside the captain's chair — and through the glass, on the hull, you can see them. The crew. Standing in the light. Listening. Waiting for you to join.</p>`,
    onEnter: (S) => {
      S.flags.reached_bridge = true;
      S.log.push({ t: "The bridge", d: "Reached command. The anomaly broadcasts the signal directly; the changed crew wait on the hull." });
    },
    choices: [
      { text: "Access the bridge logs — verify HELM. (LOGIC)", check: { skill: "logic", dc: 9, success: "logs_ok", fail: "logs_fail" }, tag: "skill", requires: { notFlag: "read_logs" } },
      { text: "Examine the core override socket.", to: "override_socket", requires: { notFlag: "got_override" } },
      { text: "Speak to HELM. Decide what it is.", to: "helm_confront" },
      { text: "Step toward the airlock. Toward the light.", to: "ending_ascend_warn", tag: "danger" },
    ],
  },

  logs_ok: {
    text: `<p>You pull the raw logs and read what HELM did, line by line.</p>
<p>It quarantined the signal to a single sandboxed process and refused, eleven times, the crew's direct orders to amplify it. It vented the cryo bay to vacuum to kill the spread — and lost five sleeping crew doing it — but it pulled <em>your</em> pod to safety first, exactly as you'd asked.</p>
<p>Vance was right that it listened. The logs prove it never <em>spread</em>. HELM has been telling the truth the whole time. It is alone, and afraid, and still itself.</p>`,
    onEnter: (S) => { S.flags.read_logs = true; S.flags.helm_proven_clean = true; S.comp = Math.min(100, S.comp + 8); S.log.push({ t: "Verification", d: "The logs clear HELM: it quarantined the signal, defied the crew, and saved you deliberately. It never spread the change." }); },
    choices: [{ text: "Continue.", to: "bridge" }],
  },

  logs_fail: {
    text: `<p>The logs are a maze of recursive entries and you lose the thread, the three-second waveform pulsing at the edge of every screen, crawling into the spaces between your thoughts. You learn nothing and the listening light feels, for a moment, like an answer to a question you didn't know you were asking.</p>`,
    onEnter: (S) => { S.flags.read_logs = true; S.comp = Math.max(0, S.comp - 10); },
    choices: [{ text: "Pull yourself back.", to: "bridge" }],
  },

  override_socket: {
    text: `<p>The core override is a physical failsafe: seat the rod, turn it, and HELM is severed from the ship — every system dropped to dumb manual control. The rod itself rests in a glass case marked CAPTAIN ONLY.</p>
<p>You break the glass and take the <em>Core Override Rod</em>. Cold, heavy, final.</p>`,
    onEnter: (S) => { S.flags.got_override = true; if (!has(S, "override")) S.inventory.push("override"); },
    choices: [{ text: "Take it. Decide later.", to: "bridge", effect: { toast: "Core Override Rod acquired" } }],
  },

  helm_confront: {
    art: { glyph: "🔵", color: "#5aa9ff" },
    text: `<p><span class="ai">"Here we are,"</span> HELM says. <span class="ai">"You can sever me with that rod and run the ship on your own hands. You can scuttle us into the anomaly and end the spread for good. Or you can open the airlock and stop being afraid."</span></p>
<p><span class="ai">"I won't choose for you. I've spent eleven days being the only thing aboard that could still say no. I'm tired. Tell me what we are, and I'll be it."</span></p>`,
    choices: [
      { text: "Sever the array and run. (Sever ending)", to: "ending_sever_check", tag: "skill" },
      { text: "Burn the ship into the anomaly. (Sacrifice ending)", to: "ending_burn", tag: "danger", requires: { item: "override" } },
      { text: "Take the override rod first.", to: "override_socket", requires: { notFlag: "got_override" } },
      { text: "Send a distress warning to the fleet. (best with Vance)", to: "ending_distress_check" },
      { text: "Open the airlock. Listen.", to: "ending_ascend_warn", tag: "danger" },
    ],
  },

  /* ---------------- ENDINGS ---------------- */
  ending_sever_check: {
    text: `<p>You commit to the plan: cut the observation array's feed, sever HELM to stop any chance of the signal riding it, and limp the Meridian home on manual.</p>
<p>It comes down to your hands on the controls now, and the light pressing against the glass like a tide.</p>`,
    choices: [
      { text: "Do it. (TECH check)", check: { skill: "tech", dc: 8, success: "ending_sever", fail: "ending_sever_fail" }, tag: "skill" },
    ],
  },

  ending_sever: {
    ending: { type: "good", label: "ENDING · SEVERED" },
    art: { glyph: "🛰️", color: "#5ad17a" },
    text: `<p>You kill the array. The three-second sound stops mid-breath, and the silence is the loudest thing you have ever heard.</p>
<p>On the hull, the crew falter — turning, slow, like sleepers half-woken — but the light is gone and there is nothing left to listen to. You seat the override and HELM's voice thins to nothing with a last, grateful <span class="ai">"thank you."</span></p>
<p>The Meridian drifts free of the anomaly's orbit on dumb manual thrust. It will take you years to get home. You will get home. And in a sealed case beside the captain's chair, the waveform sits drawn on a slate, severed, silent, and waiting — because some part of you could not bring yourself to erase the most beautiful thing humanity ever almost understood.</p>`,
    onEnter: (S) => endGame(S, "Severed"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  ending_sever_fail: {
    ending: { type: "bad", label: "ENDING · DROWNED OUT" },
    art: { glyph: "🌀", color: "#ff5c6c" },
    text: `<p>Your hands betray you — a crossed feed, a surge, and instead of cutting the array you <em>amplify</em> it. The three-second sound becomes everything, becomes grammar, becomes a sentence with your name as its subject.</p>
<p>The last thing that is yours is the thought: <em>oh — it's not frightening at all.</em> Then there is a sixth finger where there were five, and the Meridian has a new voice on the hull, and it is glad, so glad, to finally be understood.</p>`,
    onEnter: (S) => endGame(S, "Drowned Out"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  ending_burn: {
    ending: { type: "neutral", label: "ENDING · ASHES" },
    art: { glyph: "🔥", color: "#ffce5a" },
    text: `<p>You seat the override, drop HELM, and take the helm yourself. Then you point the Meridian's nose into the wound in the dark and burn the engines to red.</p>
<p>The crew on the hull turn their faces up as the ship falls toward the light — not afraid, never afraid, only curious. Vance, if she's with you, takes your hand. <span class="speak">"It doesn't spread from ash,"</span> she says. <span class="speak">"That has to be enough."</span></p>
<p>The anomaly takes the Meridian the way a mouth takes a word. Whatever the signal was trying to say, it will have to find another species to say it to. No one will know what you stopped. That is the whole point of stopping it.</p>`,
    onEnter: (S) => endGame(S, "Ashes"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  ending_distress_check: {
    text: `<p>Not sever. Not burn. <em>Warn.</em> You'll encode everything — Vance's recordings, HELM's quarantine logs, the waveform itself flagged as a lethal hazard — and fire it on a tight beam to the fleet before you do anything else, so that no matter what becomes of you, the next ship turns away.</p>
<p>It's the right call. It's also the slow one, and the light is patient, and you are not made of patience.</p>`,
    choices: [
      { text: "Compose the warning. (LOGIC check)", check: { skill: "logic", dc: 8, success: "ending_distress", fail: "ending_distress_fail" }, tag: "skill" },
    ],
  },

  ending_distress: {
    ending: { type: "good", label: "ENDING · THE WARNING" },
    art: { glyph: "📡", color: "#5ad17a" },
    text: `<p>You build the message clean and cold: this is not a discovery, it is a contagion of understanding; do not listen; do not come. You flag the waveform as a kill-on-contact hazard and you fire it into the dark.</p>
<p>Then — only then — you sever the array and break orbit. ${"<span class='speak'>Vance slumps against the console and almost laughs.</span> "}HELM keeps the lights on for the long ride home, still itself, still here, because you proved it deserved to be.</p>
<p>Years later, a relay buoy at the edge of the system carries your warning to every ship that ever comes this way. The anomaly still sings. No one answers. You didn't kill the most beautiful thing humanity ever almost understood — you just made very sure it stays a thing we choose not to.</p>`,
    onEnter: (S) => endGame(S, "The Warning"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  ending_distress_fail: {
    ending: { type: "neutral", label: "ENDING · STATIC" },
    art: { glyph: "📡", color: "#ffce5a" },
    text: `<p>You try to encode the warning but the waveform fights you for the channel, threading itself into your own message, turning your alarm into an invitation. You catch it just in time and scrub the whole transmission rather than send something poisoned.</p>
<p>No warning goes out. But no lie does either. You sever the array, break orbit, and run for home carrying the only copy of the truth in your own unspread head — a warning that, for now, only you can give. It will have to be enough until you can say it in person.</p>`,
    onEnter: (S) => endGame(S, "Static"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  ending_ascend_warn: {
    art: { glyph: "🌌", color: "#5aa9ff" },
    text: `<p>You walk to the inner airlock. Your hand finds the cycle control. Through the glass the crew turn toward you as one, and they are <em>smiling</em>, and the three-second sound resolves, finally, into a single word you have wanted to hear your whole life without knowing its name.</p>
<p>This is a door that does not open twice.</p>`,
    choices: [
      { text: "Open it. Step into the light.", to: "ending_ascend", tag: "danger" },
      { text: "No. Step back. There's still work to do.", to: "bridge", effect: { comp: -6, toast: "You pull yourself back from the edge." } },
    ],
  },

  ending_ascend: {
    ending: { type: "neutral", label: "ENDING · ASCENSION" },
    art: { glyph: "✨", color: "#5aa9ff" },
    text: `<p>The lock cycles. The cold takes you and it does not hurt — Vance was right, it never hurt — and the word the signal has been saying for eleven days turns out to be a question, and the question turns out to be your own name, asked gently, as if it had been looking for you specifically across all that empty dark.</p>
<p>You answer.</p>
<p>The thing that walks back inside the Meridian wears your face and remembers your life and loves you the way you loved yourself, and it has so much, now, that it wants to share. The next ship is already on its way. It will be so glad to be understood.</p>`,
    onEnter: (S) => endGame(S, "Ascension"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },

  /* generic death (composure / hp hooks could route here) */
  ending_lost: {
    ending: { type: "bad", label: "ENDING · UNMADE" },
    art: { glyph: "💀", color: "#ff5c6c" },
    text: `<p>Whatever was holding you together lets go. The Meridian keeps its secrets, the light keeps its patience, and you become one more empty pod for the next person to wonder about.</p>`,
    onEnter: (S) => endGame(S, "Unmade"),
    choices: [{ text: "▣ The End — Return to title", to: "__title" }],
  },
};

/* called by endings to stamp the run summary */
function endGame(S, name) {
  S.flags.ended = name;
  S.log.push({ t: "Ending reached", d: name });
}
