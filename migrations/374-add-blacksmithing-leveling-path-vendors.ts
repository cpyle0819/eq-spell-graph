/**
 * Migration 374: vendor sells edges for migration 373's Blacksmithing
 * leveling-path ingredients (issue #48) -- Small Piece/Brick of Ore, File
 * Mold, Lantern Casing Mold, and the 12 Banded Armor molds (Sheet Metal
 * shares the same 5-vendor list as most of the molds). Every vendor
 * eqlwiki.com's own page lists for each item, not a capped subset.
 *
 * Sourced from each item's own eqlwiki.com page via the MediaWiki API
 * (raw wikitext, batched multi-title query), not a summarizer. One vendor
 * row (Rivervale's Bodbin Gimple, on File Mold's own page) is marked
 * "NO LONGER EXISTS" on the wiki itself and is skipped, same "the wiki's
 * own current-state note is the real fact" precedent prior migrations use
 * for stale/removed data.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

// Same alias map migration 365/370 used for eqlwiki vendor-table zone names
// that differ from this graph's own zone labels.
const ZONE_ALIASES: Record<string, string> = {
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

// ---------------------------------------------------------------------
// Sheet Metal + the 12 Banded Armor molds -- Boot Mold and Gauntlet Mold
// share the same core 5-vendor list as the rest; Boot Mold also has one
// extra vendor of its own (below).
// ---------------------------------------------------------------------
const MOLDS_AND_SHEET_METAL = [
  "item:sheet-metal",
  "item:belt-sectional-mold", "item:bracer-sectional-mold", "item:cloak-sectional-mold",
  "item:gorget-mold", "item:helm-mold", "item:leggings-sectional-mold", "item:mail-sectional-mold",
  "item:mask-mold", "item:sleeves-sectional-mold", "item:boot-mold", "item:gauntlet-mold",
];
addVendor("Issilyn Ristan", "East Freeport", MOLDS_AND_SHEET_METAL);
addVendor("Win Karnam", "Toxxulia Forest", MOLDS_AND_SHEET_METAL);
addVendor("Marton Sayer", "Qeynos Hills", MOLDS_AND_SHEET_METAL);
addVendor("Merchant Linolyen", "Greater Faydark", MOLDS_AND_SHEET_METAL);
addVendor("Klok Nalgoz", "East Cabilis", MOLDS_AND_SHEET_METAL);
addVendor("Halvn B`Div", "Neriak Commons", ["item:boot-mold"]);

// ---------------------------------------------------------------------
// Small Piece of Ore / Small Brick of Ore -- almost identical 14-vendor
// lists (Halas splits into two vendors, one selling only Small Piece).
// Greta O`Reilly and Glazn D`Unnar/Blergerda also carry File Mold (below),
// so their sells lists grow across both sections.
// ---------------------------------------------------------------------
const BOTH_ORES = ["item:small-piece-of-ore", "item:small-brick-of-ore"];
// a clockwork miner also carries File Mold on its own page (a separate
// Ak'Anon vendor from "a clockwork merchant" below, who carries both File
// Mold and Lantern Casing Mold).
addVendor("a clockwork miner", "Ak'Anon", [...BOTH_ORES, "item:file-mold"]);
addVendor("Klok Toren", "East Cabilis", BOTH_ORES);
addVendor("Shinan Orefinder", "Erudin", BOTH_ORES);
addVendor("Kyrin Steelbone", "North Freeport", BOTH_ORES);
addVendor("Okun", "Grobb", BOTH_ORES);
addVendor("Greta O`Reilly", "Halas", [...BOTH_ORES, "item:file-mold"]);
addVendor("April", "Halas", ["item:small-piece-of-ore"]);
addVendor("Miner Harton", "High Keep", BOTH_ORES);
addVendor("Bloarn Norkhitter", "North Kaladim", BOTH_ORES);
addVendor("Glazn D`Unnar", "Neriak Commons", [...BOTH_ORES, "item:file-mold"]);
addVendor("Blergerda", "Oggok", [...BOTH_ORES, "item:file-mold"]);
addVendor("Tentus Brackmar", "Paineel", BOTH_ORES);
addVendor("Godbin Strumharp", "Steamfont Mountains", BOTH_ORES);
addVendor("Kevar Claypaws", "Stonebrunt Mountains", BOTH_ORES);
addVendor("Nimren Stonecutter", "Thurgadin", BOTH_ORES);

// ---------------------------------------------------------------------
// Lantern Casing Mold + File Mold -- several vendors carry both.
// ---------------------------------------------------------------------
addVendor("a clockwork merchant", "Ak'Anon", ["item:lantern-casing-mold", "item:file-mold"]);
addVendor("Kaila Rucksack", "Butcherblock Mountains", ["item:lantern-casing-mold", "item:file-mold"]);
addVendor("Nalda Griststone", "Butcherblock Mountains", ["item:lantern-casing-mold"]);
addVendor("Klok Gritchit", "East Cabilis", ["item:lantern-casing-mold"]);
addVendor("Smithy Vyx", "East Cabilis", ["item:lantern-casing-mold", "item:file-mold"]);
addVendor("Tislan", "East Freeport", ["item:lantern-casing-mold"]);
addVendor("Roghur Muleson", "East Freeport", ["item:lantern-casing-mold"]);
addVendor("Jillian Dayson", "East Freeport", ["item:file-mold"]);
addVendor("Merchant Uaylain", "Greater Faydark", ["item:lantern-casing-mold"]);
addVendor("Merchant Nluolian", "Greater Faydark", ["item:lantern-casing-mold", "item:file-mold"]);
addVendor("Garklog", "Grobb", ["item:lantern-casing-mold"]);
addVendor("Ungia", "Grobb", ["item:lantern-casing-mold"]);
addVendor("Jil McDaniel", "Halas", ["item:lantern-casing-mold"]);
addVendor("Coldain Outcast", "Icewell Keep", ["item:lantern-casing-mold"]);
addVendor("Sera McMannus", "Western Plains of Karana", ["item:lantern-casing-mold"]);
addVendor("Mira Sayer", "Qeynos Hills", ["item:lantern-casing-mold"]);
addVendor("Frannie", "Surefall Glade", ["item:lantern-casing-mold"]);
addVendor("Barkeep Droz", "Skyshrine", ["item:lantern-casing-mold"]);
addVendor("Oren Furdenbline", "Steamfont Mountains", ["item:lantern-casing-mold"]);
addVendor("Wevil Doughbeard", "Thurgadin", ["item:lantern-casing-mold"]);
addVendor("Brimgald Brightsteel", "Thurgadin", ["item:lantern-casing-mold"]);
addVendor("Ungia", "Neriak Foreign Quarter", ["item:lantern-casing-mold", "item:file-mold"]);
addVendor("Betty Brickbaker", "Rivervale", ["item:file-mold"]);
// Rivervale's Bodbin Gimple (File Mold) skipped -- eqlwiki's own page marks
// this vendor "NO LONGER EXISTS."

save();
console.log(`Migration 374 complete: ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's leveling-path ingredients`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
