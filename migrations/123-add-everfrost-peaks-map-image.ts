/**
 * Migration 123: add `map_image` and `map_legend` to zone:everfrost-peaks,
 * per the pattern from migration 113 (Ak'Anon) -- see issue #36.
 *
 * `public/maps/everfrost-peaks.jpg` downloaded from eqlwiki.com's own
 * /images/e/e8/Map_everfrost.jpg (the main surface map). eqlwiki.com also
 * has a separate small "Bear Caves" sub-area map, the same pattern as
 * Ak'Anon's Mines of Malfunction -- its mobs are folded into this zone's
 * bestiary (migration 124) rather than getting a second map_image, since
 * the graph schema holds one map per zone node.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:everfrost-peaks");
if (!zone) throw new Error("zone:everfrost-peaks not found");

zone.data.map_image = "everfrost-peaks.jpg";
zone.data.map_legend = [
  { key: "1", label: "Merchants selling Smithing and Tailoring supplies" },
  { key: "2", label: "Ice Goblin Igloos with low-level, roaming spawns" },
  { key: "3", label: "Ice Goblin Igloo" },
  { key: "4", label: "Barbarian guarded pathway with Lish McMarrin (and companions)" },
  { key: "5", label: "Barbarian guarded pathway with Bandl McMarrin" },
  { key: "6", label: "Ice Goblin Igloos (north: scouts & whelps, south: scouts & goblin casters)" },
  { key: "7", label: "Temple with Barbarian shamans selling poison-based spells and alchemy ingredients" },
  { key: "8", label: "\"North Tower\" (Megan's Tower)" },
  { key: "9", label: "Temple inhabited by Icy Orcs and Redwind" },
  { key: "10", label: "Stone Giant Statue" },
  { key: "11", label: "\"South Tower\"" },
  { key: "12", label: "Sulgar location (unmarked, west of Temple)" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 123 complete: map_image and map_legend set on zone:everfrost-peaks");
