/**
 * Migration 427: model Jewelcrafting's Gold-tier Basic jewelry (issue #50),
 * same shape as migrations 425-426 -- see decisions/
 * tradeskill-recipe-node-schema.md.
 *
 * Same "15 of 28 pages link the unenchanted bar" wiki-authoring
 * inconsistency migration 426 documented for Electrum -- normalized to
 * item:enchanted-gold-bar for all 28, same reasoning (every item has a real
 * stat block, only possible with the enchanted bar per the tradeskill
 * page's own Basics section). No bonus/proc effect beyond the stat block.
 * All gems already known from earlier tiers.
 *
 * Golden Blue Diamond Pendant's own page omits the {{Velious Era}} template
 * every other Blue Diamond item so far has carried -- flagged Velious era
 * anyway per the main Jewelcrafting page's own Materials section ("Blue
 * Diamond combos are Velious era"), a blanket fact overriding one page's
 * inconsistent tagging, not a reason to treat this specific combo as
 * classic-era.
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
  addEdge(recipeId, "item:enchanted-gold-bar", "uses");
  addEdge(recipeId, gemId, "uses");
  addEdge(recipeId, producedId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  recipesAdded++;
}

addRecipe("recipe:gold-malachite-bracelet", "Gold Malachite Bracelet", 146, "item:malachite", "item:gold-malachite-bracelet", { resists: {"poison":5}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:gold-turquoise-engagement-ring", "Gold Turquoise Engagement Ring", 151, "item:turquoise", "item:gold-turquoise-engagement-ring", { resists: {"cold":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:golden-blue-diamond-pendant", "Golden Blue Diamond Pendant", 228, "item:blue-diamond-ulthork", "item:golden-blue-diamond-pendant", { mana: 20, resists: {"fire":11,"cold":11,"disease":6,"poison":6,"magic":4}, weight: 0.1, size: "Tiny", slots: ["Neck"], source: "Velious era" });
addRecipe("recipe:golden-diamond-mask", "Golden Diamond Mask", 215, "item:diamond-ulthork", "item:golden-diamond-mask", { resists: {"fire":10,"cold":10,"disease":5,"poison":5,"magic":3}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:golden-emerald-bracelet", "Golden Emerald Bracelet", 188, "item:emerald", "item:golden-emerald-bracelet", { ac: 4, resists: {"fire":6}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:golden-jacinth-wedding-ring", "Golden Jacinth Wedding Ring", 210, "item:jacinth-ulthork", "item:golden-jacinth-wedding-ring", { ac: 3, resists: {"magic":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:golden-pearl-choker", "Golden Pearl Choker", 180, "item:pearl", "item:golden-pearl-choker", { ac: 5, resists: {"poison":9}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-peridot-bracelet", "Golden Peridot Bracelet", 186, "item:peridot", "item:golden-peridot-bracelet", { ac: 4, resists: {"cold":6}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:wolf-s-eye-golden-bracelet", "Wolf's Eye Golden Bracelet", 175, "item:wolfs-eye-agate", "item:wolf-s-eye-golden-bracelet", { resists: {"magic":7}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:fire-emerald-golden-bracelet", "Fire Emerald Golden Bracelet", 202, "item:fire-emerald-ulthork", "item:fire-emerald-golden-bracelet", { stats: {"str":5,"dex":3}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:gold-bloodstone-necklace", "Gold Bloodstone Necklace", 159, "item:bloodstone", "item:gold-bloodstone-necklace", { stats: {"sta":5}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:gold-carnelian-wedding-ring", "Gold Carnelian Wedding Ring", 167, "item:carnelian", "item:gold-carnelian-wedding-ring", { stats: {"agi":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:gold-lapis-lazuli-earring", "Gold Lapis Lazuli Earring", 148, "item:lapis-lazuli", "item:gold-lapis-lazuli-earring", { resists: {"disease":5}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:gold-onyx-pendant", "Gold Onyx Pendant", 162, "item:onyx", "item:gold-onyx-pendant", { stats: {"dex":5}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-amber-earring", "Golden Amber Earring", 172, "item:amber", "item:golden-amber-earring", { stats: {"str":3}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:golden-black-pearl-choker", "Golden Black Pearl Choker", 194, "item:black-pearl", "item:golden-black-pearl-choker", { stats: {"dex":7,"agi":7}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-black-sapphire-earring", "Golden Black Sapphire Earring", 212, "item:black-sapphire-ulthork", "item:golden-black-sapphire-earring", { hp: 25, mana: 35, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:golden-cat-eye-bracelet", "Golden Cat Eye Bracelet", 156, "item:cat-s-eye-agate", "item:golden-cat-eye-bracelet", { stats: {"cha":7}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:golden-fire-wedding-ring", "Golden Fire Wedding Ring", 196, "item:fire-opal", "item:golden-fire-wedding-ring", { ac: 4, hp: 45, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:golden-hematite-choker", "Golden Hematite Choker", 154, "item:hematite", "item:golden-hematite-choker", { resists: {"fire":7}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-jaded-bracelet", "Golden Jaded Bracelet", 178, "item:jade", "item:golden-jaded-bracelet", { ac: 2, hp: 15, mana: 15, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:golden-opal-amulet", "Golden Opal Amulet", 191, "item:opal", "item:golden-opal-amulet", { stats: {"sta":9,"agi":6}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-ruby-ring", "Golden Ruby Ring", 207, "item:ruby-ulthork", "item:golden-ruby-ring", { stats: {"str":2,"wis":4}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:golden-sapphire-earring", "Golden Sapphire Earring", 204, "item:sapphire-ulthork", "item:golden-sapphire-earring", { stats: {"str":2,"int":4}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:golden-star-amulet", "Golden Star Amulet", 170, "item:star-rose-quartz", "item:golden-star-amulet", { stats: {"int":4}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:golden-star-ruby-ring", "Golden Star Ruby Ring", 199, "item:star-ruby-ulthork", "item:golden-star-ruby-ring", { stats: {"dex":7,"cha":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:golden-topaz-earring", "Golden Topaz Earring", 183, "item:topaz", "item:golden-topaz-earring", { ac: 3, resists: {"disease":8}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:jasper-gold-earring", "Jasper Gold Earring", 164, "item:jasper", "item:jasper-gold-earring", { stats: {"wis":3}, weight: 0.1, size: "Tiny", slots: ["Ear"] });

save();
console.log(`Migration 427 complete: ${recipesAdded} recipe(s) added for Jewelcrafting (Gold tier)`);
