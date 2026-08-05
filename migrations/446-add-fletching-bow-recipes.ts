/**
 * Migration 446 (issue #49, batch 5/N): Fletching's bow recipes -- 63
 * distinct bow items and recipes from eqlwiki's own "Bow Recipes" table
 * (matches the page's own stated "63 bow combinations"), plus the separate
 * quested Trueshot Longbow recipe.
 *
 * **The table's 27 all-Shadewood-staff rows are excluded** (project owner
 * decision, 2026-08-05): unlike every other wood tier, those rows render
 * greyed out with unlinked item names and a placeholder "<250" trivial
 * instead of a real number, and Shadewood Bow Staff's own Cost is listed as
 * "?" -- the same "don't fabricate a value for data eqlwiki itself flags as
 * unconfirmed" call as Tailoring's No-Fail exclusions
 * (decisions/tradeskill-recipe-node-schema.md).
 *
 * Unlike arrows (migration 445), every one of these 63 combos gets its own
 * fully distinct item name (wood tier + Rough/Carved/Shaped + 0/1-Cam/
 * Compound + string all fold into the name), so there's no nock-style
 * variant-family ambiguity here -- each recipe is a standalone item, and
 * `range` is a real, unambiguous per-item fact (unlike arrows, where one
 * name spans multiple nock-dependent ranges). WT 4.0 / Size Large / Class
 * WAR PAL RNG SHD ROG / Skill Archery is uniform across every tier (checked
 * via a Hickory, an Oak 1-Cam, and a Darkwood Compound item page -- the
 * cheapest and most expensive real tiers -- all three identical), matching
 * this graph's pre-existing bow items (Longbow, Bow of the Huntsman).
 *
 * **Tools are a real ingredient slot but are never actually consumed.**
 * Skill Fletching's own Bow Details section states it outright: "Regardless
 * of success or failure the staff, string, and cams are lost but tools will
 * always be returned." Whittling Blade/Planing Tool still get a `uses` edge
 * here (a shopping list still needs to know one is required to craft the
 * recipe), it's just a one-time purchase rather than a per-combine
 * consumable -- noted here in prose rather than as a new edge attribute,
 * since no other tradeskill recipe has needed to distinguish "used" from
 * "consumed" yet.
 *
 * **Trueshot Longbow** (trivial 235, RNG-only) is a genuinely different
 * recipe: it's not part of the wood/string/tool/cam combinatorial matrix at
 * all, and 3 of its 4 ingredients (Treant Bow Staff, Dwarven Wire, Micro
 * Servo) are quest rewards from the Trueshot Longbow Quest / Tumpy Tonics,
 * not modeled elsewhere in this graph. Per Pottery's own precedent
 * (decisions/tradeskill-recipe-node-schema.md), each gets a plain `item`
 * node with a `source` field describing how it's actually obtained rather
 * than fabricating quest chains; only Planing Tool (already a real item
 * here) is a normal ingredient reference.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (`action=query&prop=revisions`), not WebFetch's summarizer -- same bar as
 * every tradeskill before this one.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let recipesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({
    id,
    label,
    type: "item",
    weight: 4.0,
    size: "Large",
    slots: ["Range"],
    skill: "Archery",
    classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"],
    ...opts,
  });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, craftedIn: string) {
  addNode({ id, label, type: "recipe", tradeskill: "Fletching", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, craftedIn, "crafted_in");
}

addItem("item:rough-hickory-recurve-bow-hemp", "Rough Hickory Recurve Bow (Hemp)", { damage: 10, delay: 50, range: 50 });
addItem("item:rough-hickory-recurve-bow-linen", "Rough Hickory Recurve Bow (Linen)", { damage: 9, delay: 46, range: 50 });
addItem("item:rough-hickory-recurve-bow-silk", "Rough Hickory Recurve Bow (Silk)", { damage: 8, delay: 42, range: 50 });
addItem("item:rough-elm-recurve-bow-hemp", "Rough Elm Recurve Bow (Hemp)", { damage: 13, delay: 51, range: 75 });
addItem("item:rough-elm-recurve-bow-linen", "Rough Elm Recurve Bow (Linen)", { damage: 12, delay: 47, range: 75 });
addItem("item:rough-elm-recurve-bow-silk", "Rough Elm Recurve Bow (Silk)", { damage: 11, delay: 43, range: 75 });
addItem("item:carved-elm-recurve-bow-hemp", "Carved Elm Recurve Bow (Hemp)", { damage: 12, delay: 47, range: 75 });
addItem("item:carved-elm-recurve-bow-linen", "Carved Elm Recurve Bow (Linen)", { damage: 11, delay: 43, range: 75 });
addItem("item:carved-elm-recurve-bow-silk", "Carved Elm Recurve Bow (Silk)", { damage: 10, delay: 39, range: 75 });
addItem("item:rough-ashwood-recurve-bow-hemp", "Rough Ashwood Recurve Bow (Hemp)", { damage: 16, delay: 58, range: 100 });
addItem("item:rough-ashwood-recurve-bow-linen", "Rough Ashwood Recurve Bow (Linen)", { damage: 15, delay: 54, range: 100 });
addItem("item:rough-ashwood-recurve-bow-silk", "Rough Ashwood Recurve Bow (Silk)", { damage: 14, delay: 50, range: 100 });
addItem("item:carved-ashwood-recurve-bow-hemp", "Carved Ashwood Recurve Bow (Hemp)", { damage: 15, delay: 54, range: 100 });
addItem("item:carved-ashwood-recurve-bow-linen", "Carved Ashwood Recurve Bow (Linen)", { damage: 14, delay: 50, range: 100 });
addItem("item:carved-ashwood-recurve-bow-silk", "Carved Ashwood Recurve Bow (Silk)", { damage: 13, delay: 46, range: 100 });
addItem("item:shaped-ashwood-recurve-bow-hemp", "Shaped Ashwood Recurve Bow (Hemp)", { damage: 14, delay: 49, range: 100 });
addItem("item:shaped-ashwood-recurve-bow-linen", "Shaped Ashwood Recurve Bow (Linen)", { damage: 13, delay: 45, range: 100 });
addItem("item:shaped-ashwood-recurve-bow-silk", "Shaped Ashwood Recurve Bow (Silk)", { damage: 12, delay: 41, range: 100 });
addItem("item:rough-oak-recurve-bow-hemp", "Rough Oak Recurve Bow (Hemp)", { damage: 21, delay: 65, range: 125 });
addItem("item:rough-oak-recurve-bow-linen", "Rough Oak Recurve Bow (Linen)", { damage: 20, delay: 61, range: 125 });
addItem("item:rough-oak-recurve-bow-silk", "Rough Oak Recurve Bow (Silk)", { damage: 19, delay: 57, range: 125 });
addItem("item:carved-oak-recurve-bow-hemp", "Carved Oak Recurve Bow (Hemp)", { damage: 20, delay: 61, range: 125 });
addItem("item:carved-oak-recurve-bow-linen", "Carved Oak Recurve Bow (Linen)", { damage: 19, delay: 57, range: 125 });
addItem("item:carved-oak-recurve-bow-silk", "Carved Oak Recurve Bow (Silk)", { damage: 18, delay: 53, range: 125 });
addItem("item:shaped-oak-recurve-bow-hemp", "Shaped Oak Recurve Bow (Hemp)", { damage: 19, delay: 56, range: 125 });
addItem("item:shaped-oak-recurve-bow-linen", "Shaped Oak Recurve Bow (Linen)", { damage: 18, delay: 52, range: 125 });
addItem("item:shaped-oak-recurve-bow-silk", "Shaped Oak Recurve Bow (Silk)", { damage: 17, delay: 48, range: 125 });
addItem("item:rough-oak-1-cam-bow-hemp", "Rough Oak 1-Cam Bow (Hemp)", { damage: 20, delay: 60, range: 125 });
addItem("item:rough-oak-1-cam-bow-linen", "Rough Oak 1-Cam Bow (Linen)", { damage: 19, delay: 56, range: 125 });
addItem("item:rough-oak-1-cam-bow-silk", "Rough Oak 1-Cam Bow (Silk)", { damage: 18, delay: 52, range: 125 });
addItem("item:carved-oak-1-cam-bow-hemp", "Carved Oak 1-Cam Bow (Hemp)", { damage: 19, delay: 56, range: 125 });
addItem("item:carved-oak-1-cam-bow-linen", "Carved Oak 1-Cam Bow (Linen)", { damage: 18, delay: 52, range: 125 });
addItem("item:carved-oak-1-cam-bow-silk", "Carved Oak 1-Cam Bow (Silk)", { damage: 17, delay: 48, range: 125 });
addItem("item:shaped-oak-1-cam-bow-hemp", "Shaped Oak 1-Cam Bow (Hemp)", { damage: 18, delay: 51, range: 125 });
addItem("item:shaped-oak-1-cam-bow-linen", "Shaped Oak 1-Cam Bow (Linen)", { damage: 17, delay: 47, range: 125 });
addItem("item:shaped-oak-1-cam-bow-silk", "Shaped Oak 1-Cam Bow (Silk)", { damage: 16, delay: 43, range: 125 });
addItem("item:rough-darkwood-recurve-bow-hemp", "Rough Darkwood Recurve Bow (Hemp)", { damage: 25, delay: 68, range: 150 });
addItem("item:rough-darkwood-recurve-bow-linen", "Rough Darkwood Recurve Bow (Linen)", { damage: 24, delay: 64, range: 150 });
addItem("item:rough-darkwood-recurve-bow-silk", "Rough Darkwood Recurve Bow (Silk)", { damage: 23, delay: 60, range: 150 });
addItem("item:carved-darkwood-recurve-bow-hemp", "Carved Darkwood Recurve Bow (Hemp)", { damage: 24, delay: 64, range: 150 });
addItem("item:carved-darkwood-recurve-bow-linen", "Carved Darkwood Recurve Bow (Linen)", { damage: 23, delay: 60, range: 150 });
addItem("item:carved-darkwood-recurve-bow-silk", "Carved Darkwood Recurve Bow (Silk)", { damage: 22, delay: 56, range: 150 });
addItem("item:shaped-darkwood-recurve-bow-hemp", "Shaped Darkwood Recurve Bow (Hemp)", { damage: 23, delay: 59, range: 150 });
addItem("item:shaped-darkwood-recurve-bow-linen", "Shaped Darkwood Recurve Bow (Linen)", { damage: 22, delay: 55, range: 150 });
addItem("item:shaped-darkwood-recurve-bow-silk", "Shaped Darkwood Recurve Bow (Silk)", { damage: 21, delay: 51, range: 150 });
addItem("item:rough-darkwood-1-cam-bow-hemp", "Rough Darkwood 1-Cam Bow (Hemp)", { damage: 24, delay: 63, range: 150 });
addItem("item:rough-darkwood-1-cam-bow-linen", "Rough Darkwood 1-Cam Bow (Linen)", { damage: 23, delay: 59, range: 150 });
addItem("item:rough-darkwood-1-cam-bow-silk", "Rough Darkwood 1-Cam Bow (Silk)", { damage: 22, delay: 55, range: 150 });
addItem("item:carved-darkwood-1-cam-bow-hemp", "Carved Darkwood 1-Cam Bow (Hemp)", { damage: 23, delay: 59, range: 150 });
addItem("item:carved-darkwood-1-cam-bow-linen", "Carved Darkwood 1-Cam Bow (Linen)", { damage: 22, delay: 55, range: 150 });
addItem("item:carved-darkwood-1-cam-bow-silk", "Carved Darkwood 1-Cam Bow (Silk)", { damage: 21, delay: 51, range: 150 });
addItem("item:shaped-darkwood-1-cam-bow-hemp", "Shaped Darkwood 1-Cam Bow (Hemp)", { damage: 22, delay: 54, range: 150 });
addItem("item:shaped-darkwood-1-cam-bow-linen", "Shaped Darkwood 1-Cam Bow (Linen)", { damage: 21, delay: 50, range: 150 });
addItem("item:shaped-darkwood-1-cam-bow-silk", "Shaped Darkwood 1-Cam Bow (Silk)", { damage: 20, delay: 46, range: 150 });
addItem("item:rough-darkwood-compound-bow-hemp", "Rough Darkwood Compound Bow (Hemp)", { damage: 23, delay: 58, range: 150 });
addItem("item:rough-darkwood-compound-bow-linen", "Rough Darkwood Compound Bow (Linen)", { damage: 22, delay: 54, range: 150 });
addItem("item:rough-darkwood-compound-bow-silk", "Rough Darkwood Compound Bow (Silk)", { damage: 21, delay: 50, range: 150 });
addItem("item:carved-darkwood-compound-bow-hemp", "Carved Darkwood Compound Bow (Hemp)", { damage: 22, delay: 54, range: 150 });
addItem("item:carved-darkwood-compound-bow-linen", "Carved Darkwood Compound Bow (Linen)", { damage: 21, delay: 50, range: 150 });
addItem("item:carved-darkwood-compound-bow-silk", "Carved Darkwood Compound Bow (Silk)", { damage: 20, delay: 46, range: 150 });
addItem("item:shaped-darkwood-compound-bow-hemp", "Shaped Darkwood Compound Bow (Hemp)", { damage: 21, delay: 49, range: 150 });
addItem("item:shaped-darkwood-compound-bow-linen", "Shaped Darkwood Compound Bow (Linen)", { damage: 20, delay: 45, range: 150 });
addItem("item:shaped-darkwood-compound-bow-silk", "Shaped Darkwood Compound Bow (Silk)", { damage: 19, delay: 41, range: 150 });

addRecipe("recipe:rough-hickory-recurve-bow-hemp", "Rough Hickory Recurve Bow (Hemp)", 16, [{ id: "item:hickory-bow-staff" }, { id: "item:hemp-twine" }], "item:rough-hickory-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-hickory-recurve-bow-linen", "Rough Hickory Recurve Bow (Linen)", 32, [{ id: "item:hickory-bow-staff" }, { id: "item:linen-string" }], "item:rough-hickory-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-hickory-recurve-bow-silk", "Rough Hickory Recurve Bow (Silk)", 46, [{ id: "item:hickory-bow-staff" }, { id: "item:silk-string" }], "item:rough-hickory-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-elm-recurve-bow-hemp", "Rough Elm Recurve Bow (Hemp)", 68, [{ id: "item:elm-bow-staff" }, { id: "item:hemp-twine" }], "item:rough-elm-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-elm-recurve-bow-linen", "Rough Elm Recurve Bow (Linen)", 68, [{ id: "item:elm-bow-staff" }, { id: "item:linen-string" }], "item:rough-elm-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-elm-recurve-bow-silk", "Rough Elm Recurve Bow (Silk)", 68, [{ id: "item:elm-bow-staff" }, { id: "item:silk-string" }], "item:rough-elm-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-elm-recurve-bow-hemp", "Carved Elm Recurve Bow (Hemp)", 102, [{ id: "item:elm-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }], "item:carved-elm-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-elm-recurve-bow-linen", "Carved Elm Recurve Bow (Linen)", 102, [{ id: "item:elm-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }], "item:carved-elm-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-elm-recurve-bow-silk", "Carved Elm Recurve Bow (Silk)", 102, [{ id: "item:elm-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }], "item:carved-elm-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-ashwood-recurve-bow-hemp", "Rough Ashwood Recurve Bow (Hemp)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:hemp-twine" }], "item:rough-ashwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-ashwood-recurve-bow-linen", "Rough Ashwood Recurve Bow (Linen)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:linen-string" }], "item:rough-ashwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-ashwood-recurve-bow-silk", "Rough Ashwood Recurve Bow (Silk)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:silk-string" }], "item:rough-ashwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-ashwood-recurve-bow-hemp", "Carved Ashwood Recurve Bow (Hemp)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }], "item:carved-ashwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-ashwood-recurve-bow-linen", "Carved Ashwood Recurve Bow (Linen)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }], "item:carved-ashwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-ashwood-recurve-bow-silk", "Carved Ashwood Recurve Bow (Silk)", 129, [{ id: "item:ashwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }], "item:carved-ashwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-ashwood-recurve-bow-hemp", "Shaped Ashwood Recurve Bow (Hemp)", 148, [{ id: "item:ashwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }], "item:shaped-ashwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-ashwood-recurve-bow-linen", "Shaped Ashwood Recurve Bow (Linen)", 148, [{ id: "item:ashwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }], "item:shaped-ashwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-ashwood-recurve-bow-silk", "Shaped Ashwood Recurve Bow (Silk)", 148, [{ id: "item:ashwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }], "item:shaped-ashwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-oak-recurve-bow-hemp", "Rough Oak Recurve Bow (Hemp)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }], "item:rough-oak-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-oak-recurve-bow-linen", "Rough Oak Recurve Bow (Linen)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }], "item:rough-oak-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-oak-recurve-bow-silk", "Rough Oak Recurve Bow (Silk)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }], "item:rough-oak-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-oak-recurve-bow-hemp", "Carved Oak Recurve Bow (Hemp)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }], "item:carved-oak-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-oak-recurve-bow-linen", "Carved Oak Recurve Bow (Linen)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }], "item:carved-oak-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-oak-recurve-bow-silk", "Carved Oak Recurve Bow (Silk)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }], "item:carved-oak-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-oak-recurve-bow-hemp", "Shaped Oak Recurve Bow (Hemp)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }], "item:shaped-oak-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-oak-recurve-bow-linen", "Shaped Oak Recurve Bow (Linen)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }], "item:shaped-oak-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-oak-recurve-bow-silk", "Shaped Oak Recurve Bow (Silk)", 168, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }], "item:shaped-oak-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-oak-1-cam-bow-hemp", "Rough Oak 1-Cam Bow (Hemp)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-oak-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-oak-1-cam-bow-linen", "Rough Oak 1-Cam Bow (Linen)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-oak-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-oak-1-cam-bow-silk", "Rough Oak 1-Cam Bow (Silk)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-oak-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-oak-1-cam-bow-hemp", "Carved Oak 1-Cam Bow (Hemp)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-oak-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-oak-1-cam-bow-linen", "Carved Oak 1-Cam Bow (Linen)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-oak-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-oak-1-cam-bow-silk", "Carved Oak 1-Cam Bow (Silk)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-oak-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-oak-1-cam-bow-hemp", "Shaped Oak 1-Cam Bow (Hemp)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-oak-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-oak-1-cam-bow-linen", "Shaped Oak 1-Cam Bow (Linen)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-oak-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-oak-1-cam-bow-silk", "Shaped Oak 1-Cam Bow (Silk)", 192, [{ id: "item:oak-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-oak-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-recurve-bow-hemp", "Rough Darkwood Recurve Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }], "item:rough-darkwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-recurve-bow-linen", "Rough Darkwood Recurve Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }], "item:rough-darkwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-recurve-bow-silk", "Rough Darkwood Recurve Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }], "item:rough-darkwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-recurve-bow-hemp", "Carved Darkwood Recurve Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }], "item:carved-darkwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-recurve-bow-linen", "Carved Darkwood Recurve Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }], "item:carved-darkwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-recurve-bow-silk", "Carved Darkwood Recurve Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }], "item:carved-darkwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-recurve-bow-hemp", "Shaped Darkwood Recurve Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }], "item:shaped-darkwood-recurve-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-recurve-bow-linen", "Shaped Darkwood Recurve Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }], "item:shaped-darkwood-recurve-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-recurve-bow-silk", "Shaped Darkwood Recurve Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }], "item:shaped-darkwood-recurve-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-1-cam-bow-hemp", "Rough Darkwood 1-Cam Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-darkwood-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-1-cam-bow-linen", "Rough Darkwood 1-Cam Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-darkwood-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-1-cam-bow-silk", "Rough Darkwood 1-Cam Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:rough-darkwood-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-1-cam-bow-hemp", "Carved Darkwood 1-Cam Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-darkwood-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-1-cam-bow-linen", "Carved Darkwood 1-Cam Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-darkwood-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-1-cam-bow-silk", "Carved Darkwood 1-Cam Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:carved-darkwood-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-1-cam-bow-hemp", "Shaped Darkwood 1-Cam Bow (Hemp)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-darkwood-1-cam-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-1-cam-bow-linen", "Shaped Darkwood 1-Cam Bow (Linen)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-darkwood-1-cam-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-1-cam-bow-silk", "Shaped Darkwood 1-Cam Bow (Silk)", 215, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 1 }], "item:shaped-darkwood-1-cam-bow-silk", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-compound-bow-hemp", "Rough Darkwood Compound Bow (Hemp)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:rough-darkwood-compound-bow-hemp", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-compound-bow-linen", "Rough Darkwood Compound Bow (Linen)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:rough-darkwood-compound-bow-linen", "container:fletching-kit");
addRecipe("recipe:rough-darkwood-compound-bow-silk", "Rough Darkwood Compound Bow (Silk)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:rough-darkwood-compound-bow-silk", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-compound-bow-hemp", "Carved Darkwood Compound Bow (Hemp)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:carved-darkwood-compound-bow-hemp", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-compound-bow-linen", "Carved Darkwood Compound Bow (Linen)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:carved-darkwood-compound-bow-linen", "container:fletching-kit");
addRecipe("recipe:carved-darkwood-compound-bow-silk", "Carved Darkwood Compound Bow (Silk)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:whittling-blade" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:carved-darkwood-compound-bow-silk", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-compound-bow-hemp", "Shaped Darkwood Compound Bow (Hemp)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:hemp-twine" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:shaped-darkwood-compound-bow-hemp", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-compound-bow-linen", "Shaped Darkwood Compound Bow (Linen)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:linen-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:shaped-darkwood-compound-bow-linen", "container:fletching-kit");
addRecipe("recipe:shaped-darkwood-compound-bow-silk", "Shaped Darkwood Compound Bow (Silk)", 235, [{ id: "item:darkwood-bow-staff" }, { id: "item:silk-string" }, { id: "item:planing-tool" }, { id: "item:standard-bow-cam", quantity: 2 }], "item:shaped-darkwood-compound-bow-silk", "container:fletching-kit");

// --- Trueshot Longbow: quested ingredients, not part of the wood/string/tool/cam matrix ---
addNode({ id: "item:treant-bow-staff", label: "Treant Bow Staff", type: "item", source: "Trueshot Longbow Quest reward" });
itemsAdded++;
addNode({ id: "item:dwarven-wire", label: "Dwarven Wire", type: "item", source: "Tumpy Tonics quest reward" });
itemsAdded++;
addNode({ id: "item:micro-servo", label: "Micro Servo", type: "item", source: "Trueshot Longbow Quest reward" });
itemsAdded++;
addItem("item:trueshot-longbow", "Trueshot Longbow", {
  weight: 3.0,
  size: "Large",
  slots: ["Range"],
  skill: "Archery",
  delay: 45,
  damage: 20,
  range: 100,
  classes: ["ranger"],
  lore: true,
  source: "Requires the Mark of Karana quest chain (Qaelin Hailstorm, Surefall Glade) alongside its own quested ingredients",
});
addRecipe(
  "recipe:trueshot-longbow",
  "Trueshot Longbow",
  235,
  [{ id: "item:treant-bow-staff" }, { id: "item:dwarven-wire" }, { id: "item:planing-tool" }, { id: "item:micro-servo" }],
  "item:trueshot-longbow",
  "container:fletching-kit"
);

save();
console.log(`Migration 446 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
