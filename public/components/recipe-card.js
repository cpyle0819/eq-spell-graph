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
//
// A "Where to Buy" section renders a recipe's hand-authored
// RecipeSummary.guide (an alignment-branched walkthrough, e.g. Baking's
// Batwing Pie) when one exists (tradeskill-shared.js's recipeGuideHtml).
// Only a small, curated set of levelingGuide recipes has one; every other
// recipe (including most other levelingGuide recipes) shows no such
// section at all. A generic dump of every vendor who happens to sell a
// common ingredient anywhere in the game is not a usable answer, so
// absence of a real guide means absence of the section, not a fallback
// listing.
import { CardBase } from "./card-base.js";
import { QUEST_CARD_CSS, section } from "./quest-shared.js";
import { RECIPE_ROW_CSS, recipeBadgesHtml, recipeFormulaHtml, recipeTreeToggleButtonHtml, recipeTreeContainerHtml, wireRecipeTreeToggle, variantsRosterHtml, recipeGuideHtml } from "./tradeskill-shared.js";
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
  // ingredient-card.js's own wireEvents(). Dispatches a bubbling+composed
  // "add-recipe-ingredients" CustomEvent (detail: { items: recipe.uses }),
  // same convention as ingredient-card.js's own "add-shopping-item" --
  // trades.js listens for it on #trades-results regardless of which card
  // raised it, including one rendered inside leveling-guide-card.js's own
  // shadow root (issue #67: the guide renders its recipes through this
  // exact component now, not a bespoke row of its own).
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

    const whereToBuyBody = recipeGuideHtml(recipe);

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        <h3>${recipe.label}</h3>
        <button type="button" class="add-shopping-btn">+ Add Ingredients</button>
        ${recipeTreeToggleButtonHtml(recipe)}
      </div>
      <div class="spell-scroll">
        <div class="spell-badges">${recipeBadgesHtml(recipe)}</div>
        ${section("Formula", `<div class="quest-section-body recipe-formula">${recipeFormulaHtml(recipe)}</div>${recipeTreeContainerHtml(recipe)}`)}
        ${section("Where to Buy", whereToBuyBody ? `<div class="quest-section-body">${whereToBuyBody}</div>` : "")}
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
