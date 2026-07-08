// A module import fully executes before this module's own top-level code
// runs, guaranteeing every custom element below is registered before this
// file sets properties on one -- a property set on a not-yet-upgraded
// element becomes an instance property that silently shadows the class's
// own accessor once it *is* defined, so registration order here is load
// bearing, not just tidiness.
import "./components/index.js";

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
  tooltip.show(spell, anchorEl);
}

function hideTooltip() {
  tooltip.hide();
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
// Separate from STATE_KEY (filter values) — this is purely "has this
// browser ever landed here before," so a first-time visitor who never
// touches a filter still counts as visited on their next load instead of
// being bounced to home.html forever.
const VISITED_KEY = "eq-visited";

// --- Init ---

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <collapsible-section label="Faction" section="faction" section-title="Race, Primary Class, and Deity only affect vendor faction standing — they don't filter which spells show up below.">
        <field-row label="Race"><select id="race-select">
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
        </select></field-row>
        <field-row label="Primary Class"><select id="primary-class-select">
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
        </select></field-row>
        <field-row label="Deity"><select id="deity-select">
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
        </select></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <collapsible-section label="Spells" section="spells">
        <field-row label="Spell Class"><tag-input id="class-tag-input" aria-label="Class suggestions"></tag-input></field-row>
        <field-row label="Spell Line"><tag-input id="spellline-tag-input" aria-label="Spell line suggestions"></tag-input></field-row>
        <field-row label="Specific Spells"><tag-input id="spell-tag-input" aria-label="Spell suggestions"></tag-input></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <collapsible-section label="Level" section="level">
        <field-row label="Levels"><range-picker id="level-range" min="1" max="50" value-min="1" value-max="10"></range-picker></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <collapsible-section label="Location" section="location">
        <field-row label="Specific Zones"><tag-input id="zone-tag-input" aria-label="Zone suggestions"></tag-input></field-row>
        <field-row label="Current Zone"><select id="zone-input"><option value="">-- Select Zone --</option></select></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <button slot="actions" type="button" class="text-action" id="reset-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
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

function getSectionEl(section) {
  return document.querySelector(`collapsible-section[section="${section}"]`);
}

// A completely fresh visitor lands on home.html instead of the planner —
// marked visited immediately (not "once they click through") so this is a
// one-shot redirect, not a loop if they come straight back. Skipped when
// the URL already carries query params (e.g. Class Browser's "Find in
// Spell Finder" pinSpell link, see consumePinnedSpellFromUrl()) — that's a
// deliberate, purposeful arrival with context to preserve, not a curious
// first-time visit to the bare root.
function redirectFirstTimeVisitor() {
  if (localStorage.getItem(VISITED_KEY) || location.search) return false;
  localStorage.setItem(VISITED_KEY, "1");
  location.replace("home.html");
  return true;
}

async function init() {
  if (redirectFirstTimeVisitor()) return;
  renderSidebar();
  document.addEventListener("toggle", (e) => { if (e.target.tagName === "COLLAPSIBLE-SECTION") saveState(); });
  [zones, availableClasses, availableSpellLines] = await Promise.all([
    fetch("api/zones").then((r) => r.json()),
    fetch("api/classes").then((r) => r.json()),
    fetch("api/spell-lines").then((r) => r.json()),
  ]);
  populateZoneList();
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
  document.getElementById("level-range").valueMin = 1;
  document.getElementById("level-range").valueMax = 10;
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
  const levelRange = document.getElementById("level-range");
  return {
    race: document.getElementById("race-select").value,
    primaryClass: document.getElementById("primary-class-select").value,
    deity: document.getElementById("deity-select").value,
    classes: selectedClasses,
    spellLines: selectedSpellLines,
    zone: document.getElementById("zone-input").value,
    levelMin: levelRange.valueMin,
    levelMax: levelRange.valueMax,
    specificSpells,
    specificZones,
    collapsedSections: [...document.querySelectorAll("collapsible-section")]
      .filter((s) => s.collapsed)
      .map((s) => s.getAttribute("section")),
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
    const levelRange = document.getElementById("level-range");
    if (s.levelMin) levelRange.valueMin = s.levelMin;
    if (s.levelMax) levelRange.valueMax = s.levelMax;
    if (Array.isArray(s.specificSpells) && s.specificSpells.length) {
      specificSpells = s.specificSpells;
      renderSpellTags();
    }
    if (Array.isArray(s.specificZones) && s.specificZones.length) {
      specificZones = s.specificZones;
      renderZoneTags();
    }
    if (Array.isArray(s.collapsedSections)) {
      s.collapsedSections.forEach((section) => { const el = getSectionEl(section); if (el) el.collapsed = true; });
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
  const levelRange = document.getElementById("level-range");
  if (levelMin) levelRange.valueMin = levelMin;
  if (levelMax) levelRange.valueMax = levelMax;

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
  ALL_SECTIONS.forEach((section) => { const el = getSectionEl(section); if (el) el.collapsed = DEFAULT_COLLAPSED_SECTIONS.includes(section); });
}

function setupAutoSave() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input", "level-range"]) {
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

let classTagInput;

function renderClassTags() {
  classTagInput.selected = selectedClasses;
}

function setupClassSearch() {
  classTagInput = document.getElementById("class-tag-input");
  classTagInput.itemId = (c) => c;
  classTagInput.itemLabel = (c) => c.charAt(0).toUpperCase() + c.slice(1);
  classTagInput.emptyMessage = "No matching classes";
  classTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    return availableClasses.filter((c) => !selectedClasses.includes(c) && c.includes(lower));
  };
  classTagInput.addEventListener("change", (e) => {
    selectedClasses = e.detail.selected;
    saveState();
    replan(300);
  });
}

// --- Spell Line filter ---
let spellLineTagInput;

function renderSpellLineTags() {
  spellLineTagInput.selected = selectedSpellLines;
}

function setupSpellLineSearch() {
  spellLineTagInput = document.getElementById("spellline-tag-input");
  spellLineTagInput.itemId = (l) => l.id;
  spellLineTagInput.itemLabel = (l) => l.label;
  spellLineTagInput.emptyMessage = "No matching spell lines";
  spellLineTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    const selectedIds = new Set(selectedSpellLines.map((l) => l.id));
    return availableSpellLines.filter((l) => !selectedIds.has(l.id) && l.label.toLowerCase().includes(lower));
  };
  spellLineTagInput.addEventListener("change", (e) => {
    selectedSpellLines = e.detail.selected;
    saveState();
    replan(300);
  });
}

// --- Level range ---
function getSelectedLevelRange() {
  const levelRange = document.getElementById("level-range");
  const min = parseInt(levelRange.valueMin);
  const max = parseInt(levelRange.valueMax);
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

// --- Specific spell search ---
let spellTagInput;

function renderSpellTags() {
  spellTagInput.selected = specificSpells;
}

function setupSpellSearch() {
  spellTagInput = document.getElementById("spell-tag-input");
  spellTagInput.itemId = (s) => s.id;
  spellTagInput.itemLabel = (s) => s.name;
  spellTagInput.emptyMessage = "No matching spells";
  spellTagInput.minQueryLength = 2;
  spellTagInput.debounceMs = 200;
  spellTagInput.reopenOnFocus = false;
  spellTagInput.closeOnScroll = true;
  // api/spells/search returns {id, label}; specificSpells is persisted/held
  // as {id, name} (see restoreState/consumePinnedSpellFromUrl) -- normalize
  // here so itemLabel works uniformly over both already-selected and
  // freshly-fetched items.
  spellTagInput.getMatches = async (q) => {
    const results = await fetch(`api/spells/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
    return results.map((r) => ({ id: r.id, name: r.label }));
  };
  spellTagInput.addEventListener("change", (e) => {
    specificSpells = e.detail.selected;
    saveState();
    replan(300);
  });
}

// --- Zone search ---
let zoneTagInput;

function renderZoneTags() {
  zoneTagInput.selected = specificZones;
}

function setupZoneSearch() {
  zoneTagInput = document.getElementById("zone-tag-input");
  zoneTagInput.itemId = (z) => z.id;
  zoneTagInput.itemLabel = (z) => z.label;
  zoneTagInput.emptyMessage = "No matching zones";
  zoneTagInput.minQueryLength = 1;
  zoneTagInput.reopenOnFocus = false;
  zoneTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    return zones.filter((z) => z.label.toLowerCase().includes(lower)).slice(0, 12);
  };
  zoneTagInput.addEventListener("change", (e) => {
    specificZones = e.detail.selected;
    saveState();
    replan(300);
  });
}

// --- Planner ---
function setupPlanner() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input"]) {
    document.getElementById(id).addEventListener("change", () => replan(300));
  }
  document.getElementById("level-range").addEventListener("input", () => replan(1000));

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
  const toggleBtn = `<macro-button square class="toggle-owned-btn">${toggleLabel}</macro-button>`;
  const clearBtn = ownedCount > 0 ? `<macro-button square id="clear-owned-btn">Clear owned</macro-button>` : "";
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
    const hasRoute = r.route && r.route.length > 1;
    const routeHtml = hasRoute ? `<route-path variant="stone"></route-path>` : "";

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
    if (hasRoute) card.querySelector("route-path").steps = r.route;
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
