// Imported first so every custom element is registered before this file
// sets properties on one -- see quests.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";
import { lazyRenderList } from "./components.js";

// The Tradeskills page: a Trade Skill select, plus a View select (Guide/
// Browse) switching between the Leveling Guide and the Browse list --
// mutually exclusive views, not stacked together. Browse adds its own Type
// (Recipes/Ingredients), skill-range (Recipes only), and plain-text search
// filters, which only make sense (and only show) in that view -- Guide is
// one fixed reference panel with nothing to filter, so only Trade Skill +
// View stay visible there. Modeled first for Brewing (migration 355,
// decisions/tradeskill-recipe-node-schema.md).
//
// There is no page-level Zone filter -- ingredient-card.js's own vendor
// list is already grouped by zone per ingredient, which is the only place
// "which zone sells this" matters, so /api/tradeskill-vendors is always
// fetched unfiltered.
//
// Only the Trade Skill select triggers a refetch; Type/skill-range/search/
// active view are all display filters over the same already-fetched
// recipes+vendors, same "search/showOutOfEra don't refetch" split
// quests.js's own filters make.
const MAX_TRADESKILL_LEVEL = 300; // EQ's tradeskill skill cap
const SHOPPING_LIST_KEY = "eq-trades-shopping-list";

let selectedTradeskill = "";
let selectedType = "recipes";
let activeView = "guide"; // "guide" | "browse"

let rawRecipes = [];
let rawVendors = [];

// {id -> label}, from /api/zones -- populates shopping-list-panel's own
// "Current Location" select and resolves that selection's label for
// findNearMe()'s own dialog header. Fetched once in init(); zones don't
// change within a session, unlike rawRecipes/rawVendors above.
let zonesById = new Map();

// scrollbar-gutter: stable on #trades-content (trades.html) reserves the
// scrollbar's width unconditionally, so #trades-results doesn't jump width
// when a tab/filter crosses the overflow threshold -- but that width isn't
// expressible as a CSS length, so trades.html's #trades-results rule reads
// it from this custom property to bleed back into the reserved strip
// instead of leaving it as a gap next to shopping-list-panel. Same trick as
// app.js's syncResultsGutterWidth. Re-measured on resize since it tracks
// the real scrollbar width (OS/zoom-dependent), not a fixed guess.
function syncResultsGutterWidth() {
  const el = document.getElementById("trades-content");
  el.style.setProperty("--gutter-w", `${el.offsetWidth - el.clientWidth}px`);
}

// [{id, label, quantity}] -- persisted independently of selectedTradeskill,
// so switching tradeskills (or reloading) doesn't lose what's collected so
// far. Owned/rendered entirely by this page; ingredient-card.js's own
// "+ Shopping List" button only ever dispatches the add event below, it
// doesn't touch this array or localStorage directly.
let shoppingList = [];

function loadShoppingList() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY) || "[]");
    shoppingList = Array.isArray(parsed) ? parsed : [];
  } catch {
    shoppingList = [];
  }
}

function saveShoppingList() {
  localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));
}

function renderShoppingList() {
  document.getElementById("shopping-list-panel").items = shoppingList;
}

// Shared by both add paths below -- doesn't save/render itself, so
// addShoppingItems() can add several ingredients as one atomic write/render
// instead of one of each per ingredient.
function addToShoppingList(id, label, quantity) {
  const existing = shoppingList.find((i) => i.id === id);
  if (existing) existing.quantity += quantity;
  else shoppingList.push({ id, label, quantity });
}

function addShoppingItem(id, label) {
  addToShoppingList(id, label, 1);
  saveShoppingList();
  renderShoppingList();
}

// leveling-guide-card.js's own "+ Add Ingredients" -- adds every ingredient
// a recipe needs (items: recipe.uses, each already {id,label,quantity}) at
// the quantities that recipe actually calls for, not a flat +1 each like a
// single ingredient's own "+" drawer does.
function addShoppingItems(items) {
  for (const item of items) addToShoppingList(item.id, item.label, item.quantity);
  saveShoppingList();
  renderShoppingList();
}

// shopping-list-panel.js's own qty-dec/qty-inc buttons -- reaching 0 (or
// below, though the panel never lets delta go past what a row already has)
// removes the row entirely rather than leaving a "0x" entry, per issue spec.
function changeShoppingQuantity(id, delta) {
  const item = shoppingList.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) shoppingList = shoppingList.filter((i) => i.id !== id);
  saveShoppingList();
  renderShoppingList();
}

function clearShoppingList() {
  shoppingList = [];
  saveShoppingList();
  renderShoppingList();
}

