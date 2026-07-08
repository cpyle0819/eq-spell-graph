// Imported first so every custom element is registered before this file
// sets properties on one -- see app.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";

// Matches the planner's level-range slider bound (public/index.html
// #level-max max="50") — the actual data tops out at level 50 (see
// DECISIONS.md).
const MAX_SPELL_LEVEL = 50;
let availableClasses = [];

// Same tag-box idiom as the Spell Finder's Spell Class filter — no fixed
// cap on how many classes you can pick. An empty selection means "all
// classes," matching /api/*'s existing "no class filter = everything"
// convention (see DECISIONS.md); deliberately not pre-selecting a default
// class, since "no tags" and "any class" should be the same state, not two
// different starting points that happen to look similar.
let classTagInput;
let selectedClassNames = [];

// Spell Line filter — same additive (union, not intersection) behavior as
// the Spell Finder's: a spell only belongs to one line, so picking two
// lines broadens which spells show rather than narrowing to an impossible
// "both at once." Only meaningful for the Spells tab (no other category has
// a spell-line concept), so its field is hidden except when that tab is
// active, same as #level-field.
let spellLineTagInput;
let selectedSpellLineIds = []; // { id, label }[]
let availableSpellLines = [];

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <field-row label="Classes"><tag-input id="class-tag-input" aria-label="Class suggestions"></tag-input></field-row>
      <field-row id="category-field" label="Category" hidden><select id="category-select"></select></field-row>
      <field-row id="spellline-field" label="Spell Line" hidden><tag-input id="spellline-tag-input" aria-label="Spell line suggestions"></tag-input></field-row>
      <field-row id="level-field" label="Level" hidden><select id="level-select"><option value="all">All Levels</option></select></field-row>
      <field-row label="Search"><input type="text" id="browser-search" placeholder="Name..."></field-row>
      <button slot="actions" type="button" class="text-action" id="reset-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

async function init() {
  renderSidebar();
  [availableClasses, availableSpellLines] = await Promise.all([
    fetch("api/classes/abilities").then((r) => r.json()),
    fetch("api/spell-lines").then((r) => r.json()),
  ]);
  setupClassTagInput();
  setupSpellLineTagInput();
  populateLevelSelect();
  setupFilters();
  fetchAbilities();
}

function setupClassTagInput() {
  classTagInput = document.getElementById("class-tag-input");
  classTagInput.itemId = (c) => c;
  classTagInput.itemLabel = (c) => c.charAt(0).toUpperCase() + c.slice(1);
  classTagInput.emptyMessage = "No matching classes";
  classTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    return availableClasses.filter((c) => !selectedClassNames.includes(c) && c.includes(lower));
  };
  classTagInput.addEventListener("change", (e) => {
    selectedClassNames = e.detail.selected;
    fetchAbilities();
  });
}

function setupSpellLineTagInput() {
  spellLineTagInput = document.getElementById("spellline-tag-input");
  spellLineTagInput.itemId = (l) => l.id;
  spellLineTagInput.itemLabel = (l) => l.label;
  spellLineTagInput.emptyMessage = "No matching spell lines";
  spellLineTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    const selectedIds = new Set(selectedSpellLineIds.map((l) => l.id));
    return availableSpellLines.filter((l) => !selectedIds.has(l.id) && l.label.toLowerCase().includes(lower));
  };
  // client-side filter over already-fetched rawSpells, no refetch needed
  spellLineTagInput.addEventListener("change", (e) => {
    selectedSpellLineIds = e.detail.selected;
    render();
  });
}

