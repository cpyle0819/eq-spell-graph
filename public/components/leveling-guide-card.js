// <leveling-guide-card>, with `.setData(recipes, levelingCities)` set as one
// atomic call. One compact panel listing every recipe of a tradeskill as an
// ordered row (easiest to hardest, trivial ascending -- the order
// src/graph.ts's getRecipes() already returns), not a separate card per
// recipe: this is the fixed reference "how do I level this skill from 0"
// answer, distinct from browsing/searching individual recipes
// (recipe-card.js's job). `recipes` is RecipeSummary[]; `levelingCities` is
// TradeskillLevelingCities | null (src/graph.ts's
// getTradeskillLevelingCities(), decisions/city-alignment-good-evil.md) --
// the best good/evil/neutral city to shop this guide's own ingredient set,
// rendered as a small badge row under the header.
//
// A standalone panel, not a CardBase list item -- same "self-contained
// dossier shell" shape as zone-dossier.js (its own bevel-panel + parchment-
// scroll, no shared base class). trades.js adds/removes this single element
// entirely via the View select; it has no collapse affordance of its own.
//
// Rows aren't clickable/don't link out to their own Browse-tab entry -- the
// guide is a fixed reference path, not a jumping-off point for browsing.
// Each ingredient chip already deep-links to its own entry (nav-href) and
// carries its own "+" drawer (item-chip.js's shoppingList option) for
// adding just that one ingredient. What the row itself adds on top: a
// "+ Add Ingredients" button that adds every ingredient this recipe needs
// to the shopping list in one click, at the quantities this recipe actually
// calls for, rather than clicking each ingredient's own "+" one at a time.
// Dispatches a bubbling+composed "add-recipe-ingredients" custom event
// (detail: { items: recipe.uses }) for trades.js to act on, same convention
// as ingredient-card.js's own "add-shopping-item".
import { RESET_CSS } from "./reset.js";
import { RECIPE_ROW_CSS, recipeBadgesHtml, recipeFormulaHtml } from "./tradeskill-shared.js";
import { hydrateItemChips } from "./item-chip.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  outline: 1px solid rgba(232, 168, 42, 0.22);
  outline-offset: -5px;
  border-top: 2px solid var(--gold);
  padding: 22px 26px !important;
}
.guide-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 6px; }
.guide-title {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; color: var(--parchment);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.guide-count-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: #c9a25e;
  font-variant-numeric: tabular-nums;
}

/* Good/evil/neutral city recommendation (decisions/
   city-alignment-good-evil.md) -- up to three small badges, not a third
   card: a supplementary fact about the guide below, not its own entity.
   Empty (no ingredient coverage in any of the three) renders nothing at
   all, caption included -- there's nothing to caption if no badge has
   anything to say. */
