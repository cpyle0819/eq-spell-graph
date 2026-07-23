/**
 * Migration 126: add `maps` (multi-floor) to zone:befallen -- see issue #36
 * and decisions/zone-multi-floor-maps.md.
 *
 * eqlwiki.com's Befallen page splits its dungeon into two map images:
 * "Levels One and Two" (public/maps/befallen-1.jpg, from its own
 * /images/7/73/Befallen12.jpg) and "Level Three"
 * (public/maps/befallen-2.jpg, from /images/3/3b/Befallen3.jpg). Legends
 * transcribed verbatim from the lettered/numbered lists under each map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:befallen");
if (!zone) throw new Error("zone:befallen not found");

zone.data.maps = [
  {
    label: "Levels One and Two",
    image: "befallen-1.jpg",
    legend: [
      { key: "A", label: "First locked door, requires Splintered Wooden Key" },
      { key: "B", label: "Second locked door, requires Charred Bone Key" },
      { key: "C", label: "Third locked door, requires Smoked Glass Key" },
      { key: "1", label: "Dark Elf Shadow Knight (drops Splintered Wooden Key, Chipped Bone Rod)" },
      { key: "2", label: "Asaka L`Rei and pit to level 3, area 1" },
      { key: "2.5", label: "Skeleton L`rodd (alcove between #2 and #A)" },
      { key: "3", label: "Human female Shadow Knight in pit trap room (drops Charred Bone Key)" },
      { key: "4", label: "Ogre Shadow Knight (drops Smoked Glass Key, Barbed Armplates)" },
      { key: "5", label: "The Broken Stair" },
    ],
  },
  {
    label: "Level Three",
    image: "befallen-2.jpg",
    legend: [
      { key: "C", label: "Locked door, requires Smoked Glass Key" },
      { key: "1", label: "Pit from level 1, area 2" },
      { key: "2", label: "The Thaumaturgist, Priest Amiaz spawns" },
      { key: "3", label: "Troll Shadow Knight spawn area" },
      { key: "4", label: "Bottom of pit trap from level 2, area 3" },
      { key: "5", label: "An Elf Skeleton spawn area" },
      { key: "6", label: "Dark Elf Female Shadow Knight spawn area" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 126 complete: maps (2 floors) set on zone:befallen");
