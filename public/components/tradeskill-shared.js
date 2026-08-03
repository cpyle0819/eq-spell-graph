// Shared rendering helpers for recipe-card.js, which renders a recipe's
// Trivial/Craftable badges, ingredient formula, ingredient tree, and
// alternate-recipe roster -- both Browse mode and the Leveling Guide render
// recipes through this exact same component (leveling-guide-card.js just
// renders a filtered/ordered subset of <recipe-card>s, see issue #67), so
// there's no second caller here anymore. Kept separate from quest-shared.js
// (imported here alongside it) since these are tradeskill/recipe-domain
// specific, not quest-domain.
import { itemChipTag, hydrateItemChips } from "./item-chip.js";

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
   are a quiet secondary action on a parchment card, not a primary button. */
.add-shopping-btn {
  font-size: 11px; color: var(--gold); background: none; border: none;
  padding: 0; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: var(--font-body);
}
.add-shopping-btn:hover, .add-shopping-btn:focus-visible { text-decoration: underline; }

/* Ingredient tree (decisions/recipe-ingredient-tree.md) -- a "Show
   Ingredient Tree" toggle only rendered when at least one ingredient is
   itself craftable (RecipeIngredient.craftable), expanding into the full
   recursive breakdown for every craftable ingredient at once. Same quiet
   text-button look as .add-shopping-btn, just a second one beside it. */
.tree-toggle-btn {
  font-size: 11px; color: var(--gold); background: none; border: none;
  padding: 0; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: var(--font-body);
  /* A native <button>'s own UA default centers its text and (inside a flex
     column ancestor with the usual align-items: stretch) stretches to the
     full row width -- either alone would visually shove "Show Ingredient
     Tree" away from whatever it's meant to sit beside. align-self here
     keeps its width to its own content regardless of the parent's flex
     direction, so this button is safe to drop into any layout context. */
  text-align: left; align-self: flex-start;
}
.tree-toggle-btn:hover, .tree-toggle-btn:focus-visible { text-decoration: underline; }
.recipe-tree-container[hidden] { display: none; }
.recipe-tree-container { margin-top: 8px; }
.recipe-tree-container .loading { font-size: 11px; font-style: italic; color: var(--parch-ink-soft); }
/* One <ul> per level -- nesting depth reads from indentation alone (a
   left border on each level, not a numeric label), same "the structure
   itself is the explanation" call quest-group-card.js's own roster makes. */
.tree-list { list-style: none; padding-left: 16px; border-left: 1px dashed var(--parch-line); }
.tree-list.tree-list-root { padding-left: 0; border-left: none; }
.tree-item { padding: 3px 0; }
.tree-item-crafted-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
/* External-trade indicator (issue: "trades external to the active one
   should be visually indicated") -- a small amber badge naming the other
   tradeskill, only rendered when a nested recipe's own tradeskill differs
   from the recipe the tree toggle was opened from. */
