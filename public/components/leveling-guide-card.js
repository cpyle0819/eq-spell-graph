// <leveling-guide-card>, with `.setData(recipes, levelingCities, compatibility)`
// set as one atomic call. Renders the tradeskill's own hand-picked leveling
// path (recipe.levelingGuide === true, trades.js's own filter) in the same
// order src/graph.ts's getRecipes() already returns (trivial ascending) --
// this is the fixed reference "how do I level this skill from 0" answer,
// distinct from browsing/searching individual recipes (recipe-card.js's
// job), but the recipes themselves render through that exact same
// <recipe-card> component Browse mode uses (issue #67: previously a bespoke
// compact row here, which let the two views drift out of sync on a
// per-recipe feature -- variants and the ingredient-tree toggle both landed
// on recipe-card first and had to be re-added here by hand each time).
//
// `recipes` is RecipeSummary[]; `levelingCities` is TradeskillLevelingCities
// | null (src/graph.ts's getTradeskillLevelingCities(),
// decisions/city-alignment-good-evil.md) -- the top 3 cities by ingredient
// coverage to shop this guide's own ingredient set in; `compatibility` is
// TradeskillCompatibility | null (src/graph.ts's getTradeskillCompatibility(),
// decisions/tradeskill-compatibility-cross-trade-dependency.md) -- the other
// tradeskill that pairs best with this one. Both render as ledger rows
// inside the header panel's own parchment-scroll insert.
//
// The header + recommendations sit in the same console-row-plus-parchment-
// scroll shell every other card in this app uses (card-base.js/
// welcome-scroll.js) -- name-on-stone header, then a parchment insert with
// wood-dowel end caps for the actual content, rather than flat pill badges
// sitting directly on the stone panel (the look this replaced: it read as a
// generic modern dashboard chip cluster next to recipe-card's own scroll
// below it). The recipe-card list below the summary panel is plain block
// stacking with no panel of its own -- each recipe-card already brings its
// own version of this exact shell, so wrapping the list in a second stone
// panel would nest stone inside stone.
//
// Every per-recipe affordance (the "+ Add Ingredients" button, ingredient
// chips, "Show Ingredient Tree" toggle, alternate-recipe roster) is
// recipe-card's own -- nothing re-wired here. recipe-card's own
// "add-recipe-ingredients" CustomEvent is bubbles+composed, so it crosses
// straight out of both its own shadow root and this one to reach trades.js's
// listener on #trades-results without this component doing anything.
import { RESET_CSS } from "./reset.js";
import "./ledger-item.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
}
.guide-summary {
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  outline: 1px solid rgba(232, 168, 42, 0.22);
  outline-offset: -5px;
  border-top: 2px solid var(--gold);
  padding: 22px 26px;
  margin-bottom: 14px;
}
.guide-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
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

/* The parchment insert with wood-dowel end caps every card-base.js-derived
   card (and welcome-scroll.js standalone) already uses for its own body
   content -- duplicated here rather than imported since neither of those
   exports the raw CSS text, same "each shell owner keeps its own copy" call
   welcome-scroll.js already made rather than extending CardBase itself.
   Empty (nothing to recommend at all) renders nothing, the hidden attribute
   set from render() below -- an empty parchment strip would read as a
   mistake, not as "no recommendations right now." */
.guide-scroll {
  position: relative;
  margin-top: 18px;
  padding: 14px 22px;
  border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.guide-scroll[hidden] { display: none; }
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

.guide-section + .guide-section { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--parch-line); }
/* A real subheading for each mini-section, not a caption that reads as one
   more line of body copy -- previously 11px italic in the same muted
   --parch-ink-soft <ledger-item>'s own detail slot already uses, so "Best
   zones to buy..." barely stood out from the "3 of 5 ingredients" line
   right under it (same flaw a Toptal typographic-hierarchy piece calls out:
   without a real weight/color/case break, two adjacent text blocks read as
   one tier). Bold + uppercase + accent color now separates it clearly from
   both the ledger-item label (bold, but plain --parch-ink) and its detail
   (muted, but not bold) -- distinct enough for its own thing without
   competing with "Leveling Guide" itself for attention. */
.guide-section-caption {
  font-family: var(--font-display); font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--parch-accent);
  margin-bottom: 8px;
}

/* <ledger-item>'s own hairline divider (:host + :host) already separates
   rows -- this just resets the first row's top padding so it sits flush
   under the caption instead of matching every other row's spacing. */
.guide-section ledger-item:first-of-type { padding-top: 4px !important; }

/* <ledger-item>'s slotted <a> is light-DOM content one level past what its
   own ::slotted() rule can reach (single compound selector, no
   combinators) -- same fix zone-dossier.js's own ".quest-ledger a" rule
   applies for the identical reason, scoped to this shadow root instead. */
.guide-scroll a { color: inherit; text-decoration: none; border-bottom: 1px dotted var(--parch-accent); }
.guide-scroll a:hover, .guide-scroll a:focus-visible { color: var(--parch-accent); border-bottom-style: solid; }
.guide-scroll a:focus-visible { outline: 2px solid var(--parch-accent); outline-offset: 2px; border-radius: 1px; }

