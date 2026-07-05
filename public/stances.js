const SELECT_IDS = ["class-select-1", "class-select-2", "class-select-3"];
let availableClasses = [];

async function init() {
  availableClasses = await fetch("api/classes/stances").then((r) => r.json());
  populateClassSelects();
  setupFilters();
  fetchStances();
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
      fetchStances();
    });
  }
}

function selectedClasses() {
  return SELECT_IDS.map((id) => document.getElementById(id).value).filter(Boolean);
}

async function fetchStances() {
  const classes = selectedClasses();
  const resultsEl = document.getElementById("stances-results");

  if (!classes.length) {
    resultsEl.innerHTML = '<div class="no-results">Pick at least one class.</div>';
    return;
  }

  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams({ class: classes.join(",") });
  const { stances, invocations } = await fetch(`api/stances-invocations?${params}`).then((r) => r.json());
  renderResults(stances, invocations, classes);
}

function renderAbility(ability, selectedClasses) {
  const card = document.createElement("div");
  card.className = "spell-detail";
  const grantingClasses = ability.classes.filter((c) => selectedClasses.includes(c));
  const badges = grantingClasses
    .map((c) => `<span class="spell-badge class-badge">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`)
    .join("");
  card.innerHTML = `
    <div class="spell-header">
      <h3>${ability.name}</h3>
      <div class="spell-badges">${badges}</div>
    </div>
    <p class="spell-desc">${ability.description}</p>
  `;
  return card;
}

function renderResults(stances, invocations, classes) {
  const el = document.getElementById("stances-results");
  el.innerHTML = "";

  if (!stances.length && !invocations.length) {
    el.innerHTML = '<div class="no-results">No stances or invocations found.</div>';
    return;
  }

  if (stances.length) {
    const title = document.createElement("h2");
    title.className = "ability-section-title";
    title.textContent = "Stances";
    el.appendChild(title);
    for (const s of stances) el.appendChild(renderAbility(s, classes));
  }

  if (invocations.length) {
    const title = document.createElement("h2");
    title.className = "ability-section-title";
    title.textContent = "Invocations";
    el.appendChild(title);
    for (const inv of invocations) el.appendChild(renderAbility(inv, classes));
  }
}

init();
