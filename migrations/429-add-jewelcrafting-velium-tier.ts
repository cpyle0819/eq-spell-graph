/**
 * Migration 429: model Jewelcrafting's Velium-tier Basic jewelry (issue
 * #50), same shape as migrations 425-428 -- see decisions/
 * tradeskill-recipe-node-schema.md.
 *
 * Velium Bar / Enchanted Velium Bar didn't exist as items yet (Velium Bar:
 * WT 0.3, Size Small, one vendor -- Talem Tucter, Thurgadin; Enchanted
 * Velium Bar: same WT/size, no vendor, player-crafted via the Enchant
 * Velium spell per the tradeskill page's own Materials table). Added here.
 *
 * This tier's sourcing needed more correction than the four before it:
 * - Most individual item pages literally say "Trivial: missing" instead of
 *   a number -- the page-level summary table has a full, internally
 *   consistent 220->302 progression instead, and every individual page that
 *   *does* have a real trivial value matches the summary table exactly, so
 *   the summary table's values are used for all 28 (the inverse of
 *   Tailoring's usual "individual page wins" rule, because here the
 *   individual pages are the ones missing data, not disagreeing with it).
 * - Two items are wiki page redirects under the names the summary table
 *   uses ("Blackened Pearl Velium Ring" -> Black Pearl Velium Ring,
 *   "Velium Fire Emerald Ring" -> Fire Emerald Velium Ring); modeled under
 *   their canonical page titles.
 * - Same unenchanted-bar-link pattern as Electrum/Gold/Platinum (6 of 28
 *   pages link plain [[Velium Bar]]) normalized to Enchanted Velium Bar,
 *   same reasoning (real stat block present on every one).
 * - No bonus/proc effect beyond the stat block. All gems already known
 *   from earlier tiers. Every item gets source: "Velious era" -- Velium
 *   tier is Velious content by definition, not just the Blue Diamond combo.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;

if (!hasNode("item:velium-bar")) {
  addNode({ id: "item:velium-bar", label: "Velium Bar", type: "item", weight: 0.3, size: "Small", source: "Velious era" });
}
if (!hasNode("item:enchanted-velium-bar")) {
  addNode({ id: "item:enchanted-velium-bar", label: "Enchanted Velium Bar", type: "item", weight: 0.3, size: "Small", source: "Player-crafted via the Enchant Velium spell -- Velious era" });
}
if (!hasNode("npc:thurgadin:talem-tucter")) {
  throw new Error("expected npc:thurgadin:talem-tucter to already exist");
}
addEdge("npc:thurgadin:talem-tucter", "item:velium-bar", "sells");

interface ItemOpts {
  ac?: number;
  hp?: number;
  mana?: number;
  stats?: Record<string, number>;
  resists?: Record<string, number>;
  weight?: number;
  size?: string;
  slots?: string[];
  source?: string;
}

function addRecipe(recipeId: string, label: string, trivial: number, gemId: string, producedId: string, itemOpts: ItemOpts) {
  addNode({ id: producedId, label, type: "item", ...itemOpts });
  addNode({ id: recipeId, label, type: "recipe", tradeskill: "Jewelcrafting", trivial });
  addEdge(recipeId, "item:enchanted-velium-bar", "uses");
  addEdge(recipeId, gemId, "uses");
  addEdge(recipeId, producedId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  recipesAdded++;
}

addRecipe("recipe:velium-malachite-ring", "Velium Malachite Ring", 220, "item:malachite", "item:velium-malachite-ring", { resists: {"poison":8}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-lapis-lazuli-necklace", "Velium Lapis Lazuli Necklace", 223, "item:lapis-lazuli", "item:velium-lapis-lazuli-necklace", { resists: {"disease":8}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:velium-turquoise-bracelet", "Velium Turquoise Bracelet", 226, "item:turquoise", "item:velium-turquoise-bracelet", { resists: {"cold":8}, weight: 0.1, size: "Tiny", slots: ["Wrist"], source: "Velious era" });
addRecipe("recipe:velium-hematite-ring", "Velium Hematite Ring", 228, "item:hematite", "item:velium-hematite-ring", { resists: {"fire":9}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:cat-eye-velium-necklace", "Cat Eye Velium Necklace", 231, "item:cat-s-eye-agate", "item:cat-eye-velium-necklace", { stats: {"cha":10}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:velium-bloodstone-earring", "Velium Bloodstone Earring", 234, "item:bloodstone", "item:velium-bloodstone-earring", { stats: {"sta":7}, weight: 0.1, size: "Tiny", slots: ["Ear"], source: "Velious era" });
addRecipe("recipe:velium-onyx-bracelet", "Velium Onyx Bracelet", 236, "item:onyx", "item:velium-onyx-bracelet", { stats: {"dex":7}, weight: 0.1, size: "Tiny", slots: ["Wrist"], source: "Velious era" });
addRecipe("recipe:velium-jasper-ring", "Velium Jasper Ring", 239, "item:jasper", "item:velium-jasper-ring", { stats: {"wis":7}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-carnelian-wedding-ring", "Velium Carnelian Wedding Ring", 242, "item:carnelian", "item:velium-carnelian-wedding-ring", { stats: {"agi":8}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-rose-engagement-ring", "Velium Rose Engagement Ring", 244, "item:star-rose-quartz", "item:velium-rose-engagement-ring", { stats: {"int":5}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-amber-ring", "Velium Amber Ring", 247, "item:amber", "item:velium-amber-ring", { stats: {"str":5}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-wolf-s-eye-necklace", "Velium Wolf's Eye Necklace", 250, "item:wolfs-eye-agate", "item:velium-wolf-s-eye-necklace", { resists: {"magic":10}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:jaded-velium-ring", "Jaded Velium Ring", 250, "item:jade", "item:jaded-velium-ring", { ac: 5, hp: 30, mana: 30, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-pearl-ring", "Velium Pearl Ring", 255, "item:pearl", "item:velium-pearl-ring", { ac: 5, resists: {"poison":11}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:topaz-velium-necklace", "Topaz Velium Necklace", 258, "item:topaz", "item:topaz-velium-necklace", { ac: 6, resists: {"disease":14}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:velium-peridot-ring", "Velium Peridot Ring", 260, "item:peridot", "item:velium-peridot-ring", { ac: 5, resists: {"cold":11}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-emerald-ring", "Velium Emerald Ring", 263, "item:emerald", "item:velium-emerald-ring", { ac: 5, resists: {"fire":11}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-opal-engagement-ring", "Velium Opal Engagement Ring", 266, "item:opal", "item:velium-opal-engagement-ring", { stats: {"sta":8,"agi":6}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:black-pearl-velium-ring", "Black Pearl Velium Ring", 268, "item:black-pearl", "item:black-pearl-velium-ring", { stats: {"dex":7,"agi":7}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-fire-wedding-ring", "Velium Fire Wedding Ring", 271, "item:fire-opal", "item:velium-fire-wedding-ring", { ac: 6, hp: 65, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-star-ruby-veil", "Velium Star Ruby Veil", 274, "item:star-ruby-ulthork", "item:velium-star-ruby-veil", { stats: {"dex":10,"cha":10}, weight: 0.1, size: "Tiny", slots: ["Face"], source: "Velious era" });
addRecipe("recipe:fire-emerald-velium-ring", "Fire Emerald Velium Ring", 276, "item:fire-emerald-ulthork", "item:fire-emerald-velium-ring", { stats: {"str":6,"dex":6}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:sapphire-velium-necklace", "Sapphire Velium Necklace", 279, "item:sapphire-ulthork", "item:sapphire-velium-necklace", { stats: {"str":8,"int":8}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:velium-ruby-veil", "Velium Ruby Veil", 282, "item:ruby-ulthork", "item:velium-ruby-veil", { stats: {"str":8,"wis":8}, weight: 0.1, size: "Tiny", slots: ["Face"], source: "Velious era" });
addRecipe("recipe:velium-jacinth-wedding-ring", "Velium Jacinth Wedding Ring", 284, "item:jacinth-ulthork", "item:velium-jacinth-wedding-ring", { resists: {"magic":14}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:black-sapphire-velium-necklace", "Black Sapphire Velium Necklace", 287, "item:black-sapphire-ulthork", "item:black-sapphire-velium-necklace", { hp: 65, mana: 65, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:velium-diamond-wedding-ring", "Velium Diamond Wedding Ring", 290, "item:diamond-ulthork", "item:velium-diamond-wedding-ring", { resists: {"fire":8,"cold":8,"disease":8,"poison":8,"magic":8}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:velium-blue-diamond-bracelet", "Velium Blue Diamond Bracelet", 302, "item:blue-diamond-ulthork", "item:velium-blue-diamond-bracelet", { mana: 30, resists: {"fire":9,"cold":11,"disease":9,"poison":9,"magic":9}, weight: 0.1, size: "Tiny", slots: ["Wrist"], source: "Velious era" });

save();
console.log(`Migration 429 complete: ${recipesAdded} recipe(s) added for Jewelcrafting (Velium tier)`);
