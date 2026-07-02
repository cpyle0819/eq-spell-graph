// --- State ---
let zones = [];
let availableClasses = [];
let lastRankings = null;
let lastLevels = [];
let showAllSpells = false;

// --- Init ---
async function init() {
  [zones, availableClasses] = await Promise.all([
    fetch("/api/zones").then((r) => r.json()),
    fetch("/api/classes").then((r) => r.json()),
  ]);
  populateZoneList();
  populateShoppingClassSelect();
  setupLevelRange();
  setupPlanner();
  setupProfiles();
}

// --- Profiles ---
const PROFILES_KEY = "eq-planner-profiles";
const LAST_PROFILE_KEY = "eq-planner-last-profile";

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); }
  catch { return []; }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getFormSnapshot() {
  return {
    race: document.getElementById("race-select").value,
    primaryClass: document.getElementById("primary-class-select").value,
    deity: document.getElementById("deity-select").value,
    cls: document.getElementById("class-select").value,
    zone: document.getElementById("zone-input").value,
    levelMin: document.getElementById("level-min").value,
    levelMax: document.getElementById("level-max").value,
  };
}

function applyProfile(profile) {
  document.getElementById("race-select").value = profile.race;
  document.getElementById("primary-class-select").value = profile.primaryClass;
  document.getElementById("deity-select").value = profile.deity;
  document.getElementById("class-select").value = profile.cls;
  document.getElementById("zone-input").value = profile.zone;
  document.getElementById("level-min").value = profile.levelMin;
  document.getElementById("level-max").value = profile.levelMax;
  document.getElementById("level-min").dispatchEvent(new Event("input"));
}

function refreshProfileSelect(selectedName = "") {
  const profiles = loadProfiles();
  const sel = document.getElementById("profile-select");
  sel.innerHTML = '<option value="">— select profile —</option>';
  for (const p of profiles) {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    if (p.name === selectedName) opt.selected = true;
    sel.appendChild(opt);
  }
}

function setProfileMode(mode) {
  const createRow = document.getElementById("profile-create-row");
  const sel = document.getElementById("profile-select");
  const updateBtn = document.getElementById("profile-update-btn");
  const deleteBtn = document.getElementById("profile-delete-btn");
  const newBtn = document.getElementById("profile-new-btn");

  if (mode === "create") {
    createRow.style.display = "flex";
    newBtn.style.display = "none";
    updateBtn.style.display = "none";
    deleteBtn.style.display = "none";
    sel.disabled = true;
    document.getElementById("profile-name").value = "";
    document.getElementById("profile-name").focus();
  } else {
    createRow.style.display = "none";
    sel.disabled = false;
    newBtn.style.display = "";
    const hasSelection = !!sel.value;
    updateBtn.style.display = hasSelection ? "" : "none";
    deleteBtn.style.display = hasSelection ? "" : "none";
  }
}

function setupProfiles() {
  const lastProfile = localStorage.getItem(LAST_PROFILE_KEY);
  const autoLoad = lastProfile && loadProfiles().find((p) => p.name === lastProfile);
  refreshProfileSelect(autoLoad ? lastProfile : "");
  setProfileMode("browse");
  if (autoLoad) applyProfile(autoLoad);

  document.getElementById("profile-select").addEventListener("change", (e) => {
    const name = e.target.value;
    if (!name) { localStorage.removeItem(LAST_PROFILE_KEY); setProfileMode("browse"); return; }
    const profile = loadProfiles().find((p) => p.name === name);
    if (profile) {
      applyProfile(profile);
      localStorage.setItem(LAST_PROFILE_KEY, name);
    }
    setProfileMode("browse");
    if (lastRankings) renderRankings(lastRankings, lastLevels);
  });

  document.getElementById("profile-new-btn").addEventListener("click", () => setProfileMode("create"));

  document.getElementById("profile-cancel-btn").addEventListener("click", () => setProfileMode("browse"));

  document.getElementById("profile-save-btn").addEventListener("click", () => {
    const name = document.getElementById("profile-name").value.trim();
    if (!name) return;
    const profiles = loadProfiles();
    const idx = profiles.findIndex((p) => p.name === name);
    const profile = { name, ...getFormSnapshot() };
    if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
    saveProfiles(profiles);
    refreshProfileSelect(name);
    localStorage.setItem(LAST_PROFILE_KEY, name);
    setProfileMode("browse");
  });

  document.getElementById("profile-update-btn").addEventListener("click", () => {
    const name = document.getElementById("profile-select").value;
    if (!name) return;
    const profiles = loadProfiles();
    const idx = profiles.findIndex((p) => p.name === name);
    if (idx >= 0) profiles[idx] = { name, ...getFormSnapshot() };
    saveProfiles(profiles);
    localStorage.setItem(LAST_PROFILE_KEY, name);
  });

  document.getElementById("profile-delete-btn").addEventListener("click", () => {
    const name = document.getElementById("profile-select").value;
    if (!name) return;
    saveProfiles(loadProfiles().filter((p) => p.name !== name));
    if (localStorage.getItem(LAST_PROFILE_KEY) === name) localStorage.removeItem(LAST_PROFILE_KEY);
    refreshProfileSelect();
    setProfileMode("browse");
  });
}

