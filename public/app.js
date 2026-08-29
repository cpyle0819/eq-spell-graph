// A module import fully executes before this module's own top-level code
// runs, guaranteeing every custom element below is registered before this
// file sets properties on one -- a property set on a not-yet-upgraded
// element becomes an instance property that silently shadows the class's
// own accessor once it *is* defined, so registration order here is load
// bearing, not just tidiness.
import "./components/index.js";
import { getOwnedSpells, setSpellOwned, clearOwnedSpells, lazyRenderList } from "./components.js";

// Matches src/graph.ts's own SPELL_TYPE. ANY_TYPE ("Any", src/graph.ts) is
// the type-select's other hardcoded option, spanning every item/container
// type at once -- every other option is a real classifyItemType() value,
// read live off /api/item-types.
const SPELL_TYPE = "Spell";

// --- State ---
let zones = [];
let availableClasses = [];
let availableSpellLines = []; // { id, label }[]
// /api/item-types -- SPELL_TYPE always first/present, the rest are
// whichever classifyItemType() values actually occur right now (decisions/
// "let types drive the filters").
let availableTypes = [SPELL_TYPE];
let selectedType = SPELL_TYPE;
let lastPayload = null;
let lastLevelRange = { min: 1, max: 1 };
let showAllSpells = false;
// Out-of-era zones are hidden from results by default (decisions/
// quest-era-flagging.md -- they aren't actually reachable in the game's
// current era yet), same convention as quests.js's own showOutOfEra. Purely
// a display filter over already-fetched data, so toggling it just
// re-renders -- no replan needed.
let showOutOfEra = false;
let selectedClasses = []; // string[] -- doubles as spell.class_levels' class facet (Type=Spell) and item.classes' facet (any other Type), same roster either way
let selectedSpellLines = []; // { id, label }[] -- Spells only
let specificSpells = []; // { id, name } -- Spells only
let specificItems = []; // { id, name } -- any non-Spells type
let specificZones = []; // { id, label }

let planDebounce;
function replan(delay = 300) { clearTimeout(planDebounce); planDebounce = setTimeout(runPlan, delay); }

// --- Detail tooltip ---
// status-panel's own spell checklist (public/components/status-panel.js)
// owns hover-to-show directly, scoped to its own shadow root -- a delegated
// listener here can't reliably read e.target/e.relatedTarget for elements
// retargeted across a shadow boundary. Scroll-to-hide has no such
// dependency, so it stays here.
function hideTooltip() {
  document.getElementById("detail-tooltip").hide();
}

function setupTooltip() {
  document.getElementById("results").addEventListener("scroll", hideTooltip, { passive: true });
}

