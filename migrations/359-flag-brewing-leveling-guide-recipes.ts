/**
 * Migration 359: flag migration 355's original 11-recipe "Antonica Biased
 * Brewers" path as `levelingGuide: true` on each recipe node.
 *
 * Migration 358 added 67 more Brewing recipes for browsing/searching, which
 * made getRecipes() (src/graph.ts) return all 78 for the tradeskill with no
 * way to tell the original leveling path apart from the rest. The
 * Tradeskills page's Leveling Guide must stay exactly those 11, regardless
 * of how many more recipes a tradeskill later accumulates -- this field is
 * what src/graph.ts's RecipeSummary.levelingGuide now exposes.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

const LEVELING_GUIDE_RECIPE_IDS = [
  "recipe:bog-juice",
  "recipe:short-beer",
  "recipe:heady-kiola",
  "recipe:short-ale",
  "recipe:fish-wine",
  "recipe:ale",
  "recipe:gnomish-spirits",
  "recipe:ol-tujims-fierce-brew",
  "recipe:ginesh",
  "recipe:faydwer-shaker",
  "recipe:minotaur-heros-brew",
];

for (const id of LEVELING_GUIDE_RECIPE_IDS) updateNode(id, { levelingGuide: true });

save();
console.log(`Migration 359 complete: flagged ${LEVELING_GUIDE_RECIPE_IDS.length} recipe(s) as levelingGuide`);
