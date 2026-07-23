/**
 * Migration 151: add `maps` to zone:burning-wood, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/burning-wood.jpg` downloaded from eqlwiki.com's own
 * /images/8/8d/Map_burningwood.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Burning Wood page (the wiki
 * itself still titles this page/category "Burning Woods" -- migration 066
 * already reconciled the duplicate zone nodes into the singular
 * `zone:burning-wood`, see issue #36's own note).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:burning-wood");
if (!zone) throw new Error("zone:burning-wood not found");

zone.data.maps = [
  {
    label: null,
    image: "burning-wood.jpg",
    legend: [
      { key: "1", label: "Sarnak Fortress" },
      { key: "2", label: "Haunted Ruins" },
      { key: "3", label: "Forest Giant Fort (loc 990, 1125)" },
      { key: "4", label: "Meteor with Slixin Klex nearby (loc -678, -1129)" },
      { key: "5", label: "Sarnak Temple (loc -1200, -3945)" },
      { key: "6", label: "Hornet's Nest (loc -2580, 2700)" },
      { key: "7", label: "Cave entrance to Frontier Mountains (loc -2580, -4175)" },
      { key: "8", label: "Slixin Klex (-678, -1129) #4 On the (Map)" },
      { key: "9", label: "Chardok Opening - Head North when 2nd set of numbers (east) is -3500" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 151 complete: maps set on zone:burning-wood");