function populateLevelSelect() {
  const sel = document.getElementById("level-select");
  for (let i = 1; i <= MAX_SPELL_LEVEL; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Level ${i}`;
    sel.appendChild(opt);
  }
}

function setupFilters() {
  document.getElementById("level-select").addEventListener("change", fetchAbilities);
  document.getElementById("category-select").addEventListener("change", (e) => {
    activeTab = e.target.value;
    render();
  });

  let searchDebounce;
  document.getElementById("browser-search").addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 150);
  });

  document.getElementById("reset-filters-btn").addEventListener("click", resetFilters);
}

function resetFilters() {
  selectedClassNames = [];
  classTagInput.selected = selectedClassNames;
  selectedSpellLineIds = [];
  spellLineTagInput.selected = selectedSpellLineIds;
  document.getElementById("level-select").value = "all";
  document.getElementById("browser-search").value = "";
  activeTab = null; // back to the first available category, not wherever the user was
  fetchAbilities();
}

// Bumped on every filter change so a slower, now-stale request can't
// overwrite the results of a filter change that happened after it.
let fetchToken = 0;

async function fetchAbilities() {
  const token = ++fetchToken;
  const classes = selectedClassNames;
  const resultsEl = document.getElementById("browser-results");

  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams({ class: classes.join(",") });
  const spellParams = new URLSearchParams({ class: classes.join(",") });
  const level = document.getElementById("level-select").value;
  if (level !== "all") spellParams.set("levels", level);

  const [{ stances, invocations }, aa, spells, abilities] = await Promise.all([
    fetch(`api/stances-invocations?${params}`).then((r) => r.json()),
    fetch(`api/aa?${params}`).then((r) => r.json()),
    fetch(`api/spells?${spellParams}`).then((r) => r.json()),
    fetch(`api/abilities?${params}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer filter change superseded this request
  renderResults(stances, invocations, aa, spells, abilities, classes);
}

// Class + (for spells) per-class level badges — badged with only the
// *selected* classes, not an entry's full class list, so overlap between
// selections is visible at a glance. An empty selection means "browsing
// every class" (see DECISIONS.md), so it shows every class the entry
// actually has rather than filtering down to nothing.
function classBadges(entryClasses, selected, levelLookup) {
  const granting = selected.length ? entryClasses.filter((c) => selected.includes(c)) : entryClasses;
  return granting
    .map((c) => {
      const label = c.charAt(0).toUpperCase() + c.slice(1);
      const level = levelLookup ? levelLookup(c) : null;
      return `<span class="spell-badge class-badge">${label}${level != null ? ` L${level}` : ""}</span>`;
    })
    .join("");
}

function renderAbility(ability, selected) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  card.innerHTML = `
    <div class="spell-header"><h3>${ability.name}</h3></div>
    <div class="spell-scroll">
      <div class="spell-badges">${classBadges(ability.classes, selected)}</div>
      <p class="spell-desc">${ability.description}</p>
    </div>
  `;
  return card;
}

function renderAA(aa, selected) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  const badges = [
    `<span class="spell-badge type-badge">${aa.ranks} rank${aa.ranks === 1 ? "" : "s"}</span>`,
    `<span class="spell-badge mana-badge">${aa.cost} pts</span>`,
    classBadges(aa.classes, selected),
  ].join("");
  card.innerHTML = `
    <div class="spell-header"><h3>${aa.name}</h3></div>
    <div class="spell-scroll">
      <div class="spell-badges">${badges}</div>
      <p class="spell-desc">${aa.description}</p>
    </div>
  `;
  return card;
}

// Rogue poison disciplines, Backstab, Kick, Taunt, etc. — class-defining
// special combat actions that aren't spells/stances/invocations/AAs (see
// migration 018). class_levels shape/lookup mirrors renderSpellCard's,
// since several of these grant to multiple classes at different levels.
function renderAbilityCard(ability, selected) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  const levelLookup = (c) => ability.class_levels.find((cl) => cl.class === c)?.level;
  // "Combat"/"Utility" is a poison-specific classification (Rogue
  // disciplines only) — labeled "X Poison" rather than a bare "Combat"/
  // "Utility" so it doesn't read as a general ability taxonomy that only
  // some entries happen to have. "special" (everything else hand-curated)
  // gets no badge at all; there's nothing informative to say.
  const badges = [
    ability.category && ability.category !== "special" ? `<span class="spell-badge type-badge">${ability.category.charAt(0).toUpperCase() + ability.category.slice(1)} Poison</span>` : "",
    ability.reuseTime ? `<span class="spell-badge mana-badge">${ability.reuseTime} reuse</span>` : "",
    classBadges(ability.class_levels.map((cl) => cl.class), selected, levelLookup),
  ].join("");
  const duration = fmtDuration(ability.duration);
  card.innerHTML = `
    <div class="spell-header"><h3>${ability.name}</h3></div>
    <div class="spell-scroll">
      <div class="spell-badges">${badges}</div>
      <p class="spell-desc">${ability.description}</p>
      ${duration ? `<div class="spell-stats"><span class="stat-tag">Duration: ${duration}</span></div>` : ""}
    </div>
  `;
  return card;
}

function fmtDuration(d) {
  if (!d) return null;
  if (/instant/i.test(d)) return "Instant";
  return d.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s");
}

function fmtCast(t) {
  if (t == null) return null;
  return t % 1 === 0 ? `${t}s cast` : `${t.toFixed(1)}s cast`;
}

// Builds the "Find in Spell Finder" link. The planner's rankZones() bypasses
// its own class/level filters entirely for a pinned spell (see DECISIONS.md),
// so these params aren't load-bearing for correctness — but without them the
// planner would keep showing whatever level range / Shopping For classes /
// race / deity were last saved there, which could be wildly unrelated to
// what you were just looking at here. race=any and deity=any are both
// unconditional: Class Browser never collects either, so any leftover value
// in the planner could produce a misleading KOS/won't-sell result that has
// nothing to do with this lookup. Each only neutralizes its own dimension
// server-side, so this doesn't hide a real primaryClass-driven wont_sell —
// there's just no primaryClass context to propagate either.
function buildPinUrl(spell, selected) {
  const level = document.getElementById("level-select").value;
  const [levelMin, levelMax] = level === "all" ? [1, MAX_SPELL_LEVEL] : [level, level];
  const params = new URLSearchParams({
    pinSpell: spell.id,
    pinName: spell.label,
    levelMin: String(levelMin),
    levelMax: String(levelMax),
    race: "any",
    deity: "any",
  });
  if (selected.length) params.set("classes", selected.join(","));
  return `index.html?${params}`;
}

