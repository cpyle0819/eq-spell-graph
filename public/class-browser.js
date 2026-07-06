const SELECT_IDS = ["class-select-1", "class-select-2", "class-select-3"];
// Matches the planner's level-range slider bound (public/index.html
// #level-max max="50") — the actual data tops out at level 50 (see
// DECISIONS.md).
const MAX_SPELL_LEVEL = 50;
let availableClasses = [];

async function init() {
  availableClasses = await fetch("api/classes/abilities").then((r) => r.json());
  populateClassSelects();
  populateLevelSelect();
  setupFilters();
  fetchAbilities();
}

function populateClassSelects() {
  for (const id of SELECT_IDS) {
    const select = document.getElementById(id);
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "— None —";
    select.appendChild(none);
    for (const cls of availableClasses) {
      const opt = document.createElement("option");
      opt.value = cls;
      opt.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
      select.appendChild(opt);
    }
  }
  document.getElementById("class-select-1").value = availableClasses[0] || "";
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

// Keep the three pickers from selecting the same class twice — disable any
// value already chosen by a sibling select.
function syncSelectOptions() {
  const selects = SELECT_IDS.map((id) => document.getElementById(id));
  const chosen = selects.map((s) => s.value).filter(Boolean);
  for (const select of selects) {
    for (const opt of select.options) {
      if (!opt.value) continue;
      opt.disabled = chosen.includes(opt.value) && select.value !== opt.value;
    }
  }
}

function setupFilters() {
  for (const id of SELECT_IDS) {
    document.getElementById(id).addEventListener("change", () => {
      syncSelectOptions();
      fetchAbilities();
    });
  }
  document.getElementById("level-select").addEventListener("change", fetchAbilities);

  let searchDebounce;
  document.getElementById("browser-search").addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 150);
  });

  document.getElementById("reset-filters-btn").addEventListener("click", resetFilters);
}

function resetFilters() {
  for (const id of SELECT_IDS) document.getElementById(id).value = "";
  document.getElementById("class-select-1").value = availableClasses[0] || "";
  document.getElementById("level-select").value = "all";
  document.getElementById("browser-search").value = "";
  syncSelectOptions();
  activeTab = null; // back to the first available tab, not wherever the user was
  fetchAbilities();
}

function selectedClasses() {
  return SELECT_IDS.map((id) => document.getElementById(id).value).filter(Boolean);
}

// Bumped on every filter change so a slower, now-stale request can't
// overwrite the results of a filter change that happened after it.
let fetchToken = 0;

async function fetchAbilities() {
  const token = ++fetchToken;
  const classes = selectedClasses();
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
// selections is visible at a glance.
function classBadges(entryClasses, selected, levelLookup) {
  const granting = entryClasses.filter((c) => selected.includes(c));
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

  const pinUrl = buildPinUrl(spell, selected);

  card.innerHTML = `
    <div class="spell-header"><h3>${spell.label}</h3></div>
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

  card.addEventListener("click", async (e) => {
    if (e.target.closest(".spell-finder-link")) return; // let the link navigate normally
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

// Tab state persists across filter changes (so switching classes doesn't
// bounce you back to the first tab) but resets to the first available
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
  return [
    { key: "spells", title: "Spells", allItems: rawSpells, items: rawSpells.filter((s) => matches(s.label)), renderFn: renderSpellCard },
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
  const tabBar = document.getElementById("browser-tabs");
  const resultsEl = document.getElementById("browser-results");
  const levelField = document.getElementById("level-field");
  const searchQuery = document.getElementById("browser-search").value;
  const sections = buildSections(searchQuery);

  if (!sections.length) {
    tabBar.hidden = true;
    tabBar.innerHTML = "";
    levelField.hidden = true;
    resultsEl.innerHTML = '<div class="no-results">No results found.</div>';
    return;
  }

  if (!sections.some((section) => section.key === activeTab)) {
    activeTab = sections[0].key;
  }
  levelField.hidden = activeTab !== "spells";

  // A lone section needs no tab to switch away from.
  tabBar.hidden = sections.length <= 1;
  tabBar.innerHTML = "";
  tabBar.setAttribute("role", "tablist");
  for (const section of sections) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab-button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(section.key === activeTab));
    btn.innerHTML = `${section.title}<span class="tab-count">${section.items.length}</span>`;
    btn.addEventListener("click", () => {
      activeTab = section.key;
      render();
    });
    tabBar.appendChild(btn);
  }

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
