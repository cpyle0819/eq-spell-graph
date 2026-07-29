/**
 * Migration 373: models Blacksmithing as a tradeskill (issue #48), via the
 * same `recipe`/`uses`/`produces`/`crafted_in` shapes Brewing/Baking
 * established (decisions/tradeskill-recipe-node-schema.md).
 *
 * First pass covers only eqlwiki.com's own `Skill Blacksmithing` page
 * "Blacksmithing Leveling Guide" section -- the "Getting Started (Up to 68)"
 * ore/metal chain (Metal Bits, Small Brick of Ore, Sheet Metal, File, Large
 * Lantern) and the "Banded Armor (Up to 115)" 12-piece set -- 17 recipes,
 * all flagged `levelingGuide`. The page's own much larger "Basic"/"Advanced
 * Blacksmithing Recipe List" sections (Tools and Implements, the full
 * Tarnished/Forged/Velium/Silvered weapon catalogs, Shields) are real recipe
 * data but not part of the wiki's own leveling guide -- left for a follow-up
 * migration, same "leveling path first, full recipe book later" split
 * Brewing (355 then 358) and Baking (365 then 367) both used. Ornate Chain
 * Armor and Fine Plate Armor are explicitly out of scope entirely: the
 * wiki's own page states outright that content past 175 skill "is based on
 * data that is not relevant to EQL."
 *
 * No vendor data in this pass -- every ingredient here (Small Piece of Ore,
 * the various armor molds) needs its own wiki page checked for a `soldby`
 * table, which is follow-up work alongside the remaining recipe catalog.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (`action=query&prop=revisions`), not a summarizer -- exact ingredient/
 * trivial/yield data. Water Flask and Bottle already exist from Brewing;
 * reused as-is.
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

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, produceQty?: number) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial, levelingGuide: true });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
  addEdge(id, "container:forge", "crafted_in");
}

// ---------------------------------------------------------------------
// Forge -- Blacksmithing's own stationary crafting station, matching Brew
// Barrel/Oven's "pure world fixture" shape (decisions/
// tradeskill-recipe-node-schema.md): eqlwiki's own page says a forge is
// where every combine happens, no soldby table, not carried in inventory.
// ---------------------------------------------------------------------
addItem("container:forge", "Forge", { type: "container" });

// ---------------------------------------------------------------------
// Base ore chain (raw ingredients + molds -- vendor/loot source unverified
// in this pass, per this migration's own header note).
// ---------------------------------------------------------------------
addItem("item:small-piece-of-ore", "Small Piece of Ore");
addItem("item:small-brick-of-ore", "Small Brick of Ore", { source: "Crafted via Blacksmithing (trivial 27) from 3x Small Piece of Ore" });
addItem("item:sheet-metal", "Sheet Metal", { source: "Crafted via Blacksmithing (trivial 56) from 2x Small Brick of Ore" });
addItem("item:file-mold", "File Mold");
addItem("item:file", "File", { source: "Crafted via Blacksmithing (trivial 21) from a File Mold" });
addItem("item:lantern-casing-mold", "Lantern Casing Mold");
addItem("item:large-lantern", "Large Lantern", { source: "Crafted via Blacksmithing (trivial 68) from a Lantern Casing Mold and a Bottle" });

addRecipe("recipe:metal-bits", "Metal Bits", 21,
  [{ id: "item:small-piece-of-ore", quantity: 2 }, { id: "item:water-flask" }], "item:metal-bits", 2);
addRecipe("recipe:small-brick-of-ore", "Small Brick of Ore", 27,
  [{ id: "item:small-piece-of-ore", quantity: 3 }, { id: "item:water-flask" }], "item:small-brick-of-ore");
addRecipe("recipe:sheet-metal", "Sheet Metal", 56,
  [{ id: "item:small-brick-of-ore", quantity: 2 }, { id: "item:water-flask" }], "item:sheet-metal");
// Tools and Implements' own table preamble: "All recipes require a Water
// Flask and a Metal Bits, except where noted" -- File and Large Lantern
// carry that implicit pair alongside their own listed component(s).
addRecipe("recipe:file", "File", 21,
  [{ id: "item:file-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:file");
addRecipe("recipe:large-lantern", "Large Lantern", 68,
  [{ id: "item:lantern-casing-mold" }, { id: "item:bottle" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:large-lantern");

// ---------------------------------------------------------------------
// Banded Armor -- 12-piece set, all sourced from the same table (Sheet
// Metal count + mold + AC + weight columns), all requiring a Water Flask
// per the table's own preamble. No `slots`/`classes` -- neither is stated
// on this recipe-list page, and this migration doesn't fabricate them.
// ---------------------------------------------------------------------
addItem("item:mask-mold", "Mask Mold");
addItem("item:banded-mask", "Banded Mask", { ac: 4, weight: 1.0, source: "Crafted via Blacksmithing (trivial 135)" });
addItem("item:gorget-mold", "Gorget Mold");
addItem("item:banded-gorget", "Banded Gorget", { ac: 5, weight: 2.0, source: "Crafted via Blacksmithing (trivial 102)" });
addItem("item:bracer-sectional-mold", "Bracer Sectional Mold");
addItem("item:banded-bracer", "Banded Bracer", { ac: 6, weight: 2.0, source: "Crafted via Blacksmithing (trivial 102)" });
addItem("item:boot-mold", "Boot Mold");
addItem("item:banded-boots", "Banded Boots", { ac: 6, weight: 5.0, source: "Crafted via Blacksmithing (trivial 135)" });
addItem("item:belt-sectional-mold", "Belt Sectional Mold");
addItem("item:banded-belt", "Banded Belt", { ac: 6, weight: 2.5, source: "Crafted via Blacksmithing (trivial 135)" });
addItem("item:mantle-sectional-mold", "Mantle Sectional Mold");
addItem("item:banded-mantle", "Banded Mantle", { ac: 6, weight: 3.5, source: "Crafted via Blacksmithing (trivial 168)" });
addItem("item:cloak-sectional-mold", "Cloak Sectional Mold");
addItem("item:banded-cloak", "Banded Cloak", { ac: 7, weight: 4.0, source: "Crafted via Blacksmithing (trivial 175)" });
addItem("item:gauntlet-mold", "Gauntlet Mold");
addItem("item:banded-gauntlets", "Banded Gauntlets", { ac: 7, weight: 4.0, source: "Crafted via Blacksmithing (trivial 168)" });
addItem("item:sleeves-sectional-mold", "Sleeves Sectional Mold");
addItem("item:banded-sleeves", "Banded Sleeves", { ac: 7, weight: 3.5, source: "Crafted via Blacksmithing (trivial 102)" });
addItem("item:helm-mold", "Helm Mold");
addItem("item:banded-helm", "Banded Helm", { ac: 8, weight: 4.5, source: "Crafted via Blacksmithing (trivial 135)" });
addItem("item:leggings-sectional-mold", "Leggings Sectional Mold");
addItem("item:banded-leggings", "Banded Leggings", { ac: 8, weight: 5.5, source: "Crafted via Blacksmithing (trivial 168)" });
addItem("item:mail-sectional-mold", "Mail Sectional Mold");
addItem("item:banded-mail", "Banded Mail", { ac: 15, weight: 7.5, source: "Crafted via Blacksmithing (trivial 135)" });

addRecipe("recipe:banded-mask", "Banded Mask", 135,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:mask-mold" }, { id: "item:water-flask" }], "item:banded-mask");
addRecipe("recipe:banded-gorget", "Banded Gorget", 102,
  [{ id: "item:sheet-metal" }, { id: "item:gorget-mold" }, { id: "item:water-flask" }], "item:banded-gorget");
addRecipe("recipe:banded-bracer", "Banded Bracer", 102,
  [{ id: "item:sheet-metal" }, { id: "item:bracer-sectional-mold" }, { id: "item:water-flask" }], "item:banded-bracer");
addRecipe("recipe:banded-boots", "Banded Boots", 135,
  [{ id: "item:sheet-metal" }, { id: "item:boot-mold" }, { id: "item:water-flask" }], "item:banded-boots");
addRecipe("recipe:banded-belt", "Banded Belt", 135,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:belt-sectional-mold" }, { id: "item:water-flask" }], "item:banded-belt");
addRecipe("recipe:banded-mantle", "Banded Mantle", 168,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:mantle-sectional-mold" }, { id: "item:water-flask" }], "item:banded-mantle");
addRecipe("recipe:banded-cloak", "Banded Cloak", 175,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:cloak-sectional-mold" }, { id: "item:water-flask" }], "item:banded-cloak");
addRecipe("recipe:banded-gauntlets", "Banded Gauntlets", 168,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:gauntlet-mold" }, { id: "item:water-flask" }], "item:banded-gauntlets");
addRecipe("recipe:banded-sleeves", "Banded Sleeves", 102,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:sleeves-sectional-mold" }, { id: "item:water-flask" }], "item:banded-sleeves");
addRecipe("recipe:banded-helm", "Banded Helm", 135,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:helm-mold" }, { id: "item:water-flask" }], "item:banded-helm");
addRecipe("recipe:banded-leggings", "Banded Leggings", 168,
  [{ id: "item:sheet-metal", quantity: 3 }, { id: "item:leggings-sectional-mold" }, { id: "item:water-flask" }], "item:banded-leggings");
addRecipe("recipe:banded-mail", "Banded Mail", 135,
  [{ id: "item:sheet-metal", quantity: 3 }, { id: "item:mail-sectional-mold" }, { id: "item:water-flask" }], "item:banded-mail");

save();
console.log(`Migration 373 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Blacksmithing`);
