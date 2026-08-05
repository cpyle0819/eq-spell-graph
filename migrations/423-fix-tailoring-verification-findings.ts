/**
 * Migration 423 (issue #52, batch 11/N): targeted spot-check corrections.
 * Re-fetched a handful of individual item pages (Ice Silk Robe/Cap/
 * Pantaloons, Crystalline Silk Shirt, Patchwork/Studded Tunic, plus every
 * remaining Patchwork/Studded piece) against migrations 417/420's own
 * summary-table-sourced data, per issue #52's "same verification pass
 * Brewing got" ask -- not a full 278-recipe re-fetch (see decisions log),
 * but enough to catch two real discrepancies:
 *
 * 1. **Ice Silk Robe's own item page disagrees with the page-level summary
 *    table migration 420 sourced it from**: trivial is 342, not 335, and
 *    the pattern ingredient is a dedicated "Robe Pattern" (new item here,
 *    vendor-sold, not previously in this graph), not the shared Tunic
 *    Pattern every other Tunic-slot piece uses. Ice Silk Pantaloons and
 *    Crystalline Silk Shirt were checked the same way and matched their
 *    summary-table data exactly (Pant Pattern, Tunic Pattern respectively)
 *    -- Robe Pattern is a one-off exception, not a pattern this whole
 *    migration series got wrong.
 * 2. **Patchwork/Tattered and Studded pieces were missing `weight`.**
 *    Their set-level summary tables (unlike Raw Silk/Cured Silk/
 *    Reinforced/Ice Silk/Crystalline Silk's own tables) have no weight
 *    column at all, so migration 417 left it unset per that migration's
 *    own "don't guess a field the source doesn't give" call -- but each
 *    piece's own item page does list a WT value, fetched here in a single
 *    batched query and backfilled.
 *
 * No proc/click effects were found on any re-checked item beyond what the
 * summary tables already captured (Wu's Gauntlets' Greater Lightstone
 * light-source note, the Coldain Prayer Shawls' own Effect fields) --
 * ordinary tailored armor in this game very rarely procs, and the
 * page-level tables' own "Item stats" columns already surface an Effect
 * line when one exists (as seen on Runed Coldain Prayer Shawl).
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, updateNode, slug, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

function addVendor(vendorLabel: string, zoneLabelRaw: string, sells: string[]) {
  const ZONE_ALIASES: Record<string, string> = { "Neriak Third Gate": "Neriak 3rd Gate", "Western Plains of Karana": "Western Karana" };
  const zoneLabel = ZONE_ALIASES[zoneLabelRaw] || zoneLabelRaw;
  const zoneId = `zone:${slug(zoneLabel)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabelRaw}) -- zone not catalogued in this graph`);
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
// Fix 1: Ice Silk Robe -- correct trivial, swap in its own Robe Pattern.
// ---------------------------------------------------------------------
if (!hasNode("item:robe-pattern")) {
  addNode({ id: "item:robe-pattern", label: "Robe Pattern", type: "item", weight: 0.1, size: "Tiny" });
  itemsAdded++;
}
addVendor("a clockwork tailor", "Ak'Anon", ["item:robe-pattern"]);
addVendor("Murga", "The Feerrott", ["item:robe-pattern"]);
addVendor("Winsa Tanner", "East Freeport", ["item:robe-pattern"]);
addVendor("Garren D`Vek", "Neriak Commons", ["item:robe-pattern"]);
addVendor("Gretamog", "Oggok", ["item:robe-pattern"]);
addVendor("Cleet Miller", "Western Plains of Karana", ["item:robe-pattern"]);
addVendor("Kyla Frostbeard", "Thurgadin", ["item:robe-pattern"]);
addVendor("Cobi Frostbeard", "Thurgadin", ["item:robe-pattern"]);

updateNode("recipe:ice-silk-robe", { trivial: 342 });
// Repoint recipe:ice-silk-robe's Tunic Pattern `uses` edge at Robe Pattern.
{
  const edge = graph.edges.find((e: { source: string; target: string; type: string }) =>
    e.source === "recipe:ice-silk-robe" && e.target === "item:tunic-pattern" && e.type === "uses");
  if (edge) edge.target = "item:robe-pattern";
}

// ---------------------------------------------------------------------
// Fix 2: backfill weight on Patchwork/Tattered and Studded pieces.
// ---------------------------------------------------------------------
const WEIGHTS: Record<string, number> = {
  "item:tattered-belt": 1.0, "item:patchwork-boots": 2.5, "item:tattered-skullcap": 0.6, "item:patchwork-cloak": 2.0,
  "item:tattered-gloves": 1.5, "item:tattered-gorget": 0.5, "item:tattered-mask": 0.4, "item:patchwork-pants": 4.0,
  "item:tattered-shoulderpads": 1.5, "item:patchwork-sleeves": 1.5, "item:patchwork-tunic": 3.5, "item:tattered-wristbands": 1.0,
  "item:studded-belt": 0.8, "item:studded-boots": 1.9, "item:studded-skullcap": 0.5, "item:studded-cloak": 1.5,
  "item:studded-gloves": 1.1, "item:studded-gorget": 0.4, "item:studded-mask": 0.3, "item:studded-leggings": 4.0,
  "item:studded-shoulderpads": 1.1, "item:studded-sleeves": 1.5, "item:studded-tunic": 3.5, "item:studded-wristbands": 0.8,
};
for (const [id, weight] of Object.entries(WEIGHTS)) updateNode(id, { weight });

save();
console.log(`Migration 423 complete: ${itemsAdded} item(s) added, ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added, ${Object.keys(WEIGHTS).length} item(s) backfilled with weight, Ice Silk Robe trivial/pattern corrected`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
