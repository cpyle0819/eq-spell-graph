/**
 * Migration 368: flag migration 365's original 8-recipe leveling path as
 * `levelingGuide: true` on each recipe node -- same purpose as Brewing's
 * migration 359. Migration 367 added 118 more Baking recipes for browsing/
 * searching, which made getRecipes() return all of them with no way to
 * tell the original leveling path apart from the rest. The Tradeskills
 * page's Leveling Guide must stay exactly these 8, regardless of how many
 * more recipes Baking later accumulates.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

const LEVELING_GUIDE_RECIPE_IDS = [
  "recipe:batwing-crunchies",
  "recipe:fish-fillets",
  "recipe:fish-rolls",
  "recipe:batwing-pie",
  "recipe:wedding-cake",
  "recipe:birthday-cake",
  "recipe:dragon-steak",
  "recipe:pixie-powder-cinnesticks",
];

for (const id of LEVELING_GUIDE_RECIPE_IDS) updateNode(id, { levelingGuide: true });

save();
console.log(`Migration 368 complete: flagged ${LEVELING_GUIDE_RECIPE_IDS.length} recipe(s) as levelingGuide`);
