const SELECT_IDS = ["class-select-1", "class-select-2", "class-select-3"];
let availableClasses = [];

async function init() {
  availableClasses = await fetch("api/classes/abilities").then((r) => r.json());
  populateClassSelects();
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

  if (!classes.length) {
    document.getElementById("browser-tabs").hidden = true;
    resultsEl.innerHTML = '<div class="no-results">Pick at least one class.</div>';
    return;
  }

  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams({ class: classes.join(",") });
  const [{ stances, invocations }, aa] = await Promise.all([
    fetch(`api/stances-invocations?${params}`).then((r) => r.json()),
    fetch(`api/aa?${params}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer filter change superseded this request
  renderResults(stances, invocations, aa, classes);
}

function classBadges(entryClasses, selectedClasses) {
  const granting = entryClasses.filter((c) => selectedClasses.includes(c));
  return granting
    .map((c) => `<span class="spell-badge class-badge">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`)
    .join("");
}

function renderAbility(ability, selectedClasses) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  card.innerHTML = `
    <div class="spell-header">
      <h3>${ability.name}</h3>
      <div class="spell-badges">${classBadges(ability.classes, selectedClasses)}</div>
    </div>
    <p class="spell-desc">${ability.description}</p>
  `;
  return card;
}

function renderAA(aa, selectedClasses) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  const badges = [
    `<span class="spell-badge type-badge">${aa.ranks} rank${aa.ranks === 1 ? "" : "s"}</span>`,
    `<span class="spell-badge mana-badge">${aa.cost} pts</span>`,
    classBadges(aa.classes, selectedClasses),
  ].join("");
  card.innerHTML = `
    <div class="spell-header">
      <h3>${aa.name}</h3>
      <div class="spell-badges">${badges}</div>
    </div>
    <p class="spell-desc">${aa.description}</p>
  `;
  return card;
}

// Tab state persists across filter changes (so switching classes doesn't
// bounce you back to the first tab) but resets to the first available
// section if the active one has no items for the new selection.
let activeTab = null;
let currentSections = [];
let currentClasses = [];

function buildSections(stances, invocations, aa) {
  return [
    { key: "stances", title: "Stances", items: stances, renderFn: renderAbility },
    { key: "invocations", title: "Invocations", items: invocations, renderFn: renderAbility },
    { key: "general", title: "General AAs", items: aa.general, renderFn: renderAA },
    { key: "archetype", title: "Archetype AAs", items: aa.archetype, renderFn: renderAA },
    { key: "class", title: "Class AAs", items: aa.class, renderFn: renderAA },
    { key: "special", title: "Special AAs", items: aa.special, renderFn: renderAA },
  ].filter((section) => section.items.length);
}

function render() {
  const tabBar = document.getElementById("browser-tabs");
  const resultsEl = document.getElementById("browser-results");

  if (!currentSections.length) {
    tabBar.hidden = true;
    tabBar.innerHTML = "";
    resultsEl.innerHTML = '<div class="no-results">No abilities found.</div>';
    return;
  }

  if (!currentSections.some((section) => section.key === activeTab)) {
    activeTab = currentSections[0].key;
  }

  // A lone section needs no tab to switch away from.
  tabBar.hidden = currentSections.length <= 1;
  tabBar.innerHTML = "";
  tabBar.setAttribute("role", "tablist");
  for (const section of currentSections) {
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

  const active = currentSections.find((section) => section.key === activeTab);
  resultsEl.innerHTML = "";
  for (const item of active.items) resultsEl.appendChild(active.renderFn(item, currentClasses));
}

function renderResults(stances, invocations, aa, classes) {
  currentSections = buildSections(stances, invocations, aa);
  currentClasses = classes;
  render();
}

init();
