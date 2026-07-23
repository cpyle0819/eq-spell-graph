/**
 * Migration 125: convert every zone node's flat `map_image`/`map_legend`
 * fields to the new `maps: { label, image, legend }[]` array shape --
 * see decisions/zone-multi-floor-maps.md for why (Befallen/Blackburrow's
 * multiple dungeon floors don't fit one zone-wide map+legend pair).
 *
 * Every zone touched here only ever had one map, so `label` is null and
 * `maps` ends up a one-element array -- this migration is a pure reshape,
 * no new map data.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

let converted = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "zone" || !node.data.map_image) continue;
  node.data.maps = [
    { label: null, image: node.data.map_image, legend: node.data.map_legend ?? [] },
  ];
  delete node.data.map_image;
  delete node.data.map_legend;
  converted++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 125 complete: ${converted} zone(s) converted to the maps[] shape`);
