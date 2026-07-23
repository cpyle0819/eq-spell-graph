/**
 * Migration 141: add `maps` to zone:dagnor-s-cauldron, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/dagnors-cauldron.jpg` downloaded from eqlwiki.com's own
 * /images/4/4f/Dagnor.jpg. Legend transcribed verbatim from the numbered
 * list under the map on eqlwiki.com's Dagnor's Cauldron page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:dagnor-s-cauldron");
if (!zone) throw new Error("zone:dagnor-s-cauldron not found");

zone.data.maps = [
  {
    label: null,
    image: "dagnors-cauldron.jpg",
    legend: [
      { key: "1", label: "Friendly (to good races) NPC Camp and Healing" },
      { key: "2", label: "Thief NPC selling Poison" },
      { key: "3", label: "Dwarven Stone Marker" },
      { key: "4", label: "Orc Scout Camp" },
      { key: "5", label: "Aqua Goblin Camp" },
      { key: "6", label: "Kedge Keep" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 141 complete: maps set on zone:dagnor-s-cauldron");
