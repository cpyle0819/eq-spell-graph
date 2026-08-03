# Recipe ingredient tree: fetched on demand, one toggle expands it all

Anywhere a recipe renders (`recipe-card.js`'s main Formula section and its
own `variantsRosterHtml` alternates, `leveling-guide-card.js`'s per-recipe
rows), a "Show Ingredient Tree" toggle appears whenever at least one of its
ingredients is itself craftable — clicking it expands every craftable
ingredient recursively at once (one toggle for the whole recipe, not a
control per ingredient), showing the full multi-level breakdown in place of
the flat one-line formula.

## Server-side recursive resolution, not client-side chaining

`getRecipeTree(recipeId)` (`src/graph.ts`) walks the whole tree in one call
— for each ingredient with `craftable: true` (a new field on `RecipeIngredient`,
computed alongside `uses`/`produces` the same read-time way as everything
else in `tradeskill-recipe-node-schema.md`), it resolves the producing
recipe (`pickPrimaryProducer()`, same vendor-sourceable/trivial tiebreak
`getRecipes()` already uses to pick a variant family's primary combo) and
recurses into *its* own ingredients. `RECIPE_TREE_DEPTH_BUDGET` (6) is a
safety backstop, not a tuned gameplay value, and a `visiting` set guards
against a genuine cycle — real EQ recipe data doesn't nest anywhere near
that deep, but nothing else in this graph enforces acyclicity across
`produces`/`uses` edges, so the guard costs little.

This is deliberately not scoped to any one tradeskill: a crafted ingredient
can be produced by a recipe belonging to a completely different trade (a
Blacksmithing recipe using Water Flask, itself craftable via Brewing) —
`getRecipeTree()` follows the ingredient wherever its own producing recipe
actually lives, and `/api/recipe-tree?id=` fetches by recipe id alone, no
`tradeskill` param.

## Fetched lazily per recipe, not embedded in every `/api/recipes` response

Most recipes' trees are never expanded, and walking every recipe's full
nesting on every `/api/recipes` call would be wasted work — `/api/
recipe-tree?id=` is a separate route, called only when a toggle is first
opened. `tradeskill-shared.js` keeps a module-level `treeCache` (recipe id
→ fetched tree, shared across every card on the page since both
`recipe-card.js` and `leveling-guide-card.js` import the same module) so
toggling a recipe closed and back open, or expanding the same recipe from
two different views, never re-fetches.

## External-trade indicator

A nested recipe gets a small badge naming its own `tradeskill` whenever that
differs from the *root* recipe's own tradeskill (the one the toggle was
opened from) — not the immediate parent's, so a chain that wanders through
one tradeskill and back into the starting one still reads as "home," not
falsely flagged. This answers "is this something I need to go craft in a
different trade entirely," which is what actually matters to a player
looking at the tree, not "did the trade change one level up."
