// Imported first so every custom element is registered before this file
// sets properties on one -- see quests.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";
import { lazyRenderList } from "./components.js";

// The Tradeskills page: a Trade Skill select, plus a View select (Guide/
// Browse) switching between the Leveling Guide and the Browse list --
// mutually exclusive views, not stacked together. Browse adds its own Type
// (Recipes/Ingredients), skill-range/Item Type/Subtype (Recipes only), and
// plain-text search filters, which only make sense (and only show) in that
// view -- Guide is one fixed reference panel with nothing to filter, so
// only Trade Skill + View stay visible there. Modeled first for Brewing
// (migration 355, decisions/tradeskill-recipe-node-schema.md).
//
// Item Type (Armor/Weapon/Other) and Subtype (armor slot, or weapon skill)
// filter Recipes by what the recipe's own `produces` item actually is --
// computed client-side from that item's real `slots`/`skill`/`ac` fields
// (classifyItem()), not a stored classification. Most non-Blacksmithing
// recipes produce food/drink/etc, which just reads as "Other" -- this isn't
// Blacksmithing-specific plumbing even though Blacksmithing (issue #48/#65)
// is what surfaced the need for it.
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

// Recipes-only: what a recipe's own `produces` item is, not the recipe/
// ingredient Type select above (selectedType) -- "" means no filter. Item
// Type narrows first (Armor/Weapon/Other); Item Subtype (armor slot, or
// weapon skill) only makes sense once a non-Other Item Type is picked, so
// it stays hidden/reset until then, same "narrower filter depends on a
// broader one" relationship Browse's own Type->skill-range visibility has.
let selectedItemType = "";
let selectedItemSubtype = "";

let rawRecipes = [];
let rawVendors = [];
// TradeskillLevelingCities (src/graph.ts) -- the best good/evil city to shop
// the current tradeskill's leveling-guide ingredients in, decisions/
// city-alignment-good-evil.md. null before the first fetch resolves.
let rawLevelingCities = null;
// itemId -> ItemSourceSummary (src/graph.ts's getItemSources) -- Foraged
// In/Fished From/Dropped By/Crafted In facts for ingredient-card.js
// (issue #55). Fetched alongside rawVendors once the ingredient id set is
// known from rawRecipes; absent from the map (not yet fetched, or an
// ingredient with none of these facts) reads the same as "no sections."
let rawItemSources = new Map();

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

// "vendor" (buy it), "crafted" (some recipe produces it), "gathered"
// (foraged/fished/dropped/other free-text source), or "unknown" (no sourcing
// data loaded for this id -- e.g. a leftover shopping-list item from a
// tradeskill that isn't currently selected, since rawVendors/rawItemSources
// only ever cover the current one). Priority order matches "how would a
// player actually get this": buying beats crafting beats hunting it down,
// so an item that's both vendor-sold and droppable (Bat Wing) still shows
// under Vendor, the simplest real option.
function categorizeShoppingItem(id, hasVendor, sources) {
  if (hasVendor) return "vendor";
  if (sources?.craftedIn?.length) return "crafted";
  if (sources && (sources.foraged.length || sources.fished.length || sources.dropped.length || sources.other)) return "gathered";
  return "unknown";
}

