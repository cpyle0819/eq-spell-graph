// --- State ---
let zones = [];
let availableClasses = [];
let availableSpellLines = []; // { id, label }[]
let lastRankings = null;
let lastLevelRange = { min: 1, max: 1 };
let showAllSpells = false;
let selectedClasses = []; // string[]
let selectedSpellLines = []; // { id, label }[]
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
  if (spell.spellLine) stats.push({ text: spell.spellLine });

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

// --- Init ---

// Builds the sidebar via the shared SidebarPanel component (components.js),
// which both this page and Class Browser use for their filter sidebar. Each
// field's own control markup (selects, tag-wraps, the range-picker) is
// still built here as raw HTML — every other function in this file that
// does document.getElementById(...) for these ids depends on them.
function renderSidebar() {
  const html = SidebarPanel({
    fields: [
      { raw: sectionHeader("Faction", "faction", "Race, Primary Class, and Deity only affect vendor faction standing — they don't filter which spells show up below.") },
      { label: "Race", section: "faction", html: `<select id="race-select">
        <option value="barbarian">Barbarian</option>
        <option value="dark elf">Dark Elf</option>
        <option value="dwarf">Dwarf</option>
        <option value="erudite">Erudite</option>
        <option value="gnome">Gnome</option>
        <option value="half elf">Half Elf</option>
        <option value="halfling">Halfling</option>
        <option value="high elf">High Elf</option>
        <option value="human">Human</option>
        <option value="iksar">Iksar</option>
        <option value="ogre">Ogre</option>
        <option value="troll">Troll</option>
        <option value="wood elf">Wood Elf</option>
        <option value="any" selected>Any (ignore faction)</option>
      </select>` },
      { label: "Primary Class", section: "faction", html: `<select id="primary-class-select">
        <option value="bard">Bard</option>
        <option value="beastlord">Beastlord</option>
        <option value="cleric">Cleric</option>
        <option value="druid">Druid</option>
        <option value="enchanter">Enchanter</option>
        <option value="magician">Magician</option>
        <option value="monk">Monk</option>
        <option value="necromancer">Necromancer</option>
        <option value="paladin">Paladin</option>
        <option value="ranger">Ranger</option>
        <option value="rogue">Rogue</option>
        <option value="shadow knight">Shadow Knight</option>
        <option value="shaman">Shaman</option>
        <option value="warrior">Warrior</option>
        <option value="wizard">Wizard</option>
        <option value="any" selected>Any (ignore faction)</option>
      </select>` },
      { label: "Deity", section: "faction", html: `<select id="deity-select">
        <option value="agnostic">Agnostic</option>
        <option value="bertoxxulous">Bertoxxulous</option>
        <option value="brell serilis">Brell Serilis</option>
        <option value="bristlebane">Bristlebane</option>
        <option value="cazic-thule">Cazic-Thule</option>
        <option value="erollisi marr">Erollisi Marr</option>
        <option value="innoruuk">Innoruuk</option>
        <option value="karana">Karana</option>
        <option value="mithaniel marr">Mithaniel Marr</option>
        <option value="prexus">Prexus</option>
        <option value="quellious">Quellious</option>
        <option value="rallos zek">Rallos Zek</option>
        <option value="rodcet nife">Rodcet Nife</option>
        <option value="solusek ro">Solusek Ro</option>
        <option value="the tribunal">The Tribunal</option>
        <option value="tunare">Tunare</option>
        <option value="veeshan">Veeshan</option>
        <option value="any" selected>Any (ignore faction)</option>
      </select>` },
      { raw: '<div class="control-sep" aria-hidden="true"></div>' },
      { raw: sectionHeader("Spells", "spells") },
      { label: "Spell Class", section: "spells", html: tagWrapHtml("class") },
      { label: "Spell Line", section: "spells", html: tagWrapHtml("spellline") },
      { label: "Specific Spells", section: "spells", html: tagWrapHtml("spell") },
      { raw: '<div class="control-sep" aria-hidden="true"></div>' },
      { raw: sectionHeader("Level", "level") },
      { label: "Levels", section: "level", html: `<div class="range-picker">
        <input type="range" id="level-min" min="1" max="50" value="1">
        <span class="range-display" id="range-display">1 – 10</span>
        <input type="range" id="level-max" min="1" max="50" value="10">
      </div>` },
      { raw: '<div class="control-sep" aria-hidden="true"></div>' },
      { raw: sectionHeader("Location", "location") },
      { label: "Specific Zones", section: "location", html: tagWrapHtml("zone") },
      { label: "Current Zone", section: "location", html: `<select id="zone-input"><option value="">-- Select Zone --</option></select>` },
      { raw: '<div class="control-sep" aria-hidden="true"></div>' },
    ],
    actions: [`<button type="button" class="text-action" id="reset-filters-btn">Reset filters</button>`],
  });
  document.getElementById("controls-panel-slot").outerHTML = html;
}

