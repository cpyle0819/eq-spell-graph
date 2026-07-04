// --- State ---
let zones = [];
let availableClasses = [];
let lastRankings = null;
let lastLevelRange = { min: 1, max: 1 };
let showAllSpells = false;
let selectedClasses = []; // string[]
let specificSpells = []; // { id, name }
let specificZones = []; // { id, label }

let planDebounce;
function replan(delay = 300) { clearTimeout(planDebounce); planDebounce = setTimeout(runPlan, delay); }

// --- Spell tooltip ---
const tooltip = document.getElementById("spell-tooltip");
let tooltipTimer;

function showTooltip(spell, anchorEl) {
  clearTimeout(tooltipTimer);

  const dur = spell.duration
    ? spell.duration.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s").replace(/instant/i, "Instant")
    : null;

  const stats = [];
  if (spell.spellType) stats.push({ text: spell.spellType, hi: true });
  if (spell.mana != null) stats.push({ text: `${spell.mana} mana` });
  if (spell.targetType) stats.push({ text: spell.targetType });
  if (dur) stats.push({ text: dur });
  if (spell.castTime != null) stats.push({ text: `${spell.castTime.toFixed(1)}s cast` });
  if (spell.resist && !/unresist/i.test(spell.resist)) stats.push({ text: `${spell.resist} resist` });
  if (spell.skill) stats.push({ text: spell.skill });

  tooltip.innerHTML = `
    <div class="tt-name">${spell.name}</div>
    ${spell.description ? `<div class="tt-desc">${spell.description}</div>` : ""}
    ${stats.length ? `<div class="tt-stats">${stats.map(s => `<span class="tt-stat${s.hi ? " highlight" : ""}">${s.text}</span>`).join("")}</div>` : ""}
  `;

  positionTooltip(anchorEl);
  tooltip.setAttribute("aria-hidden", "false");
  tooltip.classList.add("visible");
}

function positionTooltip(el) {
  const r = el.getBoundingClientRect();
  const tw = 320, th = tooltip.offsetHeight || 120;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = r.left;
  let top = r.bottom + 8;
  if (left + tw > vw - 12) left = vw - tw - 12;
  if (top + th > vh - 12) top = r.top - th - 8;
  tooltip.style.left = `${Math.max(8, left)}px`;
  tooltip.style.top = `${Math.max(8, top)}px`;
}

function hideTooltip() {
  tooltip.classList.remove("visible");
  tooltip.setAttribute("aria-hidden", "true");
}

function setupTooltip() {
  const isMouseDevice = window.matchMedia("(pointer: fine)").matches;
  const results = document.getElementById("results");

  if (!isMouseDevice) return; // touch devices: tap navigates to wiki, no hover needed

  // Desktop: show hover card, suppress link navigation on click
  results.addEventListener("mouseover", (e) => {
    const chip = e.target.closest(".spell-chip[data-spell-id]");
    if (!chip) return;
    const id = chip.dataset.spellId;
    const spell = lastRankings?.flatMap(r => r.spells).find(s => s.id === id);
    if (spell) showTooltip(spell, chip);
  });
  results.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget?.closest(".spell-chip[data-spell-id]")) hideTooltip();
  });
  results.addEventListener("scroll", hideTooltip, { passive: true });
  results.addEventListener("click", (e) => {
    const chip = e.target.closest(".spell-chip[data-spell-id]");
    if (chip) e.preventDefault(); // hover is sufficient on desktop
  });
}

const STATE_KEY = "eq-planner-state";
const OWNED_KEY = "eq-planner-owned";

// --- Init ---
async function init() {
  [zones, availableClasses] = await Promise.all([
    fetch("/api/zones").then((r) => r.json()),
    fetch("/api/classes").then((r) => r.json()),
  ]);
  populateZoneList();
  setupLevelRange();
  setupPlanner();
  setupClassSearch();
  setupSpellSearch();
  setupZoneSearch();
  const hadState = restoreState();
  if (!hadState) applyDefaults();
  setupAutoSave();
  setupTooltip();
  runPlan();
}

// --- Persisted state ---
function getState() {
  return {
    race: document.getElementById("race-select").value,
    primaryClass: document.getElementById("primary-class-select").value,
    deity: document.getElementById("deity-select").value,
    classes: selectedClasses,
    zone: document.getElementById("zone-input").value,
    levelMin: document.getElementById("level-min").value,
    levelMax: document.getElementById("level-max").value,
    specificSpells,
    specificZones,
  };
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(getState()));
}

