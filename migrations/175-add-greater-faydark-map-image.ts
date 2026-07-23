/**
 * Migration 175: add `maps` to zone:greater-faydark, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/greater-faydark.jpg` downloaded from eqlwiki.com's own
 * /images/b/b0/Greaterfaydark.jpg. Legend transcribed verbatim from the
 * numbered list under the map (Kelethin, the wood-elf city inside this
 * zone, is not a separate zone node -- its own detail is left to its own
 * wiki page per the source map's "See Kelethin for more" note).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:greater-faydark");
if (!zone) throw new Error("zone:greater-faydark not found");

zone.data.maps = [
  {
    label: null,
    image: "greater-faydark.jpg",
    legend: [
      { key: "1", label: "Orc Camps" },
      { key: "2", label: "Abandoned Druid Ring" },
      { key: "3", label: "Bandit Camp" },
      { key: "4", label: "Wizard Spires" },
      { key: "5", label: "Priest of Discord Lift" },
      { key: "6", label: "Newbie Lift" },
      { key: "7", label: "Orc Lift" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 175 complete: maps set on zone:greater-faydark");