function renderSpellCard(spell, selected) {
  const card = document.createElement("div");
  card.className = "spell-detail";

  const levelLookup = (c) => spell.class_levels.find((cl) => cl.class === c)?.level;
  const badges = [];
  if (spell.spellType) badges.push(`<span class="spell-badge type-badge">${spell.spellType}</span>`);
  if (spell.mana != null) badges.push(`<span class="spell-badge mana-badge">${spell.mana} mana</span>`);
  if (spell.skill) badges.push(`<span class="spell-badge skill-badge">${spell.skill}</span>`);
  badges.push(classBadges(spell.class_levels.map((cl) => cl.class), selected, levelLookup));

  const stats = [];
  if (spell.targetType) stats.push(`<span class="stat-tag">Target: ${spell.targetType}</span>`);
  const dur = fmtDuration(spell.duration);
  if (dur) stats.push(`<span class="stat-tag">Duration: ${dur}</span>`);
  const cast = fmtCast(spell.castTime);
  if (cast) stats.push(`<span class="stat-tag">${cast}</span>`);
  if (spell.resist && !/unresist/i.test(spell.resist)) stats.push(`<span class="stat-tag">Resist: ${spell.resist}</span>`);
  if (spell.spellLine) stats.push(`<span class="stat-tag">Line: ${spell.spellLine}</span>`);

  const pinUrl = buildPinUrl(spell, selected);
  // Shares the exact same localStorage-backed owned set as the Spell
  // Finder (components.js) — marking a spell owned here shows up there
  // and vice versa. No filtering/counting on it here, just the checkbox.
  const isOwned = getOwnedSpells().has(spell.id);

  card.innerHTML = `
    <div class="spell-header">
      <h3>${spell.label}</h3>
      <label class="spell-check spell-check-labeled"><input type="checkbox" data-spell-id="${spell.id}"${isOwned ? " checked" : ""}> Owned</label>
    </div>
    <div class="spell-scroll">
      <div class="spell-badges">${badges.join("")}</div>
      ${spell.description ? `<p class="spell-desc">${spell.description}</p>` : ""}
      ${stats.length ? `<div class="spell-stats">${stats.join("")}</div>` : ""}
      <div class="spell-card-actions">
        <span class="vendor-hint">Click to show vendors</span>
        <a class="spell-finder-link" href="${pinUrl}">Find in Spell Finder →</a>
      </div>
    </div>
  `;

  card.querySelector(".spell-check input").addEventListener("change", (e) => {
    setSpellOwned(spell.id, e.target.checked);
  });

  card.addEventListener("click", async (e) => {
    if (e.target.closest(".spell-finder-link")) return; // let the link navigate normally
    if (e.target.closest(".spell-check")) return; // checkbox has its own handler, not a vendor-toggle click
    const scroll = card.querySelector(".spell-scroll");
    const existing = scroll.querySelector(".vendor-list");
    if (existing) {
      existing.remove();
      card.querySelector(".vendor-hint").textContent = "Click to show vendors";
      return;
    }
    card.querySelector(".vendor-hint").textContent = "Loading...";
    const vendors = await fetch(`api/spell/${encodeURIComponent(spell.id)}/vendors`).then((r) => r.json());
    card.querySelector(".vendor-hint").textContent = "Click to hide vendors";
    const list = document.createElement("div");
    list.className = "vendor-list";
    list.innerHTML = vendors.length
      ? vendors.map((v) => `<div class="vendor-row"><span>${v.npc.label}</span><span class="zone-tag">— ${v.zone?.label ?? "unknown zone"}</span></div>`).join("")
      : '<div class="vendor-row" style="color:#5a4428;">No vendors found</div>';
    scroll.appendChild(list);
  });

  return card;
}

// Raw fetch results, kept so the search box can re-filter/re-render without
// a network round trip.
let rawStances = [];
let rawInvocations = [];
let rawAA = { general: [], archetype: [], class: [], special: [] };
let rawSpells = [];
let rawAbilities = [];
let rawClasses = [];

// Category selection (driven by #category-select, right after Classes in
// the sidebar) persists across filter changes (so switching classes doesn't
// bounce you back to the first category) but resets to the first available
// section if the active one has no items for the new selection.
let activeTab = null;

