/* =========================================================================
   SIGNAL // The Meridian Incident  —  engine
   ========================================================================= */
"use strict";

const SAVE_KEY = "signal_meridian_save_v1";

/* ---- runtime state ---- */
let S = null; // current save state

function newState(name, cls) {
  const c = CLASSES.find((x) => x.id === cls) || CLASSES[0];
  return {
    name: name || "Survivor",
    cls: c.id,
    clsName: c.name,
    skills: { ...c.skills },
    hp: 100,
    comp: 100,
    inventory: ["slate"],
    flags: {},
    log: [],
    scene: "start",
  };
}

/* ---------------- DOM ---------------- */
const $ = (id) => document.getElementById(id);
const screens = {
  title: $("title"),
  creation: $("creation"),
  game: $("game"),
};

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* ---------------- Title ---------------- */
function initTitle() {
  $("btn-new").onclick = () => startCreation();
  $("btn-continue").onclick = () => {
    const saved = loadGame();
    if (saved) { S = saved; show("game"); renderScene(S.scene); }
    else toast("No saved game found.");
  };
  $("btn-about").onclick = () => openAbout();
  refreshContinue();
}

function refreshContinue() {
  const has = !!localStorage.getItem(SAVE_KEY);
  const btn = $("btn-continue");
  btn.disabled = !has;
  btn.style.display = has ? "" : "none";
}

/* ---------------- Character creation ---------------- */
let pendingClass = null;
function startCreation() {
  pendingClass = null;
  $("name-input").value = "";
  const list = $("class-list");
  list.innerHTML = "";
  CLASSES.forEach((c) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `<h3>${c.glyph} ${c.name}</h3>
      <div class="class-skills">${c.skillsLabel}</div>
      <p>${c.desc}</p>`;
    card.onclick = () => {
      pendingClass = c.id;
      [...list.children].forEach((x) => x.classList.remove("selected"));
      card.classList.add("selected");
      validateCreation();
    };
    list.appendChild(card);
  });
  $("name-input").oninput = validateCreation;
  $("btn-back-title").onclick = () => show("title");
  $("btn-begin").onclick = () => {
    S = newState($("name-input").value.trim(), pendingClass);
    saveGame();
    show("game");
    renderScene("start");
  };
  validateCreation();
  show("creation");
}

function validateCreation() {
  const ok = pendingClass && $("name-input").value.trim().length > 0;
  $("btn-begin").disabled = !ok;
}

/* ---------------- Skill checks ---------------- */
function roll(skill, dc) {
  const die = 1 + Math.floor(Math.random() * 6); // 1..6
  const total = (S.skills[skill] || 0) + die;
  return { die, total, success: total >= dc, skillVal: S.skills[skill] || 0 };
}

/* ---------------- Requirements ---------------- */
function meetsReq(req) {
  if (!req) return true;
  if (req.flag && !S.flags[req.flag]) return false;
  if (req.notFlag && S.flags[req.notFlag]) return false;
  if (req.item && !S.inventory.includes(req.item)) return false;
  if (req.skillClass && S.cls !== req.skillClass) return false;
  return true;
}