function restoreState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (!s) return false;
    if (s.race) document.getElementById("race-select").value = s.race;
    if (s.primaryClass) document.getElementById("primary-class-select").value = s.primaryClass;
    if (s.deity) document.getElementById("deity-select").value = s.deity;
    const classes = s.classes || (s.cls ? [s.cls] : []);
    if (classes.length) { selectedClasses = classes; renderClassTags(); }
    if (s.zone) document.getElementById("zone-input").value = s.zone;
    if (s.levelMin) document.getElementById("level-min").value = s.levelMin;
    if (s.levelMax) {
      document.getElementById("level-max").value = s.levelMax;
      document.getElementById("level-min").dispatchEvent(new Event("input"));
    }
    if (Array.isArray(s.specificSpells) && s.specificSpells.length) {
      specificSpells = s.specificSpells;
      renderSpellTags();
    }
    if (Array.isArray(s.specificZones) && s.specificZones.length) {
      specificZones = s.specificZones;
      renderZoneTags();
    }
    return true;
  } catch { return false; }
}

function applyDefaults() {
  selectedClasses = ["shaman"];
  renderClassTags();
  const zoneSelect = document.getElementById("zone-input");
  const qeynos = [...zoneSelect.options].find((o) => o.value === "South Qeynos" || o.value === "North Qeynos" || o.value === "Qeynos");
  if (qeynos) zoneSelect.value = qeynos.value;
  else if (zoneSelect.options.length > 1) zoneSelect.selectedIndex = 1;
  document.getElementById("level-min").dispatchEvent(new Event("input"));
}

function setupAutoSave() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input", "level-min", "level-max"]) {
    const el = document.getElementById(id);
    el?.addEventListener("change", saveState);
    el?.addEventListener("input", saveState);
  }
}

// --- Owned Spells ---
function getOwnedSpells() {
  try { return new Set(JSON.parse(localStorage.getItem(OWNED_KEY) || "[]")); }
  catch { return new Set(); }
}

function setSpellOwned(spellId, owned) {
  const set = getOwnedSpells();
  owned ? set.add(spellId) : set.delete(spellId);
  localStorage.setItem(OWNED_KEY, JSON.stringify([...set]));
}

function clearOwnedSpells() {
  localStorage.removeItem(OWNED_KEY);
}

// --- Populate ---
function populateZoneList() {
  const select = document.getElementById("zone-input");
  zones.forEach((z) => {
    const opt = document.createElement("option");
    opt.value = z.label;
    opt.textContent = z.label;
    select.appendChild(opt);
  });
}

function renderClassTags() {
  document.getElementById("class-tags").innerHTML = selectedClasses.map((c) =>
    `<span class="tag-item" data-id="${c}">
      <span class="tag-item-name">${c.charAt(0).toUpperCase() + c.slice(1)}</span>
      <button class="tag-item-remove" data-id="${c}" aria-label="Remove ${c}">&times;</button>
    </span>`
  ).join("");
}

function setupClassSearch() {
  const input = document.getElementById("class-search-input");
  const dropdown = document.getElementById("class-suggestions");
  let activeIndex = -1;

  function positionDropdown() {
    const wrap = document.getElementById("class-tag-wrap").getBoundingClientRect();
    dropdown.style.left = `${wrap.left}px`;
    dropdown.style.width = `${wrap.width}px`;
    dropdown.style.top = `${wrap.bottom + 4}px`;
  }

  function openDropdown(items) {
    activeIndex = -1;
    if (!items.length) {
      dropdown.innerHTML = '<div class="suggestion-empty">No matching classes</div>';
    } else {
      dropdown.innerHTML = items
        .map((c) => `<div class="suggestion-item" role="option" data-id="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</div>`)
        .join("");
    }
    positionDropdown();
    dropdown.classList.add("open");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    activeIndex = -1;
  }

  function addClass(cls) {
    if (selectedClasses.includes(cls)) return;
    selectedClasses.push(cls);
    renderClassTags();
    saveState();
    replan(300);
    input.value = "";
    closeDropdown();
    input.focus();
  }

  function removeClass(cls) {
    selectedClasses = selectedClasses.filter((c) => c !== cls);
    renderClassTags();
    saveState();
    replan(300);
  }

  function getMatches(q) {
    const lower = q.toLowerCase();
    return availableClasses.filter((c) => !selectedClasses.includes(c) && c.includes(lower));
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    openDropdown(getMatches(q));
  });

  input.addEventListener("focus", () => {
    openDropdown(getMatches(input.value.trim()));
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdown.classList.contains("open")) return;
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) addClass(item.dataset.id);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => { setTimeout(closeDropdown, 150); });

  dropdown.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".suggestion-item");
    if (item) { e.preventDefault(); addClass(item.dataset.id); }
  });

  document.getElementById("class-tags").addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-item-remove");
    if (btn) removeClass(btn.dataset.id);
  });

  document.getElementById("class-tag-wrap").addEventListener("click", (e) => {
    if (!e.target.closest(".tag-item-remove")) input.focus();
  });

  window.addEventListener("resize", () => { if (dropdown.classList.contains("open")) positionDropdown(); });
}

