// Imported first so every custom element is registered before this file
// sets properties on one -- see quests.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";
import { lazyRenderList } from "./components.js";

// The Tradeskills page: a Trade Skill select, a Type filter (Recipes/
// Ingredients), a skill-range filter (Recipes only), plain-text search, and
// a Show Guide toggle (same square-macro-button convention as the Spell
// Finder's own "Show all", public/components/status-panel.js). Modeled
// first for Brewing (migration 355, decisions/
// tradeskill-recipe-node-schema.md).
//
// There is no page-level Zone filter -- ingredient-card.js's own vendor
// list is already grouped by zone per ingredient, which is the only place
// "which zone sells this" matters, so /api/tradeskill-vendors is always
// fetched unfiltered.
//
// Only the Trade Skill select triggers a refetch; Type/skill-range/search/
// Show Guide are all display filters over the same already-fetched
// recipes+vendors, same "search/showOutOfEra don't refetch" split
// quests.js's own filters make.
const MAX_TRADESKILL_LEVEL = 300; // EQ's tradeskill skill cap

let selectedTradeskill = "";
let selectedType = "recipes";
let showGuide = true;

let rawRecipes = [];
let rawVendors = [];

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <field-row label="Trade Skill"><select id="trade-skill-select"><option value="">— Select —</option></select></field-row>
      <field-row label="Type">
        <select id="trade-type-select">
          <option value="recipes">Recipes</option>
          <option value="ingredients">Ingredients</option>
        </select>
      </field-row>
      <field-row label="Skill Range" id="trade-skill-range-row">
        <range-picker id="trade-skill-range" min="0" max="${MAX_TRADESKILL_LEVEL}" value-min="0" value-max="${MAX_TRADESKILL_LEVEL}"></range-picker>
      </field-row>
      <field-row label="Search"><input type="text" id="trade-search" placeholder="Recipe or ingredient name..."></field-row>
      <div class="guide-toggle-row"><macro-button square id="show-guide-btn">Hide Guide</macro-button></div>
      <button slot="actions" type="button" class="text-action" id="reset-trade-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

export async function init() {
  renderSidebar();
  const tradeskills = await fetch("api/tradeskills").then((r) => r.json());
  populateTradeskillSelect(tradeskills);
  setupFilters();
  applyQueryParams();
  updateSkillRangeVisibility();
  updateGuideButtonLabel();

  // Brewing is the only tradeskill modeled so far -- pre-selecting the sole
  // option means a visitor sees a populated dossier immediately rather than
  // an empty "— Select —" landing state, same "show real data by default"
  // call quests.js's own out-of-era toggle makes in reverse.
  if (tradeskills.length === 1) {
    document.getElementById("trade-skill-select").value = tradeskills[0];
    selectedTradeskill = tradeskills[0];
  }
  fetchTradeskillData();
}

// ?type=recipes&search=<recipe name> deep-links here (e.g. from an
// ingredient's own "Used In" chips, ingredient-card.js) straight to one
// recipe, reusing the existing Type select + search box rather than a
// separate highlight/scroll mechanism -- same convention as quests.js's own
// applyQueryParams().
function applyQueryParams() {
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  if (type === "recipes" || type === "ingredients") {
    document.getElementById("trade-type-select").value = type;
    selectedType = type;
  }
  const search = params.get("search");
  if (search) document.getElementById("trade-search").value = search;
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

function setupFilters() {
  document.getElementById("trade-skill-select").addEventListener("change", (e) => {
    selectedTradeskill = e.target.value;
    fetchTradeskillData();
  });

  document.getElementById("trade-type-select").addEventListener("change", (e) => {
    selectedType = e.target.value;
    updateSkillRangeVisibility();
    render();
  });

  // Same "debounce while dragging, settle after" treatment as quests.js's
  // own level-range -- a two-thumb slider fires many "input" events per
  // drag, and re-rendering the card lists on every tick would be wasteful.
  let rangeDebounce;
  document.getElementById("trade-skill-range").addEventListener("input", () => {
    clearTimeout(rangeDebounce);
    rangeDebounce = setTimeout(render, 300);
  });

  let searchDebounce;
  document.getElementById("trade-search").addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 150);
  });

  document.getElementById("show-guide-btn").addEventListener("click", () => {
    showGuide = !showGuide;
    updateGuideButtonLabel();
    render();
  });

  document.getElementById("reset-trade-filters-btn").addEventListener("click", resetFilters);
}

function updateSkillRangeVisibility() {
  document.getElementById("trade-skill-range-row").hidden = selectedType !== "recipes";
}

function updateGuideButtonLabel() {
  document.getElementById("show-guide-btn").textContent = showGuide ? "Hide Guide" : "Show Guide";
}

