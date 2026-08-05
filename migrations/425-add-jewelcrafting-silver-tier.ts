/**
 * Migration 425: model Jewelcrafting's Silver-tier Basic jewelry (issue
 * #50), via `recipe --uses--> item` (gem + Enchanted Silver Bar) and
 * `recipe --produces--> item` (the finished piece) -- see decisions/
 * tradeskill-recipe-node-schema.md for the schema.
 *
 * eqlwiki.com's `Jewelcrafting` page's own "Crafters Item Table" (Basic,
 * Silver rows) gives trivial/stat data, but its "Metal" column just says
 * "Silver" as a tier label -- each item's own page confirms the real
 * ingredient is the *enchanted* bar (e.g. Silver Malachite Ring's own page:
 * "1 x [[Enchanted Silver Bar]] - Summoned"), matching the page's Basics
 * section ("only enchanted versions have any bonus statistics"). All 28
 * items were fetched individually (not just the summary table) via
 * eqlwiki's MediaWiki API raw wikitext, both to confirm the real ingredient
 * and to check for a bonus/proc effect beyond the stat block (none found --
 * every item stops at Slot/stats/WT/Size). Two trivials disagreed with the
 * summary table (Hematite 21->22, Turquoise 18->20); each item's own page
 * wins per the Tailoring-established "individual page is more authoritative"
 * rule.
 *
 * Most gems already existed as items (quest-reward/drop items from other
 * batches, several already annotated "common tradeskill/jewelcrafting
 * ingredient") -- reused by their existing id rather than re-added under a
 * new slug, including several `-ulthork`-suffixed ids from an earlier
 * "Ulthork Tusks Quest" reward batch. Seven gems (Emerald, Peridot, Jade,
 * Fire Opal, Opal, Star Rose Quartz, Topaz) didn't exist yet; each is
 * loot-drop-only on its own eqlwiki page (no `soldby` table), so they get no
 * `sells` edge, consistent with Brewing/Tailoring's "absence is the fact"
 * precedent. Enchanted Silver Bar already existed (player-crafted via the
 * Enchant Silver spell, no vendor).
 *
 * Each recipe also gets a `crafted_in` edge to container:jewelers-kit
 * (migration 424).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

function addGem(id: string, label: string) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", weight: 0.1, size: "Tiny" });
  itemsAdded++;
}

addGem("item:emerald", "Emerald");
addGem("item:peridot", "Peridot");
addGem("item:jade", "Jade");
addGem("item:fire-opal", "Fire Opal");
addGem("item:opal", "Opal");
addGem("item:star-rose-quartz", "Star Rose Quartz");
addGem("item:topaz", "Topaz");

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
  addEdge(recipeId, "item:enchanted-silver-bar", "uses");
  addEdge(recipeId, gemId, "uses");
  addEdge(recipeId, producedId, "produces");
  addEdge(recipeId, "container:jewelers-kit", "crafted_in");
  recipesAdded++;
}

addRecipe("recipe:silver-diamond-wedding-ring", "Silver Diamond Wedding Ring", 71, "item:diamond-ulthork", "item:silver-diamond-wedding-ring", { resists: {"fire":3,"cold":3,"disease":3,"poison":3,"magic":3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-emerald-ring", "Silver Emerald Ring", 48, "item:emerald", "item:silver-emerald-ring", { ac: 2, resists: {"fire":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-hematite-ring", "Silver Hematite Ring", 22, "item:hematite", "item:silver-hematite-ring", { resists: {"fire":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-malachite-ring", "Silver Malachite Ring", 17, "item:malachite", "item:silver-malachite-ring", { resists: {"poison":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-turquoise-bracelet", "Silver Turquoise Bracelet", 20, "item:turquoise", "item:silver-turquoise-bracelet", { resists: {"cold":2}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:silvered-pearl-ring", "Silvered Pearl Ring", 42, "item:pearl", "item:silvered-pearl-ring", { ac: 2, resists: {"poison":4}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silvered-peridot-ring", "Silvered Peridot Ring", 46, "item:peridot", "item:silvered-peridot-ring", { ac: 2, resists: {"cold":5}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-amber-ring", "Silver Amber Ring", 36, "item:amber", "item:silver-amber-ring", { stats: {"str":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:black-sapphire-silvered-necklace", "Black Sapphire Silvered Necklace", 68, "item:black-sapphire-ulthork", "item:black-sapphire-silvered-necklace", { ac: 3, hp: 30, mana: 30, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:blackened-pearl-silver-ring", "Blackened Pearl Silver Ring", 52, "item:black-pearl", "item:blackened-pearl-silver-ring", { stats: {"dex":3,"agi":3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:jaded-silver-ring", "Jaded Silver Ring", 40, "item:jade", "item:jaded-silver-ring", { ac: 1, hp: 5, mana: 5, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-bloodstone-earring", "Silver Bloodstone Earring", 26, "item:bloodstone", "item:silver-bloodstone-earring", { stats: {"sta":2}, weight: 0.1, size: "Tiny", slots: ["Ear"] });
addRecipe("recipe:silver-blue-diamond-ring", "Silver Blue Diamond Ring", 75, "item:blue-diamond-ulthork", "item:silver-blue-diamond-ring", { mana: 10, resists: {"fire":4,"cold":4,"disease":4,"poison":4,"magic":4}, weight: 0.1, size: "Tiny", slots: ["Finger"], source: "Velious era" });
addRecipe("recipe:silver-carnelian-wedding-ring", "Silver Carnelian Wedding Ring", 32, "item:carnelian", "item:silver-carnelian-wedding-ring", { stats: {"agi":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-cat-eye-necklace", "Silver Cat Eye Necklace", 24, "item:cat-s-eye-agate", "item:silver-cat-eye-necklace", { stats: {"cha":3}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:silver-fire-wedding-ring", "Silver Fire Wedding Ring", 54, "item:fire-opal", "item:silver-fire-wedding-ring", { ac: 2, hp: 30, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-jacinth-wedding-ring", "Silver Jacinth Wedding Ring", 66, "item:jacinth-ulthork", "item:silver-jacinth-wedding-ring", { ac: 10, resists: {"magic":-7}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-jasper-ring", "Silver Jasper Ring", 30, "item:jasper", "item:silver-jasper-ring", { stats: {"wis":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-lapis-lazuli-necklace", "Silver Lapis Lazuli Necklace", 21, "item:lapis-lazuli", "item:silver-lapis-lazuli-necklace", { resists: {"disease":2}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:silver-onyx-bracelet", "Silver Onyx Bracelet", 28, "item:onyx", "item:silver-onyx-bracelet", { stats: {"dex":2}, weight: 0.1, size: "Tiny", slots: ["Wrist"] });
addRecipe("recipe:silver-opal-engagement-ring", "Silver Opal Engagement Ring", 50, "item:opal", "item:silver-opal-engagement-ring", { stats: {"sta":3,"agi":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-rose-engagement-ring", "Silver Rose Engagement Ring", 34, "item:star-rose-quartz", "item:silver-rose-engagement-ring", { stats: {"int":2}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silver-ruby-veil", "Silver Ruby Veil", 63, "item:ruby-ulthork", "item:silver-ruby-veil", { stats: {"str":4,"wis":4}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:silver-wolf-s-eye-necklace", "Silver Wolf's Eye Necklace", 38, "item:wolfs-eye-agate", "item:silver-wolf-s-eye-necklace", { resists: {"magic":4}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:silvered-fire-emerald-ring", "Silvered Fire Emerald Ring", 58, "item:fire-emerald-ulthork", "item:silvered-fire-emerald-ring", { stats: {"str":3,"dex":3}, weight: 0.1, size: "Tiny", slots: ["Finger"] });
addRecipe("recipe:silvered-sapphire-necklace", "Silvered Sapphire Necklace", 60, "item:sapphire-ulthork", "item:silvered-sapphire-necklace", { stats: {"str":4,"int":4}, weight: 0.1, size: "Tiny", slots: ["Neck"] });
addRecipe("recipe:silvered-star-ruby-veil", "Silvered Star Ruby Veil", 56, "item:star-ruby-ulthork", "item:silvered-star-ruby-veil", { stats: {"dex":5,"cha":5}, weight: 0.1, size: "Tiny", slots: ["Face"] });
addRecipe("recipe:topaz-silver-necklace", "Topaz Silver Necklace", 44, "item:topaz", "item:topaz-silver-necklace", { ac: 3, resists: {"disease":5}, weight: 0.1, size: "Tiny", slots: ["Neck"] });

save();
console.log(`Migration 425 complete: ${recipesAdded} recipe(s), ${itemsAdded} new gem item(s) added for Jewelcrafting (Silver tier)`);
