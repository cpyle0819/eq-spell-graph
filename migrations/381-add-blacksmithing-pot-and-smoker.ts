/**
 * Migration 381: Blacksmithing's own Pot and Smoker recipes (issue #48
 * follow-up). Both nodes already existed as `container`s from Baking
 * (crafted_in targets only); this is the first recipe to `produces` a
 * container rather than an item -- see decisions/tradeskill-recipe-node-
 * schema.md's new section for why that's a natural extension, not a schema
 * change. Both are also craftable via Pottery on the same eqlwiki pages
 * (different ingredients/trivials); not modeled since Pottery isn't in this
 * graph yet.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, "container:forge", "crafted_in");
}

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const zoneId = `zone:${slug(zoneLabel)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(zoneLabel)}:${slug(vendorLabel)}`;
  if (!hasNode(vendorId)) {
    addNode({ id: vendorId, label: vendorLabel, type: "npc", roles: ["vendor"] });
    addEdge(vendorId, zoneId, "located_in");
    vendorsAdded++;
  }
  for (const itemId of sells) {
    addEdge(vendorId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

addItem("item:pot-mold", "Pot Mold");
addItem("item:standing-legs-mold", "Standing Legs Mold");
addItem("item:smoker-base-mold", "Smoker Base Mold");
addItem("item:smoker-support-mold", "Smoker Support Mold");

addRecipe("recipe:pot", "Pot", 122,
  [{ id: "item:metal-bits" }, { id: "item:pot-mold" }, { id: "item:standing-legs-mold" }, { id: "item:water-flask" }], "container:pot");
addRecipe("recipe:smoker", "Smoker", 50,
  [{ id: "item:metal-bits" }, { id: "item:skewers" }, { id: "item:smoker-base-mold" }, { id: "item:smoker-support-mold" }, { id: "item:water-flask" }], "container:smoker");

addVendor("Nalda Griststone", "Butcherblock Mountains", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Klok Gritchit", "East Cabilis", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Roghur Muleson", "East Freeport", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Tislan", "East Freeport", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Merchant Uaylain", "Greater Faydark", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Garklog", "Grobb", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Jil McDaniel", "Halas", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Mira Sayer", "Qeynos Hills", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Frannie", "Surefall Glade", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Yola Sweetcookie", "Rivervale", ["item:pot-mold", "item:standing-legs-mold"]);
addVendor("Barkeep Droz", "Skyshrine", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Oren Furdenbline", "Steamfont Mountains", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
addVendor("Wevil Doughbeard", "Thurgadin", ["item:pot-mold", "item:standing-legs-mold", "item:smoker-base-mold", "item:smoker-support-mold"]);
// Rivervale's Betty Brickbaker (Smoker Support Mold) and Yola Sweetcookie (Smoker Base Mold) rows
// are both marked "No longer spawns" on their respective item pages -- skipped.

save();
console.log(`Migration 381 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Pot and Smoker`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
