/**
 * Migration 409: models Pottery as a tradeskill (issue #51), the same
 * `recipe`/`uses`/`produces`/`crafted_in` shapes Brewing/Baking/Blacksmithing
 * established (decisions/tradeskill-recipe-node-schema.md). This first pass
 * covers the two new stationary crafting stations and the base clay
 * conversion chain; migration 410 covers the full "Basic" recipe list.
 *
 * Pottery is unlike every tradeskill modeled so far: it's a genuine
 * two-stage combine. eqlwiki's own Basics section: "Pottery is produced in
 * two stages. In the first stage you combine the appropriate sketch and a
 * flask of water with clay and other materials on a pottery wheel. You then
 * take the unfired result and combine it with firing sheets in the kiln to
 * make a finished product." This needs no schema change -- it's just two
 * chained `recipe` nodes (Wheel produces an "Unfired X" item, Kiln consumes
 * it), the same chained-recipe shape Blacksmithing's own ore chain (Small
 * Piece of Ore -> Small Brick of Ore -> Sheet Metal) already uses. Two new
 * `container` nodes: Pottery Wheel and Kiln, both pure world fixtures
 * matching Brew Barrel/Oven/Forge's shape (no soldby table, not carried in
 * inventory, per eqlwiki's own "Tradeskill Containers" category and the
 * Pottery page's own "Where to Potter Around" section).
 *
 * Clay conversion chain: Small Block of Clay <-> Block of Clay <-> Large
 * Block of Clay <-> Clay/water mixture are all real, vendor-sold items that
 * can *also* be converted into each other via Pottery Wheel -- modeled as
 * recipes for completeness even though buying the size you need directly is
 * the common path. Block of Clay has two independently craftable combos for
 * the same output (3x Small Block of Clay, or 1x Large Block of Clay) --
 * modeled as a `variant_of` family per decisions/tradeskill-recipe-node-
 * schema.md's "Recipe variants" section, anchored on the combo confirmed on
 * Block of Clay's own item page.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title queries against both the `Skill Pottery` page and each
 * ingredient's own item page), not a summarizer. Vendor tables are each
 * item's own eqlwiki `soldby` table in full -- no capped/representative
 * subset, per issue #51. Two vendor zones (Felwithe, Highpass Keep) aren't
 * catalogued in this graph yet and are skipped, same "zone not catalogued"
 * precedent migration 381 used.
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

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: string,
  station: "container:pottery-wheel" | "container:kiln",
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Pottery", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, station, "crafted_in");
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

// ---------------------------------------------------------------------
// Pottery Wheel / Kiln -- pure world fixtures, same shape as Brew Barrel/
// Oven/Forge.
// ---------------------------------------------------------------------
addItem("container:pottery-wheel", "Pottery Wheel", { type: "container" });
addItem("container:kiln", "Kiln", { type: "container" });

// ---------------------------------------------------------------------
// Clay conversion chain -- all four are also directly vendor-sold (below);
// these recipes exist for completeness, not because they're the common path.
// ---------------------------------------------------------------------
addItem("item:small-block-of-clay", "Small Block of Clay", { weight: 0.5, size: "Tiny" });
addItem("item:block-of-clay", "Block of Clay", { weight: 1.0, size: "Tiny" });
addItem("item:large-block-of-clay", "Large Block of Clay", { weight: 1.5, size: "Tiny" });
addItem("item:clay-water-mixture", "Clay/water mixture", { weight: 1.1, size: "Small" });

addRecipe("recipe:clay-water-mixture", "Clay/water mixture", 26,
  [{ id: "item:small-block-of-clay" }, { id: "item:water-flask" }], "item:clay-water-mixture", "container:pottery-wheel");

addRecipe("recipe:small-block-of-clay", "Small Block of Clay", 21,
  [{ id: "item:block-of-clay" }, { id: "item:water-flask" }], "item:small-block-of-clay", "container:pottery-wheel");

addRecipe("recipe:block-of-clay", "Block of Clay", 21,
  [{ id: "item:small-block-of-clay", quantity: 3 }, { id: "item:water-flask" }], "item:block-of-clay", "container:pottery-wheel");
addRecipe("recipe:block-of-clay-from-large", "Block of Clay", 21,
  [{ id: "item:large-block-of-clay" }, { id: "item:water-flask" }], "item:block-of-clay", "container:pottery-wheel");
addEdge("recipe:block-of-clay-from-large", "recipe:block-of-clay", "variant_of");

addRecipe("recipe:large-block-of-clay", "Large Block of Clay", 21,
  [{ id: "item:block-of-clay", quantity: 3 }, { id: "item:water-flask" }], "item:large-block-of-clay", "container:pottery-wheel");

// ---------------------------------------------------------------------
// Vendors -- Small/Block/Large Block of Clay, Glass Shard, and all three
// Firing Sheet grades. Clay/water mixture has no soldby table on its own
// eqlwiki page (not vendor-sold).
// ---------------------------------------------------------------------
addItem("item:glass-shard", "Glass Shard", { weight: 0.1, size: "Tiny" });
addItem("item:firing-sheet", "Firing Sheet", { weight: 0.1, size: "Tiny" });
addItem("item:quality-firing-sheet", "Quality Firing Sheet", { weight: 0.1, size: "Tiny" });
addItem("item:high-quality-firing-sheet", "High Quality Firing Sheet", { weight: 0.1, size: "Tiny" });

const CLAY_VENDORS: [string, string][] = [
  ["a clockwork miner", "Ak'Anon"], ["a clockwork potter", "Ak'Anon"],
  ["Izbal Brightblaze", "Butcherblock Mountains"],
  ["Klok Toren", "East Cabilis"], ["Klok Hoga", "East Cabilis"],
  ["Merra Clayfinger", "East Commonlands"],
  ["Shinan Orefinder", "Erudin"],
  ["Kyrin Steelbone", "North Freeport"],
  ["Gurb Smithson", "West Freeport"],
  ["Merchant Legweien", "Greater Faydark"],
  ["Okun", "Grobb"],
  ["Greta O`Reilly", "Halas"], ["Merin", "Halas"],
  ["Miner Harton", "High Keep"],
  ["Winn Greenbane", "Highpass Hold"],
  ["Dooni", "South Kaladim"],
  ["Topper Drodo", "Misty Thicket"],
  ["ChonChon", "Neriak Foreign Quarter"],
  ["Glazn D`Unnar", "Neriak Commons"],
  ["Helgara Dirtcarver", "Oggok"], ["Blergerda", "Oggok"],
  ["Tin Merchant VI", "The Overthere"],
  ["Tentus Brackmar", "Paineel"], ["Evus Doracmal", "Paineel"], ["Taria Clayspinner", "Paineel"],
  ["Tarnar", "Western Karana"],
  ["Bodbin Gimple", "Rivervale"],
  ["Merchant Ulyssa", "Southern Desert of Ro"],
  ["Godbin Strumharp", "Steamfont Mountains"],
  ["Kevar Claypaws", "Stonebrunt Mountains"], ["Jaimiou Claypaws", "Stonebrunt Mountains"],
  ["Nimren Stonecutter", "Thurgadin"], ["Gilthan Brittleblade", "Thurgadin"],
];
for (const [vendor, zone] of CLAY_VENDORS) {
  addVendor(vendor, zone, ["item:small-block-of-clay", "item:block-of-clay", "item:large-block-of-clay"]);
}

const FIRING_KILN_SUPPLY_VENDORS: [string, string][] = [
  ["a clockwork potter", "Ak'Anon"],
  ["Izbal Brightblaze", "Butcherblock Mountains"],
  ["Klok Hoga", "East Cabilis"],
  ["Merra Clayfinger", "East Commonlands"],
  ["Gurb Smithson", "West Freeport"],
  ["Merchant Legweien", "Greater Faydark"],
  ["Merin", "Halas"],
  ["Winn Greenbane", "Highpass Hold"],
  ["Dooni", "South Kaladim"],
  ["Topper Drodo", "Misty Thicket"],
  ["ChonChon", "Neriak Foreign Quarter"],
  ["Helgara Dirtcarver", "Oggok"],
  ["Tin Merchant VI", "The Overthere"],
  ["Evus Doracmal", "Paineel"], ["Taria Clayspinner", "Paineel"],
  ["Tarnar", "Western Karana"],
  ["Merchant Ulyssa", "Southern Desert of Ro"],
  ["Jaimiou Claypaws", "Stonebrunt Mountains"],
  ["Gilthan Brittleblade", "Thurgadin"],
];
for (const [vendor, zone] of FIRING_KILN_SUPPLY_VENDORS) {
  addVendor(vendor, zone, ["item:glass-shard", "item:firing-sheet", "item:quality-firing-sheet", "item:high-quality-firing-sheet"]);
}
// High Quality Firing Sheet has one extra vendor beyond the shared set above.
addVendor("Tin Merchant V", "The Overthere", ["item:high-quality-firing-sheet"]);

save();
console.log(`Migration 409 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Pottery's containers and clay conversion chain`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
