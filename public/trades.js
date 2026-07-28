// Imported first so every custom element is registered before this file
// sets properties on one -- see quests.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";
import { lazyRenderList } from "./components.js";

// Issue #32's first pass: a tradeskill select + a zone-filterable dossier
// (leveling guide + vendor list), modeled first for Brewing (migration 355,
// decisions/tradeskill-recipe-node-schema.md). Ingredient/recipe search
// across all 8 trades is explicitly out of scope for this pass.
//
// Second pass: replaced tradeskill-dossier.js's single combined
// leveling-guide-table + vendor-list card with two real per-entity card
// types (recipe-card.js/ingredient-card.js), each grouped under its own
// page-level <collapsible-section> -- "Leveling Guide" (one recipe-card
// per recipe, already sorted by trivial ascending, same order the old
// dossier rendered its rows in) and "Ingredients" (one ingredient-card per
// distinct item any of this tradeskill's recipes `uses`, alphabetical).
// Type/skill-range/search filters and the Show Guide toggle (the rest of
// issue #32's remaining checklist) are still out of scope for this pass --
// both groups render unconditionally, side by side, rather than one being
// selected by a filter that doesn't exist yet.
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

// Vendors already arrive sorted by (zoneLabel, label) from
// /api/tradeskill-vendors -- filtering down to one item's own sellers
// preserves that order, so this just walks and breaks on zoneLabel change
// rather than re-sorting (same grouping the old tradeskill-dossier.js's own
// vendorGroupsHtml() used).
function groupVendorsByZone(vendors) {
  const groups = [];
  let current = null;
  for (const v of vendors) {
    if (!current || current.zoneLabel !== v.zoneLabel) {
      current = { zoneLabel: v.zoneLabel, vendors: [] };
      groups.push(current);
    }
    current.vendors.push({ id: v.id, label: v.label });
  }
  return groups;
}

// Builds ingredient-card.js's own data contract from the same two arrays
// the Leveling Guide already fetched -- no separate "ingredients" API route
// yet. The distinct ingredient set is every item any recipe of this
// tradeskill `uses` (not `produces`) -- an intermediate product that's also
// a later recipe's own ingredient (Brewing's Short Beer, decisions/
// tradeskill-recipe-node-schema.md) shows up here exactly because it's in
// some recipe's `uses`, not because it's also a `produces`.
function buildIngredientEntries(recipes, vendors) {
  const itemsById = new Map();
  const usedInById = new Map();
  for (const r of recipes) {
    for (const ing of r.uses) {
      if (!itemsById.has(ing.id)) itemsById.set(ing.id, ing);
      if (!usedInById.has(ing.id)) usedInById.set(ing.id, []);
      usedInById.get(ing.id).push({ recipeId: r.id, recipeLabel: r.label, quantity: ing.quantity });
    }
  }

  const vendorsByItemId = new Map();
  for (const v of vendors) {
    for (const item of v.sells) {
      if (!vendorsByItemId.has(item.id)) vendorsByItemId.set(item.id, []);
      vendorsByItemId.get(item.id).push(v);
    }
  }

  return [...itemsById.values()]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((item) => ({
      item,
      usedIn: usedInById.get(item.id) ?? [],
      vendorGroups: groupVendorsByZone(vendorsByItemId.get(item.id) ?? []),
    }));
}

// A group's list of cards lives in its own plain block wrapper, not as
// direct children of <collapsible-section> -- that element's :host is a
// `display: flex; gap: 8px` column (fine for its usual sidebar-panel
// field-rows), and slotting a whole card list straight into it would put
// that same 8px gap between every card, breaking the zero-gap packed-list
// seam every other card list in this app relies on (decisions/
// card-list-seams-no-border-overlap.md). Wrapping the cards in one plain
// div makes them a single slotted child instead -- the gap lands only
// between the section header and the list, not inside it.
function cardGroupSection(label, sectionName, items, tag) {
  const section = document.createElement("collapsible-section");
  section.setAttribute("label", `${label} (${items.length})`);
  section.setAttribute("section", sectionName);
  const list = document.createElement("div");
  list.className = "trade-card-list";
  lazyRenderList(list, items, (item) => {
    const el = document.createElement(tag);
    el.setData(item);
    return el;
  });
  section.appendChild(list);
  return section;
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
  if (!recipes.length) {
    resultsEl.innerHTML = '<div class="no-results">No recipes catalogued yet for this tradeskill.</div>';
    return;
  }

  const ingredients = buildIngredientEntries(recipes, vendors);
  resultsEl.appendChild(cardGroupSection("Leveling Guide", "leveling-guide", recipes, "recipe-card"));
  resultsEl.appendChild(cardGroupSection("Ingredients", "ingredients", ingredients, "ingredient-card"));
}