.tree-trade-badge {
  font-size: 10px; padding: 1px 6px; border-radius: 3px;
  background: rgba(122, 96, 42, 0.14); border: 1px solid var(--parch-accent);
  color: var(--parch-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
}
.tree-crafted-label { font-size: 11px; font-style: italic; color: var(--parch-ink-soft); }

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

// The "Show Ingredient Tree" toggle and its own (initially empty/hidden)
// render target are two separate pieces, not one combined block -- the
// button reads best sitting right next to a recipe's own "+ Add
// Ingredients" (recipe-card.js's spell-header), while the expanded tree
// itself needs the full row width below the formula, not squeezed into a
// header. wireRecipeTreeToggle()
// below finds the container via `rootEl.querySelector`, not DOM adjacency,
// so the two can live in entirely different parts of a card's markup.
// Both are absent entirely when `recipe.uses` has no craftable ingredient
// at all (RecipeIngredient.craftable, src/graph.ts), same "nothing to
// expand into" reasoning city-alignment-good-evil.md's own null badges use.
// `recipe.id` is the exact recipe/variant combo this toggle belongs to --
// wireRecipeTreeToggle fetches that id's own tree, not the card's top-level
// recipe, so a variant row's own toggle expands *that* combo's ingredients.
export function recipeTreeToggleButtonHtml(recipe) {
  if (!recipe.uses.some((ing) => ing.craftable)) return "";
  return `<button type="button" class="tree-toggle-btn" data-tree-recipe-id="${recipe.id}">Show Ingredient Tree ▾</button>`;
}

export function recipeTreeContainerHtml(recipe) {
  if (!recipe.uses.some((ing) => ing.craftable)) return "";
  return `<div class="recipe-tree-container" data-tree-recipe-id="${recipe.id}" hidden></div>`;
}

// One <li> per ingredient -- a plain chip for a bought/foraged/dropped one,
// or (when `craftedBy` is present, only ever true for a craftable ingredient
// within RECIPE_TREE_DEPTH_BUDGET/cycle-free, src/graph.ts's
// getRecipeTree()) the chip plus its own nested formula one level deeper.
// `activeTradeskill` is always the *root* recipe's own tradeskill (the one
// the toggle was opened from), not the immediate parent's -- so a
// three-level chain that wanders back into the starting tradeskill after a
// detour through another one still reads as "back home," not falsely
// flagged external.
function treeItemHtml(ing, activeTradeskill) {
  const chip = itemChipTag(ing, { navHref: `trades.html?type=ingredients&search=${encodeURIComponent(ing.label)}`, shoppingList: true });
  if (!ing.craftedBy) return `<li class="tree-item">${chip}</li>`;
  const sub = ing.craftedBy;
  const tradeBadge = sub.tradeskill !== activeTradeskill ? `<span class="tree-trade-badge">${sub.tradeskill}</span>` : "";
  return `
    <li class="tree-item tree-item-crafted">
      <div class="tree-item-crafted-header">
        ${chip}
        <span class="tree-crafted-label">crafted from (Triv ${sub.trivial})</span>
        ${tradeBadge}
      </div>
      <ul class="tree-list">${sub.uses.map((u) => treeItemHtml(u, activeTradeskill)).join("")}</ul>
    </li>
  `;
}

// Renders a fetched RecipeTreeNode (src/graph.ts's getRecipeTree()) into the
// same shape recipeFormulaHtml's flat one-liner shows, just recursively
// expanded -- `activeTradeskill` is the recipe the toggle itself belongs to
// (recipe.tradeskill), so every nested tree-trade-badge is relative to where
// the visitor actually started, not to whichever branch they're currently
// looking at.
export function recipeTreeHtml(treeNode, activeTradeskill) {
  return `<ul class="tree-list tree-list-root">${treeNode.uses.map((u) => treeItemHtml(u, activeTradeskill)).join("")}</ul>`;
}

// Walks a fetched tree collecting every ingredient it mentions at any depth,
// keyed by id -- hydrateItemChips() needs this to resolve every chip's own
// hover stats in one pass, the same "resolve straight to what the UI wants"
// call recipe-card.js's own render() already makes for its top-level/
// variant ingredients.
function flattenTreeItems(node, acc) {
  for (const ing of node.uses) {
    acc.set(ing.id, ing);
    if (ing.craftedBy) flattenTreeItems(ing.craftedBy, acc);
  }
}

// recipeId -> RecipeTreeNode | Promise<RecipeTreeNode | undefined>, shared
// across every recipe-card on the page (Browse and the Leveling Guide alike,
// since the guide renders its own recipes through this exact same
// component) -- a given recipe's own tree never changes within a session, so
// toggling it closed and back open, or expanding the same recipe from two
// different views, never re-fetches. Caching the in-flight promise (not just
// the resolved value) means a second click while the first fetch is still
// pending reuses it instead of firing a duplicate request.
const treeCache = new Map();

function fetchRecipeTree(recipeId) {
  if (!treeCache.has(recipeId)) {
    treeCache.set(recipeId, fetch(`api/recipe-tree?id=${encodeURIComponent(recipeId)}`).then((r) => r.json()));
  }
  return treeCache.get(recipeId);
}

// Shared click-delegation for every ".tree-toggle-btn" under `rootEl` --
// call once per component (recipe-card.js wires it on its own shadowRoot,
// same delegation pattern its other click handlers already use). Fetches
// lazily on first open (not pre-fetched with
// the rest of a recipe's own data, since most trees are never expanded);
// toggling closed again just hides the already-rendered container rather
// than discarding it, so re-opening is instant.
export function wireRecipeTreeToggle(rootEl) {
  rootEl.addEventListener("click", async (e) => {
    const btn = e.target.closest(".tree-toggle-btn");
    if (!btn) return;
    const recipeId = btn.dataset.treeRecipeId;
    const container = rootEl.querySelector(`.recipe-tree-container[data-tree-recipe-id="${CSS.escape(recipeId)}"]`);
    if (!container) return;

    if (!container.hidden) {
      container.hidden = true;
      btn.textContent = "Show Ingredient Tree ▾";
      return;
    }

    if (!container.dataset.loaded) {
      container.innerHTML = `<div class="loading">Loading...</div>`;
      container.hidden = false;
      const tree = await fetchRecipeTree(recipeId);
      if (!tree) {
        container.innerHTML = `<div class="loading">Couldn't load this recipe's ingredient tree.</div>`;
        container.dataset.loaded = "true";
        return;
      }
      container.innerHTML = recipeTreeHtml(tree, tree.tradeskill);
      const itemsById = new Map();
      flattenTreeItems(tree, itemsById);
      hydrateItemChips(container, (id) => itemsById.get(id));
      container.dataset.loaded = "true";
    }

    container.hidden = false;
    btn.textContent = "Hide Ingredient Tree ▴";
  });
}

// One expandable row per alternate ingredient combo that produces the same
// item as the card's own primary recipe (decisions/
// tradeskill-recipe-node-schema.md's "Recipe variants" -- e.g. Baking's
// classic vs. Velious Beer Braised Mammoth). The primary recipe's own
// formula already renders in the card's main Formula section, so this
// roster never repeats it -- `recipe.variants` (getRecipes() in
// src/graph.ts) is already just the alternates.
// The toggle button stays out of <summary> deliberately -- a click
// anywhere inside a <summary> (including on a nested button) also toggles
// the parent <details> open/closed via the platform's own native behavior,
// so a button living there would fire two effects at once. Living in
// .variant-row-body instead means it's only visible once this variant is
// already expanded, which is a fine place for it -- a collapsed variant row
// has nothing to expand into further yet anyway.
function variantRow(variant) {
  return `
    <details class="variant-row">
      <summary>
        <span class="spell-badge trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${variant.trivial}</span>
        <span class="recipe-formula">${recipeFormulaHtml(variant)}</span>
      </summary>
      <div class="variant-row-body">
        <div class="spell-badges">${recipeBadgesHtml(variant)}</div>
        ${recipeTreeToggleButtonHtml(variant)}
        ${recipeTreeContainerHtml(variant)}
      </div>
    </details>
  `;
}

export function variantsRosterHtml(variants) {
  return variants?.length ? `<div class="variant-roster">${variants.map(variantRow).join("")}</div>` : "";
}
