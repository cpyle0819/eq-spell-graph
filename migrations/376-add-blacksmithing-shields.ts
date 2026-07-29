/**
 * Migration 376: Blacksmithing's Shields (issue #48 follow-up) -- Buckler
 * and Round Shield only, both craftable from Sheet Metal (already
 * modeled). Targ/Kite/Tower Shield need a Folded Sheet Metal or Medium
 * Quality ore-tier chain this graph doesn't have yet -- deferred alongside
 * the rest of that tier (Enchanted Components, the Velium/Silvered weapon
 * catalogs).
 *
 * Trivial values: neither Buckler's nor Round Shield's own eqlwiki page
 * states a Blacksmithing trivial, so the Shields recipe table's own number
 * is used as-is (no conflict to resolve, unlike migration 375's items).
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API, not a
 * summarizer. Smithy Hammer is returned on success or failure per the
 * Shields table's own preamble, but is still modeled as a plain `uses`
 * edge -- same "returned tool still gets a normal uses edge" precedent
 * Baking's Pie Tin/Cake Round already established for their own molds.
 * Felwithe's own vendor row on Buckler/Round Shield Mold's pages is
 * skipped: this graph only has "Northern Felwithe" catalogued, and bare
 * "Felwithe" is ambiguous between that and a southern half, same
 * "ambiguous zone name, don't guess" precedent as unqualified
 * Commonlands/Kaladim rows in earlier migrations.
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

addItem("item:smithy-hammer", "Smithy Hammer", { weight: 18.0, size: "Small" });
addItem("item:buckler-mold", "Buckler Mold");
addItem("item:buckler", "Buckler", { ac: 5, weight: 3.0, size: "Small", slots: ["Secondary"], source: "Crafted via Blacksmithing (trivial 82); the smithed version is a distinct 5 AC item from the drop/vendor Buckler" });
addItem("item:round-shield-mold", "Round Shield Mold");
addItem("item:round-shield", "Round Shield", { ac: 6, weight: 5.0, size: "Medium", slots: ["Secondary"], source: "Crafted via Blacksmithing (trivial 115)" });

addRecipe("recipe:buckler", "Buckler", 82,
  [{ id: "item:sheet-metal" }, { id: "item:buckler-mold" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }], "item:buckler");
addRecipe("recipe:round-shield", "Round Shield", 115,
  [{ id: "item:sheet-metal", quantity: 2 }, { id: "item:round-shield-mold" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }], "item:round-shield");

addVendor("Smithy Zern", "East Cabilis", ["item:buckler-mold", "item:round-shield-mold"]);
addVendor("Kif", "East Freeport", ["item:buckler-mold", "item:round-shield-mold"]);
addVendor("Ton Firepride", "South Qeynos", ["item:buckler-mold", "item:round-shield-mold"]);
// Felwithe/Merchant Tearlan skipped -- see header note.

addVendor("a clockwork miner", "Ak'Anon", ["item:smithy-hammer"]);
addVendor("Klok Toren", "East Cabilis", ["item:smithy-hammer"]);
addVendor("Shinan Orefinder", "Erudin", ["item:smithy-hammer"]);
addVendor("Kyrin Steelbone", "North Freeport", ["item:smithy-hammer"]);
addVendor("Trudie Steelbone", "North Freeport", ["item:smithy-hammer"]);
addVendor("Okun", "Grobb", ["item:smithy-hammer"]);
addVendor("Greta O`Reilly", "Halas", ["item:smithy-hammer"]);
addVendor("Miner Harton", "High Keep", ["item:smithy-hammer"]);
addVendor("Bloarn Norkhitter", "North Kaladim", ["item:smithy-hammer"]);
addVendor("Harnoff Splitrock", "North Kaladim", ["item:smithy-hammer"]);
addVendor("Glazn D`Unnar", "Neriak Commons", ["item:smithy-hammer"]);
addVendor("Bubbgrib", "Oggok", ["item:smithy-hammer"]);
addVendor("Blergerda", "Oggok", ["item:smithy-hammer"]);
addVendor("Liln Sedder", "South Qeynos", ["item:smithy-hammer"]);
addVendor("Ukla", "Rathe Mountains", ["item:smithy-hammer"]);
addVendor("Godbin Strumharp", "Steamfont Mountains", ["item:smithy-hammer"]);
addVendor("Kevar Claypaws", "Stonebrunt Mountains", ["item:smithy-hammer"]);
addVendor("Nimren Stonecutter", "Thurgadin", ["item:smithy-hammer"]);
// Rivervale's Bodbin Gimple (Smithy Hammer) skipped -- eqlwiki's own page
// notes "2025 Green no longer spawns."

save();
console.log(`Migration 376 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Shields`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
