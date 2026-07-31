/**
 * Dwarf Cultural Tradeskills (issue #65) -- Blacksmithing only, no Tailoring
 * section on this race's page. Source: eqlwiki.com's "Cultural Tradeskills:
 * Dwarf" overview page plus each of its 108 linked/transcluded item pages,
 * batch-fetched via the raw wikitext MediaWiki API (same technique as
 * migrations 388/389), never the summarizing WebFetch tool.
 *
 * Uses a single Stormguard Forge (Southern Kaladim); reused as the same
 * generic container:forge every other race's cultural forge maps to -- no
 * dual-forge alliance here (Dwarf has no allied-race sharing, unlike Dark
 * Elf/Ogre's Adamantite basics in migration 389), so no variant_of edges.
 *
 * Four full Plate tiers per the issue's full-fidelity scope decision:
 * Normal, Imbued (Brell Serilis), Enchanted, and Enchanted Imbued (Brell
 * Serilis only -- the wiki page states outright there is no Bristlebane-
 * imbued Plate set). Chain armor, by contrast, has imbued sets for BOTH
 * Brell Serilis and Bristlebane, each its own full 12-piece set -- modeled
 * as fully separate item/recipe pairs, not collapsed.
 *
 * Twelve "Small Chainmail * Pattern" titles linked from the overview page
 * turned out to be wiki #REDIRECTs to the plain "Chainmail * Pattern" items
 * already in the graph (added by migration 388) -- confirmed by fetching
 * each page's raw wikitext before assuming reuse, not guessed. They are not
 * re-added under a new id.
 *
 * Extraction covers the item schema's `source` field this time (built from
 * the wiki page's own |notes= and |soldby= template fields, stripped of
 * wiki-link markup) -- a gap in migration 389's codegen that never wired
 * either field into the emitted item despite the parser already capturing
 * them (see feedback_extract_all_schema_fields_on_scrape memory). Generic
 * editorial notes ("This is the imbued, deity restricted version of X",
 * "Part of the ... armor sets") are dropped since they just restate facts
 * the graph already encodes structurally (the `deity` field, set
 * membership), not real acquisition info.
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

addItem("item:dwarven-battle-shield", "Dwarven Battle Shield", { slots: ["Secondary"], ac: 14, resists: {"fire":5}, weight: 11.2, size: "Medium", classes: ["Cleric","Paladin","Rogue","Shaman","Warrior"] });
addRecipe("recipe:dwarven-battle-shield", "Dwarven Battle Shield", 115, [{ id: "item:block-of-brellium" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:small-kite-shield-mold" }], "item:dwarven-battle-shield", [FORGE]);

addItem("item:dwarven-battle-shield-imbued", "Dwarven Battle Shield (Imbued)", { slots: ["Secondary"], ac: 14, stats: {"sta":2,"wis":2}, resists: {"fire":5}, weight: 11.2, size: "Medium", classes: ["Cleric","Paladin","Rogue","Shaman","Warrior"], deity: "Brell Serilis" });
addRecipe("recipe:dwarven-battle-shield-imbued", "Dwarven Battle Shield (Imbued)", 128, [{ id: "item:block-of-brellium" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:imbued-ruby" }, { id: "item:small-kite-shield-mold" }], "item:dwarven-battle-shield-imbued", [FORGE]);

addItem("item:dwarven-chain-boots", "Dwarven Chain Boots", { slots: ["Feet"], ac: 9, resists: {"fire":2}, weight: 6, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-boots", "Dwarven Chain Boots", 122, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-boot-pattern" }], "item:dwarven-chain-boots", [FORGE]);

addItem("item:dwarven-chain-bracelet", "Dwarven Chain Bracelet", { slots: ["Wrist"], ac: 8, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-bracelet", "Dwarven Chain Bracelet", 128, [{ id: "item:brellium-rings" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-bracelet-pattern" }], "item:dwarven-chain-bracelet", [FORGE]);

addItem("item:dwarven-chain-cloak", "Dwarven Chain Cloak", { slots: ["Back"], ac: 8, resists: {"fire":3}, weight: 5, size: "Large", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-cloak", "Dwarven Chain Cloak", 135, [{ id: "item:brellium-rings", quantity: 3 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-cloak-pattern" }], "item:dwarven-chain-cloak", [FORGE]);

addItem("item:dwarven-chain-coif", "Dwarven Chain Coif", { slots: ["Head"], ac: 10, resists: {"fire":2}, weight: 5.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-coif", "Dwarven Chain Coif", 139, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-coif-pattern" }], "item:dwarven-chain-coif", [FORGE]);

addItem("item:dwarven-chain-gloves", "Dwarven Chain Gloves", { slots: ["Hands"], ac: 9, resists: {"fire":2}, weight: 5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-gloves", "Dwarven Chain Gloves", 135, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-glove-pattern" }], "item:dwarven-chain-gloves", [FORGE]);

addItem("item:dwarven-chain-gorget", "Dwarven Chain Gorget", { slots: ["Neck"], ac: 6, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-gorget", "Dwarven Chain Gorget", 126, [{ id: "item:brellium-rings" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-neckguard-pattern" }], "item:dwarven-chain-gorget", [FORGE]);

addItem("item:dwarven-chain-leggings", "Dwarven Chain Leggings", { slots: ["Legs"], ac: 12, resists: {"fire":2}, weight: 6.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-leggings", "Dwarven Chain Leggings", 142, [{ id: "item:brellium-rings", quantity: 3 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-pant-pattern" }], "item:dwarven-chain-leggings", [FORGE]);

addItem("item:dwarven-chain-mail", "Dwarven Chain Mail", { slots: ["Chest"], ac: 18, resists: {"fire":3}, weight: 8.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-mail", "Dwarven Chain Mail", 148, [{ id: "item:brellium-rings", quantity: 3 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-tunic-pattern" }], "item:dwarven-chain-mail", [FORGE]);

addItem("item:dwarven-chain-mantle", "Dwarven Chain Mantle", { slots: ["Shoulders"], ac: 7, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-mantle", "Dwarven Chain Mantle", 128, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-mantle-pattern" }], "item:dwarven-chain-mantle", [FORGE]);

addItem("item:dwarven-chain-skirt", "Dwarven Chain Skirt", { slots: ["Waist"], ac: 7, resists: {"fire":1}, weight: 3.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-skirt", "Dwarven Chain Skirt", 128, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-skirt-pattern" }], "item:dwarven-chain-skirt", [FORGE]);

addItem("item:dwarven-chain-sleeves", "Dwarven Chain Sleeves", { slots: ["Arms"], ac: 10, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-sleeves", "Dwarven Chain Sleeves", 135, [{ id: "item:brellium-rings", quantity: 2 }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-sleeve-pattern" }], "item:dwarven-chain-sleeves", [FORGE]);

addItem("item:dwarven-chain-veil", "Dwarven Chain Veil", { slots: ["Face"], ac: 5, resists: {"fire":1}, weight: 2, size: "Small", classes: ["Bard","Cleric","Paladin","Ranger","Rogue","Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:dwarven-chain-veil", "Dwarven Chain Veil", 123, [{ id: "item:brellium-rings" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:chainmail-veil-pattern" }], "item:dwarven-chain-veil", [FORGE]);

addItem("item:imbued-dwarven-chain-boots-brell-serilis", "Imbued Dwarven Chain Boots (Brell Serilis)", { slots: ["Feet"], ac: 10, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 6, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-boots-brell-serilis", "Imbued Dwarven Chain Boots (Brell Serilis)", 128, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-boot-pattern" }], "item:imbued-dwarven-chain-boots-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-boots-bristlebane", "Imbued Dwarven Chain Boots (Bristlebane)", { slots: ["Feet"], ac: 10, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 6, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-boots-bristlebane", "Imbued Dwarven Chain Boots (Bristlebane)", 128, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-boot-pattern" }], "item:imbued-dwarven-chain-boots-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-bracelet-brell-serilis", "Imbued Dwarven Chain Bracelet (Brell Serilis)", { slots: ["Wrist"], ac: 9, stats: {"str":3,"sta":4}, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-bracelet-brell-serilis", "Imbued Dwarven Chain Bracelet (Brell Serilis)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-ruby" }, { id: "item:chainmail-bracelet-pattern" }], "item:imbued-dwarven-chain-bracelet-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-bracelet-bristlebane", "Imbued Dwarven Chain Bracelet (Bristlebane)", { slots: ["Wrist"], ac: 9, stats: {"dex":3,"agi":4}, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-bracelet-bristlebane", "Imbued Dwarven Chain Bracelet (Bristlebane)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-peridot" }, { id: "item:chainmail-bracelet-pattern" }], "item:imbued-dwarven-chain-bracelet-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-cloak-brell-serilis", "Imbued Dwarven Chain Cloak (Brell Serilis)", { slots: ["Back"], ac: 10, stats: {"str":3,"sta":4}, resists: {"fire":3}, weight: 5, size: "Large", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-cloak-brell-serilis", "Imbued Dwarven Chain Cloak (Brell Serilis)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-cloak-pattern" }], "item:imbued-dwarven-chain-cloak-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-coif-brell-serilis", "Imbued Dwarven Chain Coif (Brell Serilis)", { slots: ["Head"], ac: 11, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 5.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-coif-brell-serilis", "Imbued Dwarven Chain Coif (Brell Serilis)", 146, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-coif-pattern" }], "item:imbued-dwarven-chain-coif-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-coif-bristlebane", "Imbued Dwarven Chain Coif (Bristlebane)", { slots: ["Head"], ac: 11, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 5.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-coif-bristlebane", "Imbued Dwarven Chain Coif (Bristlebane)", 146, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-coif-pattern" }], "item:imbued-dwarven-chain-coif-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-gloves-brell-serilis", "Imbued Dwarven Chain Gloves (Brell Serilis)", { slots: ["Hands"], ac: 10, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-gloves-brell-serilis", "Imbued Dwarven Chain Gloves (Brell Serilis)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-glove-pattern" }], "item:imbued-dwarven-chain-gloves-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-gloves-bristlebane", "Imbued Dwarven Chain Gloves (Bristlebane)", { slots: ["Hands"], ac: 10, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-gloves-bristlebane", "Imbued Dwarven Chain Gloves (Bristlebane)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-glove-pattern" }], "item:imbued-dwarven-chain-gloves-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-gorget-brell-serilis", "Imbued Dwarven Chain Gorget (Brell Serilis)", { slots: ["Neck"], ac: 8, stats: {"str":3,"sta":4}, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-gorget-brell-serilis", "Imbued Dwarven Chain Gorget (Brell Serilis)", 132, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-ruby" }, { id: "item:chainmail-neckguard-pattern" }], "item:imbued-dwarven-chain-gorget-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-gorget-bristlebane", "Imbued Dwarven Chain Gorget (Bristlebane)", { slots: ["Neck"], ac: 8, stats: {"dex":3,"agi":4}, resists: {"fire":1}, weight: 3, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-gorget-bristlebane", "Imbued Dwarven Chain Gorget (Bristlebane)", 132, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-peridot" }, { id: "item:chainmail-neckguard-pattern" }], "item:imbued-dwarven-chain-gorget-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-leggings-brell-serilis", "Imbued Dwarven Chain Leggings (Brell Serilis)", { slots: ["Legs"], ac: 14, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 6.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-leggings-brell-serilis", "Imbued Dwarven Chain Leggings (Brell Serilis)", 148, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-pant-pattern" }], "item:imbued-dwarven-chain-leggings-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-mail-brell-serilis", "Imbued Dwarven Chain Mail (Brell Serilis)", { slots: ["Chest"], ac: 20, stats: {"str":3,"sta":4}, resists: {"fire":3}, weight: 8.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-mail-brell-serilis", "Imbued Dwarven Chain Mail (Brell Serilis)", 155, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-tunic-pattern" }], "item:imbued-dwarven-chain-mail-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-mail-bristlebane", "Imbued Dwarven Chain Mail (Bristlebane)", { slots: ["Chest"], ac: 20, stats: {"dex":3,"agi":4}, resists: {"fire":3}, weight: 8.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-mail-bristlebane", "Imbued Dwarven Chain Mail (Bristlebane)", 155, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-tunic-pattern" }], "item:imbued-dwarven-chain-mail-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-mantle-brell-serilis", "Imbued Dwarven Chain Mantle (Brell Serilis)", { slots: ["Shoulders"], ac: 9, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-mantle-brell-serilis", "Imbued Dwarven Chain Mantle (Brell Serilis)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-mantle-pattern" }], "item:imbued-dwarven-chain-mantle-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-mantle-bristlebane", "Imbued Dwarven Chain Mantle (Bristlebane)", { slots: ["Shoulders"], ac: 9, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-mantle-bristlebane", "Imbued Dwarven Chain Mantle (Bristlebane)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-mantle-pattern" }], "item:imbued-dwarven-chain-mantle-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-skirt-brell-serilis", "Imbued Dwarven Chain Skirt (Brell Serilis)", { slots: ["Waist"], ac: 9, stats: {"str":3,"sta":4}, resists: {"fire":1}, weight: 3.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-skirt-brell-serilis", "Imbued Dwarven Chain Skirt (Brell Serilis)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-skirt-pattern" }], "item:imbued-dwarven-chain-skirt-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-skirt-bristlebane", "Imbued Dwarven Chain Skirt (Bristlebane)", { slots: ["Waist"], ac: 9, stats: {"dex":3,"agi":4}, resists: {"fire":1}, weight: 3.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-skirt-bristlebane", "Imbued Dwarven Chain Skirt (Bristlebane)", 135, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-skirt-pattern" }], "item:imbued-dwarven-chain-skirt-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-sleeves-brell-serilis", "Imbued Dwarven Chain Sleeves (Brell Serilis)", { slots: ["Arms"], ac: 11, stats: {"str":3,"sta":4}, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-sleeves-brell-serilis", "Imbued Dwarven Chain Sleeves (Brell Serilis)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:chainmail-sleeve-pattern" }], "item:imbued-dwarven-chain-sleeves-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-sleeves-bristlebane", "Imbued Dwarven Chain Sleeves (Bristlebane)", { slots: ["Arms"], ac: 11, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-sleeves-bristlebane", "Imbued Dwarven Chain Sleeves (Bristlebane)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 2 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-sleeve-pattern" }], "item:imbued-dwarven-chain-sleeves-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-veil-brell-serilis", "Imbued Dwarven Chain Veil (Brell Serilis)", { slots: ["Face"], ac: 7, stats: {"str":3,"sta":4}, resists: {"fire":1}, weight: 2, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-chain-veil-brell-serilis", "Imbued Dwarven Chain Veil (Brell Serilis)", 130, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-ruby" }, { id: "item:chainmail-veil-pattern" }], "item:imbued-dwarven-chain-veil-brell-serilis", [FORGE]);

addItem("item:imbued-dwarven-chain-veil-bristlebane", "Imbued Dwarven Chain Veil (Bristlebane)", { slots: ["Face"], ac: 7, stats: {"dex":3,"agi":4}, resists: {"fire":1}, weight: 2, size: "Small", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-veil-bristlebane", "Imbued Dwarven Chain Veil (Bristlebane)", 130, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings" }, { id: "item:imbued-peridot" }, { id: "item:chainmail-veil-pattern" }], "item:imbued-dwarven-chain-veil-bristlebane", [FORGE]);

addItem("item:stormguard-battle-axe", "Stormguard Battle Axe", { slots: ["Primary"], skill: "2H Slashing", delay: 50, damage: 17, weight: 13, size: "Medium", classes: ["Paladin","Ranger","Shadow Knight","Warrior"] });
addRecipe("recipe:stormguard-battle-axe", "Stormguard Battle Axe", 119, [{ id: "item:axe-head-mold" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:oak-shaft" }], "item:stormguard-battle-axe", [FORGE]);

addItem("item:stormguard-battle-axe-of-brell", "Stormguard Battle Axe of Brell", { slots: ["Primary"], skill: "2H Slashing", delay: 50, damage: 17, stats: {"wis":2}, resists: {"fire":2}, weight: 13, size: "Medium", classes: ["Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:stormguard-battle-axe-of-brell", "Stormguard Battle Axe of Brell", 132, [{ id: "item:axe-head-mold" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:imbued-ruby" }, { id: "item:oak-shaft" }], "item:stormguard-battle-axe-of-brell", [FORGE]);

addItem("item:stormguard-battle-hammer", "Stormguard Battle Hammer", { slots: ["Range","Primary","Secondary"], skill: "1H Blunt", delay: 36, damage: 9, weight: 8.5, size: "Medium", classes: ["Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:stormguard-battle-hammer", "Stormguard Battle Hammer", 106, [{ id: "item:earthen-temper" }, { id: "item:hammer-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-brellium" }], "item:stormguard-battle-hammer", [FORGE]);

addItem("item:stormguard-battle-hammer-of-brell", "Stormguard Battle Hammer of Brell", { slots: ["Range","Primary","Secondary"], skill: "1H Blunt", delay: 36, damage: 9, stats: {"wis":2}, resists: {"fire":2}, weight: 8.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:stormguard-battle-hammer-of-brell", "Stormguard Battle Hammer of Brell", 122, [{ id: "item:earthen-temper" }, { id: "item:hammer-head-mold" }, { id: "item:imbued-ruby" }, { id: "item:oak-shaft" }, { id: "item:sheet-of-brellium" }], "item:stormguard-battle-hammer-of-brell", [FORGE]);

addItem("item:enchanted-dwarven-plate-greaves", "Enchanted Dwarven Plate Greaves", { slots: ["Legs"], ac: 20, stats: {"str":8,"sta":8}, resists: {"fire":4,"magic":2}, weight: 8.5, size: "Large", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-greaves", "Enchanted Dwarven Plate Greaves", 208, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-plate-greaves-mold" }], "item:enchanted-dwarven-plate-greaves", [FORGE]);

addItem("item:enchanted-dwarven-breastplate", "Enchanted Dwarven Breastplate", { slots: ["Chest"], ac: 30, stats: {"str":8,"sta":10}, resists: {"fire":5}, weight: 11.5, size: "Large", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-breastplate", "Enchanted Dwarven Breastplate", 210, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-breastplate-mold" }], "item:enchanted-dwarven-breastplate", [FORGE]);

addItem("item:enchanted-dwarven-plate-boots", "Enchanted Dwarven Plate Boots", { slots: ["Feet"], ac: 15, stats: {"str":8,"sta":8}, resists: {"fire":2,"magic":4}, weight: 7.5, size: "Medium", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-boots", "Enchanted Dwarven Plate Boots", 195, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:leather-padding" }, { id: "item:small-plate-boot-mold" }], "item:enchanted-dwarven-plate-boots", [FORGE]);

addItem("item:enchanted-dwarven-plate-bracers", "Enchanted Dwarven Plate Bracers", { slots: ["Wrist"], ac: 13, stats: {"str":4,"sta":4}, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-bracers", "Enchanted Dwarven Plate Bracers", 195, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:leather-padding" }, { id: "item:small-plate-bracer-mold" }], "item:enchanted-dwarven-plate-bracers", [FORGE]);

addItem("item:enchanted-dwarven-plate-collar", "Enchanted Dwarven Plate Collar", { slots: ["Neck"], ac: 10, stats: {"str":4,"sta":6}, resists: {"fire":1,"magic":4}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-collar", "Enchanted Dwarven Plate Collar", 192, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:leather-padding" }, { id: "item:small-plate-gorget-mold" }], "item:enchanted-dwarven-plate-collar", [FORGE]);

addItem("item:enchanted-dwarven-plate-gauntlets", "Enchanted Dwarven Plate Gauntlets", { slots: ["Hands"], ac: 15, stats: {"str":4,"sta":4}, resists: {"fire":4,"magic":4}, weight: 5.5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-gauntlets", "Enchanted Dwarven Plate Gauntlets", 179, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-gauntlet-mold" }], "item:enchanted-dwarven-plate-gauntlets", [FORGE]);

addItem("item:enchanted-dwarven-plate-girdle", "Enchanted Dwarven Plate Girdle", { slots: ["Waist"], ac: 10, stats: {"str":4,"sta":6}, resists: {"fire":2,"magic":3}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-girdle", "Enchanted Dwarven Plate Girdle", 195, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-belt-mold" }], "item:enchanted-dwarven-plate-girdle", [FORGE]);

addItem("item:enchanted-dwarven-plate-helm", "Enchanted Dwarven Plate Helm", { slots: ["Head"], ac: 16, stats: {"str":4,"sta":4}, resists: {"fire":4,"magic":5}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-helm", "Enchanted Dwarven Plate Helm", 210, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-helm-mold" }], "item:enchanted-dwarven-plate-helm", [FORGE]);

addItem("item:enchanted-dwarven-plate-pauldron", "Enchanted Dwarven Plate Pauldron", { slots: ["Shoulders"], ac: 12, stats: {"str":4,"sta":4}, resists: {"fire":4,"magic":2}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-pauldron", "Enchanted Dwarven Plate Pauldron", 195, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-pauldron-mold" }], "item:enchanted-dwarven-plate-pauldron", [FORGE]);

addItem("item:enchanted-dwarven-plate-vambraces", "Enchanted Dwarven Plate Vambraces", { slots: ["Arms"], ac: 16, stats: {"str":5,"sta":6}, resists: {"fire":4,"magic":2}, weight: 7, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-vambraces", "Enchanted Dwarven Plate Vambraces", 194, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-vambrace-mold" }], "item:enchanted-dwarven-plate-vambraces", [FORGE]);

addItem("item:enchanted-dwarven-plate-visor", "Enchanted Dwarven Plate Visor", { slots: ["Face"], ac: 8, stats: {"sta":4}, resists: {"fire":1,"magic":4}, weight: 2, size: "Small", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-plate-visor", "Enchanted Dwarven Plate Visor", 190, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:leather-padding" }, { id: "item:small-plate-visor-mold" }], "item:enchanted-dwarven-plate-visor", [FORGE]);

addItem("item:enchanted-dwarven-splinted-cloak", "Enchanted Dwarven Splinted Cloak", { slots: ["Back"], ac: 11, stats: {"str":6,"sta":6}, resists: {"fire":3,"magic":5}, weight: 4.1, size: "Large", classes: ["Cleric","Paladin","Shadow Knight","Warrior"], magic: true });
addRecipe("recipe:enchanted-dwarven-splinted-cloak", "Enchanted Dwarven Splinted Cloak", 201, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-field-splinted-cloak-mold" }], "item:enchanted-dwarven-splinted-cloak", [FORGE]);

addItem("item:dwarven-plate-collar-enchanted-imbued", "Dwarven Plate Collar (Enchanted Imbued)", { slots: ["Neck"], ac: 10, stats: {"str":4,"sta":6,"wis":3}, resists: {"fire":1,"magic":4}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-collar-enchanted-imbued", "Dwarven Plate Collar (Enchanted Imbued)", 232, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-gorget-mold" }], "item:dwarven-plate-collar-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-visor-enchanted-imbued", "Dwarven Plate Visor (Enchanted Imbued)", { slots: ["Face"], ac: 8, stats: {"sta":4,"wis":2}, resists: {"fire":1,"magic":4}, weight: 2, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-visor-enchanted-imbued", "Dwarven Plate Visor (Enchanted Imbued)", 230, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-visor-mold" }], "item:dwarven-plate-visor-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-boots", "Dwarven Plate Boots", { slots: ["Feet"], ac: 12, resists: {"fire":2}, weight: 7.5, size: "Medium", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-boots", "Dwarven Plate Boots", 168, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:leather-padding" }, { id: "item:small-plate-boot-mold" }], "item:dwarven-plate-boots", [FORGE]);

addItem("item:dwarven-plate-bracers", "Dwarven Plate Bracers", { slots: ["Wrist"], ac: 10, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-bracers", "Dwarven Plate Bracers", 168, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:leather-padding" }, { id: "item:small-plate-bracer-mold" }], "item:dwarven-plate-bracers", [FORGE]);

addItem("item:dwarven-plate-breastplate", "Dwarven Plate Breastplate", { slots: ["Chest"], ac: 24, resists: {"fire":5}, weight: 11.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-breastplate", "Dwarven Plate Breastplate", 188, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-breastplate-mold" }], "item:dwarven-plate-breastplate", [FORGE]);

addItem("item:dwarven-plate-collar", "Dwarven Plate Collar", { slots: ["Neck"], ac: 9, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-collar", "Dwarven Plate Collar", 166, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:leather-padding" }, { id: "item:small-plate-gorget-mold" }], "item:dwarven-plate-collar", [FORGE]);

addItem("item:dwarven-plate-gauntlets", "Dwarven Plate Gauntlets", { slots: ["Hands"], ac: 12, resists: {"fire":4}, weight: 5.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-gauntlets", "Dwarven Plate Gauntlets", 175, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-gauntlet-mold" }], "item:dwarven-plate-gauntlets", [FORGE]);

addItem("item:dwarven-plate-girdle", "Dwarven Plate Girdle", { slots: ["Waist"], ac: 10, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-girdle", "Dwarven Plate Girdle", 168, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-belt-mold" }], "item:dwarven-plate-girdle", [FORGE]);

addItem("item:dwarven-plate-greaves", "Dwarven Plate Greaves", { slots: ["Legs"], ac: 16, resists: {"fire":4}, weight: 8.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-greaves", "Dwarven Plate Greaves", 182, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-plate-greaves-mold" }], "item:dwarven-plate-greaves", [FORGE]);

addItem("item:dwarven-plate-helm", "Dwarven Plate Helm", { slots: ["Head"], ac: 14, resists: {"fire":4}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-helm", "Dwarven Plate Helm", 179, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-helm-mold" }], "item:dwarven-plate-helm", [FORGE]);

addItem("item:dwarven-plate-pauldron", "Dwarven Plate Pauldron", { slots: ["Shoulders"], ac: 12, resists: {"fire":4}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-pauldron", "Dwarven Plate Pauldron", 168, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-pauldron-mold" }], "item:dwarven-plate-pauldron", [FORGE]);

addItem("item:dwarven-plate-vambraces", "Dwarven Plate Vambraces", { slots: ["Arms"], ac: 12, resists: {"fire":4}, weight: 7, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-vambraces", "Dwarven Plate Vambraces", 175, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:leather-padding" }, { id: "item:small-plate-vambrace-mold" }], "item:dwarven-plate-vambraces", [FORGE]);

addItem("item:dwarven-plate-visor", "Dwarven Plate Visor", { slots: ["Face"], ac: 7, resists: {"fire":1}, weight: 2, size: "Small", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-plate-visor", "Dwarven Plate Visor", 163, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:leather-padding" }, { id: "item:small-plate-visor-mold" }], "item:dwarven-plate-visor", [FORGE]);

addItem("item:dwarven-splinted-cloak", "Dwarven Splinted Cloak", { slots: ["Back"], ac: 11, resists: {"fire":3}, weight: 4.1, size: "Large", classes: ["Cleric","Paladin","Warrior"], magic: true });
addRecipe("recipe:dwarven-splinted-cloak", "Dwarven Splinted Cloak", 175, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:leather-padding" }, { id: "item:small-field-splinted-cloak-mold" }], "item:dwarven-splinted-cloak", [FORGE]);

addItem("item:imbued-dwarven-breastplate", "Imbued Dwarven Breastplate", { slots: ["Chest"], ac: 24, stats: {"wis":4}, resists: {"fire":5}, weight: 11.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-breastplate", "Imbued Dwarven Breastplate", 242, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-breastplate-mold" }], "item:imbued-dwarven-breastplate", [FORGE]);

addItem("item:imbued-dwarven-chain-cloak-bristlebane", "Imbued Dwarven Chain Cloak (Bristlebane)", { slots: ["Back"], ac: 10, stats: {"dex":3,"agi":4}, resists: {"fire":3}, weight: 5, size: "Large", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-cloak-bristlebane", "Imbued Dwarven Chain Cloak (Bristlebane)", 142, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-cloak-pattern" }], "item:imbued-dwarven-chain-cloak-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-chain-leggings-bristlebane", "Imbued Dwarven Chain Leggings (Bristlebane)", { slots: ["Legs"], ac: 14, stats: {"dex":3,"agi":4}, resists: {"fire":2}, weight: 6.5, size: "Medium", classes: ["Bard","Cleric","Paladin","Rogue","Warrior"], deity: "Bristlebane", magic: true });
addRecipe("recipe:imbued-dwarven-chain-leggings-bristlebane", "Imbued Dwarven Chain Leggings (Bristlebane)", 148, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-rings", quantity: 3 }, { id: "item:imbued-peridot" }, { id: "item:chainmail-pant-pattern" }], "item:imbued-dwarven-chain-leggings-bristlebane", [FORGE]);

addItem("item:imbued-dwarven-plate-boots", "Imbued Dwarven Plate Boots", { slots: ["Feet"], ac: 12, stats: {"wis":4}, resists: {"fire":2}, weight: 7.5, size: "Medium", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-boots", "Imbued Dwarven Plate Boots", 222, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-boot-mold" }], "item:imbued-dwarven-plate-boots", [FORGE]);

addItem("item:imbued-dwarven-plate-bracers", "Imbued Dwarven Plate Bracers", { slots: ["Wrist"], ac: 10, stats: {"wis":2}, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-bracers", "Imbued Dwarven Plate Bracers", 222, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-bracer-mold" }], "item:imbued-dwarven-plate-bracers", [FORGE]);

addItem("item:imbued-dwarven-plate-collar", "Imbued Dwarven Plate Collar", { slots: ["Neck"], ac: 9, stats: {"wis":3}, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-collar", "Imbued Dwarven Plate Collar", 219, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-gorget-mold" }], "item:imbued-dwarven-plate-collar", [FORGE]);

addItem("item:imbued-dwarven-plate-gauntlets", "Imbued Dwarven Plate Gauntlets", { slots: ["Hands"], ac: 12, stats: {"wis":4}, resists: {"fire":4}, weight: 5.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-gauntlets", "Imbued Dwarven Plate Gauntlets", 228, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-gauntlet-mold" }], "item:imbued-dwarven-plate-gauntlets", [FORGE]);

addItem("item:imbued-dwarven-plate-girdle", "Imbued Dwarven Plate Girdle", { slots: ["Waist"], ac: 10, stats: {"wis":3}, resists: {"fire":2}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-girdle", "Imbued Dwarven Plate Girdle", 222, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-belt-mold" }], "item:imbued-dwarven-plate-girdle", [FORGE]);

addItem("item:imbued-dwarven-plate-greaves", "Imbued Dwarven Plate Greaves", { slots: ["Legs"], ac: 16, stats: {"wis":4}, resists: {"fire":4}, weight: 8.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-greaves", "Imbued Dwarven Plate Greaves", 235, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-greaves-mold" }], "item:imbued-dwarven-plate-greaves", [FORGE]);

addItem("item:imbued-dwarven-plate-helm", "Imbued Dwarven Plate Helm", { slots: ["Head"], ac: 14, stats: {"wis":4}, resists: {"fire":4}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-helm", "Imbued Dwarven Plate Helm", 232, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-helm-mold" }], "item:imbued-dwarven-plate-helm", [FORGE]);

addItem("item:imbued-dwarven-plate-pauldron", "Imbued Dwarven Plate Pauldron", { slots: ["Shoulders"], ac: 12, stats: {"wis":3}, resists: {"fire":4}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-pauldron", "Imbued Dwarven Plate Pauldron", 222, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-pauldron-mold" }], "item:imbued-dwarven-plate-pauldron", [FORGE]);

addItem("item:imbued-dwarven-plate-vambraces", "Imbued Dwarven Plate Vambraces", { slots: ["Arms"], ac: 12, stats: {"wis":4}, resists: {"fire":4}, weight: 7, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-vambraces", "Imbued Dwarven Plate Vambraces", 228, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-vambrace-mold" }], "item:imbued-dwarven-plate-vambraces", [FORGE]);

addItem("item:imbued-dwarven-plate-visor", "Imbued Dwarven Plate Visor", { slots: ["Face"], ac: 7, stats: {"wis":2}, resists: {"fire":1}, weight: 2, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-plate-visor", "Imbued Dwarven Plate Visor", 216, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-visor-mold" }], "item:imbued-dwarven-plate-visor", [FORGE]);

addItem("item:imbued-dwarven-splinted-cloak", "Imbued Dwarven Splinted Cloak", { slots: ["Back"], ac: 11, stats: {"wis":4}, resists: {"fire":3}, weight: 4.1, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:imbued-dwarven-splinted-cloak", "Imbued Dwarven Splinted Cloak", 228, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-field-splinted-cloak-mold" }], "item:imbued-dwarven-splinted-cloak", [FORGE]);

addItem("item:dwarven-breastplate-enchanted-imbued", "Dwarven Breastplate (Enchanted Imbued)", { slots: ["Chest"], ac: 30, stats: {"str":8,"sta":10,"wis":4}, resists: {"fire":5}, weight: 11.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-breastplate-enchanted-imbued", "Dwarven Breastplate (Enchanted Imbued)", 255, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-breastplate-mold" }], "item:dwarven-breastplate-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-boots-enchanted-imbued", "Dwarven Plate Boots (Enchanted Imbued)", { slots: ["Feet"], ac: 15, stats: {"str":8,"sta":8,"wis":4}, resists: {"fire":2,"magic":4}, weight: 7.5, size: "Medium", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-boots-enchanted-imbued", "Dwarven Plate Boots (Enchanted Imbued)", 235, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-boot-mold" }], "item:dwarven-plate-boots-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-bracers-enchanted-imbued", "Dwarven Plate Bracers (Enchanted Imbued)", { slots: ["Wrist"], ac: 13, stats: {"str":4,"sta":4,"wis":2}, resists: {"fire":1}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-bracers-enchanted-imbued", "Dwarven Plate Bracers (Enchanted Imbued)", 235, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet" }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-bracer-mold" }], "item:dwarven-plate-bracers-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-gauntlets-enchanted-imbued", "Dwarven Plate Gauntlets (Enchanted Imbued)", { slots: ["Hands"], ac: 15, stats: {"str":4,"sta":4,"wis":4}, resists: {"fire":4,"magic":4}, weight: 5.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-gauntlets-enchanted-imbued", "Dwarven Plate Gauntlets (Enchanted Imbued)", 242, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-gauntlet-mold" }], "item:dwarven-plate-gauntlets-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-girdle-enchanted-imbued", "Dwarven Plate Girdle (Enchanted Imbued)", { slots: ["Waist"], ac: 10, stats: {"str":4,"sta":6,"wis":3}, resists: {"fire":2,"magic":3}, weight: 4.5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-girdle-enchanted-imbued", "Dwarven Plate Girdle (Enchanted Imbued)", 235, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-belt-mold" }], "item:dwarven-plate-girdle-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-greaves-enchanted-imbued", "Dwarven Plate Greaves (Enchanted Imbued)", { slots: ["Legs"], ac: 20, stats: {"str":8,"sta":8,"wis":4}, resists: {"fire":4,"magic":2}, weight: 8.5, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-greaves-enchanted-imbued", "Dwarven Plate Greaves (Enchanted Imbued)", 248, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-greaves-mold" }], "item:dwarven-plate-greaves-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-helm-enchanted-imbued", "Dwarven Plate Helm (Enchanted Imbued)", { slots: ["Head"], ac: 16, stats: {"str":4,"sta":4,"wis":4}, resists: {"fire":4,"magic":5}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-helm-enchanted-imbued", "Dwarven Plate Helm (Enchanted Imbued)", 246, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-helm-mold" }], "item:dwarven-plate-helm-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-pauldron-enchanted-imbued", "Dwarven Plate Pauldron (Enchanted Imbued)", { slots: ["Shoulders"], ac: 12, stats: {"str":4,"sta":4,"wis":3}, resists: {"fire":4,"magic":2}, weight: 5, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-pauldron-enchanted-imbued", "Dwarven Plate Pauldron (Enchanted Imbued)", 235, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-pauldron-mold" }], "item:dwarven-plate-pauldron-enchanted-imbued", [FORGE]);

addItem("item:dwarven-plate-vambraces-enchanted-imbued", "Dwarven Plate Vambraces (Enchanted Imbued)", { slots: ["Arms"], ac: 16, stats: {"str":5,"sta":6,"wis":4}, resists: {"fire":4,"magic":2}, weight: 7, size: "Small", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-plate-vambraces-enchanted-imbued", "Dwarven Plate Vambraces (Enchanted Imbued)", 242, [{ id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:enchanted-brellium-jointing" }, { id: "item:enchanted-folded-brellium-sheet", quantity: 2 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-plate-vambrace-mold" }], "item:dwarven-plate-vambraces-enchanted-imbued", [FORGE]);

addItem("item:dwarven-splinted-cloak-enchanted-imbued", "Dwarven Splinted Cloak (Enchanted Imbued)", { slots: ["Back"], ac: 11, stats: {"str":6,"sta":6,"wis":4}, resists: {"fire":3,"magic":5}, weight: 4.1, size: "Large", classes: ["Cleric","Paladin","Warrior"], deity: "Brell Serilis", magic: true });
addRecipe("recipe:dwarven-splinted-cloak-enchanted-imbued", "Dwarven Splinted Cloak (Enchanted Imbued)", 242, [{ id: "item:brellium-chain-jointing" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:earthen-temper" }, { id: "item:folded-sheet-of-brellium", quantity: 3 }, { id: "item:imbued-ruby" }, { id: "item:leather-padding" }, { id: "item:small-field-splinted-cloak-mold" }], "item:dwarven-splinted-cloak-enchanted-imbued", [FORGE]);

addItem("item:small-kite-shield-mold", "Small Kite Shield Mold", { weight: 0.1, size: "Tiny", source: "Sold by Trista N`Ryt (Neriak Commons), Kif (East Freeport), Krystiana N`Ryt (Neriak Third Gate), a clockwork armorer (Ak'Anon), Tortuk Everhot (North Kaladim)" });

addItem("item:dwarven-smithy-hammer", "Dwarven Smithy Hammer", { weight: 18, size: "Small", source: "Sold by Bloarn Norkhitter (North Kaladim)" });

addItem("item:large-brick-of-brellium", "Large Brick of Brellium", { weight: 18, size: "Small", source: "Sold by Bloarn Norkhitter (North Kaladim)" });
addRecipe("recipe:large-brick-of-brellium", "Large Brick of Brellium", 29, [{ id: "item:dwarven-ale" }, { id: "item:small-brick-of-brellium", quantity: 3 }], "item:large-brick-of-brellium", [FORGE]);

addItem("item:small-brick-of-brellium", "Small Brick of Brellium", { weight: 9, size: "Small", source: "Sold by Bloarn Norkhitter (North Kaladim)" });

addItem("item:imbued-peridot", "Imbued Peridot", { weight: 0.1, size: "Tiny", source: "Created from a Peridot using the Imbue Peridot spell." });

addItem("item:imbued-ruby", "Imbued Ruby", { weight: 0.1, size: "Tiny", source: "Created from a normal Ruby with the Imbue Ruby spell." });

addItem("item:block-of-brellium", "Block of Brellium", { weight: 25.5, size: "Small" });
addRecipe("recipe:block-of-brellium", "Block of Brellium", 29, [{ id: "item:dwarven-ale" }, { id: "item:large-brick-of-brellium", quantity: 3 }], "item:block-of-brellium", [FORGE]);

addItem("item:sheet-of-brellium", "Sheet of Brellium", { weight: 10, size: "Small" });
addRecipe("recipe:sheet-of-brellium", "Sheet of Brellium", 37, [{ id: "item:dwarven-ale" }, { id: "item:small-brick-of-brellium", quantity: 2 }], "item:sheet-of-brellium", [FORGE]);

addItem("item:folded-sheet-of-brellium", "Folded Sheet of Brellium", { weight: 10, size: "Small" });
addRecipe("recipe:folded-sheet-of-brellium", "Folded Sheet of Brellium", 39, [{ id: "item:block-of-brellium" }, { id: "item:dwarven-ale" }, { id: "item:dwarven-smithy-hammer" }], "item:folded-sheet-of-brellium", [FORGE]);

addItem("item:brellium-rings", "Brellium Rings", { weight: 5, size: "Small" });
addRecipe("recipe:brellium-rings", "Brellium Rings", 46, [{ id: "item:dwarven-ale" }, { id: "item:file" }, { id: "item:large-brick-of-brellium" }], "item:brellium-rings", [FORGE]);

addItem("item:brellium-chain-jointing", "Brellium Chain Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:brellium-chain-jointing", "Brellium Chain Jointing", 106, [{ id: "item:brellium-rings" }, { id: "item:dwarven-ale" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:file" }], "item:brellium-chain-jointing", [FORGE]);

addItem("item:enchanted-block-of-brellium", "Enchanted Block of Brellium", { weight: 2.4, size: "Small" });
addRecipe("recipe:enchanted-block-of-brellium", "Enchanted Block of Brellium", 100, [{ id: "item:dwarven-ale" }, { id: "item:enchanted-lrg-brick-of-brellium", quantity: 3 }], "item:enchanted-block-of-brellium", [FORGE]);

addItem("item:enchanted-lrg-brick-of-brellium", "Enchanted Lrg. Brick of Brellium", { weight: 18, size: "Small", source: "Created from a Large Brick of Brellium using the Enchant Brellium spell." });

addItem("item:enchanted-folded-brellium-sheet", "Enchanted Folded Brellium Sheet", { weight: 10, size: "Small" });
addRecipe("recipe:enchanted-folded-brellium-sheet", "Enchanted Folded Brellium Sheet", 63, [{ id: "item:dwarven-ale" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:enchanted-block-of-brellium" }], "item:enchanted-folded-brellium-sheet", [FORGE]);

addItem("item:enchanted-sm-brick-of-brellium", "Enchanted Sm. Brick of Brellium", { weight: 9, size: "Small" });
addRecipe("recipe:enchanted-sm-brick-of-brellium", "Enchanted Sm. Brick of Brellium", 21, [{ id: "item:dwarven-ale" }, { id: "item:enchanted-lrg-brick-of-brellium" }], "item:enchanted-sm-brick-of-brellium", [FORGE]);

addItem("item:enchanted-sheet-of-brellium", "Enchanted Sheet of Brellium", { weight: 10, size: "Small" });
addRecipe("recipe:enchanted-sheet-of-brellium", "Enchanted Sheet of Brellium", 110, [{ id: "item:dwarven-ale" }, { id: "item:enchanted-sm-brick-of-brellium", quantity: 2 }], "item:enchanted-sheet-of-brellium", [FORGE]);

addItem("item:enchanted-brellium-rings", "Enchanted Brellium Rings", { weight: 5, size: "Small" });
addRecipe("recipe:enchanted-brellium-rings", "Enchanted Brellium Rings", 104, [{ id: "item:dwarven-ale" }, { id: "item:enchanted-lrg-brick-of-brellium" }, { id: "item:file" }], "item:enchanted-brellium-rings", [FORGE]);

addItem("item:enchanted-brellium-jointing", "Enchanted Brellium Jointing", { weight: 4, size: "Small" });
addRecipe("recipe:enchanted-brellium-jointing", "Enchanted Brellium Jointing", 146, [{ id: "item:dwarven-ale" }, { id: "item:dwarven-smithy-hammer" }, { id: "item:enchanted-brellium-rings" }, { id: "item:file" }], "item:enchanted-brellium-jointing", [FORGE]);

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