/* ---------------- Effects ---------------- */
function applyEffect(e) {
  if (!e) return;
  if (e.addItem && !S.inventory.includes(e.addItem)) S.inventory.push(e.addItem);
  if (e.removeItem) S.inventory = S.inventory.filter((i) => i !== e.removeItem);
  if (e.setFlag) S.flags[e.setFlag] = true;
  if (typeof e.hp === "number") S.hp = clamp(S.hp + e.hp, 0, 100);
  if (typeof e.comp === "number") S.comp = clamp(S.comp + e.comp, 0, 100);
  if (e.log) S.log.push(e.log);
  if (e.toast) toast(e.toast);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------------- Render scene ---------------- */
function renderScene(id) {
  if (id === "__title") { show("title"); refreshContinue(); return; }

  const scene = SCENES[id];
  if (!scene) { console.error("Missing scene:", id); toast("…the story frays here."); return; }

  S.scene = id;
  if (scene.onEnter) scene.onEnter(S);

  // failsafe: broken mind / body
  if ((S.comp <= 0 || S.hp <= 0) && !scene.ending) {
    return renderScene("ending_lost");
  }

  updateHUD();

  // art
  const art = $("scene-art");
  if (scene.art) {
    art.style.display = "flex";
    art.innerHTML = `<span class="glyph" style="color:${scene.art.color || "#41e0c4"}">${scene.art.glyph || "◈"}</span>`;
  } else {
    art.style.display = "none";
  }

  // ending banner
  let bodyHTML = "";
  if (scene.ending) {
    bodyHTML += `<span class="ending-tag ${scene.ending.type}">${scene.ending.label}</span>`;
  }
  bodyHTML += scene.text;

  const textEl = $("scene-text");
  textEl.className = "scene-text fade-in";
  textEl.innerHTML = bodyHTML;
  // restart animation
  void textEl.offsetWidth;

  // choices
  const cBox = $("choices");
  cBox.innerHTML = "";
  (scene.choices || []).forEach((ch) => {
    const locked = !meetsReq(ch.requires);
    const btn = document.createElement("button");
    btn.className = "choice" + (locked ? " locked" : "");
    let tagHTML = "";
    if (ch.tag) {
      const lbl = ch.check ? `${ch.check.skill.toUpperCase()} ${ch.check.dc}` :
                  ch.tag === "item" ? "ITEM" :
                  ch.tag === "danger" ? "RISK" : ch.tag.toUpperCase();
      tagHTML = `<span class="tag ${ch.tag}">${lbl}</span>`;
    }
    btn.innerHTML = `<span class="arrow">›</span><span>${ch.text}</span>${tagHTML}`;
    if (!locked) {
      btn.onclick = () => choose(ch);
    }
    cBox.appendChild(btn);
  });

  // scroll story to top
  $("story").scrollTop = 0;

  if (!scene.ending) saveGame();
  else { localStorage.removeItem(SAVE_KEY); } // clear save at an ending
}

function choose(ch) {
  applyEffect(ch.effect);

  if (ch.check) {
    const r = roll(ch.check.skill, ch.check.dc);
    showCheckResult(ch.check, r, () => {
      renderScene(r.success ? ch.check.success : ch.check.fail);
    });
    return;
  }
  renderScene(ch.to);
}

/* show a brief skill-check result before navigating */
function showCheckResult(check, r, next) {
  const cBox = $("choices");
  cBox.innerHTML = "";
  const res = document.createElement("div");
  res.className = "check-result " + (r.success ? "good" : "bad");
  res.innerHTML = `<b>${check.skill.toUpperCase()} CHECK</b> — your ${r.skillVal} + roll ${r.die} = <b>${r.total}</b> vs ${check.dc}<br>${r.success ? "✓ Success." : "✗ Failure."}`;
  $("scene-text").appendChild(res);
  res.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const cont = document.createElement("button");
  cont.className = "choice";
  cont.innerHTML = `<span class="arrow">›</span><span>Continue</span>`;
  cont.onclick = next;
  cBox.appendChild(cont);
}

/* ---------------- HUD ---------------- */
function updateHUD() {
  $("hud-hp").textContent = S.hp;
  $("hud-comp").textContent = S.comp;
  $("hud-hp").style.color = S.hp <= 25 ? "var(--danger)" : "";
  $("hud-comp").style.color = S.comp <= 25 ? "var(--danger)" : "";
}

/* ---------------- Overlay (menu / inventory / character / log) ---------------- */
function openOverlay(title, html) {
  $("overlay-title").textContent = title;
  $("overlay-body").innerHTML = html;
  $("overlay").classList.add("active");
}
function closeOverlay() { $("overlay").classList.remove("active"); }

function openMenu() {
  const html = `<div class="menu-list">
    <button class="btn" id="m-char">◈ Character</button>
    <button class="btn" id="m-log">▤ Investigation Log</button>
    <button class="btn" id="m-save">▣ Save Game</button>
    <button class="btn btn-ghost" id="m-title">⏏ Quit to Title</button>
  </div>`;
  openOverlay("Menu", html);
  $("m-char").onclick = openCharacter;
  $("m-log").onclick = openLog;
  $("m-save").onclick = () => { saveGame(); toast("Game saved."); closeOverlay(); };
  $("m-title").onclick = () => {
    saveGame();
    closeOverlay();
    show("title");
    refreshContinue();
  };
}

function openCharacter() {
  const c = CLASSES.find((x) => x.id === S.cls);
  const skillRow = (k, label) => {
    const v = S.skills[k] || 0;
    const pct = Math.min(100, (v / 8) * 100);
    return `<div class="char-row"><span class="k">${label}</span>
      <span class="skillbar"><i style="width:${pct}%"></i></span>
      <span class="v">${v}</span></div>`;
  };
  const html = `
    <div class="char-row"><span class="k">Name</span><span class="v">${esc(S.name)}</span></div>
    <div class="char-row"><span class="k">Specialization</span><span class="v">${c.glyph} ${c.name}</span></div>
    <div class="char-row"><span class="k">Health</span><span class="v">${S.hp}/100</span></div>
    <div class="char-row"><span class="k">Composure</span><span class="v">${S.comp}/100</span></div>
    <div style="height:14px"></div>
    ${skillRow("tech", "Tech")}
    ${skillRow("logic", "Logic")}
    ${skillRow("bio", "Bio")}
    ${skillRow("nerve", "Nerve")}`;
  openOverlay("Character", html);
}

function openInventory() {
  let html = "";
  if (!S.inventory.length) {
    html = `<div class="empty-note">Your pockets are empty.</div>`;
  } else {
    S.inventory.forEach((id) => {
      const it = ITEMS[id];
      if (!it) return;
      const usable = id === "medkit" || id === "stim";
      html += `<div class="inv-item">
        <span class="ico">${it.ico}</span>
        <div style="flex:1">
          <h4>${it.name}</h4>
          <p>${it.desc}</p>
          ${usable ? `<button class="btn" data-use="${id}" style="margin-top:10px;padding:10px">Use</button>` : ""}
        </div></div>`;
    });
  }
  openOverlay("Inventory", html);
  $("overlay-body").querySelectorAll("[data-use]").forEach((b) => {
    b.onclick = () => useItem(b.getAttribute("data-use"));
  });
}

function useItem(id) {
  if (id === "medkit") {
    if (S.hp >= 100) return toast("You're already at full health.");
    S.hp = clamp(S.hp + 35, 0, 100);
    S.inventory.splice(S.inventory.indexOf(id), 1);
    toast("+35 Health");
  } else if (id === "stim") {
    if (S.comp >= 100) return toast("Your mind is already steady.");
    S.comp = clamp(S.comp + 35, 0, 100);
    S.inventory.splice(S.inventory.indexOf(id), 1);
    toast("+35 Composure");
  }
  updateHUD();
  saveGame();
  openInventory();
}

function openLog() {
  let html = "";
  if (!S.log.length) html = `<div class="empty-note">No entries yet.</div>`;
  else S.log.forEach((e) => {
    html += `<div class="log-entry"><b>${esc(e.t)}</b><br>${esc(e.d)}</div>`;
  });
  openOverlay("Investigation Log", html);
}

function openAbout() {
  const html = `<p class="muted" style="line-height:1.7">
    <b style="color:var(--text)">SIGNAL // The Meridian Incident</b><br><br>
    A story-rich sci-fi mystery RPG. Explore a derelict research vessel, uncover what happened to its crew,
    and decide how the story ends — your specialization and choices change what you can do and what you learn.<br><br>
    <b style="color:var(--accent)">5 endings.</b> Skill checks. Inventory. Branching paths. Your progress saves automatically on this device.<br><br>
    Tap <b>☰</b> for the menu, <b>▣</b> for inventory. Manage your <b>Health</b> (✚) and <b>Composure</b> (◈) — if either hits zero, you're lost.<br><br>
    <span style="color:var(--muted)">Built to run offline, on a phone. Open <code>index.html</code> anywhere.</span>
  </p>`;
  openOverlay("About", html);
}

/* ---------------- Save / load ---------------- */
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); refreshContinue(); }
  catch (e) { /* storage may be blocked */ }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

/* ---------------- Utilities ---------------- */
let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------------- Wire up HUD + overlay ---------------- */
function initGameUI() {
  $("hud-menu").onclick = openMenu;
  $("hud-inv").onclick = openInventory;
  $("overlay-close").onclick = closeOverlay;
  $("overlay").addEventListener("click", (e) => { if (e.target === $("overlay")) closeOverlay(); });
}

/* ---------------- Boot ---------------- */
window.addEventListener("DOMContentLoaded", () => {
  initTitle();
  initGameUI();
});
