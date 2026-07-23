/**
 * Migration 177: add `maps` to zone:lesser-faydark, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/lesser-faydark.jpg` downloaded from eqlwiki.com's own
 * /images/3/30/Lesserfaydark.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:lesser-faydark");
if (!zone) throw new Error("zone:lesser-faydark not found");

zone.data.maps = [
  {
    label: null,
    image: "lesser-faydark.jpg",
    legend: [
      { key: "1", label: "Brownie Compound - Merchants who sell high level Enchanter spells" },
      { key: "2", label: "Faerie Village, with Gearheart" },
      { key: "3", label: '"Pixie Tower"' },
      { key: "4", label: "Bandit Camp" },
      { key: "5", label: "Gnome Huts" },
      { key: "6", label: "Orc Camp" },
      { key: "7", label: "Orc Camp" },
      { key: "8", label: "Haunted Shrine" },
      { key: "9", label: "Orc Camp with Orc Chief" },
      { key: "10", label: "Wood Elf Ranger Outpost selling Food and other goods" },
      { key: "11", label: "Orc Camp" },
      { key: "12", label: "Wood Elf Temple with Shadowed Men" },
      { key: "13", label: "Abandoned Stone Ring, inhabited by the Fae Royal Court" },
      { key: "14", label: "Bandit Camp with Bandit Sisters" },
      { key: "15", label: "Abandoned Camp of the Legendary Wu, now inhabited by Teir'Dal" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 177 complete: maps set on zone:lesser-faydark");