function renderShoppingList() {
  const vendorItemIds = new Set(rawVendors.flatMap((v) => v.sells.map((s) => s.id)));
  const items = shoppingList.map((i) => ({
    ...i,
    category: categorizeShoppingItem(i.id, vendorItemIds.has(i.id), rawItemSources.get(i.id)),
  }));
  document.getElementById("shopping-list-panel").items = items;
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

// shopping-list-panel.js's own "Find Near Me" -- ranks every candidate real-
// world city that sells *something* on the shopping list by how much of the
// list it covers (most items first, nearest as the tiebreak), and shows the
// top 5. Deliberately not a "here's your one trip" minimal-stop plan: an
// earlier version tried to compute the smallest covering set of stops, but
// that always hides options ("why isn't the zone I actually wanted to visit
// even listed?") and is also easy to get subtly wrong (a zone that's the
// single best pick for *one* item can look artificially attractive in a
// stop-by-stop greedy even when a slightly farther zone would've covered
// the whole list). Scoring each city independently against the full list,
// instead of a shrinking "still needed" set, sidesteps that class of bug
// entirely -- and showing several ranked options instead of one prescribed
// route is more useful anyway when the "best" stop is a judgment call
// (e.g. slightly more items vs. slightly closer).
//
// Candidates are grouped by real-world city (TradeskillVendorSummary's own
// cityGroup, src/graph.ts), not raw zoneId -- Freeport's three playable
// sub-zones (etc.) each stop scoring independently hid how much of the
// shopping list Freeport as a whole actually covers, the same bug
// getTradeskillLevelingCities() hit first (decisions/
// city-alignment-good-evil.md). A group's own nearest reachable sub-zone
// stands in for the whole city's hops/route -- once you've walked into one
// of a city's sub-zones, reaching its others is a short in-city walk, not a
// second trip.
//
// rawVendors already covers every vendor for the currently selected
// tradeskill (fetched unfiltered, see the top-of-file comment) -- every
// shopping-list item was added from that same tradeskill's own ingredients,
// so no separate fetch is needed to know who sells what, only how far each
// candidate zone is (graph pathfinding is server-side only).
async function findNearMe(fromZoneId) {
  const itemVendors = new Map(); // itemId -> TradeskillVendorSummary[]
  for (const item of shoppingList) {
    itemVendors.set(item.id, rawVendors.filter((v) => v.sells.some((s) => s.id === item.id)));
  }

  const candidateZoneIds = [...new Set([...itemVendors.values()].flat().map((v) => v.zoneId))];
  const distances = candidateZoneIds.length
    ? await fetch(`api/zone-distances?from=${encodeURIComponent(fromZoneId)}&zones=${candidateZoneIds.map(encodeURIComponent).join(",")}`).then((r) => r.json())
    : {};

  // notFound covers both "no vendor sells this at all" and "every vendor
  // that sells it is in a zone with no known route from fromZoneId."
  const notFound = shoppingList.filter((item) => !(itemVendors.get(item.id) || []).some((v) => distances[v.zoneId]));

  // zoneId -> itemId -> vendors in that zone selling it (sorted by label so
  // "which vendor gets credit for this item" is deterministic below, when a
  // zone has more than one seller of the same item).
  const zoneItemVendors = new Map();
  const cityOfZone = new Map(); // zoneId -> cityGroup label
  for (const [itemId, vendors] of itemVendors) {
    for (const vendor of vendors) {
      if (!distances[vendor.zoneId]) continue;
      cityOfZone.set(vendor.zoneId, vendor.cityGroup);
      if (!zoneItemVendors.has(vendor.zoneId)) zoneItemVendors.set(vendor.zoneId, new Map());
      const byItem = zoneItemVendors.get(vendor.zoneId);
      if (!byItem.has(itemId)) byItem.set(itemId, []);
      byItem.get(itemId).push(vendor);
    }
  }
  for (const byItem of zoneItemVendors.values()) {
    for (const vendors of byItem.values()) vendors.sort((a, b) => a.label.localeCompare(b.label));
  }

  const zoneIdsByCity = new Map(); // cityGroup label -> zoneId[]
  for (const [zoneId, city] of cityOfZone) {
    if (!zoneIdsByCity.has(city)) zoneIdsByCity.set(city, []);
    zoneIdsByCity.get(city).push(zoneId);
  }

  const stops = [...zoneIdsByCity.entries()]
    .map(([cityLabel, zoneIds]) => {
      const entryZoneId = zoneIds.reduce((a, b) => (distances[b].hops < distances[a].hops ? b : a));
      const dist = distances[entryZoneId];
      const vendorsByI = new Map();
      const items = new Set();
      for (const zoneId of zoneIds) {
        for (const [itemId, vendors] of zoneItemVendors.get(zoneId)) {
          items.add(itemId);
          const vendor = vendors[0];
          if (!vendorsByI.has(vendor.id)) vendorsByI.set(vendor.id, { id: vendor.id, label: vendor.label, items: [] });
          vendorsByI.get(vendor.id).items.push(shoppingList.find((i) => i.id === itemId));
        }
      }
      return {
        zoneId: entryZoneId,
        zoneLabel: cityLabel,
        hops: dist.hops,
        route: dist.route,
        alternates: dist.alternates,
        itemCount: items.size,
        vendors: [...vendorsByI.values()].sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    // Most of the shopping list available in one place first; nearer breaks
    // ties, since this is still "find *near* me."
    .sort((a, b) => b.itemCount - a.itemCount || a.hops - b.hops || a.zoneLabel.localeCompare(b.zoneLabel))
    .slice(0, 5)
    .map(({ itemCount, ...stop }) => stop);

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
      <field-row label="Item Type" id="trade-item-type-row">
        <select id="trade-item-type-select">
          <option value="">— Any —</option>
          <option value="Armor">Armor</option>
          <option value="Weapon">Weapon</option>
          <option value="Other">Other</option>
        </select>
      </field-row>
      <field-row label="Subtype" id="trade-item-subtype-row">
        <select id="trade-item-subtype-select"><option value="">— Any —</option></select>
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
  selectedItemType = "";
  selectedItemSubtype = "";
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
  } else if (tradeskills.length) {
    // Pre-selecting the first (alphabetically, getTradeskills()) tradeskill
    // means a visitor sees a populated dossier immediately rather than an
    // empty "— Select —" landing state, same "show real data by default"
    // call quests.js's own out-of-era toggle makes in reverse.
    document.getElementById("trade-skill-select").value = tradeskills[0];
    selectedTradeskill = tradeskills[0];
  }
  // Awaited so syncUrlState() below reflects Item Type/Subtype after
  // fetchTradeskillData()'s own updateItemTypeOptions() has had a chance to
  // reset either one for whatever tradeskill actually loaded (e.g. a
  // `?itemType=Weapon` deep link into a tradeskill with no weapons) --
  // same race setupFilters()'s trade-skill-select handler avoids.
  await fetchTradeskillData();
  syncUrlState();

  syncResultsGutterWidth();
  window.addEventListener("resize", syncResultsGutterWidth);
}

// ?type=recipes&search=<recipe name> deep-links here (e.g. from an
// ingredient's own "Used In" chips, ingredient-card.js) straight to one
// recipe, reusing the existing Type select + search box rather than a
// separate highlight/scroll mechanism -- same convention as quests.js's own
// applyQueryParams(). Also restores `view`/`min`/`max` (issue #59) so a
// history entry captured by syncUrlState() below reconstructs the exact
// prior Browse state, not just a specific-item deep link.
function applyQueryParams() {
  const params = new URLSearchParams(location.search);

  // ingredient-card.js's own "Crafted In" links (issue #57) carry this when
  // the producing recipe belongs to a *different* tradeskill than whatever
  // page the click originated from (e.g. Baking's own Beer Braised Mammoth
  // linking to Brewing's Short Beer) -- init()'s own tradeskill-select
  // restore, right after this function returns, validates it against the
  // real tradeskill list and populates the dropdown, same as any other
  // landing. Same-tradeskill crafted-in links (and every other deep-link
  // into this page) carry the current tradeskill too, so this is always a
  // same-tradeskill no-op except for the one case it exists to fix.
  const tradeskill = params.get("tradeskill");
  if (tradeskill) selectedTradeskill = tradeskill;

  const type = params.get("type");
  if (type === "recipes" || type === "ingredients") {
    document.getElementById("trade-type-select").value = type;
    selectedType = type;
  }
  const search = params.get("search");
  if (search) document.getElementById("trade-search").value = search;

  const min = params.get("min");
  const max = params.get("max");
  if (min || max) {
    const range = document.getElementById("trade-skill-range");
    if (min) range.valueMin = min;
    if (max) range.valueMax = max;
  }

  // Subtype's own <select> isn't populated yet at this point (rawRecipes is
  // still empty -- init() hasn't called fetchTradeskillData() yet), so only
  // the module var is set here; updateItemSubtypeOptions() (called once
  // rawRecipes is real, see fetchTradeskillData()) rebuilds the options and
  // applies this value if it's still valid for the restored Item Type.
  const itemType = params.get("itemType");
  if (itemType === "Armor" || itemType === "Weapon" || itemType === "Other") {
    document.getElementById("trade-item-type-select").value = itemType;
    selectedItemType = itemType;
  }
  const subtype = params.get("subtype");
  if (subtype) selectedItemSubtype = subtype;

  // `view` is syncUrlState()'s own explicit record of Guide-vs-Browse --
  // older/external links (an item-chip's nav-href, ingredient-card's "Used
  // In"/"Crafted In") only ever carry `type`+`search`, never `view`, so a
  // present `search` still implies Browse the same way it always did, for
  // those. An explicit `view=guide` (syncUrlState() restoring a Guide
  // landing that happens to still have a leftover `search`/`type` from an
  // earlier Browse visit) takes precedence over that inference.
  const view = params.get("view");
  if (view === "guide") setActiveView("guide");
  else if (view === "browse" || search) setActiveView("browse");
}

// The live Browse-filter state (tradeskill/view/type/search/skill-range),
// as a query string -- built fresh from the DOM/module vars every time
// rather than cached, since it's only ever read at the moment something
// changed. `min`/`max` are omitted at their default full range so a bare
// Browse/Recipes visit doesn't grow a noisy `?min=0&max=300`.
function buildStateParams() {
  const params = new URLSearchParams();
  if (selectedTradeskill) params.set("tradeskill", selectedTradeskill);
  params.set("view", activeView);
  if (activeView === "browse") {
    params.set("type", selectedType);
    const search = document.getElementById("trade-search").value.trim();
    if (search) params.set("search", search);
    if (selectedType === "recipes") {
      const range = document.getElementById("trade-skill-range");
      if (String(range.valueMin) !== "0") params.set("min", range.valueMin);
      if (String(range.valueMax) !== String(MAX_TRADESKILL_LEVEL)) params.set("max", range.valueMax);
      if (selectedItemType) params.set("itemType", selectedItemType);
      if (selectedItemSubtype) params.set("subtype", selectedItemSubtype);
    }
  }
  return params;
}

// Keeps the *current* history entry's own URL in sync with whatever's live
// on screen (issue #59) -- replaceState, not pushState, so typing in the
// search box or dragging the skill range doesn't spam the back-stack with
// an entry per keystroke; it only ever overwrites the entry already at the
// top. A real navigation (router.js's own pushState, e.g. clicking a
// recipe's ingredient chip) still creates its own distinct entry on top of
// whatever this last left behind -- so Back from there restores the exact
// Browse state (tradeskill/view/type/search/range) the user had dialed in
// right before they clicked away, not just "back to the default Guide."
function syncUrlState() {
  const qs = buildStateParams().toString();
  history.replaceState(null, "", qs ? `${location.pathname}?${qs}` : location.pathname);
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
  document.getElementById("trade-skill-select").addEventListener("change", async (e) => {
    selectedTradeskill = e.target.value;
    // Awaited, unlike every other syncUrlState() call site -- Item Type/
    // Subtype can get silently reset *inside* fetchTradeskillData() (a new
    // tradeskill's own updateItemTypeOptions() call, if the old selection
    // doesn't exist for it), and syncUrlState() needs to run after that
    // reset lands, not before it -- otherwise the URL keeps a stale
    // `itemType`/`subtype` the live filter state no longer holds.
    await fetchTradeskillData();
    syncUrlState();
  });

  document.getElementById("trade-type-select").addEventListener("change", (e) => {
    selectedType = e.target.value;
    updateFilterVisibility();
    render();
    syncUrlState();
  });

  document.getElementById("trade-item-type-select").addEventListener("change", (e) => {
    selectedItemType = e.target.value;
    updateItemSubtypeOptions();
    updateFilterVisibility();
    render();
    syncUrlState();
  });

  document.getElementById("trade-item-subtype-select").addEventListener("change", (e) => {
    selectedItemSubtype = e.target.value;
    render();
    syncUrlState();
  });

  // Same "debounce while dragging, settle after" treatment as quests.js's
  // own level-range -- a two-thumb slider fires many "input" events per
  // drag, and re-rendering the card lists (or writing to history) on every
  // tick would be wasteful.
  let rangeDebounce;
  document.getElementById("trade-skill-range").addEventListener("input", () => {
    clearTimeout(rangeDebounce);
    rangeDebounce = setTimeout(() => { render(); syncUrlState(); }, 300);
  });

  let searchDebounce;
  document.getElementById("trade-search").addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => { render(); syncUrlState(); }, 150);
  });

  document.getElementById("trade-view-select").addEventListener("change", (e) => {
    setActiveView(e.target.value);
    render();
    syncUrlState();
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
  const isRecipes = !isGuide && selectedType === "recipes";
  document.getElementById("trade-skill-range-row").hidden = !isRecipes;
  // Nothing to narrow when the current tradeskill's recipes are all one
  // type (most tradeskills -- only Blacksmithing currently produces both
  // Armor and Weapon items) -- same "hide a filter that can't do anything"
  // reasoning as Subtype below.
  document.getElementById("trade-item-type-row").hidden = !isRecipes || availableItemTypes(rawRecipes).size < 2;
  // Subtype only means anything once a non-Other Item Type narrows the
  // field -- "Other" (raw materials, containers, tools) has no subtypes to
  // pick from, same reasoning classifyItem() never gives it one.
  document.getElementById("trade-item-subtype-row").hidden =
    !isRecipes || !selectedItemType || selectedItemType === "Other";
}

// Item Type select's own options -- only Armor/Weapon/Other values that
// actually occur among the current tradeskill's recipes (availableItemTypes
// above), same "populate from real data, reset a selection the new list
// can't satisfy" pattern updateItemSubtypeOptions() already uses one level
// down. Called after every fresh fetch (new tradeskill); Item Type's own
// <select> doesn't otherwise change mid-tradeskill (only Subtype does, when
// Item Type itself changes).
function updateItemTypeOptions() {
  const select = document.getElementById("trade-item-type-select");
  const current = selectedItemType;
  const types = availableItemTypes(rawRecipes);
  select.innerHTML = '<option value="">— Any —</option>';
  for (const t of ["Armor", "Weapon", "Other"]) {
    if (!types.has(t)) continue;
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  }
  selectedItemType = [...select.options].some((o) => o.value === current) ? current : "";
  select.value = selectedItemType;
}

// Rebuilds the Subtype <select>'s own options from whichever armor slots or
// weapon skills actually occur among the current tradeskill's recipes (real
// data only, same convention as populateTradeskillSelect) -- called after a
// fresh fetch (new tradeskill) and after Item Type changes (new subtype
// namespace). Preserves the current selection if it's still a valid option
// for the new list (e.g. a query-param deep link setting selectedItemSubtype
// before this ever ran); resets to "Any" otherwise, since a subtype that
// doesn't exist for the newly selected Item Type/tradeskill can't stay
// selected.
function updateItemSubtypeOptions() {
  const select = document.getElementById("trade-item-subtype-select");
  const current = selectedItemSubtype;
  select.innerHTML = '<option value="">— Any —</option>';
  if (selectedItemType && selectedItemType !== "Other") {
    for (const subtype of distinctSubtypes(rawRecipes, selectedItemType)) {
      const opt = document.createElement("option");
      opt.value = subtype;
      opt.textContent = subtype;
      select.appendChild(opt);
    }
  }
  selectedItemSubtype = [...select.options].some((o) => o.value === current) ? current : "";
  select.value = selectedItemSubtype;
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
  document.getElementById("trade-item-type-select").value = "";
  selectedItemType = "";
  updateItemSubtypeOptions();
  document.getElementById("trade-search").value = "";
  setActiveView("guide");
  render();
  syncUrlState();
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

// The distinct ingredient set is every item any recipe of this tradeskill
// `uses` (not `produces`) -- an intermediate product that's also a later
// recipe's own ingredient (Brewing's Short Beer, decisions/
// tradeskill-recipe-node-schema.md) shows up here exactly because it's in
// some recipe's `uses`, not because it's also a `produces`. Alternate
// ingredient combos (recipe.variants) are flattened in alongside the
// primary combo -- an ingredient only the Velious variant of a recipe
// calls for is still a real ingredient, even though that variant itself
// doesn't get its own top-level entry in `recipes`. Shared by
// fetchTradeskillData() (needs just the id set, to fetch /api/item-sources)
// and buildIngredientEntries() (needs the full per-recipe usedIn detail
// too) so both walk recipes/variants/uses exactly once each, not twice.
function distinctIngredientIds(recipes) {
  const ids = new Set();
  for (const r of recipes) {
    for (const combo of [r, ...(r.variants ?? [])]) {
      for (const ing of combo.uses) ids.add(ing.id);
    }
  }
  return [...ids];
}

const EMPTY_ITEM_SOURCES = { foraged: [], fished: [], dropped: [], craftedIn: [], other: null };

// Builds ingredient-card.js's own data contract from the arrays the
// Leveling Guide/render() already fetched -- no separate "ingredients" API
// route yet, besides itemSourcesById (see rawItemSources' own comment).
function buildIngredientEntries(recipes, vendors, itemSourcesById) {
  const itemsById = new Map();
  const usedInById = new Map();
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
      sources: itemSourcesById.get(item.id) ?? EMPTY_ITEM_SOURCES,
    }));
}

