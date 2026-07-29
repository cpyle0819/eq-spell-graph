/**
 * Migration 380: Blacksmithing's Velium weapon tier (issue #48 follow-up,
 * Velious era). All ten weapons require just a Sheet of Velium, a Coldain
 * Velium Temper, and the same blade/head molds the Forged (migration 378)
 * and Tools (migration 375) catalogs already added -- no new molds needed.
 *
 * Small Brick of Velium is a pure loot drop (Crystal Caverns, Icewell Keep,
 * Skyshrine, Tower of Frozen Shadow, Velketor's Labyrinth mobs per its own
 * eqlwiki page -- none of those zones are catalogued in this graph yet, so
 * no location edges are added, just a source note); its own page shows no
 * "playercrafted" section, i.e. it is not itself a combine output, despite
 * the Blacksmithing overview page's "Other Basics" table implying a
 * Large-Brick-of-Velium conversion recipe exists -- the item's own page is
 * more authoritative per this graph's established precedent, so that
 * conversion isn't modeled. Large Brick of Velium is likewise a pure drop
 * (same mob list, same absent playercrafted section) and isn't needed by
 * anything in this tier anyway (only Sheet of Velium, which uses the Small
 * variant, is needed for weapons).
 *
 * Coldain Velium Temper is vendor-only (Thurgadin), not player-crafted.
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

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, produceQty?: number) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
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

addItem("item:small-brick-of-velium", "Small Brick of Velium", {
  weight: 7.0,
  size: "Small",
  source: "Loot drop only (Crystal Caverns, Icewell Keep, Skyshrine, Tower of Frozen Shadow, Velketor's Labyrinth -- none catalogued in this graph yet); not player-crafted per its own eqlwiki page",
});
addItem("item:coldain-velium-temper", "Coldain Velium Temper", { weight: 0.1, size: "Tiny" });
addItem("item:sheet-of-velium", "Sheet of Velium", { weight: 15.0, size: "Small" });

addRecipe("recipe:sheet-of-velium", "Sheet of Velium", 31,
  [{ id: "item:small-brick-of-velium", quantity: 2 }, { id: "item:coldain-velium-temper" }], "item:sheet-of-velium");

addVendor("Nimren Stonecutter", "Thurgadin", ["item:coldain-velium-temper"]);

const velium: Array<[string, string, number, Ingredient[]]> = [
  ["forged-velium-2-handed-sword", "Forged Velium 2-Handed Sword", 122, [{ id: "item:heavy-steel-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }]],
  ["forged-velium-dagger", "Forged Velium Dagger", 95, [{ id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }]],
  ["forged-velium-long-sword", "Forged Velium Long Sword", 115, [{ id: "item:long-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }]],
  ["forged-velium-morning-star", "Forged Velium Morning Star", 119, [{ id: "item:spiked-ball-mold" }, { id: "item:hilt-mold" }]],
  ["forged-velium-scimitar", "Forged Velium Scimitar", 115, [{ id: "item:curved-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }]],
  ["forged-velium-short-sword", "Forged Velium Short Sword", 108, [{ id: "item:short-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }]],
];
const veliumYielding: Array<[string, string, number, Ingredient[], number]> = [
  ["forged-velium-shuriken", "Forged Velium Shuriken", 104, [{ id: "item:shuriken-mold" }], 20],
  ["forged-velium-throwing-axe", "Forged Velium Throwing Axe", 102, [{ id: "item:throwing-axe-mold" }], 15],
  ["forged-velium-throwing-knife", "Forged Velium Throwing Knife", 98, [{ id: "item:throwing-knife-mold" }], 20],
  ["forged-velium-throwing-spear", "Forged Velium Throwing Spear", 106, [{ id: "item:javelin-mold" }], 15],
];

for (const [id, label, trivial, molds] of velium) {
  addItem(`item:${id}`, label, { source: `Crafted via Blacksmithing (trivial ${trivial})` });
  addRecipe(`recipe:${id}`, label, trivial,
    [{ id: "item:sheet-of-velium" }, { id: "item:coldain-velium-temper" }, ...molds], `item:${id}`);
}
for (const [id, label, trivial, molds, yield_] of veliumYielding) {
  addItem(`item:${id}`, label, { source: `Crafted via Blacksmithing (trivial ${trivial}, yield ${yield_})` });
  addRecipe(`recipe:${id}`, label, trivial,
    [{ id: "item:sheet-of-velium" }, { id: "item:coldain-velium-temper" }, ...molds], `item:${id}`, yield_);
}

save();
console.log(`Migration 380 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Velium weapon tier`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
