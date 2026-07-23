/**
 * Migration 153: add `maps` to zone:innothule-swamp, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/innothule-swamp.jpg` downloaded from eqlwiki.com's own
 * /images/c/c4/Map_innothule.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Innothule Swamp page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:innothule-swamp");
if (!zone) throw new Error("zone:innothule-swamp not found");

zone.data.maps = [
  {
    label: null,
    image: "innothule-swamp.jpg",
    legend: [
      { key: "1", label: "Tower, Home of Jojongua and Fetid Froglok Ghouls" },
      { key: "2", label: "High level monsters (froglok foragers and kobold hunters)" },
      { key: "3", label: "Stone Hand with Clork, Murak, Sithgok (Alchemy supplies), and Stragak (Shaman spells)" },
      { key: "4", label: "Stone Hand with shadowmen (-430, 980)" },
      { key: "5", label: "Froglok Hunting Grounds" },
      { key: "6", label: "Ruined Ferry" },
      { key: "7", label: "Submerged Hut" },
      { key: "8", label: "Newbie Area" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 153 complete: maps set on zone:innothule-swamp");
