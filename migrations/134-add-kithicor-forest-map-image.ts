/**
 * Migration 134: add `maps` to zone:kithicor-forest, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/kithicor-forest.jpg` downloaded from eqlwiki.com's own
 * /images/3/30/Map_kithicor.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Kithicor Forest page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:kithicor-forest");
if (!zone) throw new Error("zone:kithicor-forest not found");

zone.data.maps = [
  {
    label: null,
    image: "kithicor-forest.jpg",
    legend: [
      { key: "1", label: "Shop with Boxes, Boots, Lightstones" },
      { key: "2", label: "Shop with Food" },
      { key: "3", label: "Closed Hut" },
      { key: "4", label: "Ruined Hut" },
      { key: "5", label: "Closed Hut" },
      { key: "6", label: "Haunted Stone Ring" },
      { key: "7", label: "Ranger Trainer Morin Shadowbane, who gives out Ivy Etched Armor Quests; Shops with Food, Staves, and Arrows" },
      { key: "8", label: "Closed Hut with Thumper outside" },
      { key: "9", label: "Ruined Hut" },
      { key: "10", label: "Shop with Compass, Food, Alchemy Leaves (Balm Leaves, Larkspur, Elf Leaf, Dragonwort)" },
      { key: "11", label: "Shops with Food, Arrows, Spell Components, Peridot, Bloodstone" },
      { key: "12", label: "Named Orc area (the Gan'Shraloks)" },
      { key: "13", label: "General Spawn area (Ruined Hut)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 134 complete: maps set on zone:kithicor-forest");
