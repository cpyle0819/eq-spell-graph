// <recipe-card>, with `.setData(recipe)` set as one atomic call. One
// tradeskill recipe, in the same console-row + parchment-scroll shell every
// Class Browser/Quests card uses (CardBase). `recipe` is a RecipeSummary
// (src/graph.ts's getRecipes()) -- see decisions/
// tradeskill-recipe-node-schema.md for the `recipe` node / `uses`/
// `produces`/`crafted_in` shapes rendered here.
//
// No wiki link on the recipe's own name (unlike quest-card's wikiLink) --
// eqlwiki has no per-recipe page, only one shared "Skill Brewing" table
// page (decisions/tradeskill-recipe-node-schema.md's sourcing note), so a
// guessed per-recipe URL would likely 404; each ingredient chip already
// links out to its own real item page instead.
import { CardBase } from "./card-base.js";
import { QUEST_CARD_CSS, section } from "./quest-shared.js";
import { RECIPE_ROW_CSS, recipeBadgesHtml, recipeFormulaHtml, recipeTreeToggleButtonHtml, recipeTreeContainerHtml, wireRecipeTreeToggle, variantsRosterHtml } from "./tradeskill-shared.js";
import { hydrateItemChips } from "./item-chip.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`${QUEST_CARD_CSS}\n${RECIPE_ROW_CSS}`);

class RecipeCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #recipe = null;

  setData(recipe) {
    this.#recipe = recipe;
    if (this.shadowRoot) this.render();
  }

  // Delegated on shadowRoot (not the button directly) so it keeps working
  // across render() rebuilding the header's innerHTML -- same pattern as
  // ingredient-card.js's own wireEvents(). Dispatches the same
  // "add-recipe-ingredients" event leveling-guide-card.js's own
  // "+ Add Ingredients" button does (trades.js already listens for it on
  // #trades-results, regardless of which card type raised it), so Browse's
  // recipe cards get the same "add every ingredient at once" affordance
  // Guide already had (issue #56).
  wireEvents() {
    this.shadowRoot.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-shopping-btn");
      if (!btn) return;
      this.dispatchEvent(new CustomEvent("add-recipe-ingredients", {
        bubbles: true, composed: true,
        detail: { items: this.#recipe.uses },
      }));
    });
    wireRecipeTreeToggle(this.shadowRoot);
  }

  render() {
    const recipe = this.#recipe;
    if (!recipe) return;

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        <h3>${recipe.label}</h3>
        <button type="button" class="add-shopping-btn">+ Add Ingredients</button>
        ${recipeTreeToggleButtonHtml(recipe)}
      </div>
      <div class="spell-scroll">
        <div class="spell-badges">${recipeBadgesHtml(recipe)}</div>
        ${section("Formula", `<div class="quest-section-body recipe-formula">${recipeFormulaHtml(recipe)}</div>${recipeTreeContainerHtml(recipe)}`)}
        ${section(`Alternate Recipes (${recipe.variants?.length ?? 0})`, variantsRosterHtml(recipe.variants))}
      </div>
    `;
    hydrateItemChips(this.shadowRoot, (id) => {
      if (recipe.produces?.id === id) return recipe.produces;
      const own = recipe.uses.find((i) => i.id === id);
      if (own) return own;
      for (const variant of recipe.variants ?? []) {
        if (variant.produces?.id === id) return variant.produces;
        const ing = variant.uses.find((i) => i.id === id);
        if (ing) return ing;
      }
      return undefined;
    });
  }
}

customElements.define("recipe-card", RecipeCard);