// Restores HTML defaults rather than blanking the form (same convention as
// quests.js's own resetFilters), except the tradeskill select's own default
// stays whatever init() pre-selected, not blank -- a reset should return to
// "the dossier as first landed on," not to an empty page.
function resetFilters() {
  document.getElementById("trade-type-select").value = "recipes";
  selectedType = "recipes";
  const range = document.getElementById("trade-skill-range");
  range.valueMin = 0;
  range.valueMax = MAX_TRADESKILL_LEVEL;
  document.getElementById("trade-search").value = "";
  showGuide = true;
  updateGuideButtonLabel();
  updateSkillRangeVisibility();
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

// "Craftable N+" (success.p25, the same figure recipe-card.js's own badge
// shows) is the number the Skill Range filter narrows on, not `trivial` --
// it's the number actually named "craftable" in both the UI and issue #32's
// own spec ("filter out recipe whose craftable number falls outside the
// range").
function recipeMatchesSkillRange(recipe, min, max) {
  return recipe.success.p25 >= min && recipe.success.p25 <= max;
}

function matchesSearch(label, query) {
  return label.toLowerCase().includes(query);
}

function recipeMatchesSearch(recipe, query) {
  if (!query) return true;
  if (matchesSearch(recipe.label, query)) return true;
  if (recipe.produces && matchesSearch(recipe.produces.label, query)) return true;
  return recipe.uses.some((i) => matchesSearch(i.label, query));
}

function ingredientMatchesSearch(entry, query) {
  return !query || matchesSearch(entry.item.label, query);
}

// No group label/header at all -- just the packed card list, sitting
// directly against whatever's above it (the leveling-guide-card, or the top
// of #trades-results if Show Guide is off). Plain block stacking already
// gives that zero-gap seam (decisions/card-list-seams-no-border-overlap.md)
// without needing a wrapper.
function cardGroupList(items, tag) {
  const list = document.createElement("div");
  list.className = "trade-card-list";
  lazyRenderList(list, items, (item) => {
    const el = document.createElement(tag);
    el.setData(item);
    return el;
  });
  return list;
}

// Bumped on every trade-skill change so a slower, now-stale request can't
// overwrite a newer one -- same guard as quests.js's fetchToken.
let fetchToken = 0;

async function fetchTradeskillData() {
  const resultsEl = document.getElementById("trades-results");
  if (!selectedTradeskill) {
    rawRecipes = [];
    rawVendors = [];
    resultsEl.innerHTML = '<div class="no-results">Select a trade skill to see its leveling guide and vendors.</div>';
    return;
  }

  const token = ++fetchToken;
  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams({ tradeskill: selectedTradeskill });
  const [recipes, vendors] = await Promise.all([
    fetch(`api/recipes?${params}`).then((r) => r.json()),
    fetch(`api/tradeskill-vendors?${params}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer trade-skill change superseded this request

  rawRecipes = recipes;
  rawVendors = vendors;
  render();
}

function render() {
  const resultsEl = document.getElementById("trades-results");
  if (!selectedTradeskill) return; // fetchTradeskillData() already rendered the prompt
  if (!rawRecipes.length) {
    resultsEl.innerHTML = '<div class="no-results">No recipes catalogued yet for this tradeskill.</div>';
    return;
  }

  resultsEl.innerHTML = "";

  // The guide is one fixed reference panel -- just the tradeskill's own
  // hand-picked leveling path (recipe.levelingGuide, src/graph.ts), not
  // every recipe of the tradeskill. Not a card per recipe, and not
  // collapsible itself: the Show Guide button is what adds/removes it.
  // Type/skill-range/search below narrow a separate browsing list over ALL
  // of the tradeskill's recipes, so the two can show overlapping recipes at
  // once. That's intentional: the guide answers "what's my leveling path,"
  // the browse list answers "show me recipes/ingredients matching X."
  if (showGuide) {
    const guide = document.createElement("leveling-guide-card");
    guide.setData(rawRecipes.filter((r) => r.levelingGuide));
    resultsEl.appendChild(guide);
  }

  const query = document.getElementById("trade-search").value.trim().toLowerCase();
  if (selectedType === "recipes") {
    const range = document.getElementById("trade-skill-range");
    const min = parseInt(range.valueMin);
    const max = parseInt(range.valueMax);
    const filtered = rawRecipes.filter((r) => recipeMatchesSkillRange(r, min, max) && recipeMatchesSearch(r, query));
    resultsEl.appendChild(cardGroupList(filtered, "recipe-card"));
  } else {
    const ingredients = buildIngredientEntries(rawRecipes, rawVendors).filter((e) => ingredientMatchesSearch(e, query));
    resultsEl.appendChild(cardGroupList(ingredients, "ingredient-card"));
  }
}
