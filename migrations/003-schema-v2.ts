/**
 * Migration 003: Schema v2
 *
 * 1. Rename vendor nodes to npc, add roles: ["vendor"]
 * 2. Flip has_vendor (zone->vendor) to located_in (npc->zone)
 * 3. Rename has_spell to sells (npc->spell, direction stays)
 * 4. Move level from spell node property to class_levels array
 * 5. Add connects_to edges between zones (zone adjacency for pathfinding)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");

const raw = readFileSync(DATA_PATH, "utf-8");
const graph = JSON.parse(raw);

// Step 1: Rename vendor nodes to npc, add roles
for (const node of graph.nodes) {
  if (node.data.type === "vendor") {
    node.data.type = "npc";
    node.data.roles = ["vendor"];
  }
}

// Step 4: Convert spell level to class_levels
for (const node of graph.nodes) {
  if (node.data.type === "spell") {
    const level = node.data.level;
    node.data.class_levels = [{ class: "shaman", level }];
    delete node.data.level;
  }
}

// Steps 2 & 3: Remap edges
let edgeCounter = 0;
graph.edges = graph.edges.map((e: any) => {
  if (e.data.type === "has_vendor") {
    // was zone -> vendor, flip to npc -> zone as "located_in"
    edgeCounter++;
    return {
      data: {
        id: `e-located-in-${edgeCounter}`,
        source: e.data.target, // npc (was vendor/target)
        target: e.data.source, // zone (was source)
        type: "located_in",
      },
    };
  }
  if (e.data.type === "has_spell") {
    // npc -> spell, just rename to "sells"
    edgeCounter++;
    return {
      data: {
        id: `e-sells-${edgeCounter}`,
        source: e.data.source,
        target: e.data.target,
        type: "sells",
      },
    };
  }
  return e;
});

// Step 5: Add zone adjacency (connects_to) edges
// Zone connections sourced from eqlwiki.com/Travel_Guide
const ZONE_CONNECTIONS: [string, string][] = [
  // Antonica
  ["South Qeynos", "North Qeynos"],
  ["South Qeynos", "Qeynos Catacombs"],
  ["Surefall Glade", "Qeynos Hills"],
  ["Qeynos Hills", "North Qeynos"],
  ["Qeynos Hills", "Western Karana"],
  ["Qeynos Hills", "Blackburrow"],
  ["Western Karana", "Northern Karana"],
  ["Northern Karana", "Eastern Karana"],
  ["Eastern Karana", "Gorge of King Xorbb"],
  ["Eastern Karana", "Highpass Hold"],
  ["Highpass Hold", "Kithicor Forest"],
  ["Kithicor Forest", "Rivervale"],
  ["Kithicor Forest", "West Commonlands"],
  ["Rivervale", "Misty Thicket"],
  ["West Commonlands", "East Commonlands"],
  ["East Commonlands", "North Freeport"],
  ["East Commonlands", "West Freeport"],
  ["East Commonlands", "East Freeport"],
  ["East Commonlands", "Nektulos Forest"],
  ["North Freeport", "East Freeport"],
  ["North Freeport", "West Freeport"],
  ["East Freeport", "West Freeport"],
  ["East Freeport", "Northern Desert of Ro"],
  ["Northern Desert of Ro", "Oasis of Marr"],
  ["Oasis of Marr", "Southern Desert of Ro"],
  ["Southern Desert of Ro", "Innothule Swamp"],
  ["Innothule Swamp", "Grobb"],
  ["Innothule Swamp", "Upper Guk"],
  ["Innothule Swamp", "The Feerrott"],
  ["The Feerrott", "Oggok"],
  ["Nektulos Forest", "Neriak Foreign Quarter"],
  ["Neriak Foreign Quarter", "Neriak Commons"],
  ["Neriak Commons", "Neriak 3rd Gate"],
  ["Lavastorm Mountains", "Nektulos Forest"],
  ["Halas", "Everfrost Peaks"],
  ["Everfrost Peaks", "Blackburrow"],
  ["Northern Karana", "Southern Karana"],
  ["Southern Karana", "Lake Rathetear"],
  ["Lake Rathetear", "Rathe Mountains"],
  ["Rathe Mountains", "The Feerrott"],
  // Faydwer
  ["Greater Faydark", "Northern Felwithe"],
  ["Northern Felwithe", "Southern Felwithe"],
  ["Greater Faydark", "Crushbone"],
  ["Greater Faydark", "Lesser Faydark"],
  ["Greater Faydark", "Butcherblock Mountains"],
  ["Lesser Faydark", "Steamfont Mountains"],
  ["Steamfont Mountains", "Ak'Anon"],
  ["Butcherblock Mountains", "North Kaladim"],
  ["Butcherblock Mountains", "Dagnor's Cauldron"],
  // Odus
  ["Erudin", "Toxxulia Forest"],
  ["Toxxulia Forest", "Paineel"],
  // Kunark
  ["East Cabilis", "Field of Bone"],
  ["West Cabilis", "Lake of Ill Omen"],
  ["East Cabilis", "West Cabilis"],
  ["Lake of Ill Omen", "Firiona Vie"],
  ["Firiona Vie", "Emerald Jungle"],
  ["Field of Bone", "Emerald Jungle"],
  ["The Overthere", "Skyfire Mountains"],
  ["The Overthere", "Frontier Mountains"],
  ["Frontier Mountains", "Lake of Ill Omen"],
  // Velious
  ["Thurgadin", "Great Divide"],
  ["Great Divide", "Eastern Wastes"],
  ["Eastern Wastes", "Kael Drakkal"],
  ["Kael Drakkal", "The Wakening Land"],
  ["The Wakening Land", "Skyshrine"],
  // Inter-continent (boats/ports)
  ["South Qeynos", "Erudin"],
  ["East Freeport", "Butcherblock Mountains"],
  ["Oasis of Marr", "Firiona Vie"],
  ["Butcherblock Mountains", "Firiona Vie"],
  ["Butcherblock Mountains", "The Overthere"],
  ["Northern Desert of Ro", "Iceclad Ocean"],
  ["Iceclad Ocean", "Eastern Wastes"],
  // New Sebilis Expedition is accessed from Emerald Jungle area
  ["Emerald Jungle", "New Sebilis Expedition"],
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Ensure all zones mentioned in connections exist as nodes
const existingZoneIds = new Set(
  graph.nodes.filter((n: any) => n.data.type === "zone").map((n: any) => n.data.id)
);

const allZonesNeeded = new Set<string>();
for (const [a, b] of ZONE_CONNECTIONS) {
  allZonesNeeded.add(a);
  allZonesNeeded.add(b);
}

for (const zoneName of allZonesNeeded) {
  const id = `zone:${slugify(zoneName)}`;
  if (!existingZoneIds.has(id)) {
    graph.nodes.push({ data: { id, label: zoneName, type: "zone" } });
    existingZoneIds.add(id);
  }
}

// Add connects_to edges (bidirectional — add both directions)
const connectEdgeSet = new Set<string>();
for (const [a, b] of ZONE_CONNECTIONS) {
  const idA = `zone:${slugify(a)}`;
  const idB = `zone:${slugify(b)}`;

  const keyAB = `${idA}->${idB}`;
  const keyBA = `${idB}->${idA}`;

  if (!connectEdgeSet.has(keyAB)) {
    connectEdgeSet.add(keyAB);
    edgeCounter++;
    graph.edges.push({
      data: {
        id: `e-connects-${edgeCounter}`,
        source: idA,
        target: idB,
        type: "connects_to",
      },
    });
  }
  if (!connectEdgeSet.has(keyBA)) {
    connectEdgeSet.add(keyBA);
    edgeCounter++;
    graph.edges.push({
      data: {
        id: `e-connects-${edgeCounter}`,
        source: idB,
        target: idA,
        type: "connects_to",
      },
    });
  }
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));

// Stats
const npcs = graph.nodes.filter((n: any) => n.data.type === "npc").length;
const spells = graph.nodes.filter((n: any) => n.data.type === "spell").length;
const zones = graph.nodes.filter((n: any) => n.data.type === "zone").length;
const sells = graph.edges.filter((e: any) => e.data.type === "sells").length;
const locatedIn = graph.edges.filter((e: any) => e.data.type === "located_in").length;
const connects = graph.edges.filter((e: any) => e.data.type === "connects_to").length;

console.log("Migration 003 complete:");
console.log(`  Nodes: ${npcs} npcs, ${spells} spells, ${zones} zones`);
console.log(`  Edges: ${sells} sells, ${locatedIn} located_in, ${connects} connects_to`);
console.log(`  Spell model: class_levels array (class + level per entry)`);
console.log(`  NPC model: roles array`);
