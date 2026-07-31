// Shared rendering helpers for recipe-card.js and leveling-guide-card.js --
// both render a recipe's Trivial/Craftable badges and its ingredient
// formula, one as a full standalone card, the other as a compact row inside
// one combined card. Kept separate from quest-shared.js (imported here
// alongside it) since these are tradeskill/recipe-domain specific, not
// quest-domain.
import { itemChipTag } from "./item-chip.js";

// Trivial is the sourced fact (eqlwiki's own number); Craftable is
// success.p25, a computed estimate (recipeSuccessThresholds() in
// src/graph.ts). Kept visually distinct -- solid vs muted outline -- so
// they don't read as equally authoritative.
export const RECIPE_ROW_CSS = `
.trivial-badge {
  color: var(--parch-bg);
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
  font-variant-numeric: tabular-nums;
}
.craftable-badge {
  color: var(--parch-ink-soft);
  background: rgba(122, 96, 42, 0.08);
  border: 1px solid var(--parch-line);
  font-variant-numeric: tabular-nums;
  cursor: help;
}
.recipe-formula { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.recipe-arrow { color: var(--parch-accent); font-weight: 700; }

/* Same look as ingredient-card.js's own "+ Shopping List" button -- both
   are a quiet secondary action on a parchment card, not a primary button.
   Shared here since both recipe-card.js and leveling-guide-card.js need
   the identical "+ Add Ingredients" affordance (issue #56). */
.add-shopping-btn {
  font-size: 11px; color: var(--gold); background: none; border: none;
  padding: 0; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: var(--font-body);
}
.add-shopping-btn:hover, .add-shopping-btn:focus-visible { text-decoration: underline; }

/* Alternate ingredient combos for the same produced item (decisions/
   tradeskill-recipe-node-schema.md's "Recipe variants") -- same <details>/
   <summary> disclosure pattern as quest-group-card.js's own roster, reused
   here rather than duplicated since both are "one card, N expandable
   alternate rows" shapes. */
.variant-roster { display: flex; flex-direction: column; }
.variant-row { border-top: 1px solid var(--parch-line); }
.variant-row:first-child { border-top: none; }
.variant-row > summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 9px 2px;
}
.variant-row > summary::-webkit-details-marker { display: none; }
.variant-row > summary::before {
  content: "▾"; font-size: 9px; color: var(--parch-ink-soft); flex-shrink: 0;
  transition: transform 0.15s ease;
}
.variant-row:not([open]) > summary::before { transform: rotate(-90deg); }
.variant-row > summary:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 2px; }
.variant-row-body { padding: 0 2px 14px 26px; }
`;

export function recipeBadgesHtml(recipe) {
  // "or" joins real alternatives (Baking's Batwing Crunchies: an Oven or a
  // Spit both genuinely work), not a list of requirements to gather at once.
  const containerLabel = recipe.containers?.length ? recipe.containers.map((c) => c.label).join(" or ") : "";
  const containerBadge = containerLabel ? `<span class="spell-badge skill-badge">Crafted in ${containerLabel}</span>` : "";
  return `
    <span class="spell-badge trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${recipe.trivial}</span>
    <span class="spell-badge craftable-badge" title="Skill level at which this recipe becomes reasonably attemptable (~25% success)">Craftable ${recipe.success.p25}+</span>
    ${containerBadge}
  `;
}

// Ingredients deep-link to their own ingredient-card on the Ingredients tab
// (same trades.html `?type=`/`?search=` convention as ingredient-card.js's
// own "Used In" chips, the reverse direction of this same link) and get the
// "+" shopping-list button (item-chip.js's `shoppingList` option) -- the
// produced item gets neither, since it's the recipe's own result, not
// something to go shop for. Its own stats (AC, class restriction, etc.) are
// left to its chip's hover tooltip (item-chip.js's itemStats()) rather than
// spelled out again inline here -- one source of truth, not two.
export function recipeFormulaHtml(recipe) {
  const uses = recipe.uses.map((item) => itemChipTag(item, { navHref: `trades.html?type=ingredients&search=${encodeURIComponent(item.label)}`, shoppingList: true })).join("");
  const produces = recipe.produces ? itemChipTag(recipe.produces) : "";
  return `${uses}${produces ? `<span class="recipe-arrow">→</span>${produces}` : ""}`;
}

// One expandable row per alternate ingredient combo that produces the same
// item as the card's own primary recipe (decisions/
// tradeskill-recipe-node-schema.md's "Recipe variants" -- e.g. Baking's
// classic vs. Velious Beer Braised Mammoth). The primary recipe's own
// formula already renders in the card's main Formula section, so this
// roster never repeats it -- `recipe.variants` (getRecipes() in
// src/graph.ts) is already just the alternates.
function variantRow(variant) {
  return `
    <details class="variant-row">
      <summary>
        <span class="spell-badge trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${variant.trivial}</span>
        <span class="recipe-formula">${recipeFormulaHtml(variant)}</span>
      </summary>
      <div class="variant-row-body">
        <div class="spell-badges">${recipeBadgesHtml(variant)}</div>
      </div>
    </details>
  `;
}

export function variantsRosterHtml(variants) {
  return variants?.length ? `<div class="variant-roster">${variants.map(variantRow).join("")}</div>` : "";
}
