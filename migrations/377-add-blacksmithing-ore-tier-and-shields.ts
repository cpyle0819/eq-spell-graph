/**
 * Migration 377: Blacksmithing's remaining ore-tier basics, Shield catalog
 * completion, and Misc (issue #48 follow-up).
 *
 * Ore tier: Large Brick of Ore/Block of Ore/Folded Sheet Metal/Studs/Steel
 * Boning all have full "In Forge:" breakdowns on their own eqlwiki pages
 * (fetched directly, not summarized). Medium Quality Ore-tier items (Small
 * Brick/Large Brick/Block of MQ Ore, Medium Quality Sheet Metal) do NOT --
 * their own pages show a "playercrafted" trivial number but no ingredient
 * list at all (not even a "?" placeholder, just missing), while all four are
 * directly vendor-sold. Modeled as plain vendor items, no recipe node
 * fabricated for them. Medium Quality Folded Sheet Metal is the one
 * exception in that tier: its own page documents real ingredients.
 *
 * Metal Rings/Chain Jointing (and their Medium Quality variants) are
 * deliberately excluded: every "recipes=" backlink on their own pages points
 * only at Ornate Chain armor, which eqlwiki's own Blacksmithing page already
 * flags as "not relevant to EQL" (excluded in migration 373). No shield or
 * weapon in scope needs them.
 *
 * Shields: Targ/Kite/Tower Shield complete the catalog started in migration
 * 376 (Buckler/Round Shield). Felwithe's own vendor rows are skipped
 * throughout (ambiguous vs. "Northern Felwithe", same precedent as 376);
 * rows naming "Northern Felwithe" explicitly are kept.
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

// --- Ore tier ---

addItem("item:large-brick-of-ore", "Large Brick of Ore", {
  weight: 25.5,
  size: "Small",
  source: "Crafted via Blacksmithing (trivial 27) from 3x Small Brick of Ore + Water Flask, yield 2; also drops from muddites in Beholder's Maze and rock dervishes in Lavastorm Mountains (neither zone catalogued in this graph yet)",
});
addItem("item:block-of-ore", "Block of Ore", {
  weight: 25.5,
  size: "Small",
  source: "Crafted via Blacksmithing (trivial 27) from 3x Large Brick of Ore + Water Flask; also drops from muddites in Beholder's Maze and rock dervishes in Lavastorm Mountains (neither zone catalogued in this graph yet)",
});
addItem("item:folded-sheet-metal", "Folded Sheet Metal", { weight: 0.1, size: "Tiny" });
addItem("item:studs", "Studs", { weight: 0.1, size: "Tiny" });
addItem("item:steel-boning", "Steel Boning", { weight: 0.1, size: "Tiny", source: "Also an ingredient in the Innoruuk Regent quest line" });

addRecipe("recipe:large-brick-of-ore", "Large Brick of Ore", 27,
  [{ id: "item:small-brick-of-ore", quantity: 3 }, { id: "item:water-flask" }], "item:large-brick-of-ore", 2);
addRecipe("recipe:block-of-ore", "Block of Ore", 27,
  [{ id: "item:large-brick-of-ore", quantity: 3 }, { id: "item:water-flask" }], "item:block-of-ore");
addRecipe("recipe:folded-sheet-metal", "Folded Sheet Metal", 37,
  [{ id: "item:block-of-ore" }, { id: "item:smithy-hammer" }, { id: "item:water-flask" }], "item:folded-sheet-metal");
addRecipe("recipe:studs", "Studs", 41,
  [{ id: "item:metal-bits", quantity: 3 }, { id: "item:file" }, { id: "item:water-flask" }], "item:studs", 2);
addRecipe("recipe:steel-boning", "Steel Boning", 41,
  [{ id: "item:small-brick-of-ore" }, { id: "item:file" }, { id: "item:water-flask" }], "item:steel-boning");

// Medium Quality ore tier -- vendor-only, no documented combine ingredients on any of these items' own pages.
addItem("item:small-brick-of-medium-quality-ore", "Small Brick of Medium Quality Ore", { weight: 7.0, size: "Small", source: "Vendor-sold; eqlwiki's own page lists a Blacksmithing trivial (27) but no combine ingredients" });
addItem("item:large-brick-of-medium-quality-ore", "Large Brick of Medium Quality Ore", { weight: 14.0, size: "Small", source: "Vendor-sold; eqlwiki's own page lists a Blacksmithing trivial (27) but no combine ingredients" });
addItem("item:block-of-medium-quality-ore", "Block of Medium Quality Ore", { weight: 18.0, size: "Small", source: "Vendor-sold; eqlwiki's own page lists a Blacksmithing trivial (25) but no combine ingredients" });
addItem("item:medium-quality-sheet-metal", "Medium Quality Sheet Metal", { weight: 15.0, size: "Small", source: "Vendor-sold; eqlwiki's own page lists a Blacksmithing trivial (34) but no combine ingredients" });
addItem("item:medium-quality-folded-sheet-metal", "Medium Quality Folded Sheet Metal", { weight: 15.0, size: "Small" });

addRecipe("recipe:medium-quality-folded-sheet-metal", "Medium Quality Folded Sheet Metal", 36,
  [{ id: "item:block-of-medium-quality-ore" }, { id: "item:smithy-hammer" }, { id: "item:water-flask" }], "item:medium-quality-folded-sheet-metal");

addVendor("Trudie Steelbone", "North Freeport", ["item:small-brick-of-medium-quality-ore", "item:large-brick-of-medium-quality-ore"]);
addVendor("Ukla", "Rathe Mountains", ["item:small-brick-of-medium-quality-ore", "item:large-brick-of-medium-quality-ore", "item:block-of-medium-quality-ore"]);
addVendor("Godbin Strumharp", "Steamfont Mountains", ["item:small-brick-of-medium-quality-ore", "item:large-brick-of-medium-quality-ore", "item:medium-quality-sheet-metal"]);
addVendor("Graham Embersmith", "High Keep", ["item:block-of-medium-quality-ore"]);
addVendor("Liln Sedder", "South Qeynos", ["item:block-of-medium-quality-ore", "item:medium-quality-folded-sheet-metal"]);
// North Freeport's Trudie Steelbone row on Block of Medium Quality Ore's own page is marked "NO LONGER SPAWNS" -- skipped.

// --- Shields (completing the catalog started in migration 376) ---

addItem("item:targ-shield-mold", "Targ Shield Mold");
addItem("item:targ-shield", "Targ Shield", { ac: 7, weight: 7.5, size: "Medium", slots: ["Secondary"], source: "Crafted via Blacksmithing (trivial 88); also a quest reward from Bandit Sisters and Taskmaster Earring - Dwarf Female" });
addItem("item:kite-shield-mold", "Kite Shield Mold");
addItem("item:kite-shield", "Kite Shield", { ac: 8, weight: 10.0, size: "Large", slots: ["Secondary"], source: "Crafted via Blacksmithing (trivial 88); also drops from various city guards" });
addItem("item:tower-shield-mold", "Tower Shield Mold");
addItem("item:tower-shield", "Tower Shield", { ac: 10, weight: 15.0, size: "Large", slots: ["Secondary"] });
addItem("item:oak-shaft", "Oak Shaft", { weight: 1.0, size: "Small" });

addRecipe("recipe:targ-shield", "Targ Shield", 88,
  [{ id: "item:folded-sheet-metal" }, { id: "item:targ-shield-mold" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }], "item:targ-shield");
addRecipe("recipe:kite-shield", "Kite Shield", 88,
  [{ id: "item:medium-quality-sheet-metal", quantity: 2 }, { id: "item:kite-shield-mold" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }], "item:kite-shield");
addRecipe("recipe:tower-shield", "Tower Shield", 88,
  [{ id: "item:medium-quality-folded-sheet-metal" }, { id: "item:tower-shield-mold" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }], "item:tower-shield");

addVendor("Smithy Bashdyn", "East Cabilis", ["item:targ-shield", "item:kite-shield", "item:tower-shield"]);
addVendor("Ranon Strongarm", "West Commonlands", ["item:targ-shield", "item:kite-shield", "item:tower-shield"]);
addVendor("Altunic Jartin", "East Commonlands", ["item:targ-shield", "item:kite-shield", "item:tower-shield"]);
addVendor("Kervis Ackblor", "Paineel", ["item:targ-shield", "item:kite-shield", "item:tower-shield"]);
addVendor("Raffy Conticede", "South Qeynos", ["item:targ-shield", "item:kite-shield", "item:tower-shield"]);
addVendor("Drekon Vebnebber", "Ak'Anon", ["item:kite-shield"]);
addVendor("Olyna Midel", "West Freeport", ["item:kite-shield"]);
addVendor("Tyeg Envil", "West Freeport", ["item:kite-shield"]);
addVendor("Merchant Milania", "Greater Faydark", ["item:kite-shield"]);
addVendor("Merchant Muvien", "Greater Faydark", ["item:kite-shield"]);
addVendor("Kar O`Dansin", "Halas", ["item:kite-shield"]);
addVendor("Vacto Molunel", "South Kaladim", ["item:kite-shield"]);
addVendor("Issva H`Rugla", "Neriak Commons", ["item:kite-shield"]);
addVendor("Snarg Bonesmacker", "Oggok", ["item:kite-shield"]);
addVendor("Ton Firepride", "South Qeynos", ["item:kite-shield"]);
addVendor("Rabley Trumend", "South Qeynos", ["item:kite-shield"]);
// Felwithe's Merchant Tearlan skipped for all three shields -- see header note.

addVendor("Smithy Zern", "East Cabilis", ["item:targ-shield-mold", "item:kite-shield-mold", "item:tower-shield-mold"]);
addVendor("Kif", "East Freeport", ["item:targ-shield-mold", "item:kite-shield-mold", "item:tower-shield-mold"]);
addVendor("Ton Firepride", "South Qeynos", ["item:targ-shield-mold", "item:kite-shield-mold", "item:tower-shield-mold"]);

addVendor("a clockwork miner", "Ak'Anon", ["item:oak-shaft"]);
addVendor("Smithy Krikt", "East Cabilis", ["item:oak-shaft"]);
addVendor("Murg", "The Feerrott", ["item:oak-shaft"]);
addVendor("Jenna Smith", "East Freeport", ["item:oak-shaft"]);
addVendor("Greta O`Reilly", "Halas", ["item:oak-shaft"]);
addVendor("April", "Halas", ["item:oak-shaft"]);
addVendor("Bndainy Everhot", "North Kaladim", ["item:oak-shaft"]);
addVendor("Sivy G`Noir", "Neriak Commons", ["item:oak-shaft"]);
addVendor("Glazn D`Unnar", "Neriak Commons", ["item:oak-shaft"]);
addVendor("Blergerda", "Oggok", ["item:oak-shaft"]);
// North Qeynos's Dren Ironforge row on Oak Shaft's own page is marked "Not on Vendor" -- skipped.

// --- Misc ---

addItem("item:field-point-arrowheads", "Field Point Arrowheads", { weight: 0.1, size: "Tiny" });
addItem("item:hooked-arrowheads", "Hooked Arrowheads", { weight: 0.1, size: "Tiny" });
addItem("item:javelin-mold", "Javelin Mold");
addItem("item:antonian-javelin", "Antonian Javelin", { weight: 4.0, size: "Small", source: "Cultural recipe usable only by Human Blacksmiths (per eqlwiki's own Misc recipe table)" });
addItem("item:bundled-steel-arrow-shafts", "Bundled Steel Arrow Shafts", { weight: 0.1, size: "Tiny" });
addItem("item:silver-bar", "Silver Bar", { weight: 0.3, size: "Small" });
addItem("item:silver-tipped-arrowheads", "Silver Tipped Arrowheads", { weight: 0.1, size: "Tiny" });

addRecipe("recipe:field-point-arrowheads", "Field Point Arrowheads", 41,
  [{ id: "item:metal-bits" }, { id: "item:file" }], "item:field-point-arrowheads", 20);
addRecipe("recipe:hooked-arrowheads", "Hooked Arrowheads", 44,
  [{ id: "item:small-brick-of-ore", quantity: 3 }, { id: "item:file" }], "item:hooked-arrowheads", 5);
addRecipe("recipe:antonian-javelin", "Antonian Javelin", 112,
  [{ id: "item:medium-quality-sheet-metal" }, { id: "item:javelin-mold" }], "item:antonian-javelin");
addRecipe("recipe:bundled-steel-arrow-shafts", "Bundled Steel Arrow Shafts", 44,
  [{ id: "item:large-brick-of-medium-quality-ore", quantity: 2 }, { id: "item:file" }], "item:bundled-steel-arrow-shafts");
addRecipe("recipe:silver-tipped-arrowheads", "Silver Tipped Arrowheads", 79,
  [{ id: "item:silver-bar" }, { id: "item:block-of-medium-quality-ore" }, { id: "item:file" }], "item:silver-tipped-arrowheads", 5);

addVendor("Clockwork SmithXIII", "Ak'Anon", ["item:javelin-mold"]);
addVendor("Smithy Krikt", "East Cabilis", ["item:javelin-mold"]);
addVendor("Murg", "The Feerrott", ["item:javelin-mold"]);
addVendor("Opal Leganyn", "Northern Felwithe", ["item:javelin-mold"]);
addVendor("Jenna Smith", "East Freeport", ["item:javelin-mold"]);
addVendor("April", "Halas", ["item:javelin-mold"]);
addVendor("Bndainy Everhot", "North Kaladim", ["item:javelin-mold"]);
addVendor("Sivy G`Noir", "Neriak Commons", ["item:javelin-mold"]);
addVendor("Dren Ironforge", "North Qeynos", ["item:javelin-mold"]);
addVendor("Kalaaro Steelclaws", "Stonebrunt Mountains", ["item:javelin-mold"]);
// Rivervale's Bipdo Hargin row on Javelin Mold's own page is marked "no longer spawns" -- skipped.

addVendor("a clockwork jeweler", "Ak'Anon", ["item:silver-bar"]);
addVendor("Klok Oxmod", "East Cabilis", ["item:silver-bar"]);
addVendor("Noresa Sparkle", "West Commonlands", ["item:silver-bar"]);
addVendor("Merchant Nora", "Northern Felwithe", ["item:silver-bar"]);
addVendor("Merchant Silspin", "Northern Felwithe", ["item:silver-bar"]);
addVendor("Brisha Fyrestone", "Firiona Vie", ["item:silver-bar"]);
addVendor("Merchant Kweili", "Greater Faydark", ["item:silver-bar"]);
addVendor("Aanina Rockfinder", "North Kaladim", ["item:silver-bar"]);
addVendor("Canarie", "Neriak Foreign Quarter", ["item:silver-bar"]);
addVendor("Zartox Ru`Soe", "Neriak Commons", ["item:silver-bar"]);
addVendor("Tin Merchant III", "The Overthere", ["item:silver-bar"]);
addVendor("Ziska Ironforge", "North Qeynos", ["item:silver-bar"]);
addVendor("Barkeep Droz", "Skyshrine", ["item:silver-bar"]);
addVendor("Talem Tucter", "Thurgadin", ["item:silver-bar"]);
addVendor("Sothure Gemcutter", "Erudin Palace", ["item:silver-bar"]);
addVendor("Dannis Faleet", "Paineel", ["item:silver-bar"]);
// North Freeport's own wiki row names the vendor "Amber (NPC)" -- an ambiguous,
// auto-generated-looking placeholder name, not a real NPC label -- skipped.

save();
console.log(`Migration 377 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's ore tier, Shields, and Misc`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