// Body slots that mean "this occupies a real armor slot," as opposed to
// Primary/Secondary/Range/Ammo (also `item.slots` values, but weapon/tool
// wield slots, not armor). A Shield is the one exception: it only ever
// carries "Secondary" (same as an offhand weapon) but has `ac` and no
// `skill` -- the same distinction a player would make just looking at the
// item. Computed at read time from item-node-schema.md's real fields
// (`slots`/`skill`/`ac`), not a stored `type`/`subtype` -- same "don't
// store what's derivable" convention as recipeSuccessThresholds server-side.
const ARMOR_SLOTS = new Set([
  "Head", "Face", "Neck", "Shoulders", "Chest", "Arms", "Wrist",
  "Hands", "Waist", "Legs", "Feet", "Back", "Ear", "Finger",
]);

// { type: "Armor"|"Weapon"|"Other", subtype?: string }. subtype is the
// armor slot ("Head", "Shield", ...) or weapon skill ("1H Slashing", ...) --
// absent for "Other" (raw materials, containers, tools; also anything with
// no `slots`/`skill` at all, e.g. most non-Blacksmithing recipe output).
function classifyItem(item) {
  if (!item) return { type: "Other" };
  // eqlwiki's own Throwing pages carry a trailing "v1"/"v2" on the raw skill
  // string (Range-slot-only vs. Range-or-Ammo-slot item -- both are the same
  // Throwing skill in-game, just placeable in different slots), which reads
  // as broken data once surfaced verbatim. Stripped for subtype purposes only;
  // item.skill itself keeps the sourced value.
  if (item.skill) return { type: "Weapon", subtype: item.skill.replace(/v[12]$/, "") };
  const armorSlot = item.slots?.find((s) => ARMOR_SLOTS.has(s));
  if (armorSlot) return { type: "Armor", subtype: armorSlot };
  if (item.slots?.length && item.slots.every((s) => s === "Secondary") && item.ac != null) {
    return { type: "Armor", subtype: "Shield" };
  }
  return { type: "Other" };
}

