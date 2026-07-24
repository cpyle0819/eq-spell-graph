/**
 * Migration 218: add `maps` to zone:southern-felwithe, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/southern-felwithe.jpg` downloaded from eqlwiki.com's own
 * combined Felwithe page's South Felwithe section (File:Sfelwithe.jpg).
 * Legend transcribed verbatim from that section's own numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:southern-felwithe");
if (!zone) throw new Error("zone:southern-felwithe not found");

zone.data.maps = [
  {
    label: null,
    image: "southern-felwithe.jpg",
    legend: [
      { key: "1", label: "Teleporter Room to and from Guild Halls" },
      { key: "2", label: "Wizard Guild - Merchants selling Wizard spells" },
      { key: "3", label: "Magician Guild - Merchants selling Magician spells" },
      { key: "4", label: "Enchanter Guild - Merchants selling Enchanter spells and reagents" },
      { key: "5", label: "Merchants selling Cloth Armor and Sewing Kits, Jewelry Supplies (Common Gems), Common Spells, Potions and Crystals, Loom inside" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 218 complete: maps set on zone:southern-felwithe");
