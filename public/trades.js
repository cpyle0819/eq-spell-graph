// Imported first so every custom element is registered before this file
// sets properties on one -- see quests.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";

// Issue #32's first pass: a tradeskill select + a zone-filterable dossier
// (leveling guide + vendor list), modeled first for Brewing (migration 355,
// decisions/tradeskill-recipe-node-schema.md). Ingredient/recipe search
// across all 8 trades is explicitly out of scope for this pass.
let availableZones = [];
let selectedTradeskill = "";

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <field-row label="Trade Skill"><select id="trade-skill-select"><option value="">— Select —</option></select></field-row>
      <field-row label="Zone"><select id="trade-zone-select"><option value="">All Zones</option></select></field-row>
      <button slot="actions" type="button" class="text-action" id="reset-trade-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

export async function init() {
  renderSidebar();
  const [tradeskills, zones] = await Promise.all([
    fetch("api/tradeskills").then((r) => r.json()),
    fetch("api/zones").then((r) => r.json()),
  ]);
  availableZones = zones;
  populateTradeskillSelect(tradeskills);
  populateZoneSelect();
  setupFilters();

  // Brewing is the only tradeskill modeled so far -- pre-selecting the sole
  // option means a visitor sees a populated dossier immediately rather than
  // an empty "— Select —" landing state, same "show real data by default"
  // call quests.js's own out-of-era toggle makes in reverse.
  if (tradeskills.length === 1) {
    document.getElementById("trade-skill-select").value = tradeskills[0];
    selectedTradeskill = tradeskills[0];
  }
  render();
}

function populateTradeskillSelect(tradeskills) {
  const sel = document.getElementById("trade-skill-select");
  for (const t of tradeskills) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  }
}

function populateZoneSelect() {
  const sel = document.getElementById("trade-zone-select");
  for (const z of availableZones) {
    const opt = document.createElement("option");
    opt.value = z.id;
    opt.textContent = z.outOfEra ? `${z.label} (Out of Era)` : z.label;
    sel.appendChild(opt);
  }
}

function setupFilters() {
  document.getElementById("trade-skill-select").addEventListener("change", (e) => {
    selectedTradeskill = e.target.value;
    render();
  });
  document.getElementById("trade-zone-select").addEventListener("change", render);
  document.getElementById("reset-trade-filters-btn").addEventListener("click", resetFilters);
}

// Restores HTML defaults rather than blanking the form (same convention as
// quests.js's own resetFilters), except the tradeskill select's own default
// stays whatever init() pre-selected, not blank -- a reset should return to
// "the dossier as first landed on," not to an empty page.
function resetFilters() {
  document.getElementById("trade-zone-select").value = "";
  render();
}

// Bumped on every filter change so a slower, now-stale request can't
// overwrite a newer one -- same guard as quests.js's fetchToken.
let fetchToken = 0;

async function render() {
  const resultsEl = document.getElementById("trades-results");
  if (!selectedTradeskill) {
    resultsEl.innerHTML = '<div class="no-results">Select a trade skill to see its leveling guide and vendors.</div>';
    return;
  }

  const token = ++fetchToken;
  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const zone = document.getElementById("trade-zone-select").value;
  const recipeParams = new URLSearchParams({ tradeskill: selectedTradeskill });
  const vendorParams = new URLSearchParams({ tradeskill: selectedTradeskill });
  if (zone) vendorParams.set("zone", zone);

  const [recipes, vendors] = await Promise.all([
    fetch(`api/recipes?${recipeParams}`).then((r) => r.json()),
    fetch(`api/tradeskill-vendors?${vendorParams}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer filter change superseded this request

  resultsEl.innerHTML = "";
  const dossier = document.createElement("tradeskill-dossier");
  dossier.setData({ tradeskillLabel: selectedTradeskill, recipes, vendors });
  resultsEl.appendChild(dossier);
}