function recipeMatchesItemType(recipe, itemType, subtype) {
  if (!itemType) return true;
  const c = classifyItem(recipe.produces);
  if (c.type !== itemType) return false;
  return !subtype || c.subtype === subtype;
}

// Subtype select's own options -- only values that actually occur among the
// currently selected tradeskill's own recipes, same "populate from real
// data" convention as populateTradeskillSelect. Sorted for a stable order
// (armor slots have no inherent ranking; weapon skills likewise).
function distinctSubtypes(recipes, itemType) {
  const subtypes = new Set();
  for (const r of recipes) {
    const c = classifyItem(r.produces);
    if (c.type === itemType && c.subtype) subtypes.add(c.subtype);
  }
  return [...subtypes].sort();
}

// Which of Armor/Weapon/Other actually occur among the current tradeskill's
// recipes -- a tradeskill whose recipes are all food/drink (Brewing,
// Baking) only ever has "Other," so offering Armor/Weapon options that can
// only ever return zero results would be a dead-end filter, not a useful
// one. The Item Type row itself hides entirely when this comes back with
// fewer than 2 types (nothing to actually narrow), same reasoning.
function availableItemTypes(recipes) {
  const types = new Set();
  for (const r of recipes) types.add(classifyItem(r.produces).type);
  return types;
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
    rawItemSources = new Map();
    rawLevelingCities = null;
    resultsEl.innerHTML = '<div class="no-results">Select a trade skill to see its leveling guide and vendors.</div>';
    return;
  }

  const token = ++fetchToken;
  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams({ tradeskill: selectedTradeskill });
  // /api/item-sources' ids param depends on the recipe response (the
  // ingredient id set), so recipes resolves first; vendors/leveling-cities
  // don't share that dependency and still run alongside it, not after.
  const recipes = await fetch(`api/recipes?${params}`).then((r) => r.json());
  if (token !== fetchToken) return;
  const ingredientIds = distinctIngredientIds(recipes);
  const [vendors, itemSources, levelingCities] = await Promise.all([
    fetch(`api/tradeskill-vendors?${params}`).then((r) => r.json()),
    ingredientIds.length
      ? fetch(`api/item-sources?ids=${ingredientIds.map(encodeURIComponent).join(",")}`).then((r) => r.json())
      : Promise.resolve([]),
    fetch(`api/tradeskill-leveling-cities?${params}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer trade-skill change superseded this request

  rawRecipes = recipes;
  rawVendors = vendors;
  rawItemSources = new Map(itemSources.map((s) => [s.id, s]));
  rawLevelingCities = levelingCities;
  updateItemTypeOptions();
  updateItemSubtypeOptions();
  updateFilterVisibility();
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
    guide.setData(rawRecipes.filter((r) => r.levelingGuide), rawLevelingCities);
    resultsEl.appendChild(guide);
    return;
  }

  const query = document.getElementById("trade-search").value.trim().toLowerCase();
  if (selectedType === "recipes") {
    const range = document.getElementById("trade-skill-range");
    const min = parseInt(range.valueMin);
    const max = parseInt(range.valueMax);
    const filtered = rawRecipes.filter(
      (r) =>
        recipeMatchesSkillRange(r, min, max) &&
        recipeMatchesSearch(r, query) &&
        recipeMatchesItemType(r, selectedItemType, selectedItemSubtype)
    );
    resultsEl.appendChild(cardGroupList(filtered, "recipe-card"));
  } else {
    const ingredients = buildIngredientEntries(rawRecipes, rawVendors, rawItemSources).filter((e) => ingredientMatchesSearch(e, query));
    resultsEl.appendChild(cardGroupList(ingredients, "ingredient-card"));
  }
}