.recipe-empty { font-size: 12px; font-style: italic; color: var(--ink-muted); margin-top: 16px; }
`);

// Up to 3 <ledger-item> rows, highest ingredient coverage first -- the
// TradeskillLevelingCities.topCities src/graph.ts already returns in that
// order, so this just renders them, no re-sorting. No more per-alignment
// good/evil/neutral labels (decisions/city-alignment-good-evil.md's own
// update note) -- the classification is still computed on the backend, just
// not grouped by here; three cities of the same alignment can legitimately
// all show up if that's genuinely where the ingredients are sold. Links to
// the city's own best sub-zone (city.zoneLabel) even though the visible name
// is the real-world city (city.cityLabel) -- Freeport itself isn't a single
// zone maps.html can route to, only its three sub-zones are.
function zonesLedgerHtml(cities) {
  if (!cities?.topCities?.length) return "";
  const rows = cities.topCities
    .map((city) => {
      const title = `${city.ingredientCount} of this guide's ${cities.totalIngredients} vendor-sourceable ingredients are sold in ${city.cityLabel}`;
      return `
        <ledger-item title="${title}">
          <span slot="label"><a href="maps.html?to=${encodeURIComponent(city.zoneLabel)}">${city.cityLabel}</a></span>
          <span slot="detail">${city.ingredientCount} of ${cities.totalIngredients} ingredients</span>
        </ledger-item>
      `;
    })
    .join("");
  return `
    <div class="guide-section">
      <p class="guide-section-caption">Best zones to buy this guide's vendor-sourceable ingredients from:</p>
      ${rows}
    </div>
  `;
}

// TradeskillCompatibility (src/graph.ts's getTradeskillCompatibility(),
// decisions/tradeskill-compatibility-cross-trade-dependency.md) -- the other
// tradeskill that pairs best with this one, scored by *both* directions of
// ingredient/tool dependency combined, not just this guide's own. No
// compatible trade, or a tie between two, both read as "nothing to
// recommend" (mostCompatible is null either way) and render nothing, same
// convention zonesLedgerHtml uses. Deep-links to trades.html?tradeskill=,
// the same param applyQueryParams() (public/trades.js) already restores
// from ingredient-card.js's own cross-trade "Crafted In" links.
function compatibilityLedgerHtml(compatibility) {
  if (!compatibility?.mostCompatible) return "";
  const { tradeskill, fromThisGuide, fromPartnerGuide } = compatibility.mostCompatible;
  const shared = fromThisGuide + fromPartnerGuide;
  // The relationship is usually one-way in practice (this guide leans on
  // the partner's containers/ingredients, not the reverse) -- the tooltip
  // spells out both halves so a 0 on either side reads as a real fact, not
  // a rounding artifact of the combined count.
  const title = fromPartnerGuide
    ? `This guide needs ${fromThisGuide} ingredient(s)/tool(s) crafted via ${tradeskill}; ${tradeskill}'s own guide needs ${fromPartnerGuide} crafted via this trade in return.`
    : `This guide needs ${fromThisGuide} ingredient(s)/tool(s) crafted via ${tradeskill}.`;
  return `
    <div class="guide-section">
      <p class="guide-section-caption">Most compatible trade skill (heaviest ingredient/tool overlap, both directions):</p>
      <ledger-item title="${title}">
        <span slot="label"><a href="trades.html?tradeskill=${encodeURIComponent(tradeskill)}">${tradeskill}</a></span>
        <span slot="detail">${shared} ingredient/tool overlap</span>
      </ledger-item>
    </div>
  `;
}

class LevelingGuideCard extends HTMLElement {
  #recipes = [];
  #levelingCities = null;
  #compatibility = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="guide-summary">
          <div class="guide-header">
            <span class="guide-title">Leveling Guide</span>
            <span class="guide-count-badge"></span>
          </div>
          <div class="guide-scroll" hidden></div>
        </div>
        <div class="recipe-card-list"></div>
      `;
    }
    this.render();
  }

  // levelingCities is TradeskillLevelingCities (src/graph.ts) or null/
  // undefined (not yet fetched, or no tradeskill selected) -- either reads
  // the same as "nothing to recommend." compatibility is
  // TradeskillCompatibility or null/undefined, same convention.
  setData(recipes, levelingCities, compatibility) {
    this.#recipes = recipes;
    this.#levelingCities = levelingCities ?? null;
    this.#compatibility = compatibility ?? null;
    if (this.shadowRoot) this.render();
  }

  render() {
    const recipes = this.#recipes;
    this.shadowRoot.querySelector(".guide-count-badge").textContent = `${recipes.length} Recipe${recipes.length === 1 ? "" : "s"}`;

    const scrollEl = this.shadowRoot.querySelector(".guide-scroll");
    const html = zonesLedgerHtml(this.#levelingCities) + compatibilityLedgerHtml(this.#compatibility);
    scrollEl.innerHTML = html;
    scrollEl.hidden = !html;

    const listEl = this.shadowRoot.querySelector(".recipe-card-list");
    listEl.innerHTML = "";
    if (!recipes.length) {
      listEl.innerHTML = `<div class="recipe-empty">No recipes catalogued yet for this tradeskill.</div>`;
      return;
    }
    for (const recipe of recipes) {
      const card = document.createElement("recipe-card");
      card.setData(recipe);
      listEl.appendChild(card);
    }
  }
}

customElements.define("leveling-guide-card", LevelingGuideCard);
