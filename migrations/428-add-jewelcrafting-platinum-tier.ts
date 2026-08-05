/**
 * Migration 428: model Jewelcrafting's Platinum-tier Basic jewelry (issue
 * #50), same shape as migrations 425-427 -- see decisions/
 * tradeskill-recipe-node-schema.md.
 *
 * Same unenchanted-bar-link wiki inconsistency (13 of 28 pages) normalized
 * to item:enchanted-platinum-bar per migrations 426-427's reasoning. No
 * bonus/proc effect beyond the stat block. All gems already known from
 * earlier tiers. Platinum Blue Diamond Tiara's own page does carry the
 * {{Velious Era}} template.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;

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
  addEdge(recipeId, "item:enchanted-platinum-bar", "uses");
  addEdge(recipeId, gemId, "uses");
  addEdge(recipeId, producedId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  recipesAdded++;
}

addRecipe("recipe:platinum-blue-diamond-tiara", "Platinum Blue Diamond Tiara", 295, "item:blue-diamond-ulthork", "item:platinum-blue-diamond-tiara", { mana: 25, resists: {"fire":8,"cold":8,"disease":8,"poison":8,"magic":8}, weight: 0.1, size: "Tiny", slots: ["Head"], source: "Velious era" });
addRecipe("recipe:platinum-diamond-wedding-ring", "Platinum Diamond Wedding Ring", 287, "item:diamond-ulthork", "item:platinum-diamond-wedding-ring", { resists: {"fire":7,"cold":7,"disease":7,"poison":7,"magic":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-emerald-ring", "Platinum Emerald Ring", 260, "item:emerald", "item:platinum-emerald-ring", { ac: 4, resists: {"fire":10}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-hematite-ring", "Platinum Hematite Ring", 226, "item:hematite", "item:platinum-hematite-ring", { resists: {"fire":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-jacinth-wedding-ring", "Platinum Jacinth Wedding Ring", 282, "item:jacinth-ulthork", "item:platinum-jacinth-wedding-ring", { resists: {"magic":13}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-lapis-lazuli-necklace", "Platinum Lapis Lazuli Necklace", 220, "item:lapis-lazuli", "item:platinum-lapis-lazuli-necklace", { resists: {"disease":7}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:platinum-malachite-ring", "Platinum Malachite Ring", 218, "item:malachite", "item:platinum-malachite-ring", { resists: {"poison":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-pearl-ring", "Platinum Pearl Ring", 252, "item:pearl", "item:platinum-pearl-ring", { ac: 4, resists: {"poison":10}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-peridot-ring", "Platinum Peridot Ring", 258, "item:peridot", "item:platinum-peridot-ring", { ac: 4, resists: {"cold":10}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-turquoise-bracelet", "Platinum Turquoise Bracelet", 223, "item:turquoise", "item:platinum-turquoise-bracelet", { resists: {"cold":7}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:wolf-s-eye-platinum-necklace", "Wolf's Eye Platinum Necklace", 247, "item:wolfs-eye-agate", "item:wolf-s-eye-platinum-necklace", { resists: {"magic":9}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:black-pearl-platinum-ring", "Black Pearl Platinum Ring", 266, "item:black-pearl", "item:black-pearl-platinum-ring", { stats: {"dex":6,"agi":6}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:black-sapphire-platinum-necklace", "Black Sapphire Platinum Necklace", 284, "item:black-sapphire-ulthork", "item:black-sapphire-platinum-necklace", { hp: 55, mana: 55, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:cat-eye-platinum-necklace", "Cat Eye Platinum Necklace", 228, "item:cat-s-eye-agate", "item:cat-eye-platinum-necklace", { stats: {"cha":9}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:fire-emerald-platinum-ring", "Fire Emerald Platinum Ring", 274, "item:fire-emerald-ulthork", "item:fire-emerald-platinum-ring", { stats: {"str":5,"dex":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:jaded-platinum-ring", "Jaded Platinum Ring", 250, "item:jade", "item:jaded-platinum-ring", { ac: 4, hp: 20, mana: 20, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-amber-ring", "Platinum Amber Ring", 244, "item:amber", "item:platinum-amber-ring", { stats: {"str":4}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-bloodstone-earring", "Platinum Bloodstone Earring", 231, "item:bloodstone", "item:platinum-bloodstone-earring", { stats: {"sta":6}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:platinum-carnelian-wedding-ring", "Platinum Carnelian Wedding Ring", 239, "item:carnelian", "item:platinum-carnelian-wedding-ring", { stats: {"agi":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-fire-wedding-ring", "Platinum Fire Wedding Ring", 268, "item:fire-opal", "item:platinum-fire-wedding-ring", { ac: 5, hp: 55, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-jasper-ring", "Platinum Jasper Ring", 236, "item:jasper", "item:platinum-jasper-ring", { stats: {"wis":6}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-onyx-bracelet", "Platinum Onyx Bracelet", 234, "item:onyx", "item:platinum-onyx-bracelet", { stats: {"dex":6}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:platinum-opal-engagement-ring", "Platinum Opal Engagement Ring", 263, "item:opal", "item:platinum-opal-engagement-ring", { stats: {"sta":7,"agi":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:platinum-ruby-veil", "Platinum Ruby Veil", 279, "item:ruby-ulthork", "item:platinum-ruby-veil", { stats: {"str":7,"wis":7}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:platinum-star-ruby-veil", "Platinum Star Ruby Veil", 271, "item:star-ruby-ulthork", "item:platinum-star-ruby-veil", { stats: {"dex":9,"cha":9}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:platinum-topaz-necklace", "Platinum Topaz Necklace", 255, "item:topaz", "item:platinum-topaz-necklace", { ac: 5, resists: {"disease":13}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:rose-platinum-engagement-ring", "Rose Platinum Engagement Ring", 242, "item:star-rose-quartz", "item:rose-platinum-engagement-ring", { stats: {"int":4}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:sapphire-platinum-necklace", "Sapphire Platinum Necklace", 276, "item:sapphire-ulthork", "item:sapphire-platinum-necklace", { stats: {"str":7,"int":7}, weight: 0.1, size: "Tiny", slots: ["Neck"] });

save();
console.log(`Migration 428 complete: ${recipesAdded} recipe(s) added for Jewelcrafting (Platinum tier)`);