// Only Spells starts open — picking which spells to look for is the page's
// main job, everything else (Faction, Level, Location) is a secondary
// narrowing/config concern you dip into as needed. Applied by
// applyDefaults() — for a first-time visitor that's every section's only
// assignment; for Reset filters (which also calls applyDefaults()) it's
// what makes the collapse state, not just the filter values, fully reset
// too, rather than leaving whatever the user had toggled untouched.
const ALL_SECTIONS = ["faction", "spells", "level", "location"];
const DEFAULT_COLLAPSED_SECTIONS = ["faction", "level", "location"];

function setSectionCollapsed(section, collapsed) {
  const header = document.querySelector(`.field-group-label[data-section="${section}"]`);
  if (!header) return;
  header.setAttribute("aria-expanded", String(!collapsed));
  document.querySelectorAll(`.field[data-section="${section}"]`).forEach((el) => { el.hidden = collapsed; });
}

function toggleSection(section) {
  const header = document.querySelector(`.field-group-label[data-section="${section}"]`);
  setSectionCollapsed(section, header?.getAttribute("aria-expanded") === "true");
  saveState();
}

function setupCollapsibleSections() {
  document.querySelectorAll(".field-group-label.collapsible").forEach((header) => {
    header.addEventListener("click", () => toggleSection(header.dataset.section));
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection(header.dataset.section); }
    });
  });
}

async function init() {
  document.getElementById("nav-links").innerHTML = [
    MacroButton({ label: "Route Finder", tag: "a", href: "route.html" }),
    MacroButton({ label: "Class Browser", tag: "a", href: "class-browser.html" }),
  ].join("");
  renderSidebar();
  setupCollapsibleSections();
  [zones, availableClasses, availableSpellLines] = await Promise.all([
    fetch("api/zones").then((r) => r.json()),
    fetch("api/classes").then((r) => r.json()),
    fetch("api/spell-lines").then((r) => r.json()),
  ]);
  populateZoneList();
  setupLevelRange();
  setupPlanner();
  setupClassSearch();
  setupSpellLineSearch();
  setupSpellSearch();
  setupZoneSearch();
  const hadState = restoreState();
  if (!hadState) applyDefaults();
  consumePinnedSpellFromUrl();
  setupAutoSave();
  setupTooltip();
  document.getElementById("reset-filters-btn").addEventListener("click", resetFilters);
  runPlan();
}

// Restores every filter to its out-of-the-box default (same values the HTML
// selects/inputs ship with) rather than just blanking them — "Any/Any/Any
// faction, levels 1-10" is a real usable starting point, an empty form
// isn't. Doesn't touch owned-spell marks; that's a separate concern with
// its own "Clear owned" action in the status panel.
function resetFilters() {
  document.getElementById("race-select").value = "any";
  document.getElementById("primary-class-select").value = "any";
  document.getElementById("deity-select").value = "any";
  document.getElementById("level-min").value = 1;
  document.getElementById("level-max").value = 10;
  specificSpells = [];
  specificZones = [];
  selectedSpellLines = [];
  applyDefaults(); // resets selectedClasses to ["shaman"], zone to Qeynos, refreshes the level display
  renderSpellTags();
  renderZoneTags();
  renderSpellLineTags();
  saveState();
  runPlan();
}

