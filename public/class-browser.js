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

function appendSection(el, title, items, renderFn, classes) {
  if (!items.length) return;
  const heading = document.createElement("h2");
  heading.className = "ability-section-title";
  heading.textContent = title;
  el.appendChild(heading);
  for (const item of items) el.appendChild(renderFn(item, classes));
}

function renderResults(stances, invocations, aa, classes) {
  const el = document.getElementById("browser-results");
  el.innerHTML = "";

  const totalCount = stances.length + invocations.length +
    aa.general.length + aa.archetype.length + aa.class.length + aa.special.length;
  if (!totalCount) {
    el.innerHTML = '<div class="no-results">No abilities found.</div>';
    return;
  }

  appendSection(el, "Stances", stances, renderAbility, classes);
  appendSection(el, "Invocations", invocations, renderAbility, classes);
  appendSection(el, "General AAs", aa.general, renderAA, classes);
  appendSection(el, "Archetype AAs", aa.archetype, renderAA, classes);
  appendSection(el, "Class AAs", aa.class, renderAA, classes);
  appendSection(el, "Special AAs", aa.special, renderAA, classes);
}

init();
