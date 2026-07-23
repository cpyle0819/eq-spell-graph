/**
 * Migration 155: add `maps` to zone:frontier-mountains, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/frontier-mountains.jpg` downloaded from eqlwiki.com's own
 * /images/e/e1/Map_frontiermtns.jpg. Legend transcribed verbatim from the
 * numbered/lettered list under the map on eqlwiki.com's Frontier Mountains
 * page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:frontier-mountains");
if (!zone) throw new Error("zone:frontier-mountains not found");

zone.data.maps = [
  {
    label: null,
    image: "frontier-mountains.jpg",
    legend: [
      { key: "1", label: "Iksar Ruins with Sarnaks" },
      { key: "2", label: "Mountain Giant Fortress" },
      { key: "3", label: "Iksar Guardian Statues" },
      { key: "4", label: "Ruins with Goblins" },
      { key: "5", label: "Tower with Goblins" },
      { key: "6", label: "Empty Ruins, Bind Spot" },
      { key: "A", label: "Entrance to Burynai Mines" },
      { key: "B", label: "Entrance to Burynai Mines" },
      { key: "C", label: "Entrance to Mountain Giant Mines" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 155 complete: maps set on zone:frontier-mountains");