// --- Persisted state ---
function getState() {
  return {
    race: document.getElementById("race-select").value,
    primaryClass: document.getElementById("primary-class-select").value,
    deity: document.getElementById("deity-select").value,
    classes: selectedClasses,
    spellLines: selectedSpellLines,
    zone: document.getElementById("zone-input").value,
    levelMin: document.getElementById("level-min").value,
    levelMax: document.getElementById("level-max").value,
    specificSpells,
    specificZones,
    collapsedSections: [...document.querySelectorAll(".field-group-label.collapsible")]
      .filter((h) => h.getAttribute("aria-expanded") === "false")
      .map((h) => h.dataset.section),
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
    if (Array.isArray(s.spellLines) && s.spellLines.length) {
      selectedSpellLines = s.spellLines;
      renderSpellLineTags();
    }
    if (s.zone) document.getElementById("zone-input").value = s.zone;
    if (s.levelMin) document.getElementById("level-min").value = s.levelMin;
    if (s.levelMax) {
      document.getElementById("level-max").value = s.levelMax;
      updateLevelRangeDisplay();
    }
    if (Array.isArray(s.specificSpells) && s.specificSpells.length) {
      specificSpells = s.specificSpells;
      renderSpellTags();
    }
    if (Array.isArray(s.specificZones) && s.specificZones.length) {
      specificZones = s.specificZones;
      renderZoneTags();
    }
    if (Array.isArray(s.collapsedSections)) {
      s.collapsedSections.forEach((section) => setSectionCollapsed(section, true));
    }
    return true;
  } catch { return false; }
}

// Consumes a "Find in Spell Finder" link in from the Class Browser's merged
// Spells tab: ?pinSpell=<id>&pinName=<name>&levelMin=&levelMax=&classes=&race=any&deity=any
// Runs after restoreState() — that call fully replaces specificSpells (and
// the other fields below) from localStorage, so applying the URL first would
// just get clobbered.
//
// rankZones() bypasses its own class/level filters entirely for a pinned
// spell (see DECISIONS.md), so levelMin/levelMax/classes aren't load-bearing
// for the spell actually showing up — they're here so the planner's displayed
// range and Shopping For chips make sense for what you just clicked, instead
// of showing a leftover range/class from whatever you last had open here.
function consumePinnedSpellFromUrl() {
  const params = new URLSearchParams(location.search);
  const id = params.get("pinSpell");
  if (!id) return;
  const name = params.get("pinName") || id;
  if (!specificSpells.some((s) => s.id === id)) {
    specificSpells.push({ id, name });
    renderSpellTags();
  }

  const levelMin = params.get("levelMin");
  const levelMax = params.get("levelMax");
  if (levelMin) document.getElementById("level-min").value = levelMin;
  if (levelMax) document.getElementById("level-max").value = levelMax;
  if (levelMin || levelMax) updateLevelRangeDisplay();

  const classes = params.get("classes");
  if (classes) {
    selectedClasses = classes.split(",").filter(Boolean);
    renderClassTags();
  }

  const race = params.get("race");
  if (race) document.getElementById("race-select").value = race;

  const deity = params.get("deity");
  if (deity) document.getElementById("deity-select").value = deity;

  saveState();
  history.replaceState(null, "", location.pathname);
}

function applyDefaults() {
  selectedClasses = ["shaman"];
  renderClassTags();
  const zoneSelect = document.getElementById("zone-input");
  const qeynos = [...zoneSelect.options].find((o) => o.value === "South Qeynos" || o.value === "North Qeynos" || o.value === "Qeynos");
  if (qeynos) zoneSelect.value = qeynos.value;
  else if (zoneSelect.options.length > 1) zoneSelect.selectedIndex = 1;
  updateLevelRangeDisplay();
  ALL_SECTIONS.forEach((section) => setSectionCollapsed(section, DEFAULT_COLLAPSED_SECTIONS.includes(section)));
}

function setupAutoSave() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input", "level-min", "level-max"]) {
    const el = document.getElementById(id);
    el?.addEventListener("change", saveState);
    el?.addEventListener("input", saveState);
  }
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

// --- Spell Line filter ---
// Uses the shared setupTagInput helper (components.js) for the
// add/remove/dropdown wiring, rather than duplicating it inline.
let spellLineTagInput;

function renderSpellLineTags() {
  spellLineTagInput?.renderTags();
}

function setupSpellLineSearch() {
  spellLineTagInput = setupTagInput({
    wrapId: "spellline-tag-wrap",
    tagsId: "spellline-tags",
    inputId: "spellline-search-input",
    dropdownId: "spellline-suggestions",
    getSelected: () => selectedSpellLines,
    addItem: (item) => selectedSpellLines.push(item),
    removeItem: (id) => { selectedSpellLines = selectedSpellLines.filter((l) => l.id !== id); },
    getMatches: (q) => {
      const lower = q.toLowerCase();
      const selectedIds = new Set(selectedSpellLines.map((l) => l.id));
      return availableSpellLines.filter((l) => !selectedIds.has(l.id) && l.label.toLowerCase().includes(lower));
    },
    itemId: (l) => l.id,
    itemLabel: (l) => l.label,
    emptyMessage: "No matching spell lines",
    onChange: () => { saveState(); replan(300); },
  });
}

