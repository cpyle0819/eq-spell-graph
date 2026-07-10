/**
 * Migration 020: Add Stonebrunt Mountains, a real EQL zone missing from the
 * graph entirely.
 *
 * Surfaced while linking the Leveling Guide (public/leveling-guide.html) to
 * Route Finder — the guide named it as an overflow leveling zone but it had
 * no node here at all. This is an overland zone, so per DECISIONS.md its
 * connectivity is sourced from eqlwiki.com, not classic-EQ assumptions:
 * eqlwiki.com/Stonebrunt_Mountains states "The only way to get to Stonebrunt
 * Mountains is by travelling through Paineel and through the kobold-filled
 * Warrens to the area where they've broken through into the mountain range,"
 * and its adjacent-zones list names The Warrens as the sole connection (the
 * Paineel leg is already covered by The Warrens' existing connects_to edge
 * to Toxxulia Forest, which also connects to Paineel).
 *
 * No known spell vendors, so it gets the same "uninhabited wilderness"
 * faction template migration 015 used for vendor-less zones: neutral race
 * standing, safe for all classes, neutral deity standing.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

const WILDERNESS_FACTION = {
  race: {
    barbarian: "neutral",
    "dark elf": "neutral",
    dwarf: "neutral",
    erudite: "neutral",
    gnome: "neutral",
    "half elf": "neutral",
    halfling: "neutral",
    "high elf": "neutral",
    human: "neutral",
    iksar: "neutral",
    ogre: "neutral",
    troll: "neutral",
    "wood elf": "neutral",
  },
  class: {
    bard: "safe",
    beastlord: "safe",
    cleric: "safe",
    druid: "safe",
    enchanter: "safe",
    magician: "safe",
    monk: "safe",
    necromancer: "safe",
    paladin: "safe",
    ranger: "safe",
    rogue: "safe",
    "shadow knight": "safe",
    shaman: "safe",
    warrior: "safe",
    wizard: "safe",
  },
  deity: {
    agnostic: "neutral",
    bertoxxulous: "neutral",
    "brell serilis": "neutral",
    bristlebane: "neutral",
    "cazic-thule": "neutral",
    "erollisi marr": "neutral",
    innoruuk: "neutral",
    karana: "neutral",
    "mithaniel marr": "neutral",
    prexus: "neutral",
    quellious: "neutral",
    "rallos zek": "neutral",
    "rodcet nife": "neutral",
    "solusek ro": "neutral",
    "the tribunal": "neutral",
    tunare: "neutral",
    veeshan: "neutral",
  },
};

const ZONE_ID = "zone:stonebrunt-mountains";

if (!graph.nodes.some((n: any) => n.data.id === ZONE_ID)) {
  graph.nodes.push({
    data: { id: ZONE_ID, label: "Stonebrunt Mountains", type: "zone", faction: structuredClone(WILDERNESS_FACTION) },
  });
}

function hasEdge(src: string, tgt: string): boolean {
  return graph.edges.some(
    (e: any) => e.data.type === "connects_to" && e.data.source === src && e.data.target === tgt
  );
}

function addEdge(src: string, tgt: string): void {
  if (hasEdge(src, tgt)) return;
  graph.edges.push({
    data: { id: `e-conn-${graph.edges.length}-${Date.now().toString(36)}`, source: src, target: tgt, type: "connects_to" },
  });
}

addEdge(ZONE_ID, "zone:the-warrens");
addEdge("zone:the-warrens", ZONE_ID);

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));

console.log(`Migration 020 complete: total zones now ${graph.nodes.filter((n: any) => n.data.type === "zone").length}`);