// --- Owned Spells ---
const OWNED_GLOBAL_KEY = "eq-planner-owned-global";

function getOwnedSpells() {
  const name = document.getElementById("profile-select").value;
  if (name) {
    const p = loadProfiles().find((p) => p.name === name);
    return new Set(p?.ownedSpells || []);
  }
  try { return new Set(JSON.parse(localStorage.getItem(OWNED_GLOBAL_KEY) || "[]")); }
  catch { return new Set(); }
}

function setSpellOwned(spellId, owned) {
  const name = document.getElementById("profile-select").value;
  if (name) {
    const profiles = loadProfiles();
    const idx = profiles.findIndex((p) => p.name === name);
    if (idx < 0) return;
    const set = new Set(profiles[idx].ownedSpells || []);
    owned ? set.add(spellId) : set.delete(spellId);
    profiles[idx].ownedSpells = [...set];
    saveProfiles(profiles);
  } else {
    const set = getOwnedSpells();
    owned ? set.add(spellId) : set.delete(spellId);
    localStorage.setItem(OWNED_GLOBAL_KEY, JSON.stringify([...set]));
  }
}

function clearOwnedSpells() {
  const name = document.getElementById("profile-select").value;
  if (name) {
    const profiles = loadProfiles();
    const idx = profiles.findIndex((p) => p.name === name);
    if (idx >= 0) { profiles[idx].ownedSpells = []; saveProfiles(profiles); }
  } else {
    localStorage.removeItem(OWNED_GLOBAL_KEY);
  }
}

function populateShoppingClassSelect() {
  const select = document.getElementById("class-select");
  select.innerHTML = "";
  for (const cls of availableClasses) {
    const opt = document.createElement("option");
    opt.value = cls;
    opt.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
    select.appendChild(opt);
  }
}


// --- Planner ---
function populateZoneList() {
  const select = document.getElementById("zone-input");
  zones.forEach((z) => {
    const opt = document.createElement("option");
    opt.value = z.label;
    opt.textContent = z.label;
    select.appendChild(opt);
  });
}

function setupLevelRange() {
  const minSlider = document.getElementById("level-min");
  const maxSlider = document.getElementById("level-max");
  const display = document.getElementById("range-display");

  function update() {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);
    if (min > max) {
      // Swap if user drags min past max
      [minSlider.value, maxSlider.value] = [max, min];
      [min, max] = [max, min];
    }
    display.textContent = min === max ? `Level ${min}` : `${min} – ${max}`;
  }

  minSlider.addEventListener("input", update);
  maxSlider.addEventListener("input", update);
  update();
}

function getSelectedLevels() {
  const min = parseInt(document.getElementById("level-min").value);
  const max = parseInt(document.getElementById("level-max").value);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const levels = [];
  for (let i = lo; i <= hi; i++) levels.push(i);
  return levels;
}

function setupPlanner() {
  document.getElementById("plan-btn").addEventListener("click", runPlan);

  const results = document.getElementById("results");
  results.addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-spell-id]");
    if (!cb) return;
    setSpellOwned(cb.dataset.spellId, cb.checked);
    renderRankings(lastRankings, lastLevels);
  });
  results.addEventListener("click", (e) => {
    if (e.target.matches("#toggle-owned-btn")) {
      showAllSpells = !showAllSpells;
      renderRankings(lastRankings, lastLevels);
    }
    if (e.target.matches("#clear-owned-btn")) {
      clearOwnedSpells();
      renderRankings(lastRankings, lastLevels);
    }
  });
}

async function runPlan() {
  const cls = document.getElementById("class-select").value;
  const race = document.getElementById("race-select").value;
  const primaryClass = document.getElementById("primary-class-select").value;
  const deity = document.getElementById("deity-select").value;
  const from = document.getElementById("zone-input").value;
  const levels = getSelectedLevels();

  if (!from) {
    document.getElementById("results").innerHTML =
      '<div class="no-results">Enter your current zone.</div>';
    return;
  }

  document.getElementById("results").innerHTML = '<div class="loading">Searching Norrath...</div>';

  const params = new URLSearchParams({ class: cls, levels: levels.join(","), from, race, primaryClass, deity });
  const rankings = await fetch(`/api/plan?${params}`).then((r) => r.json());

  if (rankings.error) {
    document.getElementById("results").innerHTML =
      `<div class="no-results">${rankings.error}</div>`;
    return;
  }

  lastRankings = rankings;
  lastLevels = levels;
  renderRankings(rankings, levels);
}

