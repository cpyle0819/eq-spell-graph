/**
 * Migration 413 (issue #52, batch 1/N): Tailoring's own crafting stations,
 * a prerequisite for every recipe batch that follows. eqlwiki's own "Getting
 * Started" section on `Skill Tailoring`: "access to either Small Sewing
 * Kit, Large Sewing Kit, Deluxe Sewing Kit, or Loom; additionally there is
 * a Coldain Tanners Kit for higher level Velious tailoring."
 *
 * `container:small-sewing-kit` already existed as a plain `item` node
 * (Blacksmithing-crafted, migration predating this one) with no vendor
 * data -- retyped in place to `container` here, same Toolbox precedent as
 * Tinkering (migration 412): a `crafted_in` target for every base-tier
 * Tailoring recipe from here on, still keeping its own weight/capacity/
 * containerSize/vendor fields per decisions/tradeskill-recipe-node-schema
 * .md's portable-container shape.
 *
 * Large Sewing Kit and Coldain Tanners Kit are the same portable-container
 * shape (real WT/Capacity/Size Capacity stat block, vendor-sold). Deluxe
 * Sewing Kit has the same stat block but eqlwiki's own item page lists no
 * `soldby` table at all -- no `sells` edges added, that absence is itself
 * the real fact (same call migration 355 made for un-sold Brewing
 * ingredients). Loom is the pure world-fixture kind (eqlwiki: "a stationary
 * object with which the player may interact... available in major
 * cities," no stat block, no soldby) -- same shape as Brew Barrel/Oven,
 * none of `item`'s fields, no vendor edges.
 *
 * Zone name aliases (wiki name -> this graph's zone label), same
 * "resolve, don't treat as a new zone" precedent migration 358 used:
 * "Neriak Third Gate" -> "Neriak 3rd Gate", "Eastern/Western Plains of
 * Karana" -> "Eastern/Western Karana".
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (batched multi-title query against all four item pages + Loom), not a
 * summarizer. Every vendor eqlwiki lists is included, skipping only rows
 * in zones not yet catalogued in this graph.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let containersAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

const ZONE_ALIASES: Record<string, string> = {
  "Neriak Third Gate": "Neriak 3rd Gate",
  "Eastern Plains of Karana": "Eastern Karana",
  "Western Plains of Karana": "Western Karana",
  "Northern Plains of Karana": "Northern Karana",
  "Southern Plains of Karana": "Southern Karana",
};

function addVendor(vendorLabel: string, zoneLabelRaw: string, sells: string[]) {
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
// Retype the existing Small Sewing Kit item into a `container` node.
// ---------------------------------------------------------------------
{
  const kit = graph.nodes.find((n: { id: string }) => n.id === "item:small-sewing-kit");
  if (kit) {
    kit.id = "container:small-sewing-kit";
    kit.type = "container";
    for (const e of graph.edges) {
      if (e.source === "item:small-sewing-kit") e.source = "container:small-sewing-kit";
      if (e.target === "item:small-sewing-kit") e.target = "container:small-sewing-kit";
    }
  }
}
addVendor("a clockwork tanner", "Ak'Anon", ["container:small-sewing-kit"]);
addVendor("a clockwork tailor", "Ak'Anon", ["container:small-sewing-kit"]);
addVendor("Fugan Mumfur", "Butcherblock Mountains", ["container:small-sewing-kit"]);
addVendor("Klok Tempar", "East Cabilis", ["container:small-sewing-kit"]);
addVendor("Kamzar", "West Cabilis", ["container:small-sewing-kit"]);
addVendor("Sorsha Hobbitfriend", "West Commonlands", ["container:small-sewing-kit"]);
addVendor("Peron ThreadSpinner", "West Commonlands", ["container:small-sewing-kit"]);
addVendor("Merchant Silvia", "Eastern Plains of Karana", ["container:small-sewing-kit"]);
addVendor("Loric Weaver", "East Commonlands", ["container:small-sewing-kit"]);
addVendor("Jelda Needlefinger", "East Commonlands", ["container:small-sewing-kit"]);
addVendor("Dena Loommistress", "East Commonlands", ["container:small-sewing-kit"]);
addVendor("Galbasi Weaver", "Erudin", ["container:small-sewing-kit"]);
addVendor("Monita Weaver", "Erudin", ["container:small-sewing-kit"]);
addVendor("Demicla Tanner", "Erudin", ["container:small-sewing-kit"]);
addVendor("Merchant Tissan", "Felwithe", ["container:small-sewing-kit"]);
addVendor("Merchant Silvenspin", "Felwithe", ["container:small-sewing-kit"]);
addVendor("Merchant Moonthread", "Felwithe", ["container:small-sewing-kit"]);
addVendor("Sissin Tanner", "East Freeport", ["container:small-sewing-kit"]);
addVendor("Sanhan Tanner", "East Freeport", ["container:small-sewing-kit"]);
addVendor("Winlar Tanner", "East Freeport", ["container:small-sewing-kit"]);
addVendor("Wahnig Nooz", "North Freeport", ["container:small-sewing-kit"]);
addVendor("Jallen Nooz", "North Freeport", ["container:small-sewing-kit"]);
addVendor("Lystyn Wyspin", "North Freeport", ["container:small-sewing-kit"]);
addVendor("Svinal Wyspin", "North Freeport", ["container:small-sewing-kit"]);
addVendor("Falia Frikniller", "North Freeport", ["container:small-sewing-kit"]);
addVendor("Linadian", "West Freeport", ["container:small-sewing-kit"]);
addVendor("Linadian", "Greater Faydark", ["container:small-sewing-kit"]);
addVendor("Merchant Aluwenae", "Greater Faydark", ["container:small-sewing-kit"]);
addVendor("Mac", "Halas", ["container:small-sewing-kit"]);
addVendor("Gurtha Yaptongue", "South Kaladim", ["container:small-sewing-kit"]);
addVendor("Kalameky Darkfoam", "South Kaladim", ["container:small-sewing-kit"]);
addVendor("Lena Leatherspinner", "Kithicor Forest", ["container:small-sewing-kit"]);
addVendor("Sonsa Fromp", "Misty Thicket", ["container:small-sewing-kit"]);
addVendor("Mordant Tather", "Neriak Foreign Quarter", ["container:small-sewing-kit"]);
addVendor("Jasma Tather", "Neriak Foreign Quarter", ["container:small-sewing-kit"]);
addVendor("Jarvah", "Neriak Foreign Quarter", ["container:small-sewing-kit"]);
addVendor("Mikaela S`Kor", "Neriak Commons", ["container:small-sewing-kit"]);
addVendor("Medron Y`Lask", "Neriak Third Gate", ["container:small-sewing-kit"]);
addVendor("Juk Hidebeater", "Oggok", ["container:small-sewing-kit"]);
addVendor("Duuga Tearstopper", "Oggok", ["container:small-sewing-kit"]);
addVendor("Pardas Nalue", "Paineel", ["container:small-sewing-kit"]);
addVendor("Minya Coldtoes", "Western Plains of Karana", ["container:small-sewing-kit"]);
addVendor("Silna Weaver", "Western Plains of Karana", ["container:small-sewing-kit"]);
addVendor("Solani Dayadil", "South Qeynos", ["container:small-sewing-kit"]);
addVendor("Fhara Semhart", "South Qeynos", ["container:small-sewing-kit"]);
addVendor("Iala Lenard", "South Qeynos", ["container:small-sewing-kit"]);
addVendor("Nerissa Clothspinner", "North Qeynos", ["container:small-sewing-kit"]);
addVendor("Chizzlik", "Rathe Mountains", ["container:small-sewing-kit"]);
addVendor("Twippie Diggs", "Rivervale", ["container:small-sewing-kit"]);
addVendor("Meeka Diggs", "Rivervale", ["container:small-sewing-kit"]);
addVendor("Mauren Frostbeard", "Thurgadin", ["container:small-sewing-kit"]);
addVendor("Kyla Frostbeard", "Thurgadin", ["container:small-sewing-kit"]);
addVendor("Cobi Frostbeard", "Thurgadin", ["container:small-sewing-kit"]);

// ---------------------------------------------------------------------
// Large Sewing Kit (new).
// ---------------------------------------------------------------------
addNode({ id: "container:large-sewing-kit", label: "Large Sewing Kit", type: "container", weight: 3.0, capacity: 8, containerSize: "Giant" });
containersAdded++;
addVendor("Alga Bruntbuckler", "Butcherblock Mountains", ["container:large-sewing-kit"]);
addVendor("Klok Stitch", "East Cabilis", ["container:large-sewing-kit"]);
addVendor("Sanhan Tanner", "East Freeport", ["container:large-sewing-kit"]);
addVendor("Gayle Weaven", "Erudin", ["container:large-sewing-kit"]);
addVendor("Seria O`Danos", "Everfrost Peaks", ["container:large-sewing-kit"]);
addVendor("Murga", "The Feerrott", ["container:large-sewing-kit"]);
addVendor("Dionin Needlespin", "Firiona Vie", ["container:large-sewing-kit"]);
addVendor("Merchant Gaeadin", "Greater Faydark", ["container:large-sewing-kit"]);
addVendor("Dyona Rossook", "Highpass Hold", ["container:large-sewing-kit"]);
addVendor("Tipa Lighten", "Misty Thicket", ["container:large-sewing-kit"]);
addVendor("Spoolie Gee", "Northern Desert of Ro", ["container:large-sewing-kit"]);
addVendor("Tin Merchant IX", "The Overthere", ["container:large-sewing-kit"]);
addVendor("Alysa", "Western Plains of Karana", ["container:large-sewing-kit"]);
addVendor("Freed Fimplefur", "Steamfont Mountains", ["container:large-sewing-kit"]);
addVendor("Rexx Frostweaver", "Thurgadin", ["container:large-sewing-kit"]);

// ---------------------------------------------------------------------
// Coldain Tanners Kit (new) -- Velious-tier Tailoring station.
// ---------------------------------------------------------------------
addNode({ id: "container:coldain-tanners-kit", label: "Coldain Tanners Kit", type: "container", weight: 2.0, capacity: 8, containerSize: "Giant" });
containersAdded++;
addVendor("Rexx Frostweaver", "Thurgadin", ["container:coldain-tanners-kit"]);
addVendor("Betti Frostweaver", "Thurgadin", ["container:coldain-tanners-kit"]);

// ---------------------------------------------------------------------
// Deluxe Sewing Kit (new) -- no soldby table on its own eqlwiki page.
// ---------------------------------------------------------------------
addNode({ id: "container:deluxe-sewing-kit", label: "Deluxe Sewing Kit", type: "container", weight: 4.0, capacity: 10, containerSize: "Giant" });
containersAdded++;

// ---------------------------------------------------------------------
// Loom (new) -- pure world fixture, no stat block, no vendors.
// ---------------------------------------------------------------------
addNode({ id: "container:loom", label: "Loom", type: "container" });
containersAdded++;

save();
console.log(`Migration 413 complete: ${containersAdded} container(s) added, ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Tailoring crafting stations`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
