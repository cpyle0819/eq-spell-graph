/**
 * Ogre Cultural Tradeskills (issue #65) -- Blacksmithing only, at the Oggok
 * Forge. Source: eqlwiki.com's "Cultural Tradeskills: Ogre" overview page
 * plus its own item pages, batch-fetched via the raw wikitext MediaWiki
 * API, never the summarizing WebFetch tool.
 *
 * The Dark Elf/Ogre alliance (both races can perform each other's
 * Adamantite subcombines, migration 389's own docblock) means all 10
 * Adamantite basics/enchanted-basics items -- and *both* their Teir'dal-
 * Forge and Oggok-Forge recipe variants -- already exist from that Dark
 * Elf migration. Nothing to add here; this migration only reuses those ids.
 *
 * Two deities imbue both the Plate and Chain (Splintmail) lines here:
 * Rallos Zek (Imbued Jade) and Cazic Thule (Imbued Amber) -- 12 pieces x 2
 * deities x 2 armor lines = 48 imbued armor items, each its own real item/
 * recipe pair (full-fidelity scope), reusing Imbued Amber from Iksar's own
 * migration (#392) since it's the same shared item there too.
 *
 * "Imbued Ogre War Mace" and "Imbued Ogre War Hammer" are each ONE wiki
 * page whose own notes field admits it actually covers "two different
 * items ... with different deity restrictions" (Rallos Zek via Imbued
 * Jade, Cazic Thule via Imbued Amber) -- split into 4 real item/recipe
 * pairs by hand rather than the automatic per-page loop, so this graph
 * doesn't collapse two distinct deity-restricted items into one.
 *
 * Ogre Splintmail (Chain) uses a real cross-tradeskill dependency: each
 * piece combines a Blacksmithing Sheet of Adamantite/Chainmail Pattern
 * with a "Large Leather" armor piece that Tailoring (issue #52, still
 * unmigrated) would actually craft. Those 12 Large Leather items already
 * exist as bare stub precursors -- added by Barbarian's own migration for
 * its own Ring Chain armor, another race needing the same pieces -- reused
 * here rather than duplicated, still with no recipe of their own until
 * Tailoring itself is modeled.
 *
 * The 12 "Large Chainmail * Pattern" titles turned out to be wiki
 * #REDIRECTs to the plain "Chainmail * Pattern" items already in the graph
 * (same pattern as Dwarf's "Small Chainmail *"), confirmed per-page before
 * reuse. The overview table's own "Large Round Shield Mold" for Ogre
 * Bouncer Shield doesn't match that item's own individual page, which
 * links a plain "Round Shield Mold" instead (a real, separate, already-
 * graphed item) -- trusted over the overview table, which had its own
 * documented error on this exact item already (its `notes` field: "This
 * recipe incorrectly listed a ring instead of 2x adamantite sheet").
 * "Large Round Shield Mold" is real but ends up unused by anything in this
 * migration, so it's excluded rather than added as an orphan.
 *
 * "Ogre War Hammer"'s own page gives a non-numeric Trivial ("<115");
 * 115 used instead of dropping the recipe (same handling as High Elf's
 * Enchanted Block of Mithril).
 *
 * Parser fix: the HP: field regex only allowed an optional "-", not "+",
 * so "HP: +8" (Ogre Bouncer Shield) parsed as no HP at all -- STR/STA/etc.
 * already handled +/- correctly, this was the one field that didn't. Two
 * already-committed Dwarf items (Stormguard Battle Axe of Brell, Stormguard
 * Battle Hammer of Brell, both "HP: +5") lost their hp field to this same
 * gap in migration 390 -- patched here as a small addNode() call alongside
 * this migration's own additions, not left silently wrong.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, updateNode, save } = loadGraph(import.meta.dir);

// Retroactive fix for migration 390 (Dwarf): the wikitext parser's HP:
// regex only allowed an optional "-", not "+", so "HP: +5" on both these
// items parsed as no HP at all -- caught while writing this migration's own
// parser fix for the identical gap on Ogre Bouncer Shield's "HP: +8".
updateNode("item:stormguard-battle-axe-of-brell", { hp: 5 });
updateNode("item:stormguard-battle-hammer-of-brell", { hp: 5 });

let recipesAdded = 0;
let itemsAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, trivial: number | undefined, uses: Ingredient[], produces: string, craftedIn: string[], tradeskill = "Blacksmithing") {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

const FORGE = "container:forge";

addItem("item:imbued-ogre-war-boots-cazic-thule", "Imbued Ogre War Boots (Cazic Thule)", { slots: ["Feet"], ac: 13, stats: {"sta":4}, resists: {"magic":2}, weight: 9.1, size: "Medium", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-boots-cazic-thule", "Imbued Ogre War Boots (Cazic Thule)", 222, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-amber" }, { id: "item:large-plate-boot-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-boots-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-bracer-cazic-thule", "Imbued Ogre War Bracer (Cazic Thule)", { slots: ["Wrist"], ac: 11, stats: {"str":2,"wis":2}, resists: {"magic":2}, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-bracer-cazic-thule", "Imbued Ogre War Bracer (Cazic Thule)", 222, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-amber" }, { id: "item:large-plate-bracer-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-bracer-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-breastplate-cazic-thule", "Imbued Ogre War Breastplate (Cazic Thule)", { slots: ["Chest"], ac: 26, stats: {"str":8}, resists: {"magic":2}, weight: 14, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-breastplate-cazic-thule", "Imbued Ogre War Breastplate (Cazic Thule)", 242, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-amber" }, { id: "item:large-breastplate-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-breastplate-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-cloak-cazic-thule", "Imbued Ogre War Cloak (Cazic Thule)", { slots: ["Back"], ac: 11, stats: {"str":6,"sta":2}, resists: {"magic":2}, weight: 7.5, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-cloak-cazic-thule", "Imbued Ogre War Cloak (Cazic Thule)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-amber" }, { id: "item:large-field-splinted-cloak-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-cloak-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-collar-cazic-thule", "Imbued Ogre War Collar (Cazic Thule)", { slots: ["Neck"], ac: 9, stats: {"str":2,"sta":2}, resists: {"magic":2}, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-collar-cazic-thule", "Imbued Ogre War Collar (Cazic Thule)", 218, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-amber" }, { id: "item:large-plate-gorget-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-collar-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-gauntlets-cazic-thule", "Imbued Ogre War Gauntlets (Cazic Thule)", { slots: ["Hands"], ac: 13, stats: {"str":6}, resists: {"magic":2}, weight: 7.3, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-gauntlets-cazic-thule", "Imbued Ogre War Gauntlets (Cazic Thule)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-amber" }, { id: "item:large-plate-gauntlet-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-gauntlets-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-girdle-cazic-thule", "Imbued Ogre War Girdle (Cazic Thule)", { slots: ["Waist"], ac: 10, stats: {"str":2,"sta":4}, resists: {"magic":2}, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-girdle-cazic-thule", "Imbued Ogre War Girdle (Cazic Thule)", 200, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-amber" }, { id: "item:large-plate-belt-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-girdle-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-greaves-cazic-thule", "Imbued Ogre War Greaves (Cazic Thule)", { slots: ["Legs"], ac: 18, stats: {"str":2,"sta":4}, resists: {"magic":2}, weight: 10.4, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-greaves-cazic-thule", "Imbued Ogre War Greaves (Cazic Thule)", 235, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-amber" }, { id: "item:large-plate-greaves-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-greaves-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-helm-cazic-thule", "Imbued Ogre War Helm (Cazic Thule)", { slots: ["Head"], ac: 14, stats: {"wis":4}, resists: {"magic":2}, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-helm-cazic-thule", "Imbued Ogre War Helm (Cazic Thule)", 232, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-amber" }, { id: "item:large-plate-helm-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-helm-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-pauldron-cazic-thule", "Imbued Ogre War Pauldron (Cazic Thule)", { slots: ["Shoulders"], ac: 12, stats: {"str":2,"wis":2}, resists: {"magic":2}, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-pauldron-cazic-thule", "Imbued Ogre War Pauldron (Cazic Thule)", 222, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-amber" }, { id: "item:large-plate-helm-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-pauldron-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-vambraces-cazic-thule", "Imbued Ogre War Vambraces (Cazic Thule)", { slots: ["Arms"], ac: 14, stats: {"str":6}, resists: {"magic":2}, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-vambraces-cazic-thule", "Imbued Ogre War Vambraces (Cazic Thule)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-amber" }, { id: "item:large-plate-vambrace-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-vambraces-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-visor-cazic-thule", "Imbued Ogre War Visor (Cazic Thule)", { slots: ["Face"], ac: 7, stats: {"sta":2,"wis":2}, resists: {"magic":2}, weight: 2.2, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-ogre-war-visor-cazic-thule", "Imbued Ogre War Visor (Cazic Thule)", 216, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-amber" }, { id: "item:large-plate-visor-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-visor-cazic-thule", [FORGE]);

addItem("item:imbued-ogre-war-boots-rallos-zek", "Imbued Ogre War Boots (Rallos Zek)", { slots: ["Feet"], ac: 13, stats: {"sta":4}, resists: {"magic":2}, weight: 9.1, size: "Medium", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-boots-rallos-zek", "Imbued Ogre War Boots (Rallos Zek)", 222, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-jade" }, { id: "item:large-plate-boot-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-boots-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-bracer-rallos-zek", "Imbued Ogre War Bracer (Rallos Zek)", { slots: ["Wrist"], ac: 11, stats: {"str":2,"int":2}, resists: {"magic":2}, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-bracer-rallos-zek", "Imbued Ogre War Bracer (Rallos Zek)", 220, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-jade" }, { id: "item:large-plate-bracer-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-bracer-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-breastplate-rallos-zek", "Imbued Ogre War Breastplate (Rallos Zek)", { slots: ["Chest"], ac: 26, stats: {"str":8}, resists: {"magic":2}, weight: 14, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-breastplate-rallos-zek", "Imbued Ogre War Breastplate (Rallos Zek)", 242, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-jade" }, { id: "item:large-breastplate-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-breastplate-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-cloak-rallos-zek", "Imbued Ogre War Cloak (Rallos Zek)", { slots: ["Back"], ac: 11, stats: {"str":6,"sta":2}, resists: {"magic":2}, weight: 7.5, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-cloak-rallos-zek", "Imbued Ogre War Cloak (Rallos Zek)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-jade" }, { id: "item:large-field-splinted-cloak-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-cloak-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-collar-rallos-zek", "Imbued Ogre War Collar (Rallos Zek)", { slots: ["Neck"], ac: 9, stats: {"str":2,"sta":2}, resists: {"magic":2}, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-collar-rallos-zek", "Imbued Ogre War Collar (Rallos Zek)", 219, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-jade" }, { id: "item:large-plate-gorget-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-collar-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-gauntlets-rallos-zek", "Imbued Ogre War Gauntlets (Rallos Zek)", { slots: ["Hands"], ac: 13, stats: {"str":6}, resists: {"magic":2}, weight: 7.3, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-gauntlets-rallos-zek", "Imbued Ogre War Gauntlets (Rallos Zek)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-jade" }, { id: "item:large-plate-gauntlet-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-gauntlets-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-girdle-rallos-zek", "Imbued Ogre War Girdle (Rallos Zek)", { slots: ["Waist"], ac: 10, stats: {"str":2,"sta":4}, resists: {"magic":2}, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-girdle-rallos-zek", "Imbued Ogre War Girdle (Rallos Zek)", 200, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-jade" }, { id: "item:large-plate-belt-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-girdle-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-helm-rallos-zek", "Imbued Ogre War Helm (Rallos Zek)", { slots: ["Head"], ac: 14, stats: {"int":4}, resists: {"magic":2}, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-helm-rallos-zek", "Imbued Ogre War Helm (Rallos Zek)", 232, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-jade" }, { id: "item:large-plate-helm-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-helm-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-pauldron-rallos-zek", "Imbued Ogre War Pauldron (Rallos Zek)", { slots: ["Shoulders"], ac: 12, stats: {"str":2,"int":2}, resists: {"magic":2}, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-pauldron-rallos-zek", "Imbued Ogre War Pauldron (Rallos Zek)", 222, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-jade" }, { id: "item:large-plate-helm-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-pauldron-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-vambraces-rallos-zek", "Imbued Ogre War Vambraces (Rallos Zek)", { slots: ["Arms"], ac: 14, stats: {"str":6}, resists: {"magic":2}, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-vambraces-rallos-zek", "Imbued Ogre War Vambraces (Rallos Zek)", 228, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-jade" }, { id: "item:large-plate-vambrace-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-vambraces-rallos-zek", [FORGE]);

addItem("item:imbued-ogre-war-visor-rallos-zek", "Imbued Ogre War Visor (Rallos Zek)", { slots: ["Face"], ac: 7, stats: {"sta":2,"int":2}, resists: {"magic":2}, weight: 2.2, size: "Small", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-visor-rallos-zek", "Imbued Ogre War Visor (Rallos Zek)", 214, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-jade" }, { id: "item:large-plate-visor-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-visor-rallos-zek", [FORGE]);

addItem("item:ogre-bouncer-shield", "Ogre Bouncer Shield", { slots: ["Secondary"], ac: 12, hp: 8, weight: 6.2, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], source: "Note: This recipe incorrectly listed a ring instead of 2x adamantite sheet." });
addRecipe("recipe:ogre-bouncer-shield", "Ogre Bouncer Shield", 175, [{ id: "item:blood-temper" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:round-shield-mold" }, { id: "item:smithy-hammer" }], "item:ogre-bouncer-shield", [FORGE]);

addItem("item:ogre-war-hammer", "Ogre War Hammer", { slots: ["Primary"], skill: "2H Blunt", delay: 56, damage: 19, weight: 13, size: "Large", classes: ["Cleric","Monk","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-war-hammer", "Ogre War Hammer", 115, [{ id: "item:hammer-head-mold" }, { id: "item:oak-shaft" }, { id: "item:ogre-swill" }, { id: "item:sheet-of-adamantite" }], "item:ogre-war-hammer", [FORGE]);

addItem("item:ogre-war-mace", "Ogre War Mace", { slots: ["Range","Primary","Secondary"], skill: "1H Blunt", delay: 40, damage: 10, weight: 10, size: "Medium", classes: ["Bard","Cleric","Monk","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-war-mace", "Ogre War Mace", 102, [{ id: "item:mace-head-mold" }, { id: "item:oak-shaft" }, { id: "item:ogre-swill" }, { id: "item:sheet-of-adamantite" }], "item:ogre-war-mace", [FORGE]);

addItem("item:ogre-war-plate-boots", "Ogre War Plate Boots", { slots: ["Feet"], ac: 13, weight: 9.1, size: "Medium", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-boots", "Ogre War Plate Boots", 168, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:large-plate-boot-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-boots", [FORGE]);

addItem("item:ogre-war-plate-bracers", "Ogre War Plate Bracers", { slots: ["Wrist"], ac: 11, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-bracers", "Ogre War Plate Bracers", 168, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:large-plate-bracer-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-bracers", [FORGE]);

addItem("item:ogre-war-plate-breastplate", "Ogre War Plate Breastplate", { slots: ["Chest"], ac: 26, weight: 14, size: "Large", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-breastplate", "Ogre War Plate Breastplate", 188, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:large-breastplate-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-breastplate", [FORGE]);

addItem("item:ogre-war-plate-collar", "Ogre War Plate Collar", { slots: ["Neck"], ac: 9, weight: 5.5, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-collar", "Ogre War Plate Collar", 166, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:large-plate-gorget-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-collar", [FORGE]);

addItem("item:ogre-war-plate-gauntlets", "Ogre War Plate Gauntlets", { slots: ["Hands"], ac: 13, weight: 7.3, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-gauntlets", "Ogre War Plate Gauntlets", 175, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:large-plate-gauntlet-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-gauntlets", [FORGE]);

addItem("item:ogre-war-plate-girdle", "Ogre War Plate Girdle", { slots: ["Waist"], ac: 10, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-girdle", "Ogre War Plate Girdle", 168, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:large-plate-belt-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-girdle", [FORGE]);

addItem("item:ogre-war-plate-greaves", "Ogre War Plate Greaves", { slots: ["Legs"], ac: 18, weight: 10.4, size: "Large", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-greaves", "Ogre War Plate Greaves", 182, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:large-plate-greaves-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-greaves", [FORGE]);

addItem("item:ogre-war-plate-helm", "Ogre War Plate Helm", { slots: ["Head"], ac: 14, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-helm", "Ogre War Plate Helm", 179, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:large-plate-helm-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-helm", [FORGE]);

addItem("item:ogre-war-plate-pauldron", "Ogre War Plate Pauldron", { slots: ["Shoulders"], ac: 12, weight: 6, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-pauldron", "Ogre War Plate Pauldron", 168, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:large-plate-pauldron-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-pauldron", [FORGE]);

addItem("item:ogre-war-plate-vambraces", "Ogre War Plate Vambraces", { slots: ["Arms"], ac: 14, weight: 9, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-vambraces", "Ogre War Plate Vambraces", 175, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:large-plate-vambrace-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-vambraces", [FORGE]);

addItem("item:ogre-war-plate-visor", "Ogre War Plate Visor", { slots: ["Face"], ac: 7, weight: 2.2, size: "Small", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-plate-visor", "Ogre War Plate Visor", 163, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:large-plate-visor-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-plate-visor", [FORGE]);

addItem("item:ogre-war-splinted-cloak", "Ogre War Splinted Cloak", { slots: ["Back"], ac: 11, weight: 7.5, size: "Large", classes: ["Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:ogre-war-splinted-cloak", "Ogre War Splinted Cloak", 175, [{ id: "item:adamantite-chain-jointing" }, { id: "item:blood-temper" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:large-field-splinted-cloak-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:ogre-war-splinted-cloak", [FORGE]);

addItem("item:imbued-ogre-war-greaves-rallos-zek", "Imbued Ogre War Greaves (Rallos Zek)", { slots: ["Legs"], ac: 18, stats: {"str":2,"sta":4}, resists: {"magic":2}, weight: 10.4, size: "Large", classes: ["Shadow Knight","Warrior"], deity: "Rallos Zek", magic: true });
addRecipe("recipe:imbued-ogre-war-greaves-rallos-zek", "Imbued Ogre War Greaves (Rallos Zek)", 218, [{ id: "item:blood-temper" }, { id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-jade" }, { id: "item:large-plate-greaves-mold" }, { id: "item:leather-padding" }, { id: "item:smithy-hammer" }], "item:imbued-ogre-war-greaves-rallos-zek", [FORGE]);

addItem("item:large-plate-visor-mold", "Large Plate Visor Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Gralbug (Oggok), Bubbgrib (Oggok)" });

addItem("item:imbued-jade", "Imbued Jade", { weight: 0.1, size: "Tiny", source: "Created from a normal Jade with the Imbue Jade spell." });

addItem("item:ogre-imbued-splint-belt-cazic-thule", "Ogre Imbued Splint Belt (Cazic Thule)", { slots: ["Waist"], ac: 8, stats: {"str":1,"wis":2}, weight: 4, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-belt-cazic-thule", "Ogre Imbued Splint Belt (Cazic Thule)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-skirt-pattern" }, { id: "item:large-leather-belt" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-belt-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-belt-rallos-zek", "Ogre Imbued Splint Belt (Rallos Zek)", { slots: ["Waist"], ac: 8, stats: {"str":3}, weight: 4, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-belt-rallos-zek", "Ogre Imbued Splint Belt (Rallos Zek)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-skirt-pattern" }, { id: "item:large-leather-belt" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-belt-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-boots-cazic-thule", "Ogre Imbued Splint Boots (Cazic Thule)", { slots: ["Feet"], ac: 9, stats: {"str":1,"wis":2}, weight: 6.5, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-boots-cazic-thule", "Ogre Imbued Splint Boots (Cazic Thule)", 142, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-boot-pattern" }, { id: "item:large-leather-boots" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-boots-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-boots-rallos-zek", "Ogre Imbued Splint Boots (Rallos Zek)", { slots: ["Feet"], ac: 9, stats: {"str":3}, weight: 6.5, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-boots-rallos-zek", "Ogre Imbued Splint Boots (Rallos Zek)", 142, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-boot-pattern" }, { id: "item:large-leather-boots" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-boots-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-bracer-cazic-thule", "Ogre Imbued Splint Bracer (Cazic Thule)", { slots: ["Wrist"], ac: 8, stats: {"str":1,"wis":2}, weight: 3.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-bracer-cazic-thule", "Ogre Imbued Splint Bracer (Cazic Thule)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-bracelet-pattern" }, { id: "item:large-leather-wristbands" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-bracer-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-bracer-rallos-zek", "Ogre Imbued Splint Bracer (Rallos Zek)", { slots: ["Wrist"], ac: 8, stats: {"str":3}, weight: 3.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-bracer-rallos-zek", "Ogre Imbued Splint Bracer (Rallos Zek)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-bracelet-pattern" }, { id: "item:large-leather-wristbands" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-bracer-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-cloak-cazic-thule", "Ogre Imbued Splint Cloak (Cazic Thule)", { slots: ["Back"], ac: 9, stats: {"str":1,"wis":2}, weight: 5.5, size: "Large", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-cloak-cazic-thule", "Ogre Imbued Splint Cloak (Cazic Thule)", 155, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-cloak-pattern" }, { id: "item:large-leather-cloak" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-cloak-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-cloak-rallos-zek", "Ogre Imbued Splint Cloak (Rallos Zek)", { slots: ["Back"], ac: 9, stats: {"str":3}, weight: 5.5, size: "Large", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-cloak-rallos-zek", "Ogre Imbued Splint Cloak (Rallos Zek)", 155, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-cloak-pattern" }, { id: "item:large-leather-cloak" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-cloak-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-gauntlets-cazic-thule", "Ogre Imbued Splint Gauntlets (Cazic Thule)", { slots: ["Hands"], ac: 9, stats: {"str":1,"wis":2}, weight: 5.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-gauntlets-cazic-thule", "Ogre Imbued Splint Gauntlets (Cazic Thule)", 155, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-glove-pattern" }, { id: "item:large-leather-gloves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-gauntlets-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-gauntlets-rallos-zek", "Ogre Imbued Splint Gauntlets (Rallos Zek)", { slots: ["Hands"], ac: 9, stats: {"str":3}, weight: 5.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-gauntlets-rallos-zek", "Ogre Imbued Splint Gauntlets (Rallos Zek)", 155, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-glove-pattern" }, { id: "item:large-leather-gloves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-gauntlets-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-gorget-cazic-thule", "Ogre Imbued Splint Gorget (Cazic Thule)", { slots: ["Neck"], ac: 7, stats: {"str":1,"wis":2}, weight: 3.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-gorget-cazic-thule", "Ogre Imbued Splint Gorget (Cazic Thule)", 146, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-neckguard-pattern" }, { id: "item:large-leather-gorget" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-gorget-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-gorget-rallos-zek", "Ogre Imbued Splint Gorget (Rallos Zek)", { slots: ["Neck"], ac: 7, stats: {"str":3}, weight: 3.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-gorget-rallos-zek", "Ogre Imbued Splint Gorget (Rallos Zek)", 146, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-neckguard-pattern" }, { id: "item:large-leather-gorget" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-gorget-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-helm-cazic-thule", "Ogre Imbued Splint Helm (Cazic Thule)", { slots: ["Head"], ac: 10, stats: {"str":1,"wis":2}, weight: 6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-helm-cazic-thule", "Ogre Imbued Splint Helm (Cazic Thule)", 159, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-coif-pattern" }, { id: "item:large-leather-skullcap" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-helm-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-helm-rallos-zek", "Ogre Imbued Splint Helm (Rallos Zek)", { slots: ["Head"], ac: 10, stats: {"str":3}, weight: 6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-helm-rallos-zek", "Ogre Imbued Splint Helm (Rallos Zek)", 159, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-coif-pattern" }, { id: "item:large-leather-skullcap" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-helm-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-leggings-cazic-thule", "Ogre Imbued Splint Leggings (Cazic Thule)", { slots: ["Legs"], ac: 12, stats: {"str":1,"wis":2}, weight: 7, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-leggings-cazic-thule", "Ogre Imbued Splint Leggings (Cazic Thule)", 162, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-pant-pattern" }, { id: "item:large-leather-leggings" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-leggings-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-leggings-rallos-zek", "Ogre Imbued Splint Leggings (Rallos Zek)", { slots: ["Legs"], ac: 12, stats: {"str":3}, weight: 7, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-leggings-rallos-zek", "Ogre Imbued Splint Leggings (Rallos Zek)", 162, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-pant-pattern" }, { id: "item:large-leather-leggings" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-leggings-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-mail-cazic-thule", "Ogre Imbued Splint Mail (Cazic Thule)", { slots: ["Chest"], ac: 18, stats: {"str":1,"wis":2}, weight: 9, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-mail-cazic-thule", "Ogre Imbued Splint Mail (Cazic Thule)", 168, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-tunic-pattern" }, { id: "item:large-leather-tunic" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mail-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-mail-rallos-zek", "Ogre Imbued Splint Mail (Rallos Zek)", { slots: ["Chest"], ac: 18, stats: {"str":3}, weight: 9, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-mail-rallos-zek", "Ogre Imbued Splint Mail (Rallos Zek)", 168, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-tunic-pattern" }, { id: "item:large-leather-tunic" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mail-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-mantle-cazic-thule", "Ogre Imbued Splint Mantle (Cazic Thule)", { slots: ["Shoulders"], ac: 8, stats: {"str":1,"wis":2}, weight: 5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-mantle-cazic-thule", "Ogre Imbued Splint Mantle (Cazic Thule)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-mantle-pattern" }, { id: "item:large-leather-shoulderpads" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mantle-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-mantle-rallos-zek", "Ogre Imbued Splint Mantle (Rallos Zek)", { slots: ["Shoulders"], ac: 8, stats: {"str":3}, weight: 5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-mantle-rallos-zek", "Ogre Imbued Splint Mantle (Rallos Zek)", 148, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-mantle-pattern" }, { id: "item:large-leather-shoulderpads" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mantle-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-mask-cazic-thule", "Ogre Imbued Splint Mask (Cazic Thule)", { slots: ["Face"], ac: 6, stats: {"str":1,"wis":2}, weight: 2.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-mask-cazic-thule", "Ogre Imbued Splint Mask (Cazic Thule)", 143, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-veil-pattern" }, { id: "item:large-leather-mask" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mask-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-mask-rallos-zek", "Ogre Imbued Splint Mask (Rallos Zek)", { slots: ["Face"], ac: 6, stats: {"str":3}, weight: 2.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-mask-rallos-zek", "Ogre Imbued Splint Mask (Rallos Zek)", 143, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-veil-pattern" }, { id: "item:large-leather-mask" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-mask-rallos-zek", [FORGE]);

addItem("item:ogre-imbued-splint-sleeves-cazic-thule", "Ogre Imbued Splint Sleeves (Cazic Thule)", { slots: ["Arms"], ac: 10, stats: {"str":1,"wis":2}, weight: 5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule" });
addRecipe("recipe:ogre-imbued-splint-sleeves-cazic-thule", "Ogre Imbued Splint Sleeves (Cazic Thule)", 143, [{ id: "item:blood-temper" }, { id: "item:imbued-amber" }, { id: "item:chainmail-sleeve-pattern" }, { id: "item:large-leather-sleeves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-sleeves-cazic-thule", [FORGE]);

addItem("item:ogre-imbued-splint-sleeves-rallos-zek", "Ogre Imbued Splint Sleeves (Rallos Zek)", { slots: ["Arms"], ac: 10, stats: {"str":3}, weight: 5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Rallos Zek" });
addRecipe("recipe:ogre-imbued-splint-sleeves-rallos-zek", "Ogre Imbued Splint Sleeves (Rallos Zek)", 155, [{ id: "item:blood-temper" }, { id: "item:imbued-jade" }, { id: "item:chainmail-sleeve-pattern" }, { id: "item:large-leather-sleeves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-imbued-splint-sleeves-rallos-zek", [FORGE]);

addItem("item:ogre-splintmail-belt", "Ogre Splintmail Belt", { slots: ["Waist"], ac: 8, weight: 4, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-belt", "Ogre Splintmail Belt", 128, [{ id: "item:blood-temper" }, { id: "item:chainmail-skirt-pattern" }, { id: "item:large-leather-belt" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-belt", [FORGE]);

addItem("item:ogre-splintmail-boots", "Ogre Splintmail Boots", { slots: ["Feet"], ac: 9, weight: 6.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-boots", "Ogre Splintmail Boots", 122, [{ id: "item:blood-temper" }, { id: "item:chainmail-boot-pattern" }, { id: "item:large-leather-boots" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-boots", [FORGE]);

addItem("item:ogre-splintmail-bracer", "Ogre Splintmail Bracer", { slots: ["Wrist"], ac: 8, weight: 3.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-bracer", "Ogre Splintmail Bracer", 122, [{ id: "item:blood-temper" }, { id: "item:chainmail-bracelet-pattern" }, { id: "item:large-leather-wristbands" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-bracer", [FORGE]);

addItem("item:ogre-splintmail-cloak", "Ogre Splintmail Cloak", { slots: ["Back"], ac: 9, weight: 5.5, size: "Large", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-cloak", "Ogre Splintmail Cloak", 135, [{ id: "item:blood-temper" }, { id: "item:chainmail-cloak-pattern" }, { id: "item:large-leather-cloak" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-cloak", [FORGE]);

addItem("item:ogre-splintmail-gauntlets", "Ogre Splintmail Gauntlets", { slots: ["Hands"], ac: 9, weight: 5.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-gauntlets", "Ogre Splintmail Gauntlets", 135, [{ id: "item:blood-temper" }, { id: "item:chainmail-glove-pattern" }, { id: "item:large-leather-gloves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-gauntlets", [FORGE]);

addItem("item:ogre-splintmail-gorget", "Ogre Splintmail Gorget", { slots: ["Neck"], ac: 7, weight: 3.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-gorget", "Ogre Splintmail Gorget", 126, [{ id: "item:blood-temper" }, { id: "item:chainmail-neckguard-pattern" }, { id: "item:large-leather-gorget" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-gorget", [FORGE]);

addItem("item:ogre-splintmail-helm", "Ogre Splintmail Helm", { slots: ["Head"], ac: 10, weight: 6, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-helm", "Ogre Splintmail Helm", 139, [{ id: "item:blood-temper" }, { id: "item:chainmail-coif-pattern" }, { id: "item:large-leather-skullcap" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-helm", [FORGE]);

addItem("item:ogre-splintmail-leggings", "Ogre Splintmail Leggings", { slots: ["Legs"], ac: 12, weight: 7, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-leggings", "Ogre Splintmail Leggings", 142, [{ id: "item:blood-temper" }, { id: "item:chainmail-pant-pattern" }, { id: "item:large-leather-leggings" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-leggings", [FORGE]);

addItem("item:ogre-splintmail-mail", "Ogre Splintmail Mail", { slots: ["Chest"], ac: 18, weight: 9, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-mail", "Ogre Splintmail Mail", 148, [{ id: "item:blood-temper" }, { id: "item:chainmail-tunic-pattern" }, { id: "item:large-leather-tunic" }, { id: "item:sheet-of-adamantite", quantity: 3 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-mail", [FORGE]);

addItem("item:ogre-splintmail-mantle", "Ogre Splintmail Mantle", { slots: ["Shoulders"], ac: 8, weight: 5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-mantle", "Ogre Splintmail Mantle", 128, [{ id: "item:blood-temper" }, { id: "item:chainmail-mantle-pattern" }, { id: "item:large-leather-shoulderpads" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-mantle", [FORGE]);

addItem("item:ogre-splintmail-mask", "Ogre Splintmail Mask", { slots: ["Face"], ac: 6, weight: 2.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-mask", "Ogre Splintmail Mask", 123, [{ id: "item:blood-temper" }, { id: "item:chainmail-veil-pattern" }, { id: "item:large-leather-mask" }, { id: "item:sheet-of-adamantite" }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-mask", [FORGE]);

addItem("item:ogre-splintmail-sleeves", "Ogre Splintmail Sleeves", { slots: ["Arms"], ac: 10, weight: 5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:ogre-splintmail-sleeves", "Ogre Splintmail Sleeves", 135, [{ id: "item:blood-temper" }, { id: "item:chainmail-sleeve-pattern" }, { id: "item:large-leather-sleeves" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:smithy-hammer" }], "item:ogre-splintmail-sleeves", [FORGE]);

addItem("item:large-breastplate-mold", "Large Breastplate Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-field-splinted-cloak-mold", "Large Field Splinted Cloak Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-belt-mold", "Large Plate Belt Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-boot-mold", "Large Plate Boot Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Gralbug (Oggok), Bubbgrib (Oggok)" });

addItem("item:large-plate-bracer-mold", "Large Plate Bracer Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-gauntlet-mold", "Large Plate Gauntlet Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Gralbug (Oggok), Bubbgrib (Oggok)" });

addItem("item:large-plate-gorget-mold", "Large Plate Gorget Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Gralbug (Oggok), Bubbgrib (Oggok)" });

addItem("item:large-plate-greaves-mold", "Large Plate Greaves Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-helm-mold", "Large Plate Helm Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-pauldron-mold", "Large Plate Pauldron Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });

addItem("item:large-plate-vambrace-mold", "Large Plate Vambrace Mold", { weight: 0.1, size: "Tiny", source: "Sold by Ambril McRohrer (Halas), Bubbgrib (Oggok)" });


// "Imbued Ogre War Mace"/"Imbued Ogre War Hammer" are each one wiki page for
// two really-different items (own notes field: "different deity restrictions") --
// split into their own Rallos Zek / Cazic Thule item+recipe pairs by hand,
// not the per-page loop above (see SPLIT_WEAPONS in the codegen script).
addItem("item:imbued-ogre-war-mace-rallos-zek", "Imbued Ogre War Mace (Rallos Zek)", { slots: ["Range", "Primary", "Secondary"], skill: "1H Blunt", delay: 40, damage: 10, weight: 10, size: "Medium", classes: ["Warrior", "Shadow Knight", "Bard", "Rogue", "Shaman"], magic: true, deity: "Rallos Zek" });
addRecipe("recipe:imbued-ogre-war-mace-rallos-zek", "Imbued Ogre War Mace (Rallos Zek)", 190, [{ id: "item:blood-temper" }, { id: "item:mace-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-adamantite" }, { id: "item:imbued-jade" }], "item:imbued-ogre-war-mace-rallos-zek", [FORGE]);
addItem("item:imbued-ogre-war-mace-cazic-thule", "Imbued Ogre War Mace (Cazic Thule)", { slots: ["Range", "Primary", "Secondary"], skill: "1H Blunt", delay: 40, damage: 10, weight: 10, size: "Medium", classes: ["Warrior", "Shadow Knight", "Bard", "Rogue", "Shaman"], magic: true, deity: "Cazic Thule" });
addRecipe("recipe:imbued-ogre-war-mace-cazic-thule", "Imbued Ogre War Mace (Cazic Thule)", 190, [{ id: "item:blood-temper" }, { id: "item:mace-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-adamantite" }, { id: "item:imbued-amber" }], "item:imbued-ogre-war-mace-cazic-thule", [FORGE]);
addItem("item:imbued-ogre-war-hammer-rallos-zek", "Imbued Ogre War Hammer (Rallos Zek)", { slots: ["Primary"], skill: "2H Blunt", delay: 56, damage: 19, weight: 13, size: "Large", classes: ["Warrior", "Shadow Knight", "Shaman"], magic: true, deity: "Rallos Zek" });
addRecipe("recipe:imbued-ogre-war-hammer-rallos-zek", "Imbued Ogre War Hammer (Rallos Zek)", 130, [{ id: "item:hammer-head-mold" }, { id: "item:blood-temper" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-adamantite" }, { id: "item:imbued-jade" }], "item:imbued-ogre-war-hammer-rallos-zek", [FORGE]);
addItem("item:imbued-ogre-war-hammer-cazic-thule", "Imbued Ogre War Hammer (Cazic Thule)", { slots: ["Primary"], skill: "2H Blunt", delay: 56, damage: 19, weight: 13, size: "Large", classes: ["Warrior", "Shadow Knight", "Shaman"], magic: true, deity: "Cazic Thule" });
addRecipe("recipe:imbued-ogre-war-hammer-cazic-thule", "Imbued Ogre War Hammer (Cazic Thule)", 130, [{ id: "item:hammer-head-mold" }, { id: "item:blood-temper" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-adamantite" }, { id: "item:imbued-amber" }], "item:imbued-ogre-war-hammer-cazic-thule", [FORGE]);

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
