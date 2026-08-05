/**
 * Migration 416 (issue #52, batch 4/N): `Skill Tailoring`'s own "Quest
 * Items" section -- real skill-check Tailoring combines whose output feeds
 * a specific quest chain (Fang of the Wolf, Necromancer Skullcap,
 * Shadowbound Armor/Robe of Enshroudment, Copper Coldain Insignia Ring,
 * Coldain Prayer Shawl Quests). Crystalline Silk Fiber (trivial 51) is
 * this same table's own entry for Coldain Shawl #5's starting ingredient
 * -- already modeled in migration 415 (Bags and Miscellaneous), reused
 * here rather than duplicated.
 *
 * **Two rows excluded**: Robe of the Lost Circle and Monk Training Bag are
 * both explicitly "No Fail" on eqlwiki's own table -- not a skill-check
 * recipe at all (no `trivial`, which this schema's `recipe.trivial` field
 * assumes always exists per decisions/tradeskill-recipe-node-schema.md's
 * success-threshold math). Same call as excluding Glowing Crystalline Silk
 * Piece's own recipe below (also No-Fail per Crystalline Silk Fiber's own
 * item page) -- modeled as a plain `item` with a `source` note instead of
 * inventing a recipe node for a combine this schema has no field for.
 *
 * **Ingredient items far up these chains** (Patch of Gnoll Fur, Torn/
 * Ripped Tapestry, Shadow Wolf Pelt, Drakkel Wolf Whisker, Manticore Mane,
 * Siren Hair, Woven Frost Giant Beard, Encased Velium Etched Rune, Runed
 * Prayer Shawl Pattern, Embroidered Shawl Pattern, Fur-Lined Coldain
 * Prayer Shawl) get a plain `item` node with whatever sourcing note the
 * parent combine's own page states (Dropped/Quested/Crafted) rather than
 * each being individually deep-sourced from its own page -- none have a
 * `soldby` table (quest-chain-only per every page checked), so there's no
 * vendor data to lose by not walking further. "Spell Scroll of Gather
 * Shadows" (consumed as a tradeskill ingredient, distinct from casting the
 * spell) is modeled as its own plain `item`, not a `uses` edge to the
 * pre-existing `spell:gather-shadows` node -- `uses` has never pointed at
 * a non-`item`/`container` target anywhere in this schema, and a scroll
 * being spent as a reagent is a different fact from the spell it teaches.
 *
 * Container: every recipe in this section says "In Loom" on its own item
 * page except Coldain Hunting Blanket ("In Large Sewing Kit").
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title query against every directly-produced item's own page), not
 * a summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: string,
  craftedIn: string,
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, craftedIn, "crafted_in");
}

// ---------------------------------------------------------------------
// Fang of the Wolf quest chain.
// ---------------------------------------------------------------------
addItem("item:patch-of-gnoll-fur", "Patch of Gnoll Fur", { weight: 0.1, size: "Small", source: "Dropped by gnolls" });
addItem("item:gnoll-fur-patch", "Gnoll Fur Patch", { weight: 0.3, size: "Small" });
addItem("item:gnoll-fur-patch-quarter", "Gnoll Fur Patch Quarter", { weight: 3.5, size: "Large" });
addItem("item:patched-gnoll-fur-bundle", "Patched Gnoll Fur Bundle", { slots: ["Back"], ac: 4, resists: { cold: 5 }, weight: 4.0, size: "Large", classes: [] });
addRecipe("recipe:gnoll-fur-patch", "Gnoll Fur Patch", 21, [{ id: "item:patch-of-gnoll-fur", quantity: 4 }], "item:gnoll-fur-patch", "container:loom");
addRecipe("recipe:gnoll-fur-patch-quarter", "Gnoll Fur Patch Quarter", 26, [{ id: "item:gnoll-fur-patch", quantity: 4 }], "item:gnoll-fur-patch-quarter", "container:loom");
addRecipe("recipe:patched-gnoll-fur-bundle", "Patched Gnoll Fur Bundle", 31, [{ id: "item:gnoll-fur-patch-quarter", quantity: 4 }], "item:patched-gnoll-fur-bundle", "container:loom");

// ---------------------------------------------------------------------
// Necromancer Skullcap Quests (2nd Rank).
// ---------------------------------------------------------------------
addItem("item:torn-tapestry", "Torn Tapestry", { size: "Tiny", source: "Dropped in Lake of Ill Omen" });
addItem("item:ripped-tapestry", "Ripped Tapestry", { size: "Tiny", source: "Dropped in Lake of Ill Omen" });
addItem("item:mended-tapestry", "Mended Tapestry", { weight: 0.0, size: "Tiny", noTrade: true, source: "Lore item; the rolled-up Note for Necromancer Skullcap Quests, 2nd Rank" });
addRecipe("recipe:mended-tapestry", "Mended Tapestry", 23, [{ id: "item:torn-tapestry" }, { id: "item:ripped-tapestry" }], "item:mended-tapestry", "container:loom");

// ---------------------------------------------------------------------
// Shadowbound Armor / Robe of Enshroudment quest chain.
// ---------------------------------------------------------------------
addItem("item:shadow-wolf-pelt", "Shadow Wolf Pelt", { size: "Small", source: "Dropped by shadow wolves" });
addItem("item:spell-scroll-gather-shadows", "Spell Scroll of Gather Shadows", { source: "Bought; consumed as a Tailoring reagent (distinct from casting the Gather Shadows spell itself)" });
addRecipe("recipe:large-shadow-silk", "Large Shadow Silk", 34,
  [{ id: "item:shadow-wolf-pelt", quantity: 2 }, { id: "item:silk-swatch" }, { id: "item:spell-scroll-gather-shadows" }],
  "item:large-shadow-silk", "container:loom");
addRecipe("recipe:inky-shadow-silk", "Inky Shadow Silk", 34,
  [{ id: "item:shadow-wolf-pelt" }, { id: "item:silk-swatch" }, { id: "item:spell-scroll-gather-shadows", quantity: 2 }],
  "item:inky-shadow-silk", "container:loom");
addRecipe("recipe:shadow-silk", "Shadow Silk", 36,
  [{ id: "item:shadow-wolf-pelt" }, { id: "item:silk-swatch" }, { id: "item:spell-scroll-gather-shadows" }],
  "item:shadow-silk", "container:loom");
addItem("item:large-shadow-silk", "Large Shadow Silk", { weight: 0.1, size: "Small", source: "Robe of Enshroudment quest ingredient" });
addItem("item:inky-shadow-silk", "Inky Shadow Silk", { weight: 0.1, size: "Small", source: "ShadowBound Gloves quest ingredient" });
addItem("item:shadow-silk", "Shadow Silk", { weight: 0.1, size: "Small", source: "ShadowBound Boots quest ingredient; also used in the Monk epic quest Robe of the Lost Circle" });

// ---------------------------------------------------------------------
// Copper Coldain Insignia Ring (Coldain Ring Quests #1).
// ---------------------------------------------------------------------
addItem("item:high-quality-cougarskin", "High Quality Cougarskin", { source: "Dropped" });
addItem("item:high-quality-tundra-kodiak-pelt", "High Quality Tundra Kodiak Pelt", { source: "Dropped" });
addItem("item:coldain-hunting-blanket", "Coldain Hunting Blanket", { slots: ["Finger"], weight: 1.0, size: "Medium", noTrade: true, classes: [] });
addRecipe("recipe:coldain-hunting-blanket", "Coldain Hunting Blanket", 41,
  [{ id: "item:high-quality-cougarskin", quantity: 2 }, { id: "item:high-quality-tundra-kodiak-pelt", quantity: 2 }],
  "item:coldain-hunting-blanket", "container:large-sewing-kit");

// ---------------------------------------------------------------------
// Coldain Prayer Shawl Quests (#5-#7). Crystalline Silk Fiber (#5's own
// starting ingredient, trivial 51) already exists from migration 415.
// ---------------------------------------------------------------------
addItem("item:fur-lined-coldain-prayer-shawl", "Fur-Lined Coldain Prayer Shawl", { source: "Coldain Prayer Shawl Quests reward (earlier shawl in the chain)" });
addItem("item:glowing-crystalline-silk-piece", "Glowing Crystalline Silk Piece", { source: "Made from Crystalline Silk Fiber via a No-Fail non-tradeskill combine (not a skill-check recipe)" });
addItem("item:silk-coldain-prayer-shawl", "Silk Coldain Prayer Shawl", {
  slots: ["Shoulders"], magic: true, noTrade: true, ac: 5, stats: { cha: 5, wis: 5, int: 5 }, resists: { fire: 5, cold: 5 },
  weight: 2.0, size: "Small", classes: [], source: "Coldain Prayer Shawl Quests #5",
});
addRecipe("recipe:silk-coldain-prayer-shawl", "Silk Coldain Prayer Shawl", 115,
  [{ id: "item:fur-lined-coldain-prayer-shawl" }, { id: "item:glowing-crystalline-silk-piece", quantity: 5 }],
  "item:silk-coldain-prayer-shawl", "container:loom");

addItem("item:drakkel-wolf-whisker", "Drakkel Wolf Whisker", { source: "Dropped" });
addItem("item:manticore-mane", "Manticore Mane", { source: "Dropped" });
addItem("item:siren-hair", "Siren Hair", { source: "Dropped" });
addItem("item:woven-frost-giant-beard", "Woven Frost Giant Beard", { source: "Dropped" });
addItem("item:spool-of-sacred-coldain-thread", "Spool of Sacred Coldain Thread", { magic: true, noTrade: true, weight: 0.2, size: "Small", source: "Coldain Prayer Shawl Quests #6 ingredient" });
addRecipe("recipe:spool-of-sacred-coldain-thread", "Spool of Sacred Coldain Thread", 162,
  [{ id: "item:drakkel-wolf-whisker", quantity: 2 }, { id: "item:manticore-mane", quantity: 2 }, { id: "item:siren-hair", quantity: 2 }, { id: "item:woven-frost-giant-beard" }],
  "item:spool-of-sacred-coldain-thread", "container:loom");

addItem("item:embroidered-shawl-pattern", "Embroidered Shawl Pattern", { source: "Coldain Prayer Shawl Quests #6" });
addItem("item:embroidered-coldain-prayer-shawl", "Embroidered Coldain Prayer Shawl", {
  slots: ["Shoulders"], magic: true, noTrade: true, ac: 6, stats: { sta: 6, cha: 6, wis: 6, int: 6 }, resists: { fire: 6, cold: 6 },
  weight: 2.0, size: "Small", classes: [], source: "Coldain Prayer Shawl Quests #6, shawl #6",
});
addRecipe("recipe:embroidered-coldain-prayer-shawl", "Embroidered Coldain Prayer Shawl", 208,
  [{ id: "item:embroidered-shawl-pattern" }, { id: "item:silk-coldain-prayer-shawl" }, { id: "item:spool-of-sacred-coldain-thread" }],
  "item:embroidered-coldain-prayer-shawl", "container:loom");

addItem("item:encased-velium-etched-rune", "Encased Velium Etched Rune", { source: "Coldain Prayer Shawl Quests #7 ingredient" });
addItem("item:runed-prayer-shawl-pattern", "Runed Prayer Shawl Pattern", { source: "Coldain Prayer Shawl Quests #7, quested" });
addItem("item:runed-coldain-prayer-shawl", "Runed Coldain Prayer Shawl", {
  slots: ["Shoulders"], magic: true, noTrade: true, ac: 7, stats: { sta: 7, cha: 7, wis: 7, int: 7 }, resists: { fire: 7, cold: 7, poison: 7 },
  effect: "Flowing Thought I (Worn)", weight: 2.0, size: "Small", classes: [], source: "Coldain Prayer Shawl Quests #7, shawl #7",
});
addRecipe("recipe:runed-coldain-prayer-shawl", "Runed Coldain Prayer Shawl", 162,
  [{ id: "item:embroidered-coldain-prayer-shawl" }, { id: "item:encased-velium-etched-rune" }, { id: "item:runed-prayer-shawl-pattern" }],
  "item:runed-coldain-prayer-shawl", "container:loom");

save();
console.log(`Migration 416 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Tailoring quest-chain items`);
