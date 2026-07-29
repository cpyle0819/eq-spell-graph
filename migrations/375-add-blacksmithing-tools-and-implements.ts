/**
 * Migration 375: Blacksmithing's "Tools and Implements" recipes (issue #48
 * follow-up to 373/374's leveling-path pass) -- Small/Medium/Large Metal
 * Container, Skinning Knife, Scaler, Toolbox, Small Sewing Kit, and four
 * items Baking's own migrations already created as plain cross-tradeskill
 * ingredients (Muffin Tin, Pie Tin, Cake Round, Bread Tin -- their own
 * `item` nodes are reused as-is; this migration only adds the recipe that
 * actually produces them). Includes every vendor eqlwiki.com lists for
 * each new ingredient, same as 374.
 *
 * Trivial values: where an item's own eqlwiki page states a number
 * (Muffin/Pie/Bread Tin, Cake Round, the three Metal Containers, Toolbox,
 * Small Sewing Kit), that page wins over the general Skill Blacksmithing
 * recipe-list table when the two disagree -- same "re-check each produced
 * item's own page" precedent migration 357 (Brewing) and 365 (Baking) used.
 * Skinning Knife, Scaler, and Skewers had no conflicting number to resolve
 * (both of the recipe-list table's own p99/Classic columns agreed, or no
 * item-page trivial existed at all), so the table's p99 column is used
 * as-is.
 *
 * Not covered by this migration -- explicitly deferred:
 * - Pot and Smoker's own recipes: both already exist as `container`-type
 *   nodes (Baking's own migrations), and no recipe in this graph has ever
 *   produced a container node before -- needs its own schema check before
 *   modeling, not assumed here.
 * - Shaped Cookie Cutters: the recipe list's own "Shaped Mold" component
 *   isn't wiki-linked (every other component name is), suggesting the
 *   wiki's own author wasn't sure of the real item -- skipped rather than
 *   guessed at.
 * - Lockpicks: the recipe list's own Classic Trivial column reads
 *   "existed?" -- an open question on the wiki's own page, not a number.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API, batched
 * multi-title queries, not a summarizer.
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

// Same alias map migrations 365/370/374 used, plus Neriak Third Gate/
// Neriak 3rd Gate (decisions/tradeskill-recipe-node-schema.md's own note).
const ZONE_ALIASES: Record<string, string> = {
  "Western Plains of Karana": "Western Karana",
  "Neriak Third Gate": "Neriak 3rd Gate",
};

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const resolvedZone = ZONE_ALIASES[zoneLabel] ?? zoneLabel;
  const zoneId = `zone:${slug(resolvedZone)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(resolvedZone)}:${slug(vendorLabel)}`;
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
// New mold/tool items.
// ---------------------------------------------------------------------
addItem("item:hinge-mold", "Hinge Mold");
addItem("item:small-container-base-mold", "Small Container Base Mold");
addItem("item:small-container-lid-mold", "Small Container Lid Mold");
addItem("item:container-base-mold", "Container Base Mold");
addItem("item:container-lid-mold", "Container Lid Mold");
addItem("item:large-container-base-mold", "Large Container Base Mold");
addItem("item:large-container-lid-mold", "Large Container Lid Mold");
addItem("item:small-metal-container", "Small Metal Container", { weight: 0.5, size: "Small", capacity: 4, containerSize: "Tiny", source: "Crafted via Blacksmithing (trivial 31)" });
addItem("item:medium-metal-container", "Medium Metal Container", { weight: 0.8, size: "Small", capacity: 6, containerSize: "Small", source: "Crafted via Blacksmithing (trivial 40)" });
addItem("item:large-metal-container", "Large Metal Container", { weight: 1.2, size: "Medium", capacity: 8, containerSize: "Medium", source: "Crafted via Blacksmithing (trivial 46)" });

addItem("item:dagger-blade-mold", "Dagger Blade Mold");
addItem("item:hilt-mold", "Hilt Mold");
addItem("item:skinning-knife", "Skinning Knife", { source: "Tool; crafted via Blacksmithing (trivial 41); downgrades a pelt's quality by one step (e.g. Medium Quality to Low Quality)" });

addItem("item:scaler-mold", "Scaler Mold");
addItem("item:scaler", "Scaler", { source: "Tool; crafted via Blacksmithing (trivial 39)" });

addItem("item:toolbox-mold", "Toolbox Mold");
addItem("item:toolbox", "Toolbox", { source: "Crafted via Blacksmithing (trivial 52)" });

addItem("item:ceramic-lining", "Ceramic Lining", { source: "Crafted via Pottery (trivial 17) from a Quality Firing Sheet and an Unfired Ceramic Lining in a Kiln" });
addItem("item:muffin-tin-mold", "Muffin Tin Mold");
addItem("item:pie-tin-mold", "Pie Tin Mold");
addItem("item:cake-round-mold", "Cake Round Mold");
addItem("item:bread-tin-mold", "Bread Tin Mold");

addItem("item:skewer-mold", "Skewer Mold");

addItem("item:needle-mold", "Needle Mold");
addItem("item:thimble-mold", "Thimble Mold");
addItem("item:small-sewing-kit", "Small Sewing Kit", { source: "Tool; crafted via Blacksmithing (trivial 135)" });

// ---------------------------------------------------------------------
// Recipes. Tools and Implements' own table preamble: "All recipes require
// a Water Flask and a Metal Bits, except where noted" -- Skinning Knife is
// the one noted exception ("no Metal Bits", but still needs Water Flask).
// ---------------------------------------------------------------------
addRecipe("recipe:small-metal-container", "Small Metal Container", 31,
  [{ id: "item:hinge-mold" }, { id: "item:small-container-base-mold" }, { id: "item:small-container-lid-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:small-metal-container");
addRecipe("recipe:medium-metal-container", "Medium Metal Container", 40,
  [{ id: "item:hinge-mold" }, { id: "item:container-base-mold" }, { id: "item:container-lid-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:medium-metal-container");
addRecipe("recipe:large-metal-container", "Large Metal Container", 46,
  [{ id: "item:hinge-mold" }, { id: "item:large-container-base-mold" }, { id: "item:large-container-lid-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:large-metal-container");
addRecipe("recipe:skinning-knife", "Skinning Knife", 41,
  [{ id: "item:small-brick-of-ore" }, { id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:water-flask" }], "item:skinning-knife");
addRecipe("recipe:scaler", "Scaler", 39,
  [{ id: "item:scaler-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:scaler");
addRecipe("recipe:toolbox", "Toolbox", 52,
  [{ id: "item:small-brick-of-ore" }, { id: "item:toolbox-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:toolbox");
addRecipe("recipe:muffin-tin", "Muffin Tin", 35,
  [{ id: "item:muffin-tin-mold" }, { id: "item:ceramic-lining" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:muffin-tin");
addRecipe("recipe:pie-tin", "Pie Tin", 35,
  [{ id: "item:pie-tin-mold" }, { id: "item:ceramic-lining" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:pie-tin");
addRecipe("recipe:cake-round", "Cake Round", 38,
  [{ id: "item:cake-round-mold" }, { id: "item:ceramic-lining" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:cake-round");
addRecipe("recipe:bread-tin", "Bread Tin", 38,
  [{ id: "item:bread-tin-mold" }, { id: "item:ceramic-lining" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:bread-tin");
addRecipe("recipe:skewers", "Skewers", 115,
  [{ id: "item:skewer-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:skewers");
addRecipe("recipe:small-sewing-kit", "Small Sewing Kit", 135,
  [{ id: "item:needle-mold" }, { id: "item:thimble-mold" }, { id: "item:water-flask" }, { id: "item:metal-bits" }], "item:small-sewing-kit");

// ---------------------------------------------------------------------
// Vendors.
// ---------------------------------------------------------------------
addVendor("a clockwork merchant", "Ak'Anon", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:toolbox-mold"]);
addVendor("Kaila Rucksack", "Butcherblock Mountains", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:toolbox-mold"]);
addVendor("Tislan", "East Freeport", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:needle-mold"]);
addVendor("Merchant Nluolian", "Greater Faydark", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:toolbox-mold"]);
addVendor("Ungia", "Grobb", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:toolbox-mold", "item:needle-mold"]);
addVendor("Betty Brickbaker", "Rivervale", ["item:hinge-mold", "item:small-container-base-mold", "item:small-container-lid-mold", "item:container-base-mold", "item:container-lid-mold", "item:large-container-base-mold", "item:large-container-lid-mold", "item:needle-mold"]);
addVendor("Klok Gritchit", "East Cabilis", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Roghur Muleson", "East Freeport", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Merchant Uaylain", "Greater Faydark", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Garklog", "Grobb", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Jil McDaniel", "Halas", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Mira Sayer", "Qeynos Hills", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Frannie", "Surefall Glade", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Barkeep Droz", "Skyshrine", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold"]);
addVendor("Oren Furdenbline", "Steamfont Mountains", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Wevil Doughbeard", "Thurgadin", ["item:hinge-mold", "item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Yola Sweetcookie", "Rivervale", ["item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);
addVendor("Nalda Griststone", "Butcherblock Mountains", ["item:muffin-tin-mold", "item:pie-tin-mold", "item:cake-round-mold", "item:bread-tin-mold", "item:skewer-mold", "item:scaler-mold"]);

addVendor("Clockwork SmithXIII", "Ak'Anon", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("a clockwork armorer", "Ak'Anon", ["item:hilt-mold"]);
addVendor("Smithy Krikt", "East Cabilis", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Smithy Vyx", "East Cabilis", ["item:hilt-mold"]);
addVendor("Murg", "The Feerrott", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Opal Leganyn", "Northern Felwithe", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Jenna Smith", "East Freeport", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("April", "Halas", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Ambril McRohrer", "Halas", ["item:hilt-mold"]);
addVendor("Bndainy Everhot", "North Kaladim", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Tortuk Everhot", "North Kaladim", ["item:hilt-mold"]);
addVendor("Sivy G`Noir", "Neriak Commons", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Trista N`Ryt", "Neriak Commons", ["item:hilt-mold"]);
addVendor("Dren Ironforge", "North Qeynos", ["item:dagger-blade-mold", "item:hilt-mold"]);
addVendor("Kalaaro Steelclaws", "Stonebrunt Mountains", ["item:dagger-blade-mold"]);
// Rivervale's Bipdo Hargin (Dagger Blade Mold) skipped -- eqlwiki's own
// page marks this vendor "NO LONGER SPAWNS."

addVendor("Rylin Coil", "Ak'Anon", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Alga Bruntbuckler", "Butcherblock Mountains", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Klok Stitch", "East Cabilis", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Gayle Weaven", "Erudin", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Seria O`Danos", "Everfrost Peaks", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Dionin Needlespin", "Firiona Vie", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Merchant Gaeadin", "Greater Faydark", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Dyona Rossook", "Highpass Hold", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Tipa Lighten", "Misty Thicket", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Hutyn L`Lozz", "Neriak Third Gate", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Spoolie Gee", "Northern Desert of Ro", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Tin Merchant IX", "The Overthere", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Alysa", "Western Plains of Karana", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Freed Fimplefur", "Steamfont Mountains", ["item:needle-mold", "item:thimble-mold"]);
addVendor("Rexx Frostweaver", "Thurgadin", ["item:needle-mold", "item:thimble-mold"]);

save();
console.log(`Migration 375 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Tools and Implements`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
