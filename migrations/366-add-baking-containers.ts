/**
 * Migration 366: model Baking's crafting-station containers (Oven, Mixing
 * Bowl, Spit) and `crafted_in` edges for migration 365's 8 leveling-path
 * recipes -- see decisions/tradeskill-recipe-node-schema.md's updated
 * "Recipe variants"-adjacent container note for why this isn't a 1:1 copy
 * of Brewing's Brew Barrel (migration 356):
 *
 * - Oven matches Brew Barrel exactly: a pure world-fixture per its own
 *   eqlwiki page ("a stationary object with which the player may interact
 *   ... available in major cities"), no soldby table, no stat block. Gets
 *   no item-like fields and no sells edges, same as Brew Barrel.
 * - Mixing Bowl and Spit are also filed under eqlwiki's "Tradeskill
 *   Containers" category, but both are real portable, vendor-purchased
 *   inventory items with their own weight/Capacity/Size Capacity stat
 *   block -- modeled with those fields plus full vendor lists (issue #47:
 *   no capped/representative subset), unlike the stationary Oven/Brew
 *   Barrel case the original container design assumed.
 *
 * A recipe can point at more than one container when the wiki lists
 * alternatives ("spit/oven" -- either genuinely works): Batwing Crunchies
 * gets crafted_in edges to both Oven and Spit; every other recipe in this
 * batch only ever lists Oven or Mixing Bowl alone.
 *
 * Sourced the same way as the rest of this batch: eqlwiki.com's raw
 * wikitext via its MediaWiki API, not WebFetch's summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let containersAdded = 0;
let edgesAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

if (!hasNode("container:oven")) {
  addNode({
    id: "container:oven",
    label: "Oven",
    type: "container",
    source: "Stationary object available in major cities; interact with it to attempt a Baking recipe.",
  });
  containersAdded++;
}

if (!hasNode("container:mixing-bowl")) {
  addNode({
    id: "container:mixing-bowl",
    label: "Mixing Bowl",
    type: "container",
    weight: 0.4,
    capacity: 4,
    containerSize: "Large",
    source: "Quest Item; portable Baking container, unlike the stationary Oven -- also craftable via Pottery (trivial 17)",
  });
  containersAdded++;
}

if (!hasNode("container:spit")) {
  addNode({
    id: "container:spit",
    label: "Spit",
    type: "container",
    weight: 3.0,
    capacity: 6,
    containerSize: "Giant",
    source: "Portable Baking container, unlike the stationary Oven; works as an alternative to an Oven for many recipes",
  });
  containersAdded++;
}

function craftedIn(recipeId: string, ...containerIds: string[]) {
  for (const containerId of containerIds) {
    addEdge(recipeId, containerId, "crafted_in");
    edgesAdded++;
  }
}

craftedIn("recipe:batwing-crunchies", "container:oven", "container:spit");
craftedIn("recipe:fish-fillets", "container:oven");
craftedIn("recipe:fish-rolls", "container:oven");
craftedIn("recipe:batwing-pie", "container:oven");
craftedIn("recipe:wedding-cake", "container:oven");
craftedIn("recipe:birthday-cake", "container:oven");
craftedIn("recipe:pixie-powder-cinnesticks", "container:mixing-bowl");
craftedIn("recipe:dragon-steak", "container:oven");

// Vendors -- full soldby tables for Mixing Bowl and Spit (issue #47's "no
// capped/representative subset"). Several already exist from Brewing's own
// migrations; addVendor() no-ops the node creation and just adds the sells
// edge.
const ZONE_ALIASES: Record<string, string> = {
  "Cabilis East": "East Cabilis",
  "Western Plains of Karana": "Western Karana",
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

addVendor("a clockwork baker", "Ak'Anon", ["container:mixing-bowl"]);
addVendor("Klok Unlar", "Cabilis East", ["container:mixing-bowl"]);
addVendor("Beth Breadmaker", "Erudin", ["container:mixing-bowl"]);
addVendor("Helia BlueHawk", "Erudin", ["container:mixing-bowl"]);
addVendor("Bup", "The Feerrott", ["container:mixing-bowl"]);
addVendor("Glinya Sweetpie", "Firiona Vie", ["container:mixing-bowl"]);
addVendor("Rashinda Elore", "North Freeport", ["container:mixing-bowl"]);
addVendor("Olyna Mudel", "West Freeport", ["container:mixing-bowl"]);
addVendor("Pincia Brownloe", "West Freeport", ["container:mixing-bowl"]);
addVendor("Teria O`Danos", "Halas", ["container:mixing-bowl"]);
addVendor("Baker Jena", "High Keep", ["container:mixing-bowl"]);
addVendor("Tissin Greybloom", "North Kaladim", ["container:mixing-bowl"]);
addVendor("Serenk Greybloom", "North Kaladim", ["container:mixing-bowl"]);
addVendor("Tal Drana", "Neriak Foreign Quarter", ["container:mixing-bowl"]);
addVendor("Sal Drana", "Neriak Foreign Quarter", ["container:mixing-bowl"]);
addVendor("Niz L`Crit", "Neriak Commons", ["container:mixing-bowl"]);
addVendor("Gorng Alusnein", "Paineel", ["container:mixing-bowl"]);
addVendor("Iva Tersala", "Paineel", ["container:mixing-bowl"]);
addVendor("Henina Miller", "Western Plains of Karana", ["container:mixing-bowl"]);
addVendor("Cleet Miller Jr", "Western Plains of Karana", ["container:mixing-bowl"]);
addVendor("Karn Tassen", "South Qeynos", ["container:mixing-bowl"]);
addVendor("Voleen Tassen", "South Qeynos", ["container:mixing-bowl"]);
addVendor("Grudash the Baker", "Skyshrine", ["container:mixing-bowl"]);
addVendor("Ruru the Cook", "Skyshrine", ["container:mixing-bowl"]);
addVendor("Petcas Coldbeard", "Thurgadin", ["container:mixing-bowl"]);
skippedVendors.push("Bartle Barnick (Rivervale, Mixing Bowl) -- wiki-marked \"NO LONGER SPAWNS\", not modeled");
skippedVendors.push("A goblin merchant (RunnyEye Citadel, Mixing Bowl) -- zone not catalogued in this graph");

addVendor("a clockwork baker", "Ak'Anon", ["container:spit"]);
addVendor("Nalda Griststone", "Butcherblock Mountains", ["container:spit"]);
addVendor("Klok Gritchit", "East Cabilis", ["container:spit"]);
addVendor("Bup", "The Feerrott", ["container:spit"]);
addVendor("Pincia Brownloe", "West Freeport", ["container:spit"]);
addVendor("Merchant Uaylain", "Greater Faydark", ["container:spit"]);
addVendor("Garklog", "Grobb", ["container:spit"]);
addVendor("Jil McDaniel", "Halas", ["container:spit"]);
addVendor("Niz L`Crit", "Neriak Commons", ["container:spit"]);
addVendor("Mira Sayer", "Qeynos Hills", ["container:spit"]);
addVendor("Frannie", "Surefall Glade", ["container:spit"]);
addVendor("Oren Furdenbline", "Steamfont Mountains", ["container:spit"]);
addVendor("Petcas Coldbeard", "Thurgadin", ["container:spit"]);
addVendor("Wevil Doughbeard", "Thurgadin", ["container:spit"]);

save();
console.log(`Migration 366 complete: ${containersAdded} container(s), ${edgesAdded} crafted_in edge(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Baking`);
if (skippedVendors.length) {
  console.log(`Skipped/noted ${skippedVendors.length} vendor(s):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
