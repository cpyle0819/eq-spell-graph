/**
 * Migration 015: Add missing classic (pre-Kunark) dungeon zones.
 *
 * The graph had a few dungeons already (Blackburrow, Crushbone, Qeynos
 * Catacombs, Upper Guk, High Keep, Gorge of King Xorbb) but was missing most
 * of the rest of the classic dungeon list. Connectivity sourced from
 * wiki.project1999.com per-zone pages (user OK'd using P1999/classic-EQ data
 * for this, unlike the eqlwiki.com-only rule in decisions/ for overland
 * zones — this server is currently pre-Kunark, so no Kunark/Velious dungeons
 * are added here).
 *
 * New zones have no known spell vendors (classic dungeons are mob camps, not
 * merchant hubs), so they get the same "uninhabited wilderness" faction
 * template used for existing vendor-less overland zones like West
 * Commonlands: neutral race standing, safe for all classes, neutral deity
 * standing — no guards or civilian population to offend.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

function ensureZone(label: string): string {
  const id = `zone:${slugify(label)}`;
  if (!graph.nodes.some((n: any) => n.data.id === id)) {
    graph.nodes.push({
      data: { id, label, type: "zone", faction: structuredClone(WILDERNESS_FACTION) },
    });
  }
  return id;
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

function connectBidirectional(dungeonLabel: string, parentId: string): void {
  const dungeonId = ensureZone(dungeonLabel);
  addEdge(dungeonId, parentId);
  addEdge(parentId, dungeonId);
}

// Dungeon -> connecting overland/parent zone (per wiki.project1999.com zone pages).
connectBidirectional("Befallen", "zone:west-commonlands");
connectBidirectional("Temple of Cazic Thule", "zone:the-feerrott");
connectBidirectional("Runnyeye Citadel", "zone:misty-thicket");
connectBidirectional("Runnyeye Citadel", "zone:gorge-of-king-xorbb");
connectBidirectional("Lower Guk", "zone:upper-guk");
connectBidirectional("Nagafen's Lair", "zone:lavastorm-mountains");
connectBidirectional("Najena", "zone:lavastorm-mountains");
connectBidirectional("Permafrost", "zone:everfrost-peaks");
connectBidirectional("Solusek's Eye", "zone:lavastorm-mountains");
connectBidirectional("Splitpaw", "zone:southern-karana");
connectBidirectional("Temple of Solusek Ro", "zone:lavastorm-mountains");
connectBidirectional("The Hole", "zone:paineel");
connectBidirectional("The Warrens", "zone:toxxulia-forest");
connectBidirectional("Kedge Keep", "zone:dagnor-s-cauldron");
connectBidirectional("Mistmoore Castle", "zone:lesser-faydark");
connectBidirectional("The Estate of Unrest", "zone:dagnor-s-cauldron");

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));

console.log(`Migration 015 complete: total zones now ${graph.nodes.filter((n: any) => n.data.type === "zone").length}`);
