/**
 * Migration 172: add `maps` to zone:gorge-of-king-xorbb, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/gorge-of-king-xorbb.jpg` downloaded from eqlwiki.com's own
 * /images/3/39/Map_gxorbb.jpg (the zone's own wiki page is titled "Gorge of
 * King Xorbb", also called "Beholder's Maze" -- its Category and
 * DynamicZoneList both use "Beholder's Maze"). Legend transcribed verbatim
 * from the numbered list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:gorge-of-king-xorbb");
if (!zone) throw new Error("zone:gorge-of-king-xorbb not found");

zone.data.maps = [
  {
    label: null,
    image: "gorge-of-king-xorbb.jpg",
    legend: [
      { key: "1", label: "Temple with Lord Syrkl, Lord Soptyvr, Lord Sviir and other evil eyes" },
      { key: "2", label: "Rune Stone" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 172 complete: maps set on zone:gorge-of-king-xorbb");