// shopping-list-panel.js's own "Find Near Me" -- for each shopping-list
// item, picks its single *nearest* seller (by hop count from fromZoneId),
// then groups those winning picks by zone so the result reads as a trip
// (closest stop first, everything found there together) rather than a flat
// per-item list. rawVendors already covers every vendor for the currently
// selected tradeskill (fetched unfiltered, see the top-of-file comment) --
// every shopping-list item was added from that same tradeskill's own
// ingredients, so no separate fetch is needed to know who sells what, only
// how far each candidate zone is (graph pathfinding is server-side only).
async function findNearMe(fromZoneId) {
  const itemVendors = new Map(); // itemId -> TradeskillVendorSummary[]
  for (const item of shoppingList) {
    itemVendors.set(item.id, rawVendors.filter((v) => v.sells.some((s) => s.id === item.id)));
  }

  const candidateZoneIds = [...new Set([...itemVendors.values()].flat().map((v) => v.zoneId))];
  const distances = candidateZoneIds.length
    ? await fetch(`api/zone-distances?from=${encodeURIComponent(fromZoneId)}&zones=${candidateZoneIds.map(encodeURIComponent).join(",")}`).then((r) => r.json())
    : {};

  const stopsByZone = new Map(); // zoneId -> { zoneId, zoneLabel, hops, route, vendors: Map(vendorId -> {id,label,items}) }
  const notFound = [];
  for (const item of shoppingList) {
    let best = null; // { vendor, dist }
    for (const vendor of itemVendors.get(item.id) || []) {
      const dist = distances[vendor.zoneId];
      if (!dist) continue; // unreachable
      if (!best || dist.hops < best.dist.hops || (dist.hops === best.dist.hops && vendor.label.localeCompare(best.vendor.label) < 0)) {
        best = { vendor, dist };
      }
    }
    if (!best) {
      notFound.push(item);
      continue;
    }
    const { vendor, dist } = best;
    if (!stopsByZone.has(vendor.zoneId)) {
      stopsByZone.set(vendor.zoneId, { zoneId: vendor.zoneId, zoneLabel: vendor.zoneLabel, hops: dist.hops, route: dist.route, vendors: new Map() });
    }
    const stop = stopsByZone.get(vendor.zoneId);
    if (!stop.vendors.has(vendor.id)) stop.vendors.set(vendor.id, { id: vendor.id, label: vendor.label, items: [] });
    stop.vendors.get(vendor.id).items.push(item);
  }

  const stops = [...stopsByZone.values()]
    .map((stop) => ({ ...stop, vendors: [...stop.vendors.values()].sort((a, b) => a.label.localeCompare(b.label)) }))
    .sort((a, b) => a.hops - b.hops || a.zoneLabel.localeCompare(b.zoneLabel));

  const dialog = document.getElementById("nearest-vendors-dialog");
  dialog.setData({ fromLabel: zonesById.get(fromZoneId) || fromZoneId, stops, notFound });
  dialog.show();
}

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <field-row label="Trade Skill"><select id="trade-skill-select"><option value="">— Select —</option></select></field-row>
      <field-row label="View">
        <select id="trade-view-select">
          <option value="guide">Guide</option>
          <option value="browse">Browse</option>
        </select>
      </field-row>
      <field-row label="Type" id="trade-type-row">
        <select id="trade-type-select">
          <option value="recipes">Recipes</option>
          <option value="ingredients">Ingredients</option>
        </select>
      </field-row>
      <field-row label="Skill Range" id="trade-skill-range-row">
        <range-picker id="trade-skill-range" min="0" max="${MAX_TRADESKILL_LEVEL}" value-min="0" value-max="${MAX_TRADESKILL_LEVEL}"></range-picker>
      </field-row>
      <field-row label="Search" id="trade-search-row"><input type="text" id="trade-search" placeholder="Recipe or ingredient name..."></field-row>
      <button slot="actions" type="button" class="text-action" id="reset-trade-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

