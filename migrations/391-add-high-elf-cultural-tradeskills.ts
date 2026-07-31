/**
 * High Elf Cultural Tradeskills (issue #65) -- Blacksmithing only (a single
 * Koada'dal Forge in Felwithe crafts both the caster-wearable Elven
 * Chainmail and the plate-wearable Koada'dal Mithril, despite Chainmail's
 * own recipes needing a Silk Swatch alongside the smithing pattern). Source:
 * eqlwiki.com's "Cultural Tradeskills: High Elf" overview page plus each of
 * its 90 linked/transcluded item pages, batch-fetched via the raw wikitext
 * MediaWiki API, never the summarizing WebFetch tool.
 *
 * Shape differs from Dwarf/Dark Elf/Barbarian in two ways:
 *  - Single deity (Tunare) rather than a dual-deity split.
 *  - Only three Plate tiers, not four: Normal, "Mystic" (built from Enchanted
 *    Mithril precursors but no imbue gem -- the Enchanted-equivalent tier,
 *    just named differently by the wiki), and Imbued (Enchanted precursors
 *    *and* an Imbued Emerald together -- there's no separate non-enchanted
 *    Imbued tier here, unlike Dwarf's four full tiers). Matches the issue's
 *    own scope note: take each race's page as it comes, don't force a
 *    uniform shape across races.
 *
 * "Enchanted Block of Mithril"'s own item page states its Trivial as
 * "unknown - but lower than 135" instead of a number (confirmed against the
 * raw wikitext, not a parser miss) -- parser loosened to still capture its
 * ingredient list, with the trivial value itself overridden to 175 from the
 * overview page's own Misc Combines table, the only firm number available
 * for it.
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

addItem("item:enchanted-elven-chainmail-sleeves", "Enchanted Elven Chainmail Sleeves", { slots: ["Arms"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chainmail-sleeves", "Enchanted Elven Chainmail Sleeves", 142, [{ id: "item:chainmail-sleeve-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chainmail-sleeves", [FORGE]);

addItem("item:block-of-mithril", "Block of Mithril", { weight: 15, size: "Small", source: "Sold by Tanalin Silverkale (Felwithe), Opal Leganyn (Felwithe), Merchant Niwiny (Greater Faydark)" });
addRecipe("recipe:block-of-mithril", "Block of Mithril", 120, [{ id: "item:large-brick-of-mithril", quantity: 3 }, { id: "item:morning-dew" }], "item:block-of-mithril", [FORGE]);

addItem("item:large-brick-of-mithril", "Large Brick of Mithril", { weight: 10, size: "Small", source: "Can be converted into an Enchanted Lrg. Brick of Mithril with the Enchant Mithril spell.; Sold by Tanalin Silverkale (Felwithe), Merchant Niwiny (Greater Faydark)" });
addRecipe("recipe:large-brick-of-mithril", "Large Brick of Mithril", 29, [{ id: "item:morning-dew" }, { id: "item:small-brick-of-mithril", quantity: 3 }], "item:large-brick-of-mithril", [FORGE]);

addItem("item:elven-chain-coif", "Elven Chain Coif", { slots: ["Head"], ac: 7, weight: 1.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chain-coif", "Elven Chain Coif", 175, [{ id: "item:chainmail-coif-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chain-coif", [FORGE]);

addItem("item:elven-chain-veil", "Elven Chain Veil", { slots: ["Face"], ac: 3, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chain-veil", "Elven Chain Veil", 123, [{ id: "item:chainmail-veil-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chain-veil", [FORGE]);

addItem("item:elven-chainmail-boots", "Elven Chainmail Boots", { slots: ["Feet"], ac: 5, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-boots", "Elven Chainmail Boots", 122, [{ id: "item:chainmail-boot-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-boots", [FORGE]);

addItem("item:elven-chainmail-bracelet", "Elven Chainmail Bracelet", { slots: ["Wrist"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-bracelet", "Elven Chainmail Bracelet", 128, [{ id: "item:chainmail-bracelet-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-bracelet", [FORGE]);

addItem("item:elven-chainmail-cape", "Elven Chainmail Cape", { slots: ["Back"], ac: 6, weight: 1.5, size: "Large", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-cape", "Elven Chainmail Cape", 188, [{ id: "item:chainmail-cloak-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-cape", [FORGE]);

addItem("item:elven-chainmail-gloves", "Elven Chainmail Gloves", { slots: ["Hands"], ac: 6, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-gloves", "Elven Chainmail Gloves", 188, [{ id: "item:chainmail-glove-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-gloves", [FORGE]);

addItem("item:elven-chainmail-leggings", "Elven Chainmail Leggings", { slots: ["Legs"], ac: 7, weight: 2, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-leggings", "Elven Chainmail Leggings", 188, [{ id: "item:chainmail-pant-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-leggings", [FORGE]);

addItem("item:elven-chainmail-mantle", "Elven Chainmail Mantle", { slots: ["Shoulders"], ac: 5, weight: 1.4, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-mantle", "Elven Chainmail Mantle", 176, [{ id: "item:chainmail-mantle-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-mantle", [FORGE]);

addItem("item:elven-chainmail-neckguard", "Elven Chainmail Neckguard", { slots: ["Neck"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-neckguard", "Elven Chainmail Neckguard", 126, [{ id: "item:chainmail-neckguard-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-neckguard", [FORGE]);

addItem("item:elven-chainmail-skirt", "Elven Chainmail Skirt", { slots: ["Waist"], ac: 5, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-skirt", "Elven Chainmail Skirt", 176, [{ id: "item:chainmail-skirt-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-skirt", [FORGE]);

addItem("item:elven-chainmail-sleeves", "Elven Chainmail Sleeves", { slots: ["Arms"], ac: 6, weight: 1.4, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-sleeves", "Elven Chainmail Sleeves", 188, [{ id: "item:chainmail-sleeve-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-sleeves", [FORGE]);

addItem("item:elven-chainmail-tunic", "Elven Chainmail Tunic", { slots: ["Chest"], ac: 12, weight: 3, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:elven-chainmail-tunic", "Elven Chainmail Tunic", 148, [{ id: "item:chainmail-tunic-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:elven-chainmail-tunic", [FORGE]);

addItem("item:enchanted-block-of-mithril", "Enchanted Block of Mithril", { weight: 15, size: "Small" });
addRecipe("recipe:enchanted-block-of-mithril", "Enchanted Block of Mithril", 175, [{ id: "item:enchanted-lrg-brick-of-mithril", quantity: 3 }, { id: "item:morning-dew" }], "item:enchanted-block-of-mithril", [FORGE]);

addItem("item:enchanted-elven-chain-boots", "Enchanted Elven Chain Boots", { slots: ["Feet"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], magic: true });
addRecipe("recipe:enchanted-elven-chain-boots", "Enchanted Elven Chain Boots", 132, [{ id: "item:chainmail-boot-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-boots", [FORGE]);

addItem("item:enchanted-elven-chain-cape", "Enchanted Elven Chain Cape", { slots: ["Back"], ac: 7, stats: {"wis":3,"int":3}, resists: {"magic":4}, weight: 0.7, size: "Large", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-cape", "Enchanted Elven Chain Cape", 142, [{ id: "item:chainmail-cloak-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-cape", [FORGE]);

addItem("item:enchanted-elven-chain-coif", "Enchanted Elven Chain Coif", { slots: ["Head"], ac: 8, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 0.6, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-coif", "Enchanted Elven Chain Coif", 146, [{ id: "item:chainmail-coif-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-coif", [FORGE]);

addItem("item:enchanted-elven-chain-mantle", "Enchanted Elven Chain Mantle", { slots: ["Shoulders"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-mantle", "Enchanted Elven Chain Mantle", 135, [{ id: "item:chainmail-mantle-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-mantle", [FORGE]);

addItem("item:enchanted-elven-chain-neckguard", "Enchanted Elven Chain Neckguard", { slots: ["Neck"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-neckguard", "Enchanted Elven Chain Neckguard", 132, [{ id: "item:chainmail-neckguard-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-neckguard", [FORGE]);

addItem("item:enchanted-elven-chain-tunic", "Enchanted Elven Chain Tunic", { slots: ["Chest"], ac: 14, stats: {"wis":4,"int":4}, resists: {"magic":2}, weight: 1.5, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-tunic", "Enchanted Elven Chain Tunic", 155, [{ id: "item:chainmail-tunic-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-tunic", [FORGE]);

addItem("item:enchanted-elven-chain-veil", "Enchanted Elven Chain Veil", { slots: ["Face"], ac: 4, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chain-veil", "Enchanted Elven Chain Veil", 130, [{ id: "item:chainmail-veil-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chain-veil", [FORGE]);

addItem("item:enchanted-elven-chainmail-bracelet", "Enchanted Elven Chainmail Bracelet", { slots: ["Wrist"], ac: 5, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chainmail-bracelet", "Enchanted Elven Chainmail Bracelet", 135, [{ id: "item:chainmail-bracelet-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chainmail-bracelet", [FORGE]);

addItem("item:enchanted-elven-chainmail-gloves", "Enchanted Elven Chainmail Gloves", { slots: ["Hands"], ac: 7, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chainmail-gloves", "Enchanted Elven Chainmail Gloves", 142, [{ id: "item:chainmail-glove-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chainmail-gloves", [FORGE]);

addItem("item:enchanted-elven-chainmail-leggings", "Enchanted Elven Chainmail Leggings", { slots: ["Legs"], ac: 8, stats: {"wis":2,"int":2}, resists: {"magic":4}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chainmail-leggings", "Enchanted Elven Chainmail Leggings", 148, [{ id: "item:chainmail-pant-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chainmail-leggings", [FORGE]);

addItem("item:enchanted-elven-chainmail-skirt", "Enchanted Elven Chainmail Skirt", { slots: ["Waist"], ac: 6, stats: {"wis":2,"int":2}, resists: {"magic":2}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"] });
addRecipe("recipe:enchanted-elven-chainmail-skirt", "Enchanted Elven Chainmail Skirt", 135, [{ id: "item:chainmail-skirt-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:enchanted-elven-chainmail-skirt", [FORGE]);

addItem("item:enchanted-folded-sheet-of-mithril", "Enchanted Folded Sheet of Mithril", { weight: 5, size: "Small" });
addRecipe("recipe:enchanted-folded-sheet-of-mithril", "Enchanted Folded Sheet of Mithril", 44, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-block-of-mithril" }, { id: "item:morning-dew" }], "item:enchanted-folded-sheet-of-mithril", [FORGE]);

addItem("item:enchanted-mithril-chain-jointing", "Enchanted Mithril Chain Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:enchanted-mithril-chain-jointing", "Enchanted Mithril Chain Jointing", 95, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:file" }, { id: "item:morning-dew" }], "item:enchanted-mithril-chain-jointing", [FORGE]);

addItem("item:enchanted-mithril-rings", "Enchanted Mithril Rings", { weight: 2, size: "Tiny" });
addRecipe("recipe:enchanted-mithril-rings", "Enchanted Mithril Rings", 51, [{ id: "item:enchanted-lrg-brick-of-mithril" }, { id: "item:file" }, { id: "item:morning-dew" }], "item:enchanted-mithril-rings", [FORGE]);

addItem("item:folded-sheet-of-mithril", "Folded Sheet of Mithril", { weight: 5, size: "Small" });
addRecipe("recipe:folded-sheet-of-mithril", "Folded Sheet of Mithril", 106, [{ id: "item:block-of-mithril" }, { id: "item:elven-smithy-hammer" }, { id: "item:morning-dew" }], "item:folded-sheet-of-mithril", [FORGE]);

addItem("item:imbued-elven-chain-neckguard", "Imbued Elven Chain Neckguard", { slots: ["Neck"], ac: 6, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-neckguard", "Imbued Elven Chain Neckguard", 146, [{ id: "item:chainmail-neckguard-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-neckguard", [FORGE]);

addItem("item:imbued-elven-chain-veil", "Imbued Elven Chain Veil", { slots: ["Face"], ac: 4, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-veil", "Imbued Elven Chain Veil", 143, [{ id: "item:chainmail-veil-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-veil", [FORGE]);

addItem("item:imbued-elven-chainmail-boots", "Imbued Elven Chainmail Boots", { slots: ["Feet"], ac: 7, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-elven-chainmail-boots", "Imbued Elven Chainmail Boots", 142, [{ id: "item:chainmail-boot-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-boots", [FORGE]);

addItem("item:imbued-woodlanders-shield", "Imbued Woodlanders Shield", { slots: ["Secondary"], ac: 11, stats: {"str":2,"sta":2,"wis":2}, weight: 10, size: "Large", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-woodlanders-shield", "Imbued Woodlanders Shield", 128, [{ id: "item:elven-smithy-hammer" }, { id: "item:imbued-emerald" }, { id: "item:kite-shield-mold" }, { id: "item:moonlight-temper" }, { id: "item:sheet-of-mithril", quantity: 2 }], "item:imbued-woodlanders-shield", [FORGE]);

addItem("item:koadadal-falchion", "Koada`Dal Falchion", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 24, damage: 7, weight: 5, size: "Medium", classes: ["Bard","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:koadadal-falchion", "Koada`Dal Falchion", 104, [{ id: "item:curved-blade-mold" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:hilt-mold" }, { id: "item:morning-dew" }, { id: "item:pommel-mold" }], "item:koadadal-falchion", [FORGE]);

addItem("item:koadadal-falchion-of-tunare", "Koada`Dal Falchion of Tunare", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 24, damage: 7, stats: {"str":3,"wis":3}, weight: 5, size: "Medium", classes: ["Bard","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:koadadal-falchion-of-tunare", "Koada`Dal Falchion of Tunare", 115, [{ id: "item:curved-blade-mold" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:hilt-mold" }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:pommel-mold" }], "item:koadadal-falchion-of-tunare", [FORGE]);

addItem("item:koadadal-woodlanders-shield", "Koada`Dal Woodlanders Shield", { slots: ["Secondary"], ac: 11, stats: {"sta":2}, weight: 10, size: "Large", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:koadadal-woodlanders-shield", "Koada`Dal Woodlanders Shield", 115, [{ id: "item:elven-smithy-hammer" }, { id: "item:kite-shield-mold" }, { id: "item:moonlight-temper" }, { id: "item:sheet-of-mithril", quantity: 2 }], "item:koadadal-woodlanders-shield", [FORGE]);

addItem("item:mithril-chain-jointing", "Mithril Chain Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:mithril-chain-jointing", "Mithril Chain Jointing", 106, [{ id: "item:elven-smithy-hammer" }, { id: "item:file" }, { id: "item:mithril-rings" }, { id: "item:morning-dew" }], "item:mithril-chain-jointing", [FORGE]);

addItem("item:mithril-rings", "Mithril Rings", { weight: 2, size: "Tiny" });
addRecipe("recipe:mithril-rings", "Mithril Rings", 46, [{ id: "item:file" }, { id: "item:large-brick-of-mithril" }, { id: "item:morning-dew" }], "item:mithril-rings", [FORGE]);

addItem("item:imbued-elven-chain-cape", "Imbued Elven Chain Cape", { slots: ["Back"], ac: 7, stats: {"cha":2,"wis":4,"int":4}, resists: {"magic":4}, weight: 0.7, size: "Large", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-cape", "Imbued Elven Chain Cape", 155, [{ id: "item:chainmail-cloak-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-cape", [FORGE]);

addItem("item:imbued-elven-chain-coif", "Imbued Elven Chain Coif", { slots: ["Head"], ac: 8, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":4}, weight: 0.6, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-coif", "Imbued Elven Chain Coif", 159, [{ id: "item:chainmail-coif-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-coif", [FORGE]);

addItem("item:imbued-elven-chain-mantle", "Imbued Elven Chain Mantle", { slots: ["Shoulders"], ac: 6, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-mantle", "Imbued Elven Chain Mantle", 148, [{ id: "item:chainmail-mantle-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-mantle", [FORGE]);

addItem("item:imbued-elven-chain-tunic", "Imbued Elven Chain Tunic", { slots: ["Chest"], ac: 14, stats: {"cha":2,"wis":5,"int":5}, resists: {"magic":2}, weight: 1.5, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chain-tunic", "Imbued Elven Chain Tunic", 167, [{ id: "item:chainmail-tunic-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chain-tunic", [FORGE]);

addItem("item:imbued-elven-chainmail-bracelet", "Imbued Elven Chainmail Bracelet", { slots: ["Wrist"], ac: 5, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.2, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chainmail-bracelet", "Imbued Elven Chainmail Bracelet", 148, [{ id: "item:chainmail-bracelet-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings" }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-bracelet", [FORGE]);

addItem("item:imbued-elven-chainmail-gloves", "Imbued Elven Chainmail Gloves", { slots: ["Hands"], ac: 7, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chainmail-gloves", "Imbued Elven Chainmail Gloves", 155, [{ id: "item:chainmail-glove-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-gloves", [FORGE]);

addItem("item:imbued-elven-chainmail-leggings", "Imbued Elven Chainmail Leggings", { slots: ["Legs"], ac: 8, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":4}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chainmail-leggings", "Imbued Elven Chainmail Leggings", 167, [{ id: "item:chainmail-pant-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 3 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-leggings", [FORGE]);

addItem("item:imbued-elven-chainmail-skirt", "Imbued Elven Chainmail Skirt", { slots: ["Waist"], ac: 6, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":2}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chainmail-skirt", "Imbued Elven Chainmail Skirt", 148, [{ id: "item:chainmail-skirt-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-skirt", [FORGE]);

addItem("item:imbued-elven-chainmail-sleeves", "Imbued Elven Chainmail Sleeves", { slots: ["Arms"], ac: 7, stats: {"cha":2,"wis":3,"int":3}, resists: {"magic":4}, weight: 0.7, size: "Small", classes: ["Bard","Cleric","Druid","Enchanter","Magician","Paladin","Ranger","Rogue","Warrior","Wizard"], deity: "Tunare" });
addRecipe("recipe:imbued-elven-chainmail-sleeves", "Imbued Elven Chainmail Sleeves", 155, [{ id: "item:chainmail-sleeve-pattern" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-mithril-rings", quantity: 2 }, { id: "item:imbued-emerald" }, { id: "item:moonlight-temper" }, { id: "item:silk-swatch" }], "item:imbued-elven-chainmail-sleeves", [FORGE]);

addItem("item:imbued-koadadal-mithril-boots", "Imbued Koada`Dal Mithril Boots", { slots: ["Feet"], ac: 13, stats: {"dex":8,"cha":4,"wis":3,"agi":8}, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-boots", "Imbued Koada`Dal Mithril Boots", 222, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-boot-mold" }], "item:imbued-koadadal-mithril-boots", [FORGE]);

addItem("item:imbued-koadadal-mithril-bracers", "Imbued Koada`Dal Mithril Bracers", { slots: ["Wrist"], ac: 11, stats: {"str":4,"cha":4,"wis":3}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-bracers", "Imbued Koada`Dal Mithril Bracers", 224, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-bracer-mold" }], "item:imbued-koadadal-mithril-bracers", [FORGE]);

addItem("item:imbued-koadadal-mithril-collar", "Imbued Koada`Dal Mithril Collar", { slots: ["Neck"], ac: 9, stats: {"str":3,"cha":5,"wis":6}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-collar", "Imbued Koada`Dal Mithril Collar", 219, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-gorget-mold" }], "item:imbued-koadadal-mithril-collar", [FORGE]);

addItem("item:imbued-koadadal-mithril-girdle", "Imbued Koada`Dal Mithril Girdle", { slots: ["Waist"], ac: 10, stats: {"str":4,"dex":5,"cha":4,"wis":3}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-girdle", "Imbued Koada`Dal Mithril Girdle", 224, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-belt-mold" }], "item:imbued-koadadal-mithril-girdle", [FORGE]);

addItem("item:imbued-koadadal-mithril-helm", "Imbued Koada`Dal Mithril Helm", { slots: ["Head"], ac: 14, stats: {"str":2,"cha":4,"wis":6}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-helm", "Imbued Koada`Dal Mithril Helm", 231, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-helm-mold" }], "item:imbued-koadadal-mithril-helm", [FORGE]);

addItem("item:imbued-koadadal-mithril-pauldron", "Imbued Koada`Dal Mithril Pauldron", { slots: ["Shoulders"], ac: 12, stats: {"str":6,"cha":4,"wis":3,"agi":6}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-pauldron", "Imbued Koada`Dal Mithril Pauldron", 224, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-pauldron-mold" }], "item:imbued-koadadal-mithril-pauldron", [FORGE]);

addItem("item:imbued-koadadal-mithril-visor", "Imbued Koada`Dal Mithril Visor", { slots: ["Face"], ac: 7, stats: {"cha":5,"wis":5}, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-visor", "Imbued Koada`Dal Mithril Visor", 216, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-visor-mold" }], "item:imbued-koadadal-mithril-visor", [FORGE]);

addItem("item:koadadal-mithril-boots", "Koada`Dal Mithril Boots", { slots: ["Feet"], ac: 11, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-boots", "Koada`Dal Mithril Boots", 188, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-boot-mold" }], "item:koadadal-mithril-boots", [FORGE]);

addItem("item:koadadal-mithril-bracers", "Koada`Dal Mithril Bracers", { slots: ["Wrist"], ac: 10, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-bracers", "Koada`Dal Mithril Bracers", 188, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-bracer-mold" }], "item:koadadal-mithril-bracers", [FORGE]);

addItem("item:koadadal-mithril-breastplate", "Koada`Dal Mithril Breastplate", { slots: ["Chest"], ac: 23, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-breastplate", "Koada`Dal Mithril Breastplate", 188, [{ id: "item:breastplate-mold" }, { id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }], "item:koadadal-mithril-breastplate", [FORGE]);

addItem("item:koadadal-mithril-cloak", "Koada`Dal Mithril Cloak", { slots: ["Back"], ac: 12, weight: 3, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-cloak", "Koada`Dal Mithril Cloak", 175, [{ id: "item:elven-smithy-hammer" }, { id: "item:field-splinted-cloak-mold" }, { id: "item:folded-sheet-of-mithril", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }], "item:koadadal-mithril-cloak", [FORGE]);

addItem("item:koadadal-mithril-collar", "Koada`Dal Mithril Collar", { slots: ["Neck"], ac: 8, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-collar", "Koada`Dal Mithril Collar", 188, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-gorget-mold" }], "item:koadadal-mithril-collar", [FORGE]);

addItem("item:koadadal-mithril-gauntlets", "Koada`Dal Mithril Gauntlets", { slots: ["Hands"], ac: 11, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-gauntlets", "Koada`Dal Mithril Gauntlets", 175, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-gauntlet-mold" }], "item:koadadal-mithril-gauntlets", [FORGE]);

addItem("item:koadadal-mithril-girdle", "Koada`Dal Mithril Girdle", { slots: ["Waist"], ac: 9, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-girdle", "Koada`Dal Mithril Girdle", 168, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-belt-mold" }], "item:koadadal-mithril-girdle", [FORGE]);

addItem("item:koadadal-mithril-greaves", "Koada`Dal Mithril Greaves", { slots: ["Legs"], ac: 15, weight: 4, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-greaves", "Koada`Dal Mithril Greaves", 183, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-greaves-mold" }], "item:koadadal-mithril-greaves", [FORGE]);

addItem("item:koadadal-mithril-helm", "Koada`Dal Mithril Helm", { slots: ["Head"], ac: 13, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-helm", "Koada`Dal Mithril Helm", 179, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-helm-mold" }], "item:koadadal-mithril-helm", [FORGE]);

addItem("item:koadadal-mithril-pauldron", "Koada`Dal Mithril Pauldron", { slots: ["Shoulders"], ac: 11, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-pauldron", "Koada`Dal Mithril Pauldron", 168, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-pauldron-mold" }], "item:koadadal-mithril-pauldron", [FORGE]);

addItem("item:koadadal-mithril-vambraces", "Koada`Dal Mithril Vambraces", { slots: ["Arms"], ac: 12, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-vambraces", "Koada`Dal Mithril Vambraces", 175, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-vambrace-mold" }], "item:koadadal-mithril-vambraces", [FORGE]);

addItem("item:koadadal-mithril-visor", "Koada`Dal Mithril Visor", { slots: ["Face"], ac: 6, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"] });
addRecipe("recipe:koadadal-mithril-visor", "Koada`Dal Mithril Visor", 188, [{ id: "item:elven-smithy-hammer" }, { id: "item:folded-sheet-of-mithril" }, { id: "item:leather-padding" }, { id: "item:mithril-chain-jointing" }, { id: "item:moonlight-temper" }, { id: "item:plate-visor-mold" }], "item:koadadal-mithril-visor", [FORGE]);

addItem("item:mystic-koadadal-mithril-boots", "Mystic Koada`Dal Mithril Boots", { slots: ["Feet"], ac: 13, stats: {"dex":8,"cha":4,"agi":8}, weight: 3.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-boots", "Mystic Koada`Dal Mithril Boots", 195, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-boot-mold" }], "item:mystic-koadadal-mithril-boots", [FORGE]);

addItem("item:mystic-koadadal-mithril-bracers", "Mystic Koada`Dal Mithril Bracers", { slots: ["Wrist"], ac: 11, stats: {"str":4,"cha":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-bracers", "Mystic Koada`Dal Mithril Bracers", 187, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-bracer-mold" }], "item:mystic-koadadal-mithril-bracers", [FORGE]);

addItem("item:mystic-koadadal-mithril-cloak", "Mystic Koada`Dal Mithril Cloak", { slots: ["Back"], ac: 14, stats: {"dex":6,"cha":6,"wis":4}, weight: 3, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-cloak", "Mystic Koada`Dal Mithril Cloak", 205, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:field-splinted-cloak-mold" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }], "item:mystic-koadadal-mithril-cloak", [FORGE]);

addItem("item:mystic-koadadal-mithril-collar", "Mystic Koada`Dal Mithril Collar", { slots: ["Neck"], ac: 9, stats: {"str":3,"cha":4,"wis":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-collar", "Mystic Koada`Dal Mithril Collar", 192, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-gorget-mold" }], "item:mystic-koadadal-mithril-collar", [FORGE]);

addItem("item:mystic-koadadal-mithril-cuirass", "Mystic Koada`Dal Mithril Cuirass", { slots: ["Chest"], ac: 26, stats: {"dex":10,"cha":8}, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-cuirass", "Mystic Koada`Dal Mithril Cuirass", 207, [{ id: "item:breastplate-mold" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }], "item:mystic-koadadal-mithril-cuirass", [FORGE]);

addItem("item:mystic-koadadal-mithril-gauntlets", "Mystic Koada`Dal Mithril Gauntlets", { slots: ["Hands"], ac: 13, stats: {"str":4,"dex":4,"cha":4}, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-gauntlets", "Mystic Koada`Dal Mithril Gauntlets", 206, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-gauntlet-mold" }], "item:mystic-koadadal-mithril-gauntlets", [FORGE]);

addItem("item:mystic-koadadal-mithril-girdle", "Mystic Koada`Dal Mithril Girdle", { slots: ["Waist"], ac: 10, stats: {"str":4,"dex":5,"cha":4}, weight: 2.1, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-girdle", "Mystic Koada`Dal Mithril Girdle", 195, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-belt-mold" }], "item:mystic-koadadal-mithril-girdle", [FORGE]);

addItem("item:mystic-koadadal-mithril-greaves", "Mystic Koada`Dal Mithril Greaves", { slots: ["Legs"], ac: 18, stats: {"dex":10,"cha":4,"agi":4}, weight: 4, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-greaves", "Mystic Koada`Dal Mithril Greaves", 207, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-greaves-mold" }], "item:mystic-koadadal-mithril-greaves", [FORGE]);

addItem("item:mystic-koadadal-mithril-helm", "Mystic Koada`Dal Mithril Helm", { slots: ["Head"], ac: 14, stats: {"str":2,"cha":4,"wis":4}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-helm", "Mystic Koada`Dal Mithril Helm", 206, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-helm-mold" }], "item:mystic-koadadal-mithril-helm", [FORGE]);

addItem("item:mystic-koadadal-mithril-pauldron", "Mystic Koada`Dal Mithril Pauldron", { slots: ["Shoulders"], ac: 12, stats: {"str":6,"cha":4,"agi":6}, weight: 2.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-pauldron", "Mystic Koada`Dal Mithril Pauldron", 195, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-pauldron-mold" }], "item:mystic-koadadal-mithril-pauldron", [FORGE]);

addItem("item:mystic-koadadal-mithril-vambraces", "Mystic Koada`Dal Mithril Vambraces", { slots: ["Arms"], ac: 14, stats: {"str":4,"dex":5,"cha":4}, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-vambraces", "Mystic Koada`Dal Mithril Vambraces", 202, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-vambrace-mold" }], "item:mystic-koadadal-mithril-vambraces", [FORGE]);

addItem("item:mystic-koadadal-mithril-visor", "Mystic Koada`Dal Mithril Visor", { slots: ["Face"], ac: 7, stats: {"cha":4,"wis":4}, weight: 0.8, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:mystic-koadadal-mithril-visor", "Mystic Koada`Dal Mithril Visor", 190, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril" }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-visor-mold" }], "item:mystic-koadadal-mithril-visor", [FORGE]);

addItem("item:elven-smithy-hammer", "Elven Smithy Hammer", { weight: 14, size: "Small", source: "Sold by Tanalin Silverkale (Felwithe)" });

addItem("item:sheet-of-mithril", "Sheet of Mithril", { weight: 5, size: "Small", source: "Sold by Tanalin Silverkale (Felwithe)" });
addRecipe("recipe:sheet-of-mithril", "Sheet of Mithril", 37, [], "item:sheet-of-mithril", [FORGE]);

addItem("item:small-brick-of-mithril", "Small Brick of Mithril", { weight: 5, size: "Small", source: "Sold by Tanalin Silverkale (Felwithe), Opal Leganyn (Felwithe)" });

addItem("item:imbued-emerald", "Imbued Emerald", { weight: 0.1, size: "Tiny", source: "Created from a normal Emerald with the Imbue Emerald spell. Creates items that are diety restricted to Tunare." });

addItem("item:imbued-koadadal-mithril-cloak", "Imbued Koada`Dal Mithril Cloak", { slots: ["Back"], ac: 14, stats: {"dex":6,"cha":6,"wis":8}, weight: 3, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-cloak", "Imbued Koada`Dal Mithril Cloak", 239, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:field-splinted-cloak-mold" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }], "item:imbued-koadadal-mithril-cloak", [FORGE]);

addItem("item:imbued-koadadal-mithril-cuirass", "Imbued Koada`Dal Mithril Cuirass", { slots: ["Chest"], ac: 26, stats: {"dex":10,"cha":8,"wis":5}, weight: 5.2, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-cuirass", "Imbued Koada`Dal Mithril Cuirass", 242, [{ id: "item:breastplate-mold" }, { id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }], "item:imbued-koadadal-mithril-cuirass", [FORGE]);

addItem("item:imbued-koadadal-mithril-gauntlets", "Imbued Koada`Dal Mithril Gauntlets", { slots: ["Hands"], ac: 13, stats: {"str":4,"dex":4,"cha":4,"wis":4}, weight: 2.6, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-gauntlets", "Imbued Koada`Dal Mithril Gauntlets", 230, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-gauntlet-mold" }], "item:imbued-koadadal-mithril-gauntlets", [FORGE]);

addItem("item:imbued-koadadal-mithril-greaves", "Imbued Koada`Dal Mithril Greaves", { slots: ["Legs"], ac: 18, stats: {"dex":10,"cha":4,"wis":4,"agi":4}, weight: 4, size: "Large", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-greaves", "Imbued Koada`Dal Mithril Greaves", 237, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 3 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-greaves-mold" }], "item:imbued-koadadal-mithril-greaves", [FORGE]);

addItem("item:imbued-koadadal-mithril-vambraces", "Imbued Koada`Dal Mithril Vambraces", { slots: ["Arms"], ac: 14, stats: {"str":4,"dex":5,"cha":4,"wis":4}, weight: 3.4, size: "Small", classes: ["Bard","Cleric","Paladin","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-koadadal-mithril-vambraces", "Imbued Koada`Dal Mithril Vambraces", 228, [{ id: "item:elven-smithy-hammer" }, { id: "item:enchanted-folded-sheet-of-mithril", quantity: 2 }, { id: "item:enchanted-mithril-chain-jointing" }, { id: "item:imbued-emerald" }, { id: "item:leather-padding" }, { id: "item:moonlight-temper" }, { id: "item:plate-vambrace-mold" }], "item:imbued-koadadal-mithril-vambraces", [FORGE]);

addItem("item:enchanted-lrg-brick-of-mithril", "Enchanted Lrg. Brick of Mithril", { weight: 10, size: "Small", source: "Created from a Large Brick of Mithril with the Enchant Mithril spell." });

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
