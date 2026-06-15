/* Hollow Frontier — UI controller (browser). Uses window.CORE. */
(function () {
  "use strict";
  const C = window.CORE;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const SAVE = "hollow_frontier_save_v1";

  let S = null;          // game state
  let page = "briefing";
  let lastBrief = null;  // last advance result
  let setup = { location: "oregon", founders: [], seed: 0 };

  /* ---------------- setup ---------------- */
  function initSetup() {
    setup.seed = (Date.now() & 0xffffff) || 7;
    // locations
    const ll = $("loc-list"); ll.innerHTML = "";
    Object.keys(C.LOCATIONS).forEach(id => {
      const l = C.LOCATIONS[id];
      const c = el("div", "loc-card" + (id === setup.location ? " sel" : ""));
      c.innerHTML = `<h3>${l.name}</h3><div class="d">${l.difficulty}</div><p>${locBlurb(id)}</p>`;
      c.onclick = () => { setup.location = id; [...ll.children].forEach(x => x.classList.remove("sel")); c.classList.add("sel"); };
      ll.appendChild(c);
    });
    rollFounders();
    $("begin").onclick = beginGame;
  }
  function locBlurb(id) {
    return ({
      rockies: "Brutal winters, rich timber & stone, well hidden. Survive the cold.",
      jungle: "Warm and fed year-round — but fever stalks the careless.",
      desert: "Water is everything here, and there's never enough. Hardest start.",
      oregon: "Mild, wet, and bountiful by sea and forest. The gentlest refuge.",
      delta: "Abundant and busy — disease, floods, and visitors both kind and cruel.",
    })[id] || "";
  }
  function rollFounders() {
    const rng = C.makeRng(setup.seed);
    setup.founders = [];
    for (let i = 0; i < C.CONFIG.START_FOUNDERS; i++) setup.founders.push({ seed: (setup.seed * 131 + i * 977) >>> 0, rerolls: C.CONFIG.REROLLS });
    renderFounders();
  }
  function renderFounders() {
    const fl = $("founder-list"); fl.innerHTML = "";
    setup.founders.forEach((f, i) => {
      const c = makeFounderPreview(f.seed);
      f._c = c;
      const card = el("div", "founder");
      card.innerHTML = `<div class="top"><h4>${c.name}, ${c.age}</h4>
        <button class="btn sm" ${f.rerolls <= 0 ? "disabled style='opacity:.4'" : ""}>↻ ${f.rerolls}</button></div>
        <div class="sk">${C.SKILLS.map(s => cap(s) + " " + c.skills[s]).join(" · ")}</div>
        <div class="tr">${archName(c.archetype)} — ${c.traits.join(", ") || "no notable traits"}</div>`;
      const btn = card.querySelector("button");
      btn.onclick = () => { if (f.rerolls <= 0) return; f.rerolls--; f.seed = (f.seed * 1103515245 + 12345) >>> 0; renderFounders(); };
      fl.appendChild(card);
    });
  }
  function makeFounderPreview(seed) { return C.makeColonist(C.makeRng(seed), setup.location, "founder"); }
  function archName(id) { const a = C.ARCHETYPES.find(x => x.id === id); return a ? a.name : id; }
  const cap = s => s[0].toUpperCase() + s.slice(1, 4);

  function beginGame() {
    S = C.newGame({ seed: setup.seed, location: setup.location });
    // replace founders with chosen previews
    S.colonists = setup.founders.map(f => { const c = C.makeColonist(C.makeRng(f.seed), setup.location, "founder"); return c; });
    S.assignments = {};
    startingAssignments();
    S.colonyHealth = C.computeColonyHealth(S);
    lastBrief = { log: ["The wagons stop. This is the place. Set your people to work before night falls."], season: C.season(S), turnHours: C.turnHours(S.colonyHealth) };
    saveGame(); show("game"); page = "briefing"; render();
  }
  // sensible starting spread that covers food + water, by skill fit; player can change freely
  function startingAssignments() {
    const pop = S.colonists.length;
    const quota = ["fetchwater", "forage", "forage"];
    while (quota.length < pop) quota.push(quota.length === 3 ? "build" : quota.length === 4 ? "chopwood" : "forage");
    const avail = S.colonists.slice();
    quota.forEach(job => {
      if (!avail.length) return;
      const skl = (C.MANUAL_JOBS[job] || {}).skill;
      if (skl) avail.sort((a, b) => C.effectiveSkill(b, skl) - C.effectiveSkill(a, skl));
      const c = avail.shift();
      S.assignments[c.id] = { job, effort: 45 };
    });
    avail.forEach(c => S.assignments[c.id] = { job: "forage", effort: 45 });
  }

  /* ---------------- screens ---------------- */
  function show(name) { document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); $(name).classList.add("active"); }

  /* ---------------- status bar + tabs ---------------- */
  function renderStatus() {
    const seas = C.season(S);
    $("sb-time").innerHTML = `Day ${S.day}<small>${seas} · Yr ${1 + Math.floor(S.day / 360)} · 👥 ${live().length}</small>`;
    $("ch-num").textContent = S.colonyHealth;
    $("ch-fill").style.width = S.colonyHealth + "%";
    $("adv-len").textContent = "up to " + turnLabel(C.turnHours(S.colonyHealth));
    if (S.over) { $("advance").textContent = "— ended —"; $("advance").disabled = true; }
  }
  function turnLabel(h) { return h < 24 ? "1 hour" : h < 168 ? "1 day" : h < 720 ? "1 week" : h < 2160 ? "1 month" : h < 8640 ? "1 season" : "1 year"; }

  /* ---------------- render dispatch ---------------- */
  function render() {
    renderStatus();
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.page === page));
    const p = $("page"); p.scrollTop = 0;
    if (page === "briefing") p.innerHTML = "", p.appendChild(viewBriefing());
    else if (page === "colony") p.innerHTML = "", p.appendChild(viewColony());
    else if (page === "people") p.innerHTML = "", p.appendChild(viewPeople());
    else if (page === "jobs") p.innerHTML = "", p.appendChild(viewJobs());
  }

  /* ---------------- briefing ---------------- */
  function viewBriefing() {
    const f = document.createDocumentFragment();
    if (S.over) {
      const c = el("div", "card");
      c.innerHTML = `<h3>The colony is gone</h3><p>${S.ending || ""}</p>
        <p class="muted">It lasted <b>${S.day} days</b> — ${(S.day / 360).toFixed(1)} years. ${S.dead.length} laid to rest.</p>`;
      const b = el("button", "btn primary", "New Colony"); b.style.marginTop = "8px"; b.onclick = () => { localStorage.removeItem(SAVE); location.reload(); };
      c.appendChild(b); f.appendChild(c);
      return f;
    }
    const w = el("div", "card");
    const span = (lastBrief && lastBrief.daysElapsed) ? (lastBrief.daysElapsed + (lastBrief.daysElapsed === 1 ? " day" : " days")) : "the founding";
    w.innerHTML = `<h3>What happened — ${span}</h3>`;
    const log = (lastBrief && lastBrief.log && lastBrief.log.length) ? lastBrief.log : ["A quiet stretch. Nothing of note."];
    log.forEach(line => w.appendChild(el("div", "logline", line)));
    f.appendChild(w);

    // quick state
    const q = el("div", "card"); q.innerHTML = "<h3>State of the colony</h3>";
    q.appendChild(quickRes());
    f.appendChild(q);
    return f;
  }
  function quickRes() {
    const pop = live().length;
    const g = el("div", "res-grid");
    const foodDays = (C.totalFood(S) / Math.max(1, pop) / C.CONFIG.foodPerDay);
    const waterDays = ((S.store.water || 0) / Math.max(1, pop) / C.CONFIG.waterPerDay);
    const fwDays = ((S.store.firewood || 0) / Math.max(1, pop * C.CONFIG.firewoodPerDayCold * C.LOCATIONS[S.location].coldness));
    const arrow = t => t > 0 ? " <span style='color:var(--good)'>▲</span>" : t < 0 ? " <span style='color:var(--danger)'>▼</span>" : "";
    g.appendChild(resBox("Food (days)", days(foodDays) + arrow(lastBrief && lastBrief.trendFood), foodDays < 8));
    g.appendChild(resBox("Water (days)", days(waterDays) + arrow(lastBrief && lastBrief.trendWater), waterDays < 8));
    g.appendChild(resBox("Firewood", C.season(S) === "Winter" ? days(fwDays) : "—", C.season(S) === "Winter" && fwDays < 8));
    g.appendChild(resBox("Diet variety", C.foodVariety(S) + "/4", C.foodVariety(S) < 2));
    return g;
  }
  const days = d => isFinite(d) ? Math.floor(d) + "d" : "∞";
  function resBox(k, v, low) { const e = el("div", "res" + (low ? " low" : "")); e.innerHTML = `<span class="muted">${k}</span><b>${v}</b>`; return e; }

  /* ---------------- colony ---------------- */
  function viewColony() {
    const f = document.createDocumentFragment();
    // resources
    const r = el("div", "card"); r.innerHTML = "<h3>Stores <span class='muted' style='text-transform:none;letter-spacing:0;font-size:11px'>— amount / cap</span></h3>";
    const grid = el("div", "res-grid");
    const groups = [["grain", "fruit", "veg", "protein"], ["water", "firewood"], ["logs", "stone", "iron", "coal"], ["herbs", "leather", "wool"], ["tools", "coats", "ale", "weapons", "ammo"]];
    groups.flat().forEach(res => {
      const v = S.store[res] || 0; if (v < 0.5 && !["water", "logs", "tools"].includes(res)) return;
      const cap = C.capFor(S, res); const full = v >= cap * 0.98;
      grid.appendChild(resBox(resName(res), `${Math.floor(v)}<span class="muted" style="font-weight:400">/${cap}${full ? " ⛔" : ""}</span>`, false));
    });
    r.appendChild(grid);
    r.appendChild(el("div", "muted", "<span style='font-size:11px'>⛔ at cap — overflow is wasted; build a Stockpile/Barn for more.</span>"));
    f.appendChild(r);

    // projects
    const pr = el("div", "card"); pr.innerHTML = "<h3>Construction</h3>";
    if (S.projects.length) S.projects.forEach(p => {
      const b = C.BUILDINGS[p.id]; const pct = Math.min(100, p.work / b.build.work * 100);
      const v = el("div", "vit"); v.innerHTML = `<div class="lab"><span>${b.name}</span><span>${pct.toFixed(0)}%</span></div><div class="bar"><i style="width:${pct}%;background:var(--accent2)"></i></div>`;
      pr.appendChild(v);
    });
    else pr.appendChild(el("div", "muted", "Nothing under construction."));
    const bb = el("button", "btn", "+ Start a building"); bb.style.marginTop = "8px"; bb.onclick = openBuildSheet; pr.appendChild(bb);
    f.appendChild(pr);

    // buildings owned
    const ob = el("div", "card"); ob.innerHTML = "<h3>Standing</h3>";
    const owned = Object.keys(S.buildings).filter(b => b !== "camp");
    ob.appendChild(el("div", owned.length ? "" : "muted", owned.length ? owned.map(id => `<span class="tag" style="margin:2px">${C.BUILDINGS[id].name}${S.buildings[id] > 1 ? " ×" + S.buildings[id] : ""}</span>`).join(" ") : "Just the camp, for now."));
    f.appendChild(ob);

    // decrees
    const dc = el("div", "card"); dc.innerHTML = "<h3>Decrees <span class='muted' style='text-transform:none;letter-spacing:0;font-size:11px'>— cost goodwill</span></h3>";
    Object.keys(C.DECREES).forEach(id => {
      const d = C.DECREES[id]; const on = !!S.decrees[id];
      const row = el("div", "row");
      const cost = d.happiness ? ` <span style="color:${d.happiness < 0 ? "var(--danger)" : "var(--good)"}">(${d.happiness > 0 ? "+" : ""}${d.happiness} spirits)</span>` : "";
      row.innerHTML = `<div class="nm"><b>${d.name}</b> <span class="tag">${d.type}</span><div class="s">${d.desc || ""}${cost}</div></div>`;
      const btn = el("button", "btn sm", d.type === "action" ? "Do it" : (on ? "On" : "Off"));
      if (d.type !== "action" && on) btn.classList.add("primary");
      btn.onclick = () => toggleDecree(id);
      row.appendChild(btn); dc.appendChild(row);
    });
    f.appendChild(dc);
    return f;
  }
  function toggleDecree(id) {
    const d = C.DECREES[id];
    if (d.type === "action") { applyAction(id); }
    else S.decrees[id] = !S.decrees[id];
    saveGame(); render();
  }
  function applyAction(id) {
    const d = C.DECREES[id];
    if (d.spend) for (const r in d.spend) S.store[r] = Math.max(0, (S.store[r] || 0) - d.spend[r]);
    if (d.healAll) live().forEach(c => c.health = Math.min(100, c.health + d.healAll));
    if (d.happiness) live().forEach(c => c.happiness = Math.min(100, Math.max(0, c.happiness + d.happiness)));
    if (id === "feast") live().forEach(c => c.happiness = Math.min(100, c.happiness + 18));
    toast(d.name + " enacted.");
  }

  function openBuildSheet() {
    const loc = C.LOCATIONS[S.location];
    let html = "<h3>Start a building</h3>";
    Object.keys(C.BUILDINGS).forEach(id => {
      if (id === "camp") return;
      const b = C.BUILDINGS[id]; const gate = (loc.buildings && loc.buildings[id] != null) ? loc.buildings[id] : 1;
      if (gate <= 0) return;
      const afford = Object.keys(b.build.mats).every(r => (S.store[r] || 0) >= b.build.mats[r]);
      const mats = Object.entries(b.build.mats).map(([r, n]) => `${n} ${resName(r)}`).join(", ") || "no materials";
      html += `<div class="opt ${afford ? "" : "disabled"}" data-id="${id}"><div class="oi">${b.name} <span class="muted" style="font-size:11px">— ${defOutputText(b)}</span><small>${b.build.work}w · ${mats}${b.skill ? " · " + cap2(b.skill) : ""}</small></div><button class="btn sm ${afford ? "primary" : ""}" ${afford ? "" : "disabled"}>Build</button></div>`;
    });
    openSheet(html);
    $("sheet").querySelectorAll(".opt").forEach(o => { const id = o.dataset.id; const btn = o.querySelector("button"); if (!btn.disabled) btn.onclick = () => { if (C.startProject(S, id)) { toast("Construction begun: " + C.BUILDINGS[id].name); closeSheet(); saveGame(); render(); } }; });
  }

  /* ---------------- people ---------------- */
  function viewPeople() {
    const f = document.createDocumentFragment();
    live().forEach(c => {
      const card = el("div", "card");
      const job = S.assignments[c.id] ? jobName(S.assignments[c.id].job) : "idle";
      card.innerHTML = `<h3 style="color:var(--text);text-transform:none;letter-spacing:0;font-size:16px">${c.name}, ${c.age} <span class="tag">${archName(c.archetype)}</span></h3>
        <div class="muted" style="font-size:12px;margin:-4px 0 8px">Working: ${job}${c.sick > 0 ? " · <span style='color:var(--danger)'>ill</span>" : ""}</div>`;
      card.appendChild(vit("Stamina", c.stamina, "var(--accent)"));
      card.appendChild(vit("Hunger", c.hunger, "var(--accent2)"));
      card.appendChild(vit("Warmth", c.warmth, "var(--cold)"));
      card.appendChild(vit("Health", c.health, "var(--good)"));
      card.appendChild(vit("Happiness", c.happiness, "var(--accent)"));
      card.appendChild(el("div", "sk", C.SKILLS.map(s => `<span class="tag" style="margin:2px">${cap2(s)} ${C.effectiveSkill(c, s)}</span>`).join(" ")));
      if (c.traits.length) card.appendChild(el("div", "tr", c.traits.map(t => `<span class="tag" style="margin:2px;border-color:#3a4d28">${t}</span>`).join(" ")));
      f.appendChild(card);
    });
    return f;
  }
  function vit(label, val, color) {
    const e = el("div", "vit"); const low = val < 30;
    e.innerHTML = `<div class="lab"><span>${label}</span><span style="${low ? "color:var(--danger)" : ""}">${Math.round(val)}</span></div><div class="bar"><i style="width:${val}%;background:${low ? "var(--danger)" : color}"></i></div>`;
    return e;
  }

  /* ---------------- jobs ---------------- */
  function viewJobs() {
    const f = document.createDocumentFragment();
    const intro = el("div", "card"); intro.innerHTML = `<h3>Standing orders</h3><div class="muted" style="font-size:12.5px">Assign each colonist a job and how hard they push. Orders persist until you change them. <b>Rest</b> recovers stamina.<br><br>Buildings cost <b>Wood</b> &amp; <b>Stone</b> — make them with <b>Chop Wood</b> / <b>Gather Stone</b>, or build a <b>Forester</b> / <b>Quarry</b> for a steady supply.</div>`;
    f.appendChild(intro);
    const list = el("div", "card");
    live().forEach(c => {
      const a = S.assignments[c.id] || (S.assignments[c.id] = { job: "forage", effort: 45 });
      const row = el("div", "row");
      const nm = el("div", "nm", `<b>${c.name.split(" ")[0]}</b><div class="s">${bestSkillLabel(c)}</div>`);
      const jb = el("button", "jobpick", jobName(a.job)); jb.onclick = () => openJobSheet(c);
      const seg = el("div", "seg");
      [["Rest", 0], ["Steady", 45], ["Hard", 80]].forEach(([lab, val]) => {
        const b = el("button", a.effort === val ? "on" : "", lab);
        b.onclick = () => { a.effort = val; saveGame(); render(); };
        seg.appendChild(b);
      });
      row.appendChild(nm); row.appendChild(jb); row.appendChild(seg);
      list.appendChild(row);
    });
    f.appendChild(list);
    return f;
  }
  function bestSkillLabel(c) { const s = C.SKILLS.slice().sort((a, b) => C.effectiveSkill(c, b) - C.effectiveSkill(c, a))[0]; return cap2(s) + " " + C.effectiveSkill(c, s); }
  function openJobSheet(c) {
    let html = `<h3>${c.name.split(" ")[0]} — assign job</h3>`;
    const jobs = [];
    Object.keys(C.MANUAL_JOBS).forEach(id => jobs.push([id, C.MANUAL_JOBS[id], true]));
    Object.keys(S.buildings).forEach(id => { if (id !== "camp" && C.BUILDINGS[id]) jobs.push([id, C.BUILDINGS[id], false]); });
    jobs.forEach(([id, def, manual]) => {
      const skl = def.skill;
      const fit = skl ? ` · ${cap2(skl)} ${C.effectiveSkill(c, skl)}` : "";
      html += `<div class="opt" data-id="${id}"><div class="oi">${jobName(id)}<small>${defOutputText(def)}${fit}</small></div><span class="tag">pick</span></div>`;
    });
    openSheet(html);
    $("sheet").querySelectorAll(".opt").forEach(o => o.onclick = () => { S.assignments[c.id].job = o.dataset.id; closeSheet(); saveGame(); render(); });
  }
  function jobName(id) { return (C.MANUAL_JOBS[id] && C.MANUAL_JOBS[id].name) || (C.BUILDINGS[id] && C.BUILDINGS[id].name) || id; }
  function defOutputText(def) {
    if (!def) return "";
    if (def.produce) return "makes " + Object.keys(def.produce).map(resName).join(", ");
    if (def.recipe) return Object.keys(def.recipe.in).map(resName).join("+") + " → " + Object.keys(def.recipe.out).map(resName).join(", ");
    if (def.isBuild) return "builds projects";
    if (def.heal) return "tends the sick";
    if (def.defense) return "defends (+" + def.defense + ")";
    if (def.housing) return "+" + def.housing + " housing";
    if (def.amenity && def.amenity.happiness) return "raises happiness";
    if (def.cap) return "storage capacity";
    if (def.trade) return "enables trade";
    if (def.learnMult) return "faster learning";
    if (def.scout) return "scouts the area";
    if (def.effort === 0) return "recovers stamina";
    return "";
  }

  /* ---------------- advance ---------------- */
  function doAdvance() {
    if (S.over) return;
    const p0 = live().length || 1;
    const f0 = C.totalFood(S) / p0, w0 = (S.store.water || 0) / p0;
    lastBrief = C.advanceTurn(S);
    const p1 = live().length || 1;
    lastBrief.trendFood = Math.sign(Math.round(C.totalFood(S) / p1 - f0));
    lastBrief.trendWater = Math.sign(Math.round((S.store.water || 0) / p1 - w0));
    saveGame();
    page = "briefing"; render();
  }

  /* ---------------- sheet / toast ---------------- */
  function openSheet(html) { $("sheet").innerHTML = html; $("overlay").classList.add("active"); }
  function closeSheet() { $("overlay").classList.remove("active"); }
  let toastT;
  function toast(msg) {
    let t = $("toast"); if (!t) { t = el("div", ""); t.id = "toast"; t.style.cssText = "position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:var(--panel2);border:1px solid var(--accent);color:var(--text);padding:10px 16px;border-radius:24px;font-size:13px;z-index:30;box-shadow:var(--shadow);transition:opacity .2s;"; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = "1"; clearTimeout(toastT); toastT = setTimeout(() => t.style.opacity = "0", 1800);
  }

  /* ---------------- save/load ---------------- */
  function saveGame() { try { localStorage.setItem(SAVE, C.serialize(S)); } catch (e) {} }
  function loadGame() { try { const j = localStorage.getItem(SAVE); if (!j) return false; S = C.deserialize(j); return true; } catch (e) { return false; } }

  const live = () => S.colonists.filter(c => c.alive);
  const cap2 = s => s[0].toUpperCase() + s.slice(1);
  // friendlier resource names for players (internal ids stay the same)
  const RES_NAME = { logs: "Wood", protein: "Meat", veg: "Veg" };
  const resName = r => RES_NAME[r] || cap2(r);

  /* ---------------- boot ---------------- */
  window.addEventListener("DOMContentLoaded", () => {
    $("advance").onclick = doAdvance;
    document.querySelectorAll(".tab").forEach(t => t.onclick = () => { page = t.dataset.page; render(); });
    $("overlay").onclick = e => { if (e.target === $("overlay")) closeSheet(); };
    if (loadGame() && !S.over) { lastBrief = { log: ["Welcome back."], turnHours: C.turnHours(S.colonyHealth) }; show("game"); render(); }
    else initSetup();
  });
})();