// --- Level range ---
let updateLevelRangeDisplay = () => {};

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
  updateLevelRangeDisplay = updateDisplay;
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
      const results = await fetch(`api/spells/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
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
  // Delegated from #planner, not #results — the toggle/clear actions live
  // in #status-panel, a sibling of #results, not a descendant of it.
  document.getElementById("planner").addEventListener("click", (e) => {
    if (e.target.matches(".toggle-owned-btn")) {
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
    document.getElementById("status-panel").innerHTML = "";
    return;
  }

  document.getElementById("results").innerHTML = '<div class="loading">Searching Norrath...</div>';

  const params = new URLSearchParams({ class: classes.join(","), levelMin: String(levelMin), levelMax: String(levelMax), from, race, primaryClass, deity });
  if (specificSpells.length) params.set("spells", specificSpells.map((s) => s.id).join(","));
  if (specificZones.length) params.set("zones", specificZones.map((z) => z.id).join(","));
  if (selectedSpellLines.length) params.set("lines", selectedSpellLines.map((l) => l.id).join(","));
  const rankings = await fetch(`api/plan?${params}`).then((r) => r.json());

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
  const statusEl = document.getElementById("status-panel");
  if (!rankings.length) {
    el.innerHTML = '<div class="no-results">No vendors found for those levels.</div>';
    statusEl.innerHTML = "";
    return;
  }

  const owned = getOwnedSpells();
  // "any" only neutralizes its own dimension server-side (a real KOS from
  // race, say, still shows even with deity set to Any) — so faction/badge
  // rendering below needs no special-casing at all. This is purely an
  // informational aside about which dimension(s) aren't being checked.
  const raceIgnored = rankings[0]?.raceIgnored === true;
  const classIgnored = rankings[0]?.classIgnored === true;
  const deityIgnored = rankings[0]?.deityIgnored === true;
  const accessible = rankings.filter((r) => r.faction === "safe" || r.faction === "neutral");
  const wontSell = rankings.filter((r) => r.faction === "wont_sell");
  const kos = rankings.filter((r) => r.faction === "kos");
  const allSpellIds = new Set(accessible.flatMap((r) => r.spells.map((s) => s.id)));
  const totalSpells = allSpellIds.size;
  const ownedCount = [...allSpellIds].filter((id) => owned.has(id)).length;

  const warnings = [];
  const ignoredDims = [raceIgnored && "race", classIgnored && "class", deityIgnored && "deity"].filter(Boolean);
  if (ignoredDims.length) {
    const ignoredLabel = ignoredDims.length > 1
      ? `${ignoredDims.slice(0, -1).join(", ")} & ${ignoredDims[ignoredDims.length - 1]}`
      : ignoredDims[0];
    warnings.push(`<span style="color:var(--ink-muted);">${ignoredLabel} ignored</span>`);
  }
  if (wontSell.length) warnings.push(`<span style="color:#f59e0b;">${wontSell.length} zone(s) won't sell to you</span>`);
  if (kos.length) warnings.push(`<span style="color:#f87171;">${kos.length} zone(s) KOS</span>`);

  // Status panel: results metadata (counts/warnings, progress bar + owned
  // count, show/clear actions) — the empty-results "Show all" fallback
  // (renderRankings below) stays a plain .text-action link instead of a
  // MacroButton, since it sits inline in body text, not a dedicated
  // action row.
  const toggleLabel = showAllSpells ? "Show remaining" : "Show all";
  const toggleBtn = MacroButton({ label: toggleLabel, className: "toggle-owned-btn", square: true });
  const clearBtn = ownedCount > 0 ? MacroButton({ label: "Clear owned", id: "clear-owned-btn", square: true }) : "";
  const pct = totalSpells ? Math.round((ownedCount / totalSpells) * 100) : 0;
  statusEl.innerHTML = `
    <div class="status-meta">
      ${totalSpells} spell(s) across ${accessible.length} zone(s) for ${levelMin === levelMax ? `level ${levelMin}` : `levels ${levelMin}–${levelMax}`}
      ${warnings.length ? `<div class="status-warnings">${warnings.join(" · ")}</div>` : ""}
    </div>
    <div class="status-summary">
      <span class="mana-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${totalSpells}" aria-valuenow="${ownedCount}" aria-label="Spells owned: ${ownedCount} of ${totalSpells}" title="Spells owned: ${ownedCount} of ${totalSpells}"><span class="mana-fill" style="width:${pct}%"></span></span>
      <span class="status-owned-count">${ownedCount} / ${totalSpells} owned</span>
    </div>
    <div class="status-actions">
      ${toggleBtn}
      ${clearBtn}
    </div>
  `;

  el.innerHTML = "";

  // EQ /consider verbiage; the title attribute carries the practical meaning
  const FACTION_LABELS = { safe: "amiable", neutral: "indifferent", wont_sell: "dubious", kos: "scowls" };
  const FACTION_TITLES = {
    safe: "Regards you as an ally — sells at normal prices",
    neutral: "Regards you indifferently — sells at normal prices",
    wont_sell: "Looks upon you dubiously — merchants won't sell to you",
    kos: "Scowls at you, ready to attack — kill on sight",
  };
  const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
  const DIMENSION_LABELS = { race: "race", class: "class", deity: "deity" };
  // Same text for the badge and the LED dot (zone-name's ::before — a
  // pseudo-element can't carry its own title, so zone-name's covers it) —
  // one tooltip, two hover targets. Appends *why* only for wont_sell/kos,
  // naming whichever dimension(s) actually caused it (factionReasons is
  // empty for safe/neutral, since nothing there needs explaining).
  function factionTooltip(r) {
    const base = FACTION_TITLES[r.faction] || "";
    if (!r.factionReasons?.length) return base;
    const reasons = r.factionReasons
      .map((fr) => `your ${titleCase(fr.value)} ${DIMENSION_LABELS[fr.dimension]}`)
      .join(" and ");
    return `${base} (${reasons} ${r.factionReasons.length > 1 ? "are" : "is"} disliked here)`;
  }

  let renderedZones = 0;
  for (const r of rankings) {
    const visibleSpells = showAllSpells ? r.spells : r.spells.filter((s) => !owned.has(s.id));
    if (!showAllSpells && visibleSpells.length === 0) continue;
    renderedZones++;

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

    // Plain stone text, not a parchment scroll — the spell list is this
    // page's focus content (see .spell-scroll below), so the route is
    // wayfinding detail, not the thing to read closely.
    const routeHtml = r.route && r.route.length > 1
      ? `<div class="zone-route">
          <span class="route-label">Route</span>
          <div class="route-steps">${r.route.map((step, i) => {
            if (i === 0) return `<span class="route-zone">${step.name}</span>`;
            if (step.via === "boat") return `<span class="boat-sep" title="Boat crossing">⚓</span><span class="route-zone">${step.name}</span>`;
            if (step.via === "translocator") return `<span class="translocator-sep" title="Translocator (paid teleport)">✨</span><span class="route-zone">${step.name}</span>`;
            return `<span class="route-sep">›</span><span class="route-zone">${step.name}</span>`;
          }).join("")}</div>
        </div>`
      : "";

    const spellCount = visibleSpells.length;
    const ownedHere = r.spells.length - visibleSpells.length;
    const spellBadge = spellCount + (ownedHere > 0 && !showAllSpells ? ` <span style="color:#4ade80;font-size:10px;">(${ownedHere} owned)</span>` : "");

    const tooltip = factionTooltip(r);
    card.innerHTML = `
      <div class="zone-card-header">
        <span class="zone-name" title="${tooltip}">${r.zoneName}</span>
        ${r.faction !== "safe" ? `<span class="faction-badge ${r.faction}" title="${tooltip}">${FACTION_LABELS[r.faction] || r.faction}</span>` : ""}
        <span class="zone-badge">${spellBadge} spell${spellCount !== 1 ? "s" : ""}</span>
        <span class="zone-badge hops">${hopsText}</span>
      </div>
      ${routeHtml}
      <div class="spell-scroll">
        <div class="spell-vendor-list">${spellRows}</div>
      </div>
    `;
    el.appendChild(card);
  }

  // Every zone had a real spell in it, but every one of those spells is
  // marked owned — the header above still says "N spell(s) across M
  // zone(s)," so without this the results area just goes blank with no clue
  // why. Only reachable when !showAllSpells, since showAllSpells never
  // filters anything out of visibleSpells.
  if (renderedZones === 0) {
    const msg = document.createElement("div");
    msg.className = "no-results";
    msg.innerHTML = `All matching spells are marked owned. <button class="text-action toggle-owned-btn">Show all</button>`;
    el.appendChild(msg);
  }
}

init();
