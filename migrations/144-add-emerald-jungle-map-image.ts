/**
 * Migration 144: add `maps` to zone:emerald-jungle, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/emerald-jungle.jpg` downloaded from eqlwiki.com's own
 * /images/1/1b/Map_emeraldjungle.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Emerald Jungle page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:emerald-jungle");
if (!zone) throw new Error("zone:emerald-jungle not found");

zone.data.maps = [
  {
    label: null,
    image: "emerald-jungle.jpg",
    legend: [
      { key: "1", label: "Iksar Outcast Camps, loc's: 1a (4200, -1450), 1b (2800, 2225), 1c (1560, 690)" },
      { key: "2", label: "Great Staircase" },
      { key: "3", label: "The Druid spell Wind of the South teleports the group to -3100, 3500" },
      { key: "4", label: "The Wizard spell Markar's Relocation teleports the group to -1250, 3500" },
      { key: "-", label: "Entrance to City of Mist is at (300, -2000)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 144 complete: maps set on zone:emerald-jungle");