export async function init() {
  renderSidebar();
  // renderSidebar() just rebuilt #trade-view-select/#trade-type-select from
  // scratch, defaulting to Guide/Recipes -- router.js caches this module
  // across a soft-navigation away and back (an ES module's top level only
  // ever runs once), so without this reset these two module vars would
  // still hold whatever they were on the previous visit, going stale
  // against the fresh DOM (dropdown reads "Guide," but render() still
  // filters on a leftover activeView of "browse"). applyQueryParams() below
  // can still override either from a deep link, same as any other landing.
  selectedType = "recipes";
  activeView = "guide";
  loadShoppingList();
  renderShoppingList();
  const [tradeskills, zones] = await Promise.all([
    fetch("api/tradeskills").then((r) => r.json()),
    fetch("api/zones").then((r) => r.json()),
  ]);
  zonesById = new Map(zones.map((z) => [z.id, z.label]));
  document.getElementById("shopping-list-panel").zones = zones;
  populateTradeskillSelect(tradeskills);
  setupFilters();
  applyQueryParams();
  updateFilterVisibility();

  // renderSidebar() rebuilt #trade-skill-select from scratch too, same as
  // the view/type selects above -- but unlike those two, selectedTradeskill
  // itself is deliberately NOT reset at the top of this function (a
  // tradeskill choice should survive a soft-nav away and back, e.g.
  // clicking an ingredient chip to its own Ingredients-tab entry and then
  // back). Without this restore, the fresh <select> would just show its
  // default "— Select —" option while the results below it kept rendering
  // whatever tradeskill selectedTradeskill still held -- dropdown and
  // results silently out of sync.
  if (selectedTradeskill && tradeskills.includes(selectedTradeskill)) {
    document.getElementById("trade-skill-select").value = selectedTradeskill;
  } else if (tradeskills.length === 1) {
    // Sole tradeskill modeled so far -- pre-selecting it means a visitor
    // sees a populated dossier immediately rather than an empty
    // "— Select —" landing state, same "show real data by default" call
    // quests.js's own out-of-era toggle makes in reverse.
    document.getElementById("trade-skill-select").value = tradeskills[0];
    selectedTradeskill = tradeskills[0];
  }
  fetchTradeskillData();

  syncResultsGutterWidth();
  window.addEventListener("resize", syncResultsGutterWidth);
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

  // A deep link to one specific recipe or ingredient (an item-chip's own
  // nav-href, or ingredient-card's "Used In" links) always means "show me
  // that one thing" -- switch to the Browse view so it's what's on screen,
  // regardless of which view was showing before the click.
  if (search) setActiveView("browse");

  // Consumed into page state above -- clear the URL back to the bare path
  // (same convention as app.js's own applyQueryParams()), or a chip whose
  // nav-href points at this exact query string (e.g. re-opening the guide
  // and clicking the same ingredient again) would match location.href
  // exactly. Router.js's click handler only intercepts+soft-navs when the
  // target URL differs from the current one -- an identical href falls
  // through to a real, uncaught anchor click, i.e. a full page reload.
  history.replaceState(null, "", location.pathname);
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
    updateFilterVisibility();
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

  document.getElementById("trade-view-select").addEventListener("change", (e) => {
    setActiveView(e.target.value);
    render();
  });

  document.getElementById("reset-trade-filters-btn").addEventListener("click", resetFilters);

  // ingredient-card.js's own "+ Shopping List" button and recipe-card.js/
  // leveling-guide-card.js's own ingredient chips (recipeFormulaHtml's
  // shoppingList option) -- composed so both cross out of their own shadow
  // roots. leveling-guide-card.js's own "+ Add Ingredients" button dispatches
  // the plural event below instead, one ingredient's worth of items at once.
  document.getElementById("trades-results").addEventListener("add-shopping-item", (e) => {
    addShoppingItem(e.detail.id, e.detail.label);
  });
  document.getElementById("trades-results").addEventListener("add-recipe-ingredients", (e) => {
    addShoppingItems(e.detail.items);
  });

  const panel = document.getElementById("shopping-list-panel");
  panel.addEventListener("change-shopping-quantity", (e) => changeShoppingQuantity(e.detail.id, e.detail.delta));
  panel.addEventListener("clear-shopping-list", clearShoppingList);
  panel.addEventListener("find-near-me", (e) => findNearMe(e.detail.zoneId));
}

// #trade-view-select (always visible, unlike the filters it governs) --
// syncs its own value (in case this was called from something other than
// the select's own change handler, e.g. applyQueryParams()'s ingredient
// deep-link) and which filters are relevant to show. Guide is one fixed
// reference panel
// with nothing to filter, so only Trade Skill + View stay visible there;
// Browse's own Type/Search (and Skill Range, Recipes only) come back once
// Browse is selected. Callers re-render themselves -- this only syncs
// state + visibility, same split render()'s other callers already use.
function setActiveView(view) {
  activeView = view;
  document.getElementById("trade-view-select").value = view;
  updateFilterVisibility();
}

function updateFilterVisibility() {
  const isGuide = activeView === "guide";
  document.getElementById("trade-type-row").hidden = isGuide;
  document.getElementById("trade-search-row").hidden = isGuide;
  document.getElementById("trade-skill-range-row").hidden = isGuide || selectedType !== "recipes";
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
  setActiveView("guide");
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
  // Alternate ingredient combos (recipe.variants, decisions/
  // tradeskill-recipe-node-schema.md) are flattened in alongside the
  // primary combo -- an ingredient only the Velious variant of a recipe
  // calls for is still a real "used in," even though that variant itself
  // doesn't get its own top-level entry in `recipes`.
  for (const r of recipes) {
    for (const combo of [r, ...(r.variants ?? [])]) {
      for (const ing of combo.uses) {
        if (!itemsById.has(ing.id)) itemsById.set(ing.id, ing);
        if (!usedInById.has(ing.id)) usedInById.set(ing.id, []);
        usedInById.get(ing.id).push({ recipeId: combo.id, recipeLabel: combo.label, quantity: ing.quantity });
      }
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
  // every recipe of the tradeskill. #trade-view-select makes Guide and
  // Browse mutually exclusive: the guide answers "what's my leveling path,"
  // the browse list (Type/skill-range/search in the sidebar) answers "show
  // me recipes/ingredients matching X," but only one is ever on screen.
  if (activeView === "guide") {
    const guide = document.createElement("leveling-guide-card");
    guide.setData(rawRecipes.filter((r) => r.levelingGuide));
    resultsEl.appendChild(guide);
    return;
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