.guide-cities { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.guide-cities-caption { font-size: 11px; font-style: italic; color: var(--ink-muted); }
.guide-cities-badges { display: flex; gap: 10px; flex-wrap: wrap; }
.city-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; padding: 4px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: var(--parchment);
}
.city-badge .align-good { color: #7fbf6a; font-weight: 700; }
.city-badge .align-evil { color: #c0554a; font-weight: 700; }
.city-badge .align-neutral { color: var(--ink-muted); font-weight: 700; }
.city-badge a { color: #c9a25e; text-decoration: none; }
.city-badge a:hover, .city-badge a:focus-visible { text-decoration: underline; }
.city-badge .city-count { color: var(--ink-muted); }

.guide-scroll {
  position: relative;
  padding: 16px 20px; border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.guide-scroll::before, .guide-scroll::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
.guide-scroll::before { left: -11px; }
.guide-scroll::after { right: -11px; }

/* Grid, not a flex row per recipe -- a flex row sized .skill-badges to
   that row's own badge widths alone, so a recipe with a long "Crafted in
   Oven or Spit" badge pushed its own .recipe-body further right than every
   other row's, an inconsistent left edge for the name/formula column top
   to bottom. A shared grid instead sizes column 1 to the single widest
   badge stack in the whole list (max-content) and starts column 2 right
   after it for every row alike -- same fix zone-dossier.js's .npc-list
   already uses for the identical "per-row flex column width" problem. */
.recipe-list { display: grid; grid-template-columns: max-content 1fr; column-gap: 12px; }
.recipe-empty { grid-column: 1 / -1; font-size: 12px; font-style: italic; color: var(--parch-ink-soft); }
.skill-badges, .recipe-body { padding: 10px 0; }
.skill-badges:nth-child(-n+2), .recipe-body:nth-child(-n+2) { padding-top: 0; }
.skill-badges:not(:nth-child(-n+2)), .recipe-body:not(:nth-child(-n+2)) { border-top: 1px solid var(--parch-line); }
.skill-badges { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.recipe-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.recipe-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.recipe-name { font-weight: 700; color: var(--parch-ink); font-size: 13px; }

.spell-badge { font-size: 11px; padding: 2px 7px; border-radius: 3px; }
.skill-badge { background: rgba(0, 0, 0, 0.05); color: #4a4232; border: 1px solid var(--parch-line); }
${RECIPE_ROW_CSS}
`);

// Two sibling spans, not a wrapping row div -- .recipe-list itself is the
// grid (see its own CSS comment for why), so every recipe's badges/body
// land in the same two grid columns and the body column aligns down the
// whole list without each row needing to know the widest badge stack in
// the list.
function recipeRowHtml(recipe) {
  return `
    <span class="skill-badges">${recipeBadgesHtml(recipe)}</span>
    <span class="recipe-body">
      <span class="recipe-name-row">
        <span class="recipe-name">${recipe.label}</span>
        <button type="button" class="add-shopping-btn" data-recipe-id="${recipe.id}">+ Add Ingredients</button>
      </span>
      <span class="recipe-formula">${recipeFormulaHtml(recipe)}</span>
    </span>
  `;
}

const ALIGN_LABELS = { good: "Good City", evil: "Evil City", neutral: "Neutral City" };

// One badge per alignment side that actually has a covering city -- a side
// with no vendor coverage at all (city.good/city.evil/city.neutral is null)
// renders nothing rather than a dead "no recommendation" badge, same
// "absence isn't a gap to fill" convention city-alignment-good-evil.md's own
// data uses. "Neutral" (src/graph.ts's deriveCityAlignment()) covers both a
// city eqlwiki itself documents as genuinely mixed (Freeport) and one this
// graph's faction data just doesn't discriminate on (Cabilis) -- either way
// it's a real third option, not a lesser one, so it renders the same way as
// Good/Evil, not folded into either or hidden.
// Deep-links to maps.html?to=<zoneLabel>, same convention leveling-guide.html
// (the zone-revamp page, not this one) already uses for a plain zone name.
// The count spells out "N of M ingredients" in the visible label itself, not
// a bare "(N/M)" -- a slash-separated pair reads as a magic number without
// units; `title` repeats it in full prose (what "ingredients" means here:
// vendor-sourceable only, see cityBadgesHtml's own caption) for anyone
// hovering. `total` (src/graph.ts's getTradeskillLevelingCities()) already
// excludes this guide's own crafted/foraged/dropped-only ingredients --
// ones no vendor anywhere sells, so no city could ever cover them -- so a
// perfect score reads as "N of N," not as an unexplained gap.
function cityBadgeHtml(align, city, total) {
  if (!city) return "";
  const label = ALIGN_LABELS[align];
  const title = `${city.ingredientCount} of this guide's ${total} vendor-sourceable ingredients are sold in ${city.cityLabel}`;
  // Links to the city's own best sub-zone (city.zoneLabel) even though the
  // visible name is the real-world city (city.cityLabel) -- Freeport itself
  // isn't a single zone maps.html can route to, only its three sub-zones
  // are (decisions/city-alignment-good-evil.md).
  return `
    <span class="city-badge" title="${title}">
      <span class="align-${align}">${label}:</span>
      <a href="maps.html?to=${encodeURIComponent(city.zoneLabel)}">${city.cityLabel}</a>
      <span class="city-count">${city.ingredientCount} of ${total} ingredients</span>
    </span>
  `;
}

// A one-line caption above the badges spells out what they mean up front
// (issue: the bare badges gave no hint what the count was even counting) --
// visible text, not just each badge's own hover title, since a touch device
// has no hover at all to discover that detail on. Names "vendor-sourceable"
// explicitly -- this guide's own crafted/foraged/dropped-only ingredients
// (never sold by any vendor) don't count toward either total, so a city
// showing e.g. "5 of 5" already covers everything actually shoppable, even
// though the guide itself calls for more ingredients than that.
function cityBadgesHtml(cities) {
  if (!cities || (!cities.good && !cities.evil && !cities.neutral)) return "";
  return `
    <span class="guide-cities-caption">Best good/evil/neutral city to buy this guide's vendor-sourceable ingredients from:</span>
    <span class="guide-cities-badges">
      ${cityBadgeHtml("good", cities.good, cities.totalIngredients)}
      ${cityBadgeHtml("evil", cities.evil, cities.totalIngredients)}
      ${cityBadgeHtml("neutral", cities.neutral, cities.totalIngredients)}
    </span>
  `;
}

class LevelingGuideCard extends HTMLElement {
  #recipes = [];
  #itemsById = new Map();
  #levelingCities = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="guide-header">
          <span class="guide-title">Leveling Guide</span>
          <span class="guide-count-badge"></span>
        </div>
        <div class="guide-cities"></div>
        <div class="guide-scroll">
          <div class="recipe-list"></div>
        </div>
      `;
      const list = this.shadowRoot.querySelector(".recipe-list");
      list.addEventListener("click", (e) => this.#addIngredients(e));
    }
    this.render();
  }

  #addIngredients(e) {
    const btn = e.target.closest(".add-shopping-btn");
    if (!btn) return;
    const recipe = this.#recipes.find((r) => r.id === btn.dataset.recipeId);
    if (!recipe) return;
    this.dispatchEvent(new CustomEvent("add-recipe-ingredients", {
      bubbles: true, composed: true,
      detail: { items: recipe.uses },
    }));
  }

  // levelingCities is TradeskillLevelingCities (src/graph.ts) or null/
  // undefined (not yet fetched, or no tradeskill selected) -- either reads
  // the same as "nothing to recommend."
  setData(recipes, levelingCities) {
    this.#recipes = recipes;
    this.#itemsById = new Map(recipes.flatMap((r) => [...r.uses, ...(r.produces ? [r.produces] : [])]).map((i) => [i.id, i]));
    this.#levelingCities = levelingCities ?? null;
    if (this.shadowRoot) this.render();
  }

  render() {
    const recipes = this.#recipes;
    this.shadowRoot.querySelector(".guide-count-badge").textContent = `${recipes.length} Recipe${recipes.length === 1 ? "" : "s"}`;
    this.shadowRoot.querySelector(".guide-cities").innerHTML = cityBadgesHtml(this.#levelingCities);
    const listEl = this.shadowRoot.querySelector(".recipe-list");
    listEl.innerHTML = recipes.length
      ? recipes.map(recipeRowHtml).join("")
      : `<div class="recipe-empty">No recipes catalogued yet for this tradeskill.</div>`;
    hydrateItemChips(listEl, (id) => this.#itemsById.get(id));
  }
}

customElements.define("leveling-guide-card", LevelingGuideCard);
