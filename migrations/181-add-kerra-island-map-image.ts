/**
 * Migration 181: add `maps` to zone:kerra-island, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/kerra-island.jpg` downloaded from eqlwiki.com's own
 * /images/0/01/Kerra.jpg. Legend transcribed verbatim from the numbered
 * list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:kerra-island");
if (!zone) throw new Error("zone:kerra-island not found");

zone.data.maps = [
  {
    label: null,
    image: "kerra-island.jpg",
    legend: [
      { key: "1", label: "Prison with kobold captives" },
      { key: "2", label: "High Temple with Khonza Mitty of Kerra" },
      { key: "3", label: "Cave of Sujah Leader Shazda Asad" },
      { key: "4", label: "Tiger Island with a heretic necromancer and skeletons" },
      { key: "5", label: "Tiger Training Pit with kerran tiger spahi" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 181 complete: maps set on zone:kerra-island");
