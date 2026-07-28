// <recipe-card>, with `.setData(recipe)` set as one atomic call. One
// tradeskill recipe as its own card, in the same console-row + parchment-
// scroll shell every Class Browser/Quests card already uses (CardBase).
// Replaces tradeskill-dossier.js's combined recipe-row table (issue #32's
// second pass) -- see decisions/tradeskill-recipe-node-schema.md for the
// `recipe` node / `uses`/`produces`/`crafted_in` shapes rendered here.
// `recipe` is a RecipeSummary (src/graph.ts's getRecipes()).
//
// Craftable/Trivial badges: Trivial is the sourced fact (eqlwiki's own
// number), Craftable is success.p25, a computed estimate
// (recipeSuccessThresholds() in src/graph.ts) -- kept visually distinct
// (solid vs muted-outline) so they don't read as equally authoritative,
// the same call tradeskill-dossier.js's own badges made.
//
// Ingredient/produced-item chips reuse quest-shared.js's `.item-badge`
// styling and wireItemTooltips() rather than tradeskill-dossier.js's own
// bespoke `.ingredient-badge` -- same amber "item" language, one fewer
// near-duplicate CSS block. The produced item gets the identical chip, no
// "reward" color -- it's an ordinary item like any ingredient (decisions/
// tradeskill-recipe-node-schema.md); only the → arrow marks it as the
// output. No wiki link on the recipe's own name (unlike quest-card's
// wikiLink) -- eqlwiki has no per-recipe page, only one shared "Skill
// Brewing" table page (decisions/tradeskill-recipe-node-schema.md's
// sourcing note), so a guessed per-recipe URL would likely 404; each
// ingredient chip already links out to its own real item page instead.
import { CardBase, wikiUrl } from "./card-base.js";
import { QUEST_CARD_CSS, section, wireItemTooltips } from "./quest-shared.js";

function ingredientChip(item) {
  const qtyPrefix = item.quantity && item.quantity !== 1 ? `${item.quantity}x ` : "";
  return `<a class="spell-badge item-badge" data-item-id="${item.id}" href="${wikiUrl(item.label)}" target="_blank" rel="noopener">${qtyPrefix}${item.label}</a>`;
}

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
${QUEST_CARD_CSS}
.trivial-badge {
  color: var(--parch-bg);
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
  font-variant-numeric: tabular-nums;
}
/* Muted/outline where .trivial-badge is solid -- "trivial" is the hard
   sourced fact, "craftable" is a computed estimate, and the two shouldn't
   read as equally authoritative. */
.craftable-badge {
  color: var(--parch-ink-soft);
  background: rgba(122, 96, 42, 0.08);
  border: 1px solid var(--parch-line);
  font-variant-numeric: tabular-nums;
  cursor: help;
}
.recipe-formula { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.recipe-arrow { color: var(--parch-accent); font-weight: 700; }
`);

class RecipeCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #recipe = null;

  setData(recipe) {
    this.#recipe = recipe;
    if (this.shadowRoot) this.render();
  }

  wireEvents() {
    wireItemTooltips(this.shadowRoot, (id) => {
      const r = this.#recipe;
      if (!r) return undefined;
      if (r.produces?.id === id) return r.produces;
      return r.uses.find((i) => i.id === id);
    });
  }

  render() {
    const recipe = this.#recipe;
    if (!recipe) return;

    const uses = recipe.uses.map(ingredientChip).join("");
    const produces = recipe.produces ? ingredientChip(recipe.produces) : "";
    const formula = `${uses}${produces ? `<span class="recipe-arrow">→</span>${produces}` : ""}`;

    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${recipe.label}</h3></div>
      <div class="spell-scroll">
        <div class="spell-badges">
          <span class="spell-badge trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${recipe.trivial}</span>
          <span class="spell-badge craftable-badge" title="Skill level at which this recipe becomes reasonably attemptable (~25% success)">Craftable ${recipe.success.p25}+</span>
          ${recipe.container ? `<span class="spell-badge skill-badge">Crafted in ${recipe.container.label}</span>` : ""}
        </div>
        ${section("Formula", `<div class="quest-section-body recipe-formula">${formula}</div>`)}
      </div>
    `;
  }
}

customElements.define("recipe-card", RecipeCard);
