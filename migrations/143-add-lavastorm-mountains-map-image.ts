/**
 * Migration 143: add `maps` to zone:lavastorm-mountains, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/lavastorm-mountains.jpg` downloaded from eqlwiki.com's own
 * /images/6/68/Map_lavastorm.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Lavastorm Mountains page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:lavastorm-mountains");
if (!zone) throw new Error("zone:lavastorm-mountains not found");

zone.data.maps = [
  {
    label: null,
    image: "lavastorm-mountains.jpg",
    legend: [
      { key: "1", label: "Druid Ring with Druid Merchant selling Druid Spells" },
      { key: "2", label: "Fire Goblin Camp" },
      { key: "3", label: "Gypsy Camp selling Combine Weapons, Fine Steel Weapons, Compasses and Earrings of Fire Reflection" },
      { key: "4", label: "Stone Obelisk" },
      { key: "5", label: "Goblin Camp where Hykallen appears" },
      { key: "6", label: "Stone Obelisk with a shadowed man" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 143 complete: maps set on zone:lavastorm-mountains");
