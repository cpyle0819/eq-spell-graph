/**
 * Migration 414 (issue #52, batch 2/N): flags the two `Skill Tailoring`
 * Leveling Guide rows that already have a `recipe` node -- Mithril
 * Reinforced Mask (trivial 215) and Imbued Mithril Reinforced Mask
 * (trivial 228), both added pre-existing by migration 394's Wood Elf
 * cultural tradeskills work, which explicitly left Tailoring itself
 * unmigrated (this issue's own scope).
 *
 * Almost every other Leveling Guide row names an item that belongs to a
 * later armor-set section of the same wiki page (Reinforced Armor,
 * Crystalline Silk, Wu's Fighting Armor, Arctic Wyvern) rather than being
 * its own standalone recipe -- those get `levelingGuide: true` set inline
 * when that batch creates the actual recipe node, not duplicated here.
 * Two rows (Vale Reinforced Mask, Imbued Vale Reinforced Mask) are
 * Halfling cultural tailoring, cross-referenced off this page but not
 * modeled by it -- same "a prerequisite/sibling tradeskill surfaces before
 * it's fully modeled" call migration 412 made for unmodeled Fletching.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

updateNode("recipe:mithril-reinforced-mask", { levelingGuide: true });
updateNode("recipe:imbued-mithril-reinforced-mask", { levelingGuide: true });

save();
console.log("Migration 414 complete: flagged 2 pre-existing Tailoring recipes as levelingGuide");
