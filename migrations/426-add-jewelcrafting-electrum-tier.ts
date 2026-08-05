/**
 * Migration 426: model Jewelcrafting's Electrum-tier Basic jewelry (issue
 * #50), same shape as migration 425's Silver tier -- see decisions/
 * tradeskill-recipe-node-schema.md.
 *
 * Unlike Silver tier, 16 of these 28 items' own eqlwiki pages link the
 * *unenchanted* [[Electrum Bar]] as the combine ingredient rather than
 * [[Enchanted Electrum Bar]] -- a wiki authoring inconsistency, not a real
 * recipe difference: 5 of those 16 pages carry an explicit note ("Make sure
 * to enchant the bar by an enchanter before combining. If you don't do that
 * you will not get any stats on your created gear"), and every one of the
 * 16 -- note or not -- has a real stat block, which per the Jewelcrafting
 * page's own Basics section ("only enchanted versions have any bonus
 * statistics") is only possible with the enchanted bar. All 28 are modeled
 * uniformly against item:enchanted-electrum-bar. No bonus/proc effect
 * beyond the stat block on any of the 28. All gems were already known from
 * Silver tier (migration 425) or pre-existing nodes -- none new here.
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
  addEdge(recipeId, "item:enchanted-electrum-bar", "uses");
  addEdge(recipeId, gemId, "uses");
  addEdge(recipeId, producedId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  recipesAdded++;
}

addRecipe("recipe:blue-diamond-electrum-earring", "Blue Diamond Electrum Earring", 148, "item:blue-diamond-ulthork", "item:blue-diamond-electrum-earring", { mana: 15, resists: {"fire":6,"cold":6,"disease":11,"poison":11,"magic":4}, weight: 0.1, size: "Tiny", slots: ["Ear"], source: "Velious era" });
addRecipe("recipe:diamond-electrum-mask", "Diamond Electrum Mask", 143, "item:diamond-ulthork", "item:diamond-electrum-mask", { resists: {"fire":5,"cold":5,"disease":10,"poison":10,"magic":3}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:electrum-hematite-choker", "Electrum Hematite Choker", 82, "item:hematite", "item:electrum-hematite-choker", { resists: {"fire":4}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-malachite-bracelet", "Electrum Malachite Bracelet", 74, "item:malachite", "item:electrum-malachite-bracelet", { resists: {"poison":3}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:electrum-pearl-choker", "Electrum Pearl Choker", 108, "item:pearl", "item:electrum-pearl-choker", { ac: 3, resists: {"poison":6}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-peridot-bracelet", "Electrum Peridot Bracelet", 114, "item:peridot", "item:electrum-peridot-bracelet", { ac: 3, resists: {"cold":4}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:electrum-turquoise-engagement-ring", "Electrum Turquoise Engagement Ring", 79, "item:turquoise", "item:electrum-turquoise-engagement-ring", { resists: {"cold":3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:wolf-s-eye-electrum-bracelet", "Wolf's Eye Electrum Bracelet", 103, "item:wolfs-eye-agate", "item:wolf-s-eye-electrum-bracelet", { resists: {"magic":4}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:black-pearl-electrum-choker", "Black Pearl Electrum Choker", 122, "item:black-pearl", "item:black-pearl-electrum-choker", { stats: {"dex":4,"agi":4}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:black-sapphire-electrum-earring", "Black Sapphire Electrum Earring", 140, "item:black-sapphire-ulthork", "item:black-sapphire-electrum-earring", { ac: 2, hp: 35, mana: 25, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:electrum-amber-earring", "Electrum Amber Earring", 100, "item:amber", "item:electrum-amber-earring", { stats: {"str":1}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:electrum-bloodstone-necklace", "Electrum Bloodstone Necklace", 87, "item:bloodstone", "item:electrum-bloodstone-necklace", { stats: {"sta":3}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-carnelian-wedding-ring", "Electrum Carnelian Wedding Ring", 95, "item:carnelian", "item:electrum-carnelian-wedding-ring", { stats: {"agi":3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:electrum-cat-eye-bracelet", "Electrum Cat Eye Bracelet", 84, "item:cat-s-eye-agate", "item:electrum-cat-eye-bracelet", { stats: {"cha":4}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:electrum-fire-wedding-ring", "Electrum Fire Wedding Ring", 124, "item:fire-opal", "item:electrum-fire-wedding-ring", { ac: 3, hp: 35, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:electrum-jasper-earring", "Electrum Jasper Earring", 92, "item:jasper", "item:electrum-jasper-earring", { stats: {"wis":2}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:electrum-lapis-lazuli-earring", "Electrum Lapis Lazuli Earring", 76, "item:lapis-lazuli", "item:electrum-lapis-lazuli-earring", { resists: {"disease":3}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:electrum-onyx-pendant", "Electrum Onyx Pendant", 90, "item:onyx", "item:electrum-onyx-pendant", { stats: {"dex":3}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-opal-amulet", "Electrum Opal Amulet", 119, "item:opal", "item:electrum-opal-amulet", { stats: {"sta":4,"agi":3}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-star-amulet", "Electrum Star Amulet", 98, "item:star-rose-quartz", "item:electrum-star-amulet", { stats: {"int":2}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:electrum-star-ruby-ring", "Electrum Star Ruby Ring", 127, "item:star-ruby-ulthork", "item:electrum-star-ruby-ring", { stats: {"dex":5,"cha":7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:emerald-electrum-bracelet", "Emerald Electrum Bracelet", 116, "item:emerald", "item:emerald-electrum-bracelet", { ac: 3, resists: {"fire":4}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:fire-emerald-electrum-bracelet", "Fire Emerald Electrum Bracelet", 130, "item:fire-emerald-ulthork", "item:fire-emerald-electrum-bracelet", { stats: {"str":3,"dex":5}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:jacinth-electrum-wedding-ring", "Jacinth Electrum Wedding Ring", 138, "item:jacinth-ulthork", "item:jacinth-electrum-wedding-ring", { ac: 7, resists: {"magic":-3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:jaded-electrum-bracelet", "Jaded Electrum Bracelet", 106, "item:jade", "item:jaded-electrum-bracelet", { ac: 2, hp: 10, mana: 10, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:ruby-electrum-ring", "Ruby Electrum Ring", 135, "item:ruby-ulthork", "item:ruby-electrum-ring", { stats: {"str":4,"wis":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:sapphire-electrum-earring", "Sapphire Electrum Earring", 132, "item:sapphire-ulthork", "item:sapphire-electrum-earring", { stats: {"str":4,"int":2}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:topaz-electrum-earring", "Topaz Electrum Earring", 111, "item:topaz", "item:topaz-electrum-earring", { ac: 2, resists: {"disease":5}, weight: 0.1, size: "Tiny", slots: ["Ear"] });

save();
console.log(`Migration 426 complete: ${recipesAdded} recipe(s) added for Jewelcrafting (Electrum tier)`);
