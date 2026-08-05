/**
 * Migration 432: add unenchanted-bar leveling variants for Jewelcrafting's
 * 15 leveling-guide recipes (issue #50 follow-up, project owner feedback
 * 2026-08-06).
 *
 * Migrations 425-429 modeled every Basic-tier recipe against the enchanted
 * bar exclusively, matching each item's own eqlwiki page (the version that
 * actually carries stats). But the tradeskill page's own Basics section
 * says the *unenchanted* bar still produces the same skillup chance --
 * "unenchanted jewelry combines do produce skillups, only enchanted
 * versions have any bonus statistics." For leveling specifically (not for
 * making a keeper item), the unenchanted bar is strictly better: no
 * Enchanter needs to be found/paid, and it's the vendor-purchasable item
 * already in this graph for Silver and Velium.
 *
 * Modeled as a `variant_of` sibling per leveling-guide recipe (decisions/
 * tradeskill-recipe-node-schema.md's existing "same output item, different
 * combo" pattern), producing a new, non-magic item node rather than
 * reusing the enchanted combine's stat-bearing item -- eqlwiki doesn't
 * document this as a separate item page (there's no distinct in-game name
 * for it, it's the same display name minus the MAGIC ITEM flag and stats),
 * so the new node exists purely to represent that real mechanical
 * difference, not a fabricated wiki fact.
 *
 * `levelingGuide` moves from the enchanted recipe to its new unenchanted
 * sibling on all 15 stops, per the project owner's explicit direction to
 * prefer non-enchanted metals for leveling.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, updateNode, save } = loadGraph(import.meta.dir);

interface Stop {
  enchantedRecipeId: string;
  label: string;
  trivial: number;
  plainBarId: string;
  gemId: string;
  weight: number;
  size: string;
  slots: string[];
}

const STOPS: Stop[] = [
  { enchantedRecipeId: "recipe:silver-malachite-ring", label: "Silver Malachite Ring", trivial: 17, plainBarId: "item:silver-bar", gemId: "item:malachite", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:silver-carnelian-wedding-ring", label: "Silver Carnelian Wedding Ring", trivial: 32, plainBarId: "item:silver-bar", gemId: "item:carnelian", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:silver-wolf-s-eye-necklace", label: "Silver Wolf's Eye Necklace", trivial: 38, plainBarId: "item:silver-bar", gemId: "item:wolfs-eye-agate", weight: 0.1, size: "Tiny", slots: ["Neck"] },
  { enchantedRecipeId: "recipe:electrum-malachite-bracelet", label: "Electrum Malachite Bracelet", trivial: 74, plainBarId: "item:electrum-bar", gemId: "item:malachite", weight: 0.1, size: "Tiny", slots: ["Wrist"] },
  { enchantedRecipeId: "recipe:electrum-carnelian-wedding-ring", label: "Electrum Carnelian Wedding Ring", trivial: 95, plainBarId: "item:electrum-bar", gemId: "item:carnelian", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:wolf-s-eye-electrum-bracelet", label: "Wolf's Eye Electrum Bracelet", trivial: 103, plainBarId: "item:electrum-bar", gemId: "item:wolfs-eye-agate", weight: 0.1, size: "Tiny", slots: ["Wrist"] },
  { enchantedRecipeId: "recipe:gold-malachite-bracelet", label: "Gold Malachite Bracelet", trivial: 146, plainBarId: "item:gold-bar", gemId: "item:malachite", weight: 0.1, size: "Tiny", slots: ["Wrist"] },
  { enchantedRecipeId: "recipe:gold-carnelian-wedding-ring", label: "Gold Carnelian Wedding Ring", trivial: 167, plainBarId: "item:gold-bar", gemId: "item:carnelian", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:wolf-s-eye-golden-bracelet", label: "Wolf's Eye Golden Bracelet", trivial: 175, plainBarId: "item:gold-bar", gemId: "item:wolfs-eye-agate", weight: 0.1, size: "Tiny", slots: ["Wrist"] },
  { enchantedRecipeId: "recipe:platinum-malachite-ring", label: "Platinum Malachite Ring", trivial: 218, plainBarId: "item:platinum-bar", gemId: "item:malachite", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:velium-malachite-ring", label: "Velium Malachite Ring", trivial: 220, plainBarId: "item:velium-bar", gemId: "item:malachite", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:platinum-carnelian-wedding-ring", label: "Platinum Carnelian Wedding Ring", trivial: 239, plainBarId: "item:platinum-bar", gemId: "item:carnelian", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:velium-carnelian-wedding-ring", label: "Velium Carnelian Wedding Ring", trivial: 242, plainBarId: "item:velium-bar", gemId: "item:carnelian", weight: 0.1, size: "Tiny", slots: ["Finger"] },
  { enchantedRecipeId: "recipe:wolf-s-eye-platinum-necklace", label: "Wolf's Eye Platinum Necklace", trivial: 247, plainBarId: "item:platinum-bar", gemId: "item:wolfs-eye-agate", weight: 0.1, size: "Tiny", slots: ["Neck"] },
  { enchantedRecipeId: "recipe:velium-wolf-s-eye-necklace", label: "Velium Wolf's Eye Necklace", trivial: 250, plainBarId: "item:velium-bar", gemId: "item:wolfs-eye-agate", weight: 0.1, size: "Tiny", slots: ["Neck"] },
];

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

let recipesAdded = 0;
for (const stop of STOPS) {
  const itemId = `item:${slug(stop.label)}-unenchanted`;
  const recipeId = `recipe:${slug(stop.label)}-unenchanted`;

  addNode({
    id: itemId,
    label: stop.label,
    type: "item",
    weight: stop.weight,
    size: stop.size,
    slots: stop.slots,
    magic: false,
    source: "Result of the same combine made with a plain (unenchanted) bar -- no stat bonus, but the same skillup chance as the enchanted version, and no Enchanter required",
  });

  addNode({ id: recipeId, label: stop.label, type: "recipe", tradeskill: "Jewelcrafting", trivial: stop.trivial });
  addEdge(recipeId, stop.plainBarId, "uses");
  addEdge(recipeId, stop.gemId, "uses");
  addEdge(recipeId, itemId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  addEdge(recipeId, stop.enchantedRecipeId, "variant_of");
  recipesAdded++;

  updateNode(stop.enchantedRecipeId, { levelingGuide: false });
  updateNode(recipeId, { levelingGuide: true });
}

save();
console.log(`Migration 432 complete: ${recipesAdded} unenchanted variant recipe(s) added, levelingGuide moved to them`);
