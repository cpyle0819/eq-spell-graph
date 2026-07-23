/**
 * Migration 142: add `maps` (multi-floor) to zone:kurns-tower --
 * decisions/zone-multi-floor-maps.md, see issue #36.
 *
 * eqlwiki.com's Kurn's Tower page splits its dungeon into two map images:
 * "Upper Levels" (public/maps/kurns-tower-upper.jpg, from its own
 * /images/2/2f/Map_kurnsupper.jpg) and "Lower Levels"
 * (public/maps/kurns-tower-lower.jpg, from /images/a/ad/Map_kurnslower.jpg).
 * Legends transcribed verbatim from the numbered lists under each map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:kurns-tower");
if (!zone) throw new Error("zone:kurns-tower not found");

zone.data.maps = [
  {
    label: "Upper Levels",
    image: "kurns-tower-upper.jpg",
    legend: [
      { key: "1", label: '"The Barracks"' },
      { key: "2", label: "Secret Safe Room" },
      { key: "3", label: '"The Dining Room" with an undead crusader (wanders near stairs close to dining room) who drops Skull with an X (Common for non-Lore version, Rare for Lore version) and an odd mole' },
      { key: "4", label: "Entry Hall" },
    ],
  },
  {
    label: "Lower Levels",
    image: "kurns-tower-lower.jpg",
    legend: [
      { key: "1", label: "An undead jester who drops Iksar Berserker Club (Rare). Also a Thick Boned Skeleton spawn that drops Thick Iksar Skull." },
      { key: "2", label: "Wandering Burynai Forager who drops A Dusty Sealed Canopic (Common)" },
      { key: "3", label: "A skeletal cook is a static spawn who drops Shield of Kurn (Uncommon) and does not agro to anyone. Hand it A Glowing Skull to receive The Skull of Torture in return. A wandering fingered skeleton spawns nearby (not the same spawn as the cook) and drops various size Skeleton Fingers." },
      { key: "4", label: "Bargynn, who drops Bargynn's Torch (Common) and Bargynn's Digger (Common)" },
      { key: "A/B", label: "Pits that drop from the Basement level into Tunnels -- one-way drops; the only way out afterward is to zone out to Field of Bone (also one-way) from the Tunnels area" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 142 complete: maps (2 floors) set on zone:kurns-tower");
