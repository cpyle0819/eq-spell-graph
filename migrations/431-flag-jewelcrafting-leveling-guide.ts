/**
 * Migration 431: flag Jewelcrafting's leveling-guide recipes (issue #50).
 *
 * Unlike Brewing, eqlwiki's own `Jewelcrafting` page has no dedicated
 * leveling-path table -- see decisions/tradeskill-recipe-node-schema.md for
 * the derivation method used here instead (per the project owner's explicit
 * direction, 2026-08-05): among the 140 Basic-tier recipes (Deity-tier
 * excluded -- its trivials are themselves cost-interpolated estimates, not
 * a solid base to anchor a "recommended path" on), only 3 of the ~20 gems
 * have any vendor (`sells`) data already in this graph -- Malachite,
 * Carnelian, and Wolf's Eye Agate. Every other Basic gem is loot/mob-drop
 * only per its own eqlwiki page. Recipes using one of those 3 vendor-
 * sourced gems, one per metal tier (Silver through Velium), are flagged as
 * the leveling path: 15 stops, trivial 17 through 250, satisfying "least
 * ingredients" (every Jewelcrafting recipe is already just gem+bar, so this
 * doesn't discriminate) and "least locations to travel to" (these 3 gems'
 * vendor lists heavily overlap -- Ak'Anon, West Freeport, and North Qeynos
 * sell all three) far better than the loot-only alternatives, which would
 * require killing specific mobs rather than a vendor stop.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

const LEVELING_GUIDE_RECIPE_IDS = [
  "recipe:silver-malachite-ring",
  "recipe:silver-carnelian-wedding-ring",
  "recipe:silver-wolf-s-eye-necklace",
  "recipe:electrum-malachite-bracelet",
  "recipe:electrum-carnelian-wedding-ring",
  "recipe:wolf-s-eye-electrum-bracelet",
  "recipe:gold-malachite-bracelet",
  "recipe:gold-carnelian-wedding-ring",
  "recipe:wolf-s-eye-golden-bracelet",
  "recipe:platinum-malachite-ring",
  "recipe:velium-malachite-ring",
  "recipe:platinum-carnelian-wedding-ring",
  "recipe:velium-carnelian-wedding-ring",
  "recipe:wolf-s-eye-platinum-necklace",
  "recipe:velium-wolf-s-eye-necklace",
];

let flagged = 0;
for (const id of LEVELING_GUIDE_RECIPE_IDS) {
  updateNode(id, { levelingGuide: true });
  flagged++;
}

save();
console.log(`Migration 431 complete: ${flagged} recipe(s) flagged as Jewelcrafting's leveling guide`);
