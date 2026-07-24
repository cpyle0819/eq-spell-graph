/**
 * Migration 220: add `maps` to zone:grobb, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/grobb.jpg` downloaded from eqlwiki.com's own Grobb page
 * (File:Grobb.jpg). Legend transcribed verbatim from the page's own
 * numbered list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:grobb");
if (!zone) throw new Error("zone:grobb not found");

zone.data.maps = [
  {
    label: null,
    image: "grobb.jpg",
    legend: [
      { key: "1", label: "Constructed Potential" },
      { key: "2", label: "Cave with Basher Nanrum for Fire Beetle Eyes Quest" },
      { key: "3", label: "Sells General Supplies" },
      { key: "4", label: "Dismembered Dwarf with Oven nearby" },
      { key: "5", label: "Warrior Guild, sells Weapons" },
      { key: "6", label: "\"Gunthak's Belch\" sells Brewing Supplies, Alcohol, Brew Barrel inside" },
      { key: "7", label: "Sells Weapons, Large Leather, Chain, and Plate Armor; one Forge inside, another outside north of Bimuk; outside sells Food Items, Boots, Fletching Equipment and Bows and Arrows; Kiln and Pottery Wheel near pottery merchant Vynugga" },
      { key: "8", label: "Entrance of Shadow Knight Guild, sells Ore, Sharpening Stones, and Clay, Weapons" },
      { key: "9", label: "Shadow Knight Guild" },
      { key: "10", label: "Beastlord and Shaman Spells, Medicine Bag and Alchemy Supplies; Loom in tunnel near Raztara" },
      { key: "11", label: "Bank" },
      { key: "12", label: "Jewelry Merchant and Oven" },
      { key: "13", label: "Fireplace with A Froglok Prisoner" },
      { key: "14", label: "Shaman Guild" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 220 complete: maps set on zone:grobb");
