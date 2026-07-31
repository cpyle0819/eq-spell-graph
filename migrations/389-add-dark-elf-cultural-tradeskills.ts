/**
 * Migration 389: Dark Elf Cultural Tradeskills (issue #65), full pass --
 * Adamantite basics, weapons (Dragoon Shield, Indigo Sabre + Innoruuk
 * variants), Chainmail armor (plain/Enchanted/Imbued), and Plate armor
 * (plain/Enchanted/Imbued). Third race after Human (383-385) and
 * Barbarian (388).
 *
 * Sourced from eqlwiki.com's "Cultural Tradeskills: Dark Elf" page raw
 * wikitext, cross-checked against every individual produced item's own
 * page (batched MediaWiki API fetch, 87 pages, zero missing) for exact
 * stat blocks and ingredient lists.
 *
 * No dedicated "Teir'dal Forge" container: both "Teir`dal Forge" and
 * "Oggok Forge" (see below) redirect to eqlwiki's generic "Forge"
 * article, same situation as Barbarian's Northman Forge (388) -- crafted
 * in the existing container:forge.
 *
 * Dark Elf/Ogre alliance: the wiki's own Basics and Enchanted Basics
 * tables state "due to the alliance between Dark Elves and Ogres, all
 * 'Adamantite' components can be created by either race in their
 * cultural forges" -- each of the 10 basics/enchanted-basics items
 * (Small/Large Brick, Block, Sheet, Folded Sheet, Rings, Chain Jointing
 * and their Enchanted counterparts) has two real alternate recipes, one
 * per forge (Neriak Nectar + Teir`dal Smithy Hammer vs. Ogre Swill +
 * generic Smithy Hammer), both producing the same item -- modeled as two
 * recipe nodes each (id suffixed `-teirdal-forge`/`-oggok-forge`) rather
 * than picking one path, per the "full fidelity" scope decision on
 * issue #65 -- linked via `variant_of` (Teir`dal Forge as anchor), the
 * same same-output-different-ingredients pattern Baking's issue #47
 * established (decisions/tradeskill-recipe-node-schema.md), not two
 * unrelated recipes that happen to share a `produces` target. These same
 * nodes should be reused, not redeclared, when the Ogre cultural
 * tradeskills migration runs later.
 *
 * Teir`dal Smithy Hammer is a real distinct tool from the generic Smithy
 * Hammer (own page, WT 14.0, sold by Draan N`Ryt in Neriak Third Gate) --
 * unlike Barbarian, which had no race-specific hammer.
 *
 * "classes" derived from each item's own [[Category:X Equipment]] tags
 * (explicit allow-list, decisions/item-node-schema.md); deity-only
 * category tags (e.g. "Innoruuk Worshiper Equipment") are filtered out
 * since deity restriction is already captured in the `deity` field.
 *
 * Two same-named Adamantite Breastplate/Cloak/etc. pages disambiguate
 * via eqlwiki's `{{Disambig3}}` template (all 3 tiers share one in-game
 * item name) -- handled during parsing, no effect on the modeled data.
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

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, trivial: number | undefined, uses: Ingredient[], produces: string, craftedIn: string[]) {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill: "Blacksmithing" };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

const FORGE = "container:forge";

// New precursor items not covered by the 87 fetched item pages (molds, tools, spell-transform intermediates).
addItem("item:teirdal-smithy-hammer", "Teir`dal Smithy Hammer", {"weight":14,"size":"Small","source":"Sold by Draan N`Ryt in Neriak Third Gate; distinct tool from the generic Smithy Hammer"});
addItem("item:silk-swatch", "Silk Swatch", {"weight":0.1,"size":"Small"});
addItem("item:enchanted-lrg-brick-of-adamantite", "Enchanted Lrg. Brick of Adamantite", {"weight":15,"size":"Small","source":"Created by casting Spell: Enchant Adamantite on a Large Brick of Adamantite"});
addItem("item:small-plate-visor-mold", "Small Plate Visor Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-gorget-mold", "Small Plate Gorget Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-boot-mold", "Small Plate Boot Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-bracer-mold", "Small Plate Bracer Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-helm-mold", "Small Plate Helm Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-pauldron-mold", "Small Plate Pauldron Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-belt-mold", "Small Plate Belt Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-vambrace-mold", "Small Plate Vambrace Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-gauntlet-mold", "Small Plate Gauntlet Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-breastplate-mold", "Small Breastplate Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-field-splinted-cloak-mold", "Small Field Splinted Cloak Mold", {"weight":0.1,"size":"Tiny"});
addItem("item:small-plate-greaves-mold", "Small Plate Greaves Mold", {"weight":0.1,"size":"Tiny"});

addItem("item:teirdal-adamantite-boots-imbued", "Teir`Dal Adamantite Boots (Imbued)", { slots: ["Feet"], ac: 13, stats: {"dex":8,"wis":3,"int":4,"agi":8}, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-boots-imbued", "Teir`Dal Adamantite Boots (Imbued)", 222, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-boot-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-boots-imbued", [FORGE]);

addItem("item:teirdal-adamantite-bracers-imbued", "Teir`Dal Adamantite Bracers (Imbued)", { slots: ["Wrist"], ac: 11, stats: {"str":4,"wis":3,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-bracers-imbued", "Teir`Dal Adamantite Bracers (Imbued)", 223, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-bracer-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-bracers-imbued", [FORGE]);

addItem("item:teirdal-adamantite-breastplate-imbued", "Teir`Dal Adamantite Breastplate (Imbued)", { slots: ["Chest"], ac: 26, stats: {"str":4,"dex":10,"wis":4,"int":4}, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-breastplate-imbued", "Teir`Dal Adamantite Breastplate (Imbued)", 240, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-breastplate-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-breastplate-imbued", [FORGE]);

addItem("item:teirdal-adamantite-cloak-imbued", "Teir`Dal Adamantite Cloak (Imbued)", { slots: ["Back"], ac: 14, stats: {"str":6,"dex":6,"wis":4,"int":4}, weight: 3, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-cloak-imbued", "Teir`Dal Adamantite Cloak (Imbued)", 230, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-field-splinted-cloak-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-cloak-imbued", [FORGE]);

addItem("item:teirdal-adamantite-collar-imbued", "Teir`Dal Adamantite Collar (Imbued)", { slots: ["Neck"], ac: 9, stats: {"str":3,"dex":4,"wis":4,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-collar-imbued", "Teir`Dal Adamantite Collar (Imbued)", 220, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gorget-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-collar-imbued", [FORGE]);

addItem("item:teirdal-adamantite-gauntlets-imbued", "Teir`Dal Adamantite Gauntlets (Imbued)", { slots: ["Hands"], ac: 13, stats: {"str":4,"dex":4,"wis":4,"int":4}, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-gauntlets-imbued", "Teir`Dal Adamantite Gauntlets (Imbued)", 225, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gauntlet-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-gauntlets-imbued", [FORGE]);

addItem("item:teirdal-adamantite-girdle-imbued", "Teir`Dal Adamantite Girdle (Imbued)", { slots: ["Waist"], ac: 10, stats: {"str":4,"dex":5,"wis":3,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-girdle-imbued", "Teir`Dal Adamantite Girdle (Imbued)", 223, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-belt-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-girdle-imbued", [FORGE]);

addItem("item:teirdal-adamantite-greaves-imbued", "Teir`Dal Adamantite Greaves (Imbued)", { slots: ["Legs"], ac: 18, stats: {"dex":10,"wis":4,"int":4,"agi":4}, weight: 4, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-greaves-imbued", "Teir`Dal Adamantite Greaves (Imbued)", 237, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-greaves-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-greaves-imbued", [FORGE]);

addItem("item:teirdal-adamantite-helm-imbued", "Teir`Dal Adamantite Helm (Imbued)", { slots: ["Head"], ac: 14, stats: {"str":2,"wis":2,"int":4,"agi":4}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-helm-imbued", "Teir`Dal Adamantite Helm (Imbued)", 230, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-helm-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-helm-imbued", [FORGE]);

addItem("item:teirdal-adamantite-pauldron-imbued", "Teir`Dal Adamantite Pauldron (Imbued)", { slots: ["Shoulders"], ac: 12, stats: {"str":6,"wis":3,"int":4,"agi":6}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-pauldron-imbued", "Teir`Dal Adamantite Pauldron (Imbued)", 222, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-pauldron-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-pauldron-imbued", [FORGE]);

addItem("item:teirdal-adamantite-vambraces-imbued", "Teir`Dal Adamantite Vambraces (Imbued)", { slots: ["Arms"], ac: 14, stats: {"str":4,"dex":5,"wis":4,"int":4}, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-vambraces-imbued", "Teir`Dal Adamantite Vambraces (Imbued)", 230, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-vambrace-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-vambraces-imbued", [FORGE]);

addItem("item:teirdal-adamantite-visor-imbued", "Teir`Dal Adamantite Visor (Imbued)", { slots: ["Face"], ac: 7, stats: {"wis":2,"int":4,"agi":4}, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"], deity: "Innoruuk" });
addRecipe("recipe:teirdal-adamantite-visor-imbued", "Teir`Dal Adamantite Visor (Imbued)", 223, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:imbued-sapphire" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-visor-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-visor-imbued", [FORGE]);

addItem("item:imbued-teirdal-chain-bracelet", "Imbued Teir`Dal Chain Bracelet", { slots: ["Wrist"], ac: 5, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-bracelet", "Imbued Teir`Dal Chain Bracelet", 168, [{ id: "item:chainmail-bracelet-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-bracelet", [FORGE]);

addItem("item:imbued-teirdal-chain-cape", "Imbued Teir`Dal Chain Cape", { slots: ["Back"], ac: 7, stats: {"wis":4,"int":4,"agi":2}, resists: {"magic":4}, weight: 0.7, size: "Large", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-cape", "Imbued Teir`Dal Chain Cape", 180, [{ id: "item:chainmail-cloak-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-cape", [FORGE]);

addItem("item:imbued-teirdal-chain-coif", "Imbued Teir`Dal Chain Coif", { slots: ["Head"], ac: 8, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":4}, weight: 0.6, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-coif", "Imbued Teir`Dal Chain Coif", 168, [{ id: "item:chainmail-coif-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-coif", [FORGE]);

addItem("item:imbued-teirdal-chain-gloves", "Imbued Teir`Dal Chain Gloves", { slots: ["Hands"], ac: 7, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-gloves", "Imbued Teir`Dal Chain Gloves", 168, [{ id: "item:chainmail-glove-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-gloves", [FORGE]);

addItem("item:imbued-teirdal-chain-leggings", "Imbued Teir`Dal Chain Leggings", { slots: ["Legs"], ac: 8, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":4}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-leggings", "Imbued Teir`Dal Chain Leggings", 180, [{ id: "item:chainmail-pant-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-leggings", [FORGE]);

addItem("item:imbued-teirdal-chain-mantle", "Imbued Teir`Dal Chain Mantle", { slots: ["Shoulders"], ac: 6, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-mantle", "Imbued Teir`Dal Chain Mantle", 168, [{ id: "item:chainmail-mantle-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-mantle", [FORGE]);

addItem("item:imbued-teirdal-chain-neckguard", "Imbued Teir`Dal Chain Neckguard", { slots: ["Neck"], ac: 6, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-neckguard", "Imbued Teir`Dal Chain Neckguard", 168, [{ id: "item:chainmail-neckguard-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-neckguard", [FORGE]);

addItem("item:imbued-teirdal-chain-sleeves", "Imbued Teir`Dal Chain Sleeves", { slots: ["Arms"], ac: 7, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":4}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-sleeves", "Imbued Teir`Dal Chain Sleeves", 168, [{ id: "item:chainmail-sleeve-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-sleeves", [FORGE]);

addItem("item:imbued-teirdal-chain-tunic", "Imbued Teir`Dal Chain Tunic", { slots: ["Chest"], ac: 14, stats: {"wis":5,"int":5,"agi":2}, resists: {"magic":2}, weight: 1.5, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-tunic", "Imbued Teir`Dal Chain Tunic", 180, [{ id: "item:chainmail-tunic-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-tunic", [FORGE]);

addItem("item:imbued-teirdal-chain-veil", "Imbued Teir`Dal Chain Veil", { slots: ["Face"], ac: 4, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chain-veil", "Imbued Teir`Dal Chain Veil", 168, [{ id: "item:chainmail-veil-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chain-veil", [FORGE]);

addItem("item:imbued-teirdal-chainmail-boots", "Imbued Teir`Dal Chainmail Boots", { slots: ["Feet"], ac: 7, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk", magic: true });
addRecipe("recipe:imbued-teirdal-chainmail-boots", "Imbued Teir`Dal Chainmail Boots", 168, [{ id: "item:chainmail-boot-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chainmail-boots", [FORGE]);

addItem("item:imbued-teirdal-chainmail-skirt", "Imbued Teir`Dal Chainmail Skirt", { slots: ["Waist"], ac: 6, stats: {"wis":3,"int":3,"agi":2}, resists: {"magic":2}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], deity: "Innoruuk" });
addRecipe("recipe:imbued-teirdal-chainmail-skirt", "Imbued Teir`Dal Chainmail Skirt", 168, [{ id: "item:chainmail-skirt-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:imbued-sapphire" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-chainmail-skirt", [FORGE]);

addItem("item:block-of-adamantite", "Block of Adamantite", { weight: 15, size: "Small" });
addRecipe("recipe:block-of-adamantite-teirdal-forge", "Block of Adamantite", 29, [{ id: "item:neriak-nectar" }, { id: "item:large-brick-of-adamantite", quantity: 3 }], "item:block-of-adamantite", [FORGE]);
addRecipe("recipe:block-of-adamantite-oggok-forge", "Block of Adamantite", 29, [{ id: "item:ogre-swill" }, { id: "item:large-brick-of-adamantite", quantity: 3 }], "item:block-of-adamantite", [FORGE]);
addEdge("recipe:block-of-adamantite-oggok-forge", "recipe:block-of-adamantite-teirdal-forge", "variant_of");

addItem("item:large-brick-of-adamantite", "Large Brick of Adamantite", { weight: 15, size: "Small" });
addRecipe("recipe:large-brick-of-adamantite-teirdal-forge", "Large Brick of Adamantite", 29, [{ id: "item:neriak-nectar" }, { id: "item:small-brick-of-adamantite", quantity: 3 }], "item:large-brick-of-adamantite", [FORGE]);
addRecipe("recipe:large-brick-of-adamantite-oggok-forge", "Large Brick of Adamantite", 29, [{ id: "item:ogre-swill" }, { id: "item:small-brick-of-adamantite", quantity: 3 }], "item:large-brick-of-adamantite", [FORGE]);
addEdge("recipe:large-brick-of-adamantite-oggok-forge", "recipe:large-brick-of-adamantite-teirdal-forge", "variant_of");

addItem("item:small-brick-of-adamantite", "Small Brick of Adamantite", { weight: 5, size: "Small" });

addItem("item:sheet-of-adamantite", "Sheet of Adamantite", { weight: 5, size: "Small" });
addRecipe("recipe:sheet-of-adamantite-teirdal-forge", "Sheet of Adamantite", 37, [{ id: "item:neriak-nectar" }, { id: "item:small-brick-of-adamantite", quantity: 2 }], "item:sheet-of-adamantite", [FORGE]);
addRecipe("recipe:sheet-of-adamantite-oggok-forge", "Sheet of Adamantite", 37, [{ id: "item:ogre-swill" }, { id: "item:small-brick-of-adamantite", quantity: 2 }], "item:sheet-of-adamantite", [FORGE]);
addEdge("recipe:sheet-of-adamantite-oggok-forge", "recipe:sheet-of-adamantite-teirdal-forge", "variant_of");

addItem("item:teirdal-adamantite-helm", "Teir`Dal Adamantite Helm", { slots: ["Head"], ac: 13, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-helm", "Teir`Dal Adamantite Helm", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-helm-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-helm", [FORGE]);

addItem("item:indigo-sabre", "Indigo Sabre", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 24, damage: 7, weight: 5, size: "Medium", classes: ["Bard","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:indigo-sabre", "Indigo Sabre", 104, [{ id: "item:curved-blade-mold" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:hilt-mold" }, { id: "item:neriak-nectar" }, { id: "item:pommel-mold" }], "item:indigo-sabre", [FORGE]);

addItem("item:adamantite-chain-jointing", "Adamantite Chain Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:adamantite-chain-jointing-teirdal-forge", "Adamantite Chain Jointing", 106, [{ id: "item:neriak-nectar" }, { id: "item:adamantite-rings" }, { id: "item:teirdal-smithy-hammer" }, { id: "item:file" }], "item:adamantite-chain-jointing", [FORGE]);
addRecipe("recipe:adamantite-chain-jointing-oggok-forge", "Adamantite Chain Jointing", 106, [{ id: "item:ogre-swill" }, { id: "item:adamantite-rings" }, { id: "item:smithy-hammer" }, { id: "item:file" }], "item:adamantite-chain-jointing", [FORGE]);
addEdge("recipe:adamantite-chain-jointing-oggok-forge", "recipe:adamantite-chain-jointing-teirdal-forge", "variant_of");

addItem("item:adamantite-rings", "Adamantite Rings", { weight: 2, size: "Tiny" });
addRecipe("recipe:adamantite-rings-teirdal-forge", "Adamantite Rings", 46, [{ id: "item:neriak-nectar" }, { id: "item:large-brick-of-adamantite" }, { id: "item:file" }], "item:adamantite-rings", [FORGE]);
addRecipe("recipe:adamantite-rings-oggok-forge", "Adamantite Rings", 46, [{ id: "item:ogre-swill" }, { id: "item:large-brick-of-adamantite" }, { id: "item:file" }], "item:adamantite-rings", [FORGE]);
addEdge("recipe:adamantite-rings-oggok-forge", "recipe:adamantite-rings-teirdal-forge", "variant_of");

addItem("item:enchanted-adamantite-jointing", "Enchanted Adamantite Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:enchanted-adamantite-jointing-teirdal-forge", "Enchanted Adamantite Jointing", 95, [{ id: "item:enchanted-adamantite-rings" }, { id: "item:file" }, { id: "item:neriak-nectar" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-adamantite-jointing", [FORGE]);
addRecipe("recipe:enchanted-adamantite-jointing-oggok-forge", "Enchanted Adamantite Jointing", 95, [{ id: "item:enchanted-adamantite-rings" }, { id: "item:file" }, { id: "item:ogre-swill" }, { id: "item:smithy-hammer" }], "item:enchanted-adamantite-jointing", [FORGE]);
addEdge("recipe:enchanted-adamantite-jointing-oggok-forge", "recipe:enchanted-adamantite-jointing-teirdal-forge", "variant_of");

addItem("item:enchanted-adamantite-rings", "Enchanted Adamantite Rings", { weight: 2, size: "Tiny" });
addRecipe("recipe:enchanted-adamantite-rings-teirdal-forge", "Enchanted Adamantite Rings", 51, [{ id: "item:enchanted-lrg-brick-of-adamantite" }, { id: "item:file" }, { id: "item:neriak-nectar" }], "item:enchanted-adamantite-rings", [FORGE]);
addRecipe("recipe:enchanted-adamantite-rings-oggok-forge", "Enchanted Adamantite Rings", 51, [{ id: "item:enchanted-lrg-brick-of-adamantite" }, { id: "item:file" }, { id: "item:ogre-swill" }], "item:enchanted-adamantite-rings", [FORGE]);
addEdge("recipe:enchanted-adamantite-rings-oggok-forge", "recipe:enchanted-adamantite-rings-teirdal-forge", "variant_of");

addItem("item:enchanted-block-of-adamantite", "Enchanted Block of Adamantite", { weight: 15, size: "Small" });
addRecipe("recipe:enchanted-block-of-adamantite-teirdal-forge", "Enchanted Block of Adamantite", 32, [{ id: "item:enchanted-lrg-brick-of-adamantite", quantity: 3 }, { id: "item:neriak-nectar" }], "item:enchanted-block-of-adamantite", [FORGE]);
addRecipe("recipe:enchanted-block-of-adamantite-oggok-forge", "Enchanted Block of Adamantite", 32, [{ id: "item:enchanted-lrg-brick-of-adamantite", quantity: 3 }, { id: "item:ogre-swill" }], "item:enchanted-block-of-adamantite", [FORGE]);
addEdge("recipe:enchanted-block-of-adamantite-oggok-forge", "recipe:enchanted-block-of-adamantite-teirdal-forge", "variant_of");

addItem("item:enchanted-folded-adamantite-sheet", "Enchanted Folded Adamantite Sheet", { weight: 5, size: "Small" });
addRecipe("recipe:enchanted-folded-adamantite-sheet-teirdal-forge", "Enchanted Folded Adamantite Sheet", 39, [{ id: "item:enchanted-block-of-adamantite" }, { id: "item:neriak-nectar" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-folded-adamantite-sheet", [FORGE]);
addRecipe("recipe:enchanted-folded-adamantite-sheet-oggok-forge", "Enchanted Folded Adamantite Sheet", 39, [{ id: "item:enchanted-block-of-adamantite" }, { id: "item:ogre-swill" }, { id: "item:smithy-hammer" }], "item:enchanted-folded-adamantite-sheet", [FORGE]);
addEdge("recipe:enchanted-folded-adamantite-sheet-oggok-forge", "recipe:enchanted-folded-adamantite-sheet-teirdal-forge", "variant_of");

addItem("item:enchanted-teirdal-chain-boots", "Enchanted Teir`Dal Chain Boots", { slots: ["Feet"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"], magic: true });
addRecipe("recipe:enchanted-teirdal-chain-boots", "Enchanted Teir`Dal Chain Boots", 148, [{ id: "item:chainmail-boot-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-boots", [FORGE]);

addItem("item:enchanted-teirdal-chain-bracelet", "Enchanted Teir`Dal Chain Bracelet", { slots: ["Wrist"], ac: 5, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-bracelet", "Enchanted Teir`Dal Chain Bracelet", 148, [{ id: "item:chainmail-bracelet-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-bracelet", [FORGE]);

addItem("item:enchanted-teirdal-chain-cape", "Enchanted Teir`Dal Chain Cape", { slots: ["Back"], ac: 7, stats: {"wis":3,"int":3}, resists: {"magic":4}, weight: 0.7, size: "Large", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-cape", "Enchanted Teir`Dal Chain Cape", 146, [{ id: "item:chainmail-cloak-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-cape", [FORGE]);

addItem("item:enchanted-teirdal-chain-coif", "Enchanted Teir`Dal Chain Coif", { slots: ["Head"], ac: 8, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 0.6, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-coif", "Enchanted Teir`Dal Chain Coif", 147, [{ id: "item:chainmail-coif-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-coif", [FORGE]);

addItem("item:enchanted-teirdal-chain-gloves", "Enchanted Teir`Dal Chain Gloves", { slots: ["Hands"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-gloves", "Enchanted Teir`Dal Chain Gloves", 148, [{ id: "item:chainmail-glove-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-gloves", [FORGE]);

addItem("item:enchanted-teirdal-chain-leggings", "Enchanted Teir`Dal Chain Leggings", { slots: ["Legs"], ac: 8, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-leggings", "Enchanted Teir`Dal Chain Leggings", 155, [{ id: "item:chainmail-pant-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-leggings", [FORGE]);

addItem("item:enchanted-teirdal-chain-mantle", "Enchanted Teir`Dal Chain Mantle", { slots: ["Shoulders"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-mantle", "Enchanted Teir`Dal Chain Mantle", 145, [{ id: "item:chainmail-mantle-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-mantle", [FORGE]);

addItem("item:enchanted-teirdal-chain-neckguard", "Enchanted Teir`Dal Chain Neckguard", { slots: ["Neck"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-neckguard", "Enchanted Teir`Dal Chain Neckguard", 146, [{ id: "item:chainmail-neckguard-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-neckguard", [FORGE]);

addItem("item:enchanted-teirdal-chain-sleeves", "Enchanted Teir`Dal Chain Sleeves", { slots: ["Arms"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-sleeves", "Enchanted Teir`Dal Chain Sleeves", 148, [{ id: "item:chainmail-sleeve-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-sleeves", [FORGE]);

addItem("item:enchanted-teirdal-chain-tunic", "Enchanted Teir`Dal Chain Tunic", { slots: ["Chest"], ac: 14, stats: {"wis":4,"int":4}, resists: {"magic":2}, weight: 1.5, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-tunic", "Enchanted Teir`Dal Chain Tunic", 155, [{ id: "item:chainmail-tunic-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 3 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-tunic", [FORGE]);

addItem("item:enchanted-teirdal-chain-veil", "Enchanted Teir`Dal Chain Veil", { slots: ["Face"], ac: 4, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chain-veil", "Enchanted Teir`Dal Chain Veil", 145, [{ id: "item:chainmail-veil-pattern" }, { id: "item:enchanted-adamantite-rings" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chain-veil", [FORGE]);

addItem("item:enchanted-teirdal-chainmail-skirt", "Enchanted Teir`Dal Chainmail Skirt", { slots: ["Waist"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:enchanted-teirdal-chainmail-skirt", "Enchanted Teir`Dal Chainmail Skirt", 135, [{ id: "item:chainmail-skirt-pattern" }, { id: "item:enchanted-adamantite-rings", quantity: 2 }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:enchanted-teirdal-chainmail-skirt", [FORGE]);

addItem("item:folded-sheet-of-adamantite", "Folded Sheet of Adamantite", { weight: 5, size: "Small" });
addRecipe("recipe:folded-sheet-of-adamantite-teirdal-forge", "Folded Sheet of Adamantite", 39, [{ id: "item:neriak-nectar" }, { id: "item:block-of-adamantite" }, { id: "item:teirdal-smithy-hammer" }], "item:folded-sheet-of-adamantite", [FORGE]);
addRecipe("recipe:folded-sheet-of-adamantite-oggok-forge", "Folded Sheet of Adamantite", 39, [{ id: "item:ogre-swill" }, { id: "item:block-of-adamantite" }, { id: "item:smithy-hammer" }], "item:folded-sheet-of-adamantite", [FORGE]);
addEdge("recipe:folded-sheet-of-adamantite-oggok-forge", "recipe:folded-sheet-of-adamantite-teirdal-forge", "variant_of");

addItem("item:imbued-teirdal-dragoon-shield", "Imbued Teir`Dal Dragoon Shield", { slots: ["Secondary"], ac: 11, stats: {"str":2,"sta":2,"int":2}, weight: 10, size: "Large", classes: ["Cleric","Rogue","Shadow Knight","Warrior"], deity: "Innoruuk", magic: true });
addRecipe("recipe:imbued-teirdal-dragoon-shield", "Imbued Teir`Dal Dragoon Shield", 128, [{ id: "item:imbued-sapphire" }, { id: "item:kite-shield-mold" }, { id: "item:shadow-temper" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:teirdal-smithy-hammer" }], "item:imbued-teirdal-dragoon-shield", [FORGE]);

addItem("item:indigo-sabre-of-innoruuk", "Indigo Sabre of Innoruuk", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 24, damage: 7, stats: {"str":3,"int":3}, weight: 5, size: "Medium", classes: ["Rogue","Shadow Knight","Warrior"], deity: "Innoruuk", magic: true });
addRecipe("recipe:indigo-sabre-of-innoruuk", "Indigo Sabre of Innoruuk", 116, [{ id: "item:curved-blade-mold" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:hilt-mold" }, { id: "item:imbued-sapphire" }, { id: "item:pommel-mold" }, { id: "item:shadow-temper" }], "item:indigo-sabre-of-innoruuk", [FORGE]);

addItem("item:teirdal-adamantite-boots", "Teir`Dal Adamantite Boots", { slots: ["Feet"], ac: 11, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-boots", "Teir`Dal Adamantite Boots", 195, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-boot-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-boots", [FORGE]);

addItem("item:teirdal-adamantite-boots-enchanted", "Teir`Dal Adamantite Boots (Enchanted)", { slots: ["Feet"], ac: 13, stats: {"dex":8,"int":4,"agi":8}, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-boots-enchanted", "Teir`Dal Adamantite Boots (Enchanted)", 195, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-boot-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-boots-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-bracers", "Teir`Dal Adamantite Bracers", { slots: ["Wrist"], ac: 10, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-bracers", "Teir`Dal Adamantite Bracers", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-bracer-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-bracers", [FORGE]);

addItem("item:teirdal-adamantite-bracers-enchanted", "Teir`Dal Adamantite Bracers (Enchanted)", { slots: ["Wrist"], ac: 11, stats: {"str":4,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-bracers-enchanted", "Teir`Dal Adamantite Bracers (Enchanted)", 195, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-bracer-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-bracers-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-breastplate", "Teir`Dal Adamantite Breastplate", { slots: ["Chest"], ac: 23, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-breastplate", "Teir`Dal Adamantite Breastplate", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-breastplate-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-breastplate", [FORGE]);

addItem("item:teirdal-adamantite-breastplate-enchanted", "Teir`Dal Adamantite Breastplate (Enchanted)", { slots: ["Chest"], ac: 26, stats: {"str":4,"dex":10,"int":4}, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-breastplate-enchanted", "Teir`Dal Adamantite Breastplate (Enchanted)", 213, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-breastplate-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-breastplate-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-cloak", "Teir`Dal Adamantite Cloak", { slots: ["Back"], ac: 12, weight: 3, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-cloak", "Teir`Dal Adamantite Cloak", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-field-splinted-cloak-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-cloak", [FORGE]);

addItem("item:teirdal-adamantite-cloak-enchanted", "Teir`Dal Adamantite Cloak (Enchanted)", { slots: ["Back"], ac: 14, stats: {"str":6,"dex":6,"int":4}, weight: 3, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-cloak-enchanted", "Teir`Dal Adamantite Cloak (Enchanted)", 205, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-field-splinted-cloak-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-cloak-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-collar", "Teir`Dal Adamantite Collar", { slots: ["Neck"], ac: 8, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-collar", "Teir`Dal Adamantite Collar", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gorget-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-collar", [FORGE]);

addItem("item:teirdal-adamantite-collar-enchanted", "Teir`Dal Adamantite Collar (Enchanted)", { slots: ["Neck"], ac: 9, stats: {"str":3,"dex":4,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-collar-enchanted", "Teir`Dal Adamantite Collar (Enchanted)", 194, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gorget-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-collar-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-gauntlets", "Teir`Dal Adamantite Gauntlets", { slots: ["Hands"], ac: 12, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-gauntlets", "Teir`Dal Adamantite Gauntlets", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gauntlet-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-gauntlets", [FORGE]);

addItem("item:teirdal-adamantite-gauntlets-enchanted", "Teir`Dal Adamantite Gauntlets (Enchanted)", { slots: ["Hands"], ac: 13, stats: {"str":4,"dex":4,"int":4}, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-gauntlets-enchanted", "Teir`Dal Adamantite Gauntlets (Enchanted)", 208, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-gauntlet-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-gauntlets-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-girdle", "Teir`Dal Adamantite Girdle", { slots: ["Waist"], ac: 9, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-girdle", "Teir`Dal Adamantite Girdle", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-belt-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-girdle", [FORGE]);

addItem("item:teirdal-adamantite-girdle-enchanted", "Teir`Dal Adamantite Girdle (Enchanted)", { slots: ["Waist"], ac: 10, stats: {"str":4,"dex":5,"int":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-girdle-enchanted", "Teir`Dal Adamantite Girdle (Enchanted)", 195, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-belt-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-girdle-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-greaves", "Teir`Dal Adamantite Greaves", { slots: ["Legs"], ac: 15, stats: {"dex":10,"wis":4,"int":4,"agi":4}, weight: 4, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-greaves", "Teir`Dal Adamantite Greaves", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-greaves-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-greaves", [FORGE]);

addItem("item:teirdal-adamantite-greaves-enchanted", "Teir`Dal Adamantite Greaves (Enchanted)", { slots: ["Legs"], ac: 18, stats: {"dex":10,"int":4,"agi":4}, weight: 4, size: "Large", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-greaves-enchanted", "Teir`Dal Adamantite Greaves (Enchanted)", 211, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-greaves-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-greaves-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-helm-enchanted", "Teir`Dal Adamantite Helm (Enchanted)", { slots: ["Head"], ac: 14, stats: {"str":2,"int":4,"agi":4}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-helm-enchanted", "Teir`Dal Adamantite Helm (Enchanted)", 207, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-helm-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-helm-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-pauldron", "Teir`Dal Adamantite Pauldron", { slots: ["Shoulders"], ac: 11, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-pauldron", "Teir`Dal Adamantite Pauldron", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-pauldron-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-pauldron", [FORGE]);

addItem("item:teirdal-adamantite-pauldron-enchanted", "Teir`Dal Adamantite Pauldron (Enchanted)", { slots: ["Shoulders"], ac: 12, stats: {"str":6,"int":4,"agi":6}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-pauldron-enchanted", "Teir`Dal Adamantite Pauldron (Enchanted)", 195, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-pauldron-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-pauldron-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-vambraces", "Teir`Dal Adamantite Vambraces", { slots: ["Arms"], ac: 12, stats: {"str":4,"dex":5,"int":4}, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-vambraces", "Teir`Dal Adamantite Vambraces", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-vambrace-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-vambraces", [FORGE]);

addItem("item:teirdal-adamantite-vambraces-enchanted", "Teir`Dal Adamantite Vambraces (Enchanted)", { slots: ["Arms"], ac: 14, stats: {"str":4,"dex":5,"int":4}, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-vambraces-enchanted", "Teir`Dal Adamantite Vambraces (Enchanted)", 200, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-vambrace-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-vambraces-enchanted", [FORGE]);

addItem("item:teirdal-adamantite-visor", "Teir`Dal Adamantite Visor", { slots: ["Face"], ac: 6, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-visor", "Teir`Dal Adamantite Visor", 190, [{ id: "item:adamantite-chain-jointing" }, { id: "item:folded-sheet-of-adamantite" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-visor-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-visor", [FORGE]);

addItem("item:teirdal-adamantite-visor-enchanted", "Teir`Dal Adamantite Visor (Enchanted)", { slots: ["Face"], ac: 7, stats: {"int":4,"agi":4}, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-adamantite-visor-enchanted", "Teir`Dal Adamantite Visor (Enchanted)", 190, [{ id: "item:enchanted-adamantite-jointing" }, { id: "item:enchanted-folded-adamantite-sheet" }, { id: "item:leather-padding" }, { id: "item:shadow-temper" }, { id: "item:small-plate-visor-mold" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-adamantite-visor-enchanted", [FORGE]);

addItem("item:teirdal-chain-coif", "Teir`Dal Chain Coif", { slots: ["Head"], ac: 7, weight: 1.2, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chain-coif", "Teir`Dal Chain Coif", 172, [{ id: "item:adamantite-rings", quantity: 2 }, { id: "item:chainmail-coif-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chain-coif", [FORGE]);

addItem("item:teirdal-chain-neckguard", "Teir`Dal Chain Neckguard", { slots: ["Neck"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chain-neckguard", "Teir`Dal Chain Neckguard", 172, [{ id: "item:adamantite-rings" }, { id: "item:chainmail-neckguard-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chain-neckguard", [FORGE]);

addItem("item:teirdal-chain-veil", "Teir`Dal Chain Veil", { slots: ["Face"], ac: 3, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chain-veil", "Teir`Dal Chain Veil", 172, [{ id: "item:adamantite-rings" }, { id: "item:chainmail-veil-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chain-veil", [FORGE]);

addItem("item:teirdal-chainmail-boots", "Teir`Dal Chainmail Boots", { slots: ["Feet"], ac: 5, weight: 1, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-boots", "Teir`Dal Chainmail Boots", 122, [{ id: "item:adamantite-rings" }, { id: "item:chainmail-boot-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-boots", [FORGE]);

addItem("item:teirdal-chainmail-bracelet", "Teir`Dal Chainmail Bracelet", { slots: ["Wrist"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-bracelet", "Teir`Dal Chainmail Bracelet", 128, [{ id: "item:adamantite-rings" }, { id: "item:chainmail-bracelet-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-bracelet", [FORGE]);

addItem("item:teirdal-chainmail-cape", "Teir`Dal Chainmail Cape", { slots: ["Back"], ac: 6, weight: 1.5, size: "Large", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-cape", "Teir`Dal Chainmail Cape", 135, [{ id: "item:adamantite-rings", quantity: 3 }, { id: "item:chainmail-cloak-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-cape", [FORGE]);

addItem("item:teirdal-chainmail-gloves", "Teir`Dal Chainmail Gloves", { slots: ["Hands"], ac: 6, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-gloves", "Teir`Dal Chainmail Gloves", 172, [{ id: "item:adamantite-rings", quantity: 2 }, { id: "item:chainmail-glove-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-gloves", [FORGE]);

addItem("item:teirdal-chainmail-leggings", "Teir`Dal Chainmail Leggings", { slots: ["Legs"], ac: 7, weight: 2, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-leggings", "Teir`Dal Chainmail Leggings", 172, [{ id: "item:adamantite-rings", quantity: 3 }, { id: "item:chainmail-pant-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-leggings", [FORGE]);

addItem("item:teirdal-chainmail-mantle", "Teir`Dal Chainmail Mantle", { slots: ["Shoulders"], ac: 5, weight: 1.4, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-mantle", "Teir`Dal Chainmail Mantle", 172, [{ id: "item:adamantite-rings", quantity: 2 }, { id: "item:chainmail-mantle-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-mantle", [FORGE]);

addItem("item:teirdal-chainmail-skirt", "Teir`Dal Chainmail Skirt", { slots: ["Waist"], ac: 5, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-skirt", "Teir`Dal Chainmail Skirt", 172, [{ id: "item:adamantite-rings", quantity: 2 }, { id: "item:chainmail-skirt-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-skirt", [FORGE]);

addItem("item:teirdal-chainmail-sleeves", "Teir`Dal Chainmail Sleeves", { slots: ["Arms"], ac: 6, weight: 1.4, size: "Small", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-sleeves", "Teir`Dal Chainmail Sleeves", 172, [{ id: "item:adamantite-rings", quantity: 2 }, { id: "item:chainmail-sleeve-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-sleeves", [FORGE]);

addItem("item:teirdal-chainmail-tunic", "Teir`Dal Chainmail Tunic", { slots: ["Chest"], ac: 12, weight: 3, size: "Medium", classes: ["Bard","Cleric","Enchanter","Magician","Necromancer","Rogue","Shadow Knight","Warrior","Wizard"] });
addRecipe("recipe:teirdal-chainmail-tunic", "Teir`Dal Chainmail Tunic", 148, [{ id: "item:adamantite-rings", quantity: 3 }, { id: "item:chainmail-tunic-pattern" }, { id: "item:shadow-temper" }, { id: "item:silk-swatch" }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-chainmail-tunic", [FORGE]);

addItem("item:teirdal-dragoon-shield", "Teir`Dal Dragoon Shield", { slots: ["Secondary"], ac: 11, stats: {"sta":2}, weight: 10, size: "Large", classes: ["Cleric","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:teirdal-dragoon-shield", "Teir`Dal Dragoon Shield", 175, [{ id: "item:kite-shield-mold" }, { id: "item:shadow-temper" }, { id: "item:sheet-of-adamantite", quantity: 2 }, { id: "item:teirdal-smithy-hammer" }], "item:teirdal-dragoon-shield", [FORGE]);

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