function renderRankings(rankings, levels) {
  const el = document.getElementById("results");
  if (!rankings.length) {
    el.innerHTML = '<div class="no-results">No vendors found for those levels.</div>';
    return;
  }

  const owned = getOwnedSpells();
  const accessible = rankings.filter((r) => r.faction === "safe" || r.faction === "neutral");
  const wontSell = rankings.filter((r) => r.faction === "wont_sell");
  const kos = rankings.filter((r) => r.faction === "kos");
  const allSpellIds = new Set(accessible.flatMap((r) => r.spells.map((s) => s.id)));
  const totalSpells = allSpellIds.size;
  const ownedCount = [...allSpellIds].filter((id) => owned.has(id)).length;

  const warnings = [];
  if (wontSell.length) warnings.push(`<span style="color:#f59e0b;">${wontSell.length} zone(s) won't sell to you</span>`);
  if (kos.length) warnings.push(`<span style="color:#f87171;">${kos.length} zone(s) KOS</span>`);

  const ownedLabel = ownedCount > 0 ? ` · <span style="color:#4ade80">${ownedCount} owned</span>` : "";
  const toggleBtn = `<button class="secondary" id="toggle-owned-btn">${showAllSpells ? "Show remaining" : "Show all"}</button>`;
  const clearBtn = ownedCount > 0 ? `<button class="secondary" id="clear-owned-btn">Clear owned</button>` : "";

  el.innerHTML = `<div class="results-header">
    <span>${totalSpells} spell(s) across ${accessible.length} zone(s) for levels ${levels.join(", ")}${ownedLabel}${warnings.length ? " — " + warnings.join(", ") : ""}</span>
    <span class="results-actions">${toggleBtn}${clearBtn}</span>
  </div>`;

  const FACTION_LABELS = { safe: "safe", neutral: "neutral", wont_sell: "won't sell", kos: "kill on sight" };

  for (const r of rankings) {
    const visibleSpells = showAllSpells ? r.spells : r.spells.filter((s) => !owned.has(s.id));
    if (!showAllSpells && visibleSpells.length === 0) continue;

    const hopsText = r.hops === null ? "unreachable" : r.hops === 0 ? "you are here" : `${r.hops} hop${r.hops > 1 ? "s" : ""}`;
    const card = document.createElement("div");
    card.className = `zone-card ${r.faction}`;

    const spellRows = r.spells.map((s) => {
      const isOwned = owned.has(s.id);
      if (!showAllSpells && isOwned) return "";
      return `
        <div class="spell-row${isOwned ? " spell-owned" : ""}">
          <label class="spell-check"><input type="checkbox" data-spell-id="${s.id}"${isOwned ? " checked" : ""}></label>
          <span class="spell-chip">${s.name}<span class="lvl">L${s.level}</span></span>
          <span class="vendor-names">${s.vendors.filter((v, _, arr) => !arr.some((o) => o !== v && o.startsWith(v + ","))).map((v) => `<span class="vendor-tag">${v}</span>`).join("")}</span>
        </div>
      `;
    }).join("");

    const routeHtml = r.route && r.route.length > 1
      ? `<div class="route-path">
          <span class="route-label">Route</span>
          <div class="route-steps">${r.route.map((step, i) => {
            if (i === 0) return `<span class="route-zone">${step.name}</span>`;
            return step.via === "boat"
              ? `<span class="boat-sep">⚓</span><span class="route-zone">${step.name}</span>`
              : `<span class="route-sep">›</span><span class="route-zone">${step.name}</span>`;
          }).join("")}</div>
        </div>`
      : "";

    const spellCount = visibleSpells.length;
    const ownedHere = r.spells.length - visibleSpells.length;
    const spellBadge = spellCount + (ownedHere > 0 && !showAllSpells ? ` <span style="color:#4ade80;font-size:10px;">(${ownedHere} owned)</span>` : "");

    card.innerHTML = `
      <div class="zone-card-header">
        <span class="zone-name">${r.zoneName}</span>
        <span class="faction-badge ${r.faction}">${FACTION_LABELS[r.faction] || r.faction}</span>
        <span class="zone-badge">${spellBadge} spell${spellCount !== 1 ? "s" : ""}</span>
        <span class="zone-badge hops">${hopsText}</span>
      </div>
      ${routeHtml}
      <div class="spell-vendor-list">${spellRows}</div>
    `;
    el.appendChild(card);
  }
}

init();
