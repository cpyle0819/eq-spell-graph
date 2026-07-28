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
`;

export function recipeBadgesHtml(recipe) {
  const containerBadge = recipe.container ? `<span class="spell-badge skill-badge">Crafted in ${recipe.container.label}</span>` : "";
  return `
    <span class="spell-badge trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${recipe.trivial}</span>
    <span class="spell-badge craftable-badge" title="Skill level at which this recipe becomes reasonably attemptable (~25% success)">Craftable ${recipe.success.p25}+</span>
    ${containerBadge}
  `;
}

// Ingredients deep-link to their own ingredient-card on the Ingredients tab
// (same trades.html `?type=`/`?search=` convention as ingredient-card.js's
// own "Used In" chips, the reverse direction of this same link) -- the
// produced item doesn't, since it's the recipe's own result, not something
// to go look up ingredient-side.
export function recipeFormulaHtml(recipe) {
  const uses = recipe.uses.map((item) => itemChipTag(item, { navHref: `trades.html?type=ingredients&search=${encodeURIComponent(item.label)}` })).join("");
  const produces = recipe.produces ? itemChipTag(recipe.produces) : "";
  return `${uses}${produces ? `<span class="recipe-arrow">→</span>${produces}` : ""}`;
}