// scrollbar-gutter: stable (index.html, issue #31) reserves the scrollbar's
// width unconditionally so cards don't jump when the list crosses the
// overflow threshold -- but that width isn't expressible as a CSS length,
// so index.html's #results > * rule reads it from this custom property to
// bleed back into the reserved strip instead of leaving it as a gap next to
// status-panel. Re-measured on resize since it tracks the real scrollbar
// width (OS/zoom-dependent), not a fixed guess.
function syncResultsGutterWidth() {
  const el = document.getElementById("results");
  el.style.setProperty("--gutter-w", `${el.offsetWidth - el.clientWidth}px`);
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
      <collapsible-section label="Shopping For" section="shopping">
        <field-row label="Type"><select id="type-select"></select></field-row>
        <field-row label="Class"><tag-input id="class-tag-input" aria-label="Class suggestions"></tag-input></field-row>
        <field-row label="Spell Line" id="spellline-row"><tag-input id="spellline-tag-input" aria-label="Spell line suggestions"></tag-input></field-row>
        <field-row label="Specific Spells" id="specific-spells-row"><tag-input id="spell-tag-input" aria-label="Spell suggestions"></tag-input></field-row>
        <field-row label="Specific Items" id="specific-items-row" hidden><tag-input id="item-tag-input" aria-label="Item suggestions"></tag-input></field-row>
        <field-row label="Levels" id="level-row"><range-picker id="level-range" min="1" max="50" value-min="1" value-max="10"></range-picker></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <collapsible-section label="Location" section="location">
        <field-row label="Zone"><tag-input id="zone-tag-input" aria-label="Zone suggestions"></tag-input></field-row>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <collapsible-section label="Advanced" section="advanced">
        <collapsible-section label="Faction" static section-title="Race, Primary Class, and Deity only affect vendor faction standing — they don't filter which goods show up below.">
          <field-row label="Race"><select id="race-select">
            <option value="barbarian">Barbarian</option>
            <option value="dark elf">Dark Elf</option>
            <option value="dwarf">Dwarf</option>
            <option value="erudite">Erudite</option>
            <option value="froglok">Froglok</option>
            <option value="gnome">Gnome</option>
            <option value="half elf">Half Elf</option>
            <option value="halfling">Halfling</option>
            <option value="high elf">High Elf</option>
            <option value="human">Human</option>
            <option value="iksar">Iksar</option>
            <option value="kerran">Kerran</option>
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
        <collapsible-section label="Location" static>
          <field-row label="Current Zone"><select id="zone-input"><option value="">-- Select Zone --</option></select></field-row>
          <field-row label="Route"><toggle-checkbox id="include-ports" label="Include Ports" title="Let a Wizard- or Druid-only teleport spell (e.g. Alter Plane: Sky, Circle of Toxxulia) count as a 1-hop route"></toggle-checkbox></field-row>
          <field-row label="Era"><toggle-checkbox id="show-out-of-era" label="Show Out of Era"></toggle-checkbox></field-row>
        </collapsible-section>
      </collapsible-section>
      <div class="control-sep" aria-hidden="true"></div>
      <button slot="actions" type="button" class="text-action" id="reset-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

// Only Shopping For starts open — picking what to shop for is the page's
// main job, everything else (Location, Advanced) is a secondary
// narrowing/config concern you dip into as needed (decisions/
// spell-finder-sidebar-four-sections.md). Levels lives as the last field
// inside Shopping For itself now, not its own section -- it's a Spells-only
// narrowing facet exactly like Spell Line/Specific Spells beside it (hidden
// together via updateShoppingForVisibility()'s [hidden] toggles), so it
// doesn't need a dedicated collapsible wrapper the way a genuinely separate
// concern (Location, Advanced) does. Location's top-level "Zone" (specific
// zones to search within) is split from Advanced's static "Location"
// sub-group (routing origin + route/era travel options) -- they answer
// different questions, narrowing results vs. where/how you're traveling
// from, so they don't share one control despite the same real-world "zone"
// concept. Faction and that Location sub-group (Current Zone, Route, Era)
// live inside Advanced as static (non-collapsible) groups, not top-level
// sections of their own -- their defaults (Any faction, ports off,
// out-of-era hidden, no zone selected) already cover the common case, so
// Advanced collapsed is the useful starting point rather than exposing
// them up front. Applied by applyDefaults() — for a first-time visitor
// that's every section's only assignment; for Reset filters (which also
// calls applyDefaults()) it's what makes the collapse state, not just the
// filter values, fully reset too, rather than leaving whatever the user
// had toggled untouched.
const ALL_SECTIONS = ["shopping", "location", "advanced"];
const DEFAULT_COLLAPSED_SECTIONS = ["location", "advanced"];

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

export async function init() {
  if (redirectFirstTimeVisitor()) return;
  renderSidebar();
  document.addEventListener("toggle", (e) => { if (e.target.tagName === "COLLAPSIBLE-SECTION") saveState(); });
  [zones, availableClasses, availableSpellLines, availableTypes] = await Promise.all([
    fetch("api/zones").then((r) => r.json()),
    fetch("api/classes").then((r) => r.json()),
    fetch("api/spell-lines").then((r) => r.json()),
    fetch("api/item-types").then((r) => r.json()),
  ]);
  populateZoneList();
  setupPlanner();
  setupClassSearch();
  setupSpellLineSearch();
  setupSpellSearch();
  setupItemSearch();
  setupZoneSearch();
  setupTypeFilter();
  const hadState = restoreState();
  if (!hadState) applyDefaults();
  consumePinnedSpellFromUrl();
  setupAutoSave();
  setupTooltip();
  syncResultsGutterWidth();
  window.addEventListener("resize", syncResultsGutterWidth);
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
  specificItems = [];
  specificZones = [];
  selectedSpellLines = [];
  showOutOfEra = false;
  document.getElementById("show-out-of-era").checked = false;
  document.getElementById("include-ports").checked = false;
  selectedType = SPELL_TYPE;
  document.getElementById("type-select").value = SPELL_TYPE;
  updateShoppingForVisibility();
  applyDefaults(); // resets selectedClasses to ["shaman"], zone to Qeynos, refreshes the level display
  renderSpellTags();
  renderItemTags();
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
    ports: document.getElementById("include-ports").checked,
    levelMin: levelRange.valueMin,
    levelMax: levelRange.valueMax,
    specificSpells,
    specificItems,
    specificZones,
    type: selectedType,
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
    if (s.ports) document.getElementById("include-ports").checked = true;
    const levelRange = document.getElementById("level-range");
    if (s.levelMin) levelRange.valueMin = s.levelMin;
    if (s.levelMax) levelRange.valueMax = s.levelMax;
    if (Array.isArray(s.specificSpells) && s.specificSpells.length) {
      specificSpells = s.specificSpells;
      renderSpellTags();
    }
    if (Array.isArray(s.specificItems) && s.specificItems.length) {
      specificItems = s.specificItems;
      renderItemTags();
    }
    if (Array.isArray(s.specificZones) && s.specificZones.length) {
      specificZones = s.specificZones;
      renderZoneTags();
    }
    if (s.type && availableTypes.includes(s.type)) {
      selectedType = s.type;
      document.getElementById("type-select").value = s.type;
    }
    updateShoppingForVisibility();
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
// rankGoods() bypasses its own class/level filters entirely for a pinned
// spell (see decisions/), so levelMin/levelMax/classes aren't load-bearing
// for the spell actually showing up — they're here so the planner's displayed
// range and Shopping For chips make sense for what you just clicked, instead
// of showing a leftover range/class from whatever you last had open here.
function consumePinnedSpellFromUrl() {
  const params = new URLSearchParams(location.search);
  const id = params.get("pinSpell");
  if (!id) return;

  // A pinned spell is inherently a Spells-type deep link -- if the saved
  // state (restored just before this runs) had left Type on something
  // else, force it back so the pinned spell actually shows up in results
  // instead of silently vanishing under an item-type plan.
  selectedType = SPELL_TYPE;
  document.getElementById("type-select").value = SPELL_TYPE;
  updateShoppingForVisibility();

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
  // Left on its "-- Select Zone --" placeholder rather than defaulting to
  // Qeynos -- Current Zone lives in Advanced now, and results should work
  // (ranked by goods count, no route/hops badge) before a player has picked
  // a zone at all rather than silently assuming one.
  document.getElementById("zone-input").value = "";
  ALL_SECTIONS.forEach((section) => { const el = getSectionEl(section); if (el) el.collapsed = DEFAULT_COLLAPSED_SECTIONS.includes(section); });
}

function setupAutoSave() {
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input", "level-range", "include-ports"]) {
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

// --- Type filter ---
// Level (spells only -- no equivalent to spell.class_levels on an item),
// Spell Line, and Specific Spells all hide/show together based on Type;
// Specific Items is the exact inverse. A plain field-row [hidden] toggle
// (see field-row.js/collapsible-section.js's own [hidden] rules) rather
// than a second render pass, since nothing about the fields themselves
// changes between types.
function updateShoppingForVisibility() {
  const isSpells = selectedType === SPELL_TYPE;
  document.getElementById("level-row").hidden = !isSpells;
  document.getElementById("spellline-row").hidden = !isSpells;
  document.getElementById("specific-spells-row").hidden = !isSpells;
  document.getElementById("specific-items-row").hidden = isSpells;
}

function setupTypeFilter() {
  const select = document.getElementById("type-select");
  select.innerHTML = availableTypes.map((t) => `<option value="${t}">${t}</option>`).join("");
  select.value = selectedType;
  updateShoppingForVisibility();
  select.addEventListener("change", (e) => {
    selectedType = e.target.value;
    updateShoppingForVisibility();
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

// --- Specific item search (any non-Spells Type) ---
let itemTagInput;

function renderItemTags() {
  itemTagInput.selected = specificItems;
}

function setupItemSearch() {
  itemTagInput = document.getElementById("item-tag-input");
  itemTagInput.itemId = (it) => it.id;
  itemTagInput.itemLabel = (it) => it.name;
  itemTagInput.emptyMessage = "No matching items";
  itemTagInput.minQueryLength = 2;
  itemTagInput.debounceMs = 200;
  itemTagInput.reopenOnFocus = false;
  itemTagInput.closeOnScroll = true;
  // Scoped to the currently selected Type so suggestions only ever show
  // goods that type can actually match -- same "types drive the filters"
  // idea as the Type select's own option list.
  itemTagInput.getMatches = async (q) => {
    const type = selectedType === SPELL_TYPE ? "" : selectedType;
    const results = await fetch(`api/items/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`).then((r) => r.json());
    return results.map((r) => ({ id: r.id, name: r.label }));
  };
  itemTagInput.addEventListener("change", (e) => {
    specificItems = e.detail.selected;
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
  for (const id of ["race-select", "primary-class-select", "deity-select", "zone-input", "include-ports"]) {
    document.getElementById(id).addEventListener("change", () => replan(300));
  }
  // Level never changes which goods/offers are relevant (a class vendor
  // sells its class's whole spellbook at every level, decisions/
  // class-spell-vendor-model.md) -- only which of the already-fetched
  // goods the status panel's checklist currently shows. No replan, and
  // #results is never touched.
  document.getElementById("level-range").addEventListener("input", () => {
    lastLevelRange = getSelectedLevelRange();
    if (lastPayload) updateStatusPanel(lastPayload, lastLevelRange);
  });

  const planner = document.getElementById("planner");
  // Two independent owned checkboxes dispatch two differently-named composed
  // events, both handled the same way: status-panel (public/components/
  // status-panel.js) owns its own checklist checkboxes and dispatches
  // `spell-owned-change`; good-card (public/components/good-card.js) owns
  // its own per-result checkbox and dispatches `good-owned-change` (already
  // calling setSpellOwned() on itself before dispatching, so this listener
  // only needs to persist the status-panel one and refresh the status panel
  // either way). A delegated "change" listener here can't class/attribute-
  // match e.target once it's retargeted across either host's shadow
  // boundary, hence the composed events. Delegated from #planner, not
  // #results, since status-panel is a sibling of #results, not a
  // descendant of it. Owned state never changes which goods/offers show
  // either, so both only update the status panel.
  planner.addEventListener("spell-owned-change", (e) => {
    setSpellOwned(e.detail.spellId, e.detail.checked);
    updateStatusPanel(lastPayload, lastLevelRange);
  });
  planner.addEventListener("good-owned-change", () => {
    updateStatusPanel(lastPayload, lastLevelRange);
  });

  planner.addEventListener("toggle-owned", () => {
    showAllSpells = !showAllSpells;
    updateStatusPanel(lastPayload, lastLevelRange);
  });
  planner.addEventListener("clear-owned", () => {
    clearOwnedSpells();
    updateStatusPanel(lastPayload, lastLevelRange);
  });

  // Purely a display filter over already-fetched data (era/outOfEra is
  // already on every offer rankGoods() returns). Re-render, not replan,
  // same reasoning as quests.js's identical toggle.
  document.getElementById("show-out-of-era").addEventListener("change", (e) => {
    showOutOfEra = e.target.checked;
    renderRankings(lastPayload, lastLevelRange);
  });
}

async function runPlan() {
  const classes = selectedClasses;
  const race = document.getElementById("race-select").value;
  const primaryClass = document.getElementById("primary-class-select").value;
  const deity = document.getElementById("deity-select").value;
  const from = document.getElementById("zone-input").value;
  const { min: levelMin, max: levelMax } = getSelectedLevelRange();

  document.getElementById("results").innerHTML = '<div class="loading">Searching Norrath...</div>';

  // levelMin/levelMax aren't part of this request: level is a purely
  // client-side display filter over the returned goods (see
  // setupPlanner()'s level-range handler), not a ranking input.
  const params = new URLSearchParams({ class: classes.join(","), from, race, primaryClass, deity, type: selectedType });
  if (specificZones.length) params.set("zones", specificZones.map((z) => z.id).join(","));
  if (document.getElementById("include-ports").checked) params.set("ports", "1");
  if (selectedType === SPELL_TYPE) {
    if (specificSpells.length) params.set("spells", specificSpells.map((s) => s.id).join(","));
    if (selectedSpellLines.length) params.set("lines", selectedSpellLines.map((l) => l.id).join(","));
  } else if (specificItems.length) {
    params.set("items", specificItems.map((it) => it.id).join(","));
  }
  const payload = await fetch(`api/plan?${params}`).then((r) => r.json());

  if (payload.error) {
    document.getElementById("results").innerHTML = `<div class="no-results">${payload.error}</div>`;
    return;
  }

  lastPayload = payload;
  lastLevelRange = { min: levelMin, max: levelMax };
  renderRankings(payload, lastLevelRange);
}

// `payload` is /api/plan's raw response for every type, Spell included:
// { goods, raceIgnored?, classIgnored?, deityIgnored? } (src/graph.ts's
// rankGoods()) -- one entry per matching spell/item, each carrying every
// zone/vendor that actually sells it as its own `offers` array (possibly
// empty). renderGoods() (#results) and updateStatusPanel() (#status-panel)
// are two independent renders over the same payload: which goods/offers are
// relevant never depends on level or owned state (a class vendor's
// inventory is the whole class's spellbook regardless of level, decisions/
// class-spell-vendor-model.md), only on a fresh fetch or the out-of-era
// toggle, so a caller that only changes level or owned state calls
// updateStatusPanel() alone. renderRankings() runs both.
function renderRankings(payload, levelRange) {
  renderGoods(payload);
  updateStatusPanel(payload, levelRange);
}

function renderGoods(payload) {
  const el = document.getElementById("results");
  if (!payload.goods.length) {
    el.innerHTML = '<div class="no-results">No results found.</div>';
    return;
  }

  el.innerHTML = "";
  lazyRenderList(el, payload.goods, (g) => {
    const card = document.createElement("good-card");
    card.setData(g, { selectedClasses, showOutOfEra });
    return card;
  });
}

function updateStatusPanel(payload, { min: levelMin, max: levelMax }) {
  const statusEl = document.getElementById("status-panel");
  const goods = payload.goods;
  const isSpells = selectedType === SPELL_TYPE;

  if (!goods.length) {
    statusEl.data = null;
    return;
  }

  const owned = getOwnedSpells();
  // "any" only neutralizes its own dimension server-side (a real KOS from
  // race, say, still shows even with deity set to Any) — so faction/badge
  // rendering below needs no special-casing at all. This is purely an
  // informational aside about which dimension(s) aren't being checked.
  const raceIgnored = payload.raceIgnored === true;
  const classIgnored = payload.classIgnored === true;
  const deityIgnored = payload.deityIgnored === true;

  // Faction/era are properties of a zone (plus the current race/class/
  // deity), not of any one good -- every offer sharing a zoneId carries the
  // same faction/outOfEra, so one pass over every good's offers gives a
  // deduplicated zone -> status map, same "how many zones are in each
  // bucket" warnings the old zone-first view showed.
  const zoneStatus = new Map(); // zoneId -> { faction, outOfEra }
  for (const g of goods) for (const o of g.offers) zoneStatus.set(o.zoneId, { faction: o.faction, outOfEra: !!o.outOfEra });
  let accessibleZoneCount = 0, wontSellZoneCount = 0, kosZoneCount = 0, outOfEraZoneCount = 0;
  for (const { faction, outOfEra } of zoneStatus.values()) {
    if (outOfEra && !showOutOfEra) { outOfEraZoneCount++; continue; }
    if (faction === "safe" || faction === "neutral") accessibleZoneCount++;
    else if (faction === "wont_sell") wontSellZoneCount++;
    else if (faction === "kos") kosZoneCount++;
  }

  // A good counts as accessible once it has at least one era-visible offer
  // in a safe/neutral zone -- a drop/quest-only good with zero offers, or
  // one only reachable through a wont_sell/kos/hidden-out-of-era zone,
  // isn't currently obtainable and drops out of the totals/checklist below
  // (it still renders as its own card in the results list either way, just
  // without counting toward "how many can I actually buy right now").
  const accessibleGoods = goods.filter((g) => {
    const visible = showOutOfEra ? g.offers : g.offers.filter((o) => !o.outOfEra);
    return visible.some((o) => o.faction === "safe" || o.faction === "neutral");
  });

  // totalGoods/ownedCount for Spells: narrow each accessible spell's own
  // class/level pairs to the current level range -- a spell drops out
  // entirely once none of its pairs are in range, same as dropping a class
  // that didn't match Shopping For. Items have no owned concept, so
  // status-panel's mana-bar/toggle/clear UI only renders when ownedCount
  // isn't null/undefined.
  let totalGoods, ownedCount, spellChecklist;
  if (isSpells) {
    spellChecklist = accessibleGoods
      .map((g) => ({ id: g.id, name: g.name, description: g.description, classes: g.spellClasses.filter((c) => c.level >= levelMin && c.level <= levelMax) }))
      .filter((s) => s.classes.length > 0);
    totalGoods = spellChecklist.length;
    ownedCount = spellChecklist.filter((s) => owned.has(s.id)).length;
  } else {
    totalGoods = accessibleGoods.length;
    ownedCount = undefined;
  }

  const warnings = [];
  const ignoredDims = [raceIgnored && "race", classIgnored && "class", deityIgnored && "deity"].filter(Boolean);
  if (ignoredDims.length) {
    const ignoredLabel = ignoredDims.length > 1
      ? `${ignoredDims.slice(0, -1).join(", ")} & ${ignoredDims[ignoredDims.length - 1]}`
      : ignoredDims[0];
    warnings.push(`<span style="color:var(--ink-muted);">${ignoredLabel} ignored</span>`);
  }
  if (wontSellZoneCount) warnings.push(`<span style="color:#f59e0b;">${wontSellZoneCount} zone(s) won't sell to you</span>`);
  if (kosZoneCount) warnings.push(`<span style="color:#f87171;">${kosZoneCount} zone(s) KOS</span>`);
  if (outOfEraZoneCount) warnings.push(`<span style="color:var(--ink-muted);">${outOfEraZoneCount} out-of-era zone(s) hidden</span>`);

  const levelText = isSpells ? (levelMin === levelMax ? `level ${levelMin}` : `levels ${levelMin}–${levelMax}`) : null;

  // status-panel (public/components/status-panel.js) owns the meta text,
  // warnings, progress bar, toggle/clear buttons, and (Spells) the
  // checklist itself -- this just hands it the numbers and, for Spells,
  // the filtered spell checklist plus the live owned Set.
  statusEl.data = {
    totalGoods, goodsLabel: isSpells ? "spell" : "item", accessibleCount: accessibleZoneCount,
    levelText, warnings, ownedCount, showAllSpells,
    ...(isSpells ? { spells: spellChecklist, owned } : {}),
  };
}
