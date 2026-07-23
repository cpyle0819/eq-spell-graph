/**
 * Migration 117: add `map_image` and `map_legend` to zone:crushbone, per
 * the pattern from migration 113 (Ak'Anon) -- see issue #36.
 *
 * `public/maps/crushbone.jpg` downloaded from eqlwiki.com's own
 * /images/b/b3/Crushbone.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Crushbone page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:crushbone");
if (!zone) throw new Error("zone:crushbone not found");

zone.data.map_image = "crushbone.jpg";
zone.data.map_legend = [
  { key: "1", label: "Tents inhabited by legionnaires" },
  { key: "2", label: "Castle Crush with high-level spawns, including Ambassador DVinn and Emperor Crush in the tower; Lord Darish and Bonefire in the Throneroom; \"Wall\" camp outside the castle entrance" },
  { key: "3", label: "Slave Cabin with inhabitants for the Screaming Mace Quest" },
  { key: "4", label: "Slaver Caves with slaves outside" },
  { key: "5", label: "Slaver Pit containing Orc Taskmaster and Bloodgurgler" },
  { key: "6", label: "Trainer Hill with Orc Trainer" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 117 complete: map_image and map_legend set on zone:crushbone");
