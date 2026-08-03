/**
 * Migration 408: Blacksmithing's four Shaped Cookie Cutters (issue #48
 * follow-up to 375, which explicitly deferred these -- "the recipe list's
 * own 'Shaped Mold' component isn't wiki-linked, suggesting the wiki's own
 * author wasn't sure of the real item -- skipped rather than guessed at").
 * Each item's own eqlwiki page now names its mold explicitly (Animal/
 * Barbarian/Gnome/Troll Cookie Mold), resolving that blocker. Surfaced while
 * researching Pottery (issue #51), which crafts the same four items via a
 * different recipe -- this migration gives each one a real Blacksmithing
 * anchor so Pottery's own version can `variant_of` it instead of standing
 * alone.
 *
 * Also adds `item:metal-bits`, which migration 373's own `recipe:metal-bits`
 * has pointed a `produces` edge at since it was written, but never actually
 * created as a node -- a pre-existing dangling edge. These four recipes are
 * the first new ones in this migration to `uses` it, so the gap needs
 * fixing here regardless.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title query), not a summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, "container:forge", "crafted_in");
}

addItem("item:metal-bits", "Metal Bits", { weight: 0.1, size: "Tiny" });

addItem("item:animal-cookie-mold", "Animal Cookie Mold");
addItem("item:barbarian-cookie-mold", "Barbarian Cookie Mold");
addItem("item:gnome-cookie-mold", "Gnome Cookie Mold");
addItem("item:troll-cookie-mold", "Troll Cookie Mold");

addItem("item:animal-shaped-cookie-cutter", "Animal Shaped Cookie Cutter", { weight: 0.1, size: "Small" });
addItem("item:barbarian-shaped-cookie-cutter", "Barbarian Shaped Cookie Cutter", { weight: 0.1, size: "Small" });
addItem("item:gnome-shaped-cookie-cutter", "Gnome Shaped Cookie Cutter", { weight: 0.1, size: "Small" });
addItem("item:troll-shaped-cookie-cutter", "Troll Shaped Cookie Cutter", { weight: 0.1, size: "Small" });

addRecipe("recipe:animal-shaped-cookie-cutter", "Animal Shaped Cookie Cutter", 56,
  [{ id: "item:animal-cookie-mold" }, { id: "item:metal-bits" }, { id: "item:water-flask" }], "item:animal-shaped-cookie-cutter");
addRecipe("recipe:barbarian-shaped-cookie-cutter", "Barbarian Shaped Cookie Cutter", 56,
  [{ id: "item:barbarian-cookie-mold" }, { id: "item:metal-bits" }, { id: "item:water-flask" }], "item:barbarian-shaped-cookie-cutter");
addRecipe("recipe:gnome-shaped-cookie-cutter", "Gnome Shaped Cookie Cutter", 56,
  [{ id: "item:gnome-cookie-mold" }, { id: "item:metal-bits" }, { id: "item:water-flask" }], "item:gnome-shaped-cookie-cutter");
addRecipe("recipe:troll-shaped-cookie-cutter", "Troll Shaped Cookie Cutter", 56,
  [{ id: "item:troll-cookie-mold" }, { id: "item:metal-bits" }, { id: "item:water-flask" }], "item:troll-shaped-cookie-cutter");

save();
console.log(`Migration 408 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Blacksmithing's Shaped Cookie Cutters`);