// allItems reflects the current class selection only (never the search
// box) — that's what decides whether a tab exists at all. items applies the
// search on top and can legitimately be empty; a tab whose category has data
// for this class selection should stay put and show "0" while searching,
// not disappear (only truly inapplicable categories, e.g. a caster's
// Disciplines, get hidden entirely).
function buildSections(searchQuery) {
  const q = searchQuery.trim().toLowerCase();
  const matches = (name) => !q || name.toLowerCase().includes(q);
  // Spells alone also match on their spell line (e.g. searching "heal" finds
  // Superior Healing via the "Minor Healing line" it belongs to, not just
  // spells with "heal" literally in the name) — no other category has a
  // spell-line concept, so this stays spells-only rather than a shared rule.
  const matchesSpell = (s) => !q || matches(s.label) || (s.spellLine && matches(s.spellLine));
  // Spell Line is a real narrowing filter (like the class selection), not
  // just a search-box match — it affects allItems (so the tab's count badge
  // reflects it), not just items. Multiple selected lines are additive
  // (union) with each other, same as Spell Finder: a spell belongs to only
  // one line, so "must match every selected line" would always be empty.
  const lineIds = new Set(selectedSpellLineIds.map((l) => l.id));
  const spellsInSelectedLines = lineIds.size === 0
    ? rawSpells
    : rawSpells.filter((s) => s.spellLineId && lineIds.has(s.spellLineId));
  return [
    { key: "spells", title: "Spells", allItems: spellsInSelectedLines, items: spellsInSelectedLines.filter(matchesSpell), renderFn: renderSpellCard },
    { key: "abilities", title: "Abilities", allItems: rawAbilities, items: rawAbilities.filter((s) => matches(s.name)), renderFn: renderAbilityCard },
    { key: "stances", title: "Stances", allItems: rawStances, items: rawStances.filter((s) => matches(s.name)), renderFn: renderAbility },
    { key: "invocations", title: "Invocations", allItems: rawInvocations, items: rawInvocations.filter((s) => matches(s.name)), renderFn: renderAbility },
    { key: "general", title: "General AAs", allItems: rawAA.general, items: rawAA.general.filter((s) => matches(s.name)), renderFn: renderAA },
    { key: "archetype", title: "Archetype AAs", allItems: rawAA.archetype, items: rawAA.archetype.filter((s) => matches(s.name)), renderFn: renderAA },
    { key: "class", title: "Class AAs", allItems: rawAA.class, items: rawAA.class.filter((s) => matches(s.name)), renderFn: renderAA },
    { key: "special", title: "Special AAs", allItems: rawAA.special, items: rawAA.special.filter((s) => matches(s.name)), renderFn: renderAA },
  ].filter((section) => section.allItems.length);
}

function render() {
  const categoryField = document.getElementById("category-field");
  const categorySelect = document.getElementById("category-select");
  const resultsEl = document.getElementById("browser-results");
  const levelField = document.getElementById("level-field");
  const spelllineField = document.getElementById("spellline-field");
  const searchQuery = document.getElementById("browser-search").value;
  const sections = buildSections(searchQuery);

  if (!sections.length) {
    categoryField.hidden = true;
    levelField.hidden = true;
    spelllineField.hidden = true;
    resultsEl.innerHTML = '<div class="no-results">No results found.</div>';
    return;
  }

  if (!sections.some((section) => section.key === activeTab)) {
    activeTab = sections[0].key;
  }
  levelField.hidden = activeTab !== "spells";
  // Also hidden when the current class selection's spells (rawSpells, not
  // the already-line-filtered set — checking that would be self-referential
  // once a line is picked) have no spell-line data at all, same spirit as
  // the category disappearing entirely when it has zero items: no point
  // showing a filter with nothing it could ever narrow.
  spelllineField.hidden = activeTab !== "spells" || !rawSpells.some((s) => s.spellLineId);

  // A lone section needs no picker to switch away from.
  categoryField.hidden = sections.length <= 1;
  categorySelect.innerHTML = sections
    .map((section) => `<option value="${section.key}">${section.title} (${section.items.length})</option>`)
    .join("");
  categorySelect.value = activeTab;

  const active = sections.find((section) => section.key === activeTab);
  resultsEl.innerHTML = "";
  if (!active.items.length) {
    resultsEl.innerHTML = `<div class="no-results">No ${active.title.toLowerCase()} match your search.</div>`;
    return;
  }
  for (const item of active.items) resultsEl.appendChild(active.renderFn(item, rawClasses));
}

function renderResults(stances, invocations, aa, spells, abilities, classes) {
  rawStances = stances;
  rawInvocations = invocations;
  rawAA = aa;
  rawSpells = spells;
  rawAbilities = abilities;
  rawClasses = classes;
  render();
}

init();