// --- Level range ---
function setupLevelRange() {
  const minSlider = document.getElementById("level-min");
  const maxSlider = document.getElementById("level-max");
  const display = document.getElementById("range-display");

  function updateDisplay() {
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    display.textContent = min === max ? `Level ${min}` : `${min} – ${max}`;
  }

  minSlider.addEventListener("input", () => {
    if (parseInt(minSlider.value) > parseInt(maxSlider.value)) minSlider.value = maxSlider.value;
    updateDisplay();
  });

  maxSlider.addEventListener("input", () => {
    if (parseInt(maxSlider.value) < parseInt(minSlider.value)) maxSlider.value = minSlider.value;
    updateDisplay();
  });

  updateDisplay();
}

function getSelectedLevelRange() {
  const min = parseInt(document.getElementById("level-min").value);
  const max = parseInt(document.getElementById("level-max").value);
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

// --- Specific spell search ---
function renderSpellTags() {
  document.getElementById("spell-tags").innerHTML = specificSpells.map((s) =>
    `<span class="tag-item" data-id="${s.id}">
      <span class="tag-item-name">${s.name}</span>
      <button class="tag-item-remove" data-id="${s.id}" aria-label="Remove ${s.name}">&times;</button>
    </span>`
  ).join("");
}

function renderZoneTags() {
  document.getElementById("zone-tags").innerHTML = specificZones.map((z) =>
    `<span class="tag-item" data-id="${z.id}">
      <span class="tag-item-name">${z.label}</span>
      <button class="tag-item-remove" data-id="${z.id}" aria-label="Remove ${z.label}">&times;</button>
    </span>`
  ).join("");
}

function setupSpellSearch() {
  const input = document.getElementById("spell-search-input");
  const dropdown = document.getElementById("spell-suggestions");
  let activeIndex = -1;
  let searchDebounce;

  function positionDropdown() {
    const r = input.getBoundingClientRect();
    const wrap = document.getElementById("spell-tag-wrap").getBoundingClientRect();
    dropdown.style.left = `${wrap.left}px`;
    dropdown.style.width = `${wrap.width}px`;
    dropdown.style.top = `${wrap.bottom + 4}px`;
  }

  function openDropdown(items) {
    activeIndex = -1;
    if (!items.length) {
      dropdown.innerHTML = '<div class="suggestion-empty">No matching spells</div>';
    } else {
      dropdown.innerHTML = items
        .map((s) => `<div class="suggestion-item" role="option" data-id="${s.id}" data-name="${s.label}">${s.label}</div>`)
        .join("");
    }
    positionDropdown();
    dropdown.classList.add("open");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    activeIndex = -1;
  }

  function addSpell(id, name) {
    if (specificSpells.some((s) => s.id === id)) return;
    specificSpells.push({ id, name });
    renderSpellTags();
    saveState();
    replan(300);
    input.value = "";
    closeDropdown();
    input.focus();
  }

  function removeSpell(id) {
    specificSpells = specificSpells.filter((s) => s.id !== id);
    renderSpellTags();
    saveState();
    replan(300);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 2) { closeDropdown(); return; }
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      const results = await fetch(`/api/spells/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      openDropdown(results);
    }, 200);
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdown.classList.contains("open")) return;
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) addSpell(item.dataset.id, item.dataset.name);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => { setTimeout(closeDropdown, 150); });
  input.addEventListener("focus", () => { if (input.value.trim().length >= 2) positionDropdown(); });

  dropdown.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".suggestion-item");
    if (item) { e.preventDefault(); addSpell(item.dataset.id, item.dataset.name); }
  });

  document.getElementById("spell-tags").addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-item-remove");
    if (btn) removeSpell(btn.dataset.id);
  });

  // Clicking the wrapper focuses the input
  document.getElementById("spell-tag-wrap").addEventListener("click", (e) => {
    if (!e.target.closest(".tag-item-remove")) input.focus();
  });

  window.addEventListener("resize", () => { if (dropdown.classList.contains("open")) positionDropdown(); });
  window.addEventListener("scroll", closeDropdown, { passive: true });
}

// --- Zone search ---
function setupZoneSearch() {
  const input = document.getElementById("zone-search-input");
  const dropdown = document.getElementById("zone-suggestions");
  let activeIndex = -1;

  function positionDropdown() {
    const wrap = document.getElementById("zone-tag-wrap").getBoundingClientRect();
    dropdown.style.left = `${wrap.left}px`;
    dropdown.style.width = `${wrap.width}px`;
    dropdown.style.top = `${wrap.bottom + 4}px`;
  }

  function openDropdown(items) {
    activeIndex = -1;
    if (!items.length) {
      dropdown.innerHTML = '<div class="suggestion-empty">No matching zones</div>';
    } else {
      dropdown.innerHTML = items
        .map((z) => `<div class="suggestion-item" role="option" data-id="${z.id}" data-label="${z.label}">${z.label}</div>`)
        .join("");
    }
    positionDropdown();
    dropdown.classList.add("open");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    activeIndex = -1;
  }

  function addZone(id, label) {
    if (specificZones.some((z) => z.id === id)) return;
    specificZones.push({ id, label });
    renderZoneTags();
    saveState();
    replan(300);
    input.value = "";
    closeDropdown();
    input.focus();
  }

  function removeZone(id) {
    specificZones = specificZones.filter((z) => z.id !== id);
    renderZoneTags();
    saveState();
    replan(300);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) { closeDropdown(); return; }
    const matches = zones.filter((z) => z.label.toLowerCase().includes(q)).slice(0, 12);
    openDropdown(matches);
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdown.classList.contains("open")) return;
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) addZone(item.dataset.id, item.dataset.label);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => { setTimeout(closeDropdown, 150); });
  input.addEventListener("focus", () => { if (input.value.trim().length >= 1) positionDropdown(); });

  dropdown.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".suggestion-item");
    if (item) { e.preventDefault(); addZone(item.dataset.id, item.dataset.label); }
  });

  document.getElementById("zone-tags").addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-item-remove");
    if (btn) removeZone(btn.dataset.id);
  });

  document.getElementById("zone-tag-wrap").addEventListener("click", (e) => {
    if (!e.target.closest(".tag-item-remove")) input.focus();
  });

  window.addEventListener("resize", () => { if (dropdown.classList.contains("open")) positionDropdown(); });
}

// --- Planner ---
function setupPlanner() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input"]) {
    document.getElementById(id).addEventListener("change", () => replan(300));
  }
  document.getElementById("level-min").addEventListener("input", () => replan(1000));
  document.getElementById("level-max").addEventListener("input", () => replan(1000));

  const results = document.getElementById("results");
  results.addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-spell-id]");
    if (!cb) return;
    setSpellOwned(cb.dataset.spellId, cb.checked);
    renderRankings(lastRankings, lastLevelRange);
  });
  results.addEventListener("click", (e) => {
    if (e.target.matches("#toggle-owned-btn")) {
      showAllSpells = !showAllSpells;
      renderRankings(lastRankings, lastLevelRange);
    }
    if (e.target.matches("#clear-owned-btn")) {
      clearOwnedSpells();
      renderRankings(lastRankings, lastLevelRange);
    }
  });
}

async function runPlan() {
  const classes = selectedClasses;
  const race = document.getElementById("race-select").value;
  const primaryClass = document.getElementById("primary-class-select").value;
  const deity = document.getElementById("deity-select").value;
  const from = document.getElementById("zone-input").value;
  const { min: levelMin, max: levelMax } = getSelectedLevelRange();

  if (!from) {
    document.getElementById("results").innerHTML =
      '<div class="no-results">Select your current zone.</div>';
    return;
  }

  document.getElementById("results").innerHTML = '<div class="loading">Searching Norrath...</div>';

  const params = new URLSearchParams({ class: classes.join(","), levelMin: String(levelMin), levelMax: String(levelMax), from, race, primaryClass, deity });
  if (specificSpells.length) params.set("spells", specificSpells.map((s) => s.id).join(","));
  if (specificZones.length) params.set("zones", specificZones.map((z) => z.id).join(","));
  const rankings = await fetch(`/api/plan?${params}`).then((r) => r.json());

  if (rankings.error) {
    document.getElementById("results").innerHTML = `<div class="no-results">${rankings.error}</div>`;
    return;
  }

  lastRankings = rankings;
  lastLevelRange = { min: levelMin, max: levelMax };
  renderRankings(rankings, lastLevelRange);
}

function renderRankings(rankings, { min: levelMin, max: levelMax }) {
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
    <span>${totalSpells} spell(s) across ${accessible.length} zone(s) for ${levelMin === levelMax ? `level ${levelMin}` : `levels ${levelMin}–${levelMax}`}${ownedLabel}${warnings.length ? " — " + warnings.join(", ") : ""}</span>
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
          <a class="spell-chip" data-spell-id="${s.id}" href="https://eqlwiki.com/${encodeURIComponent(s.name.replace(/ /g, "_"))}" target="_blank" rel="noopener">${s.name}${s.classes.map((c) => `<span class="lvl">${c.cls.charAt(0).toUpperCase() + c.cls.slice(1)} L${c.level}</span>`).join("")}</a>
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
        ${r.faction !== "safe" ? `<span class="faction-badge ${r.faction}">${FACTION_LABELS[r.faction] || r.faction}</span>` : ""}
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
