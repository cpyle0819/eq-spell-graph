/**
 * Migration 132: add `maps` to zone:highpass-hold, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/highpass-hold.jpg` downloaded from eqlwiki.com's own
 * /images/4/4b/Map_hhpass.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Highpass Hold page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:highpass-hold");
if (!zone) throw new Error("zone:highpass-hold not found");

zone.data.maps = [
  {
    label: null,
    image: "highpass-hold.jpg",
    legend: [
      { key: "1", label: "Gnolls with Grenix Mucktail and Vexven Mucktail; guards patrol the area" },
      { key: "2", label: "The Golden Rooster with Brewing Supplies, Alcohol, and Miscellaneous Items" },
      { key: "3", label: "Shop with Kiln, Pottery Wheel, Goods, Food, and Pottery Sketches" },
      { key: "4", label: "Tiger's Roar with Alcohol, Brew Barrel, Oven, and Brewing Supplies; underwater tunnel to smuggler's area" },
      { key: "5", label: "Bandit Camp" },
      { key: "6", label: "Serpent Supply with Kiln, Pottery Wheel, Food, Forge, and Tailoring Supplies" },
      { key: "7", label: "The Lumberyard with Brew Barrel and Alcohol" },
      { key: "8", label: "Greenbanes' Weapons with Weapons, Clay, and Firing Sheets; Forge outside" },
      { key: "9", label: "Orcs with Hagnis Shralok, Recfek Shralok, and Vopuk Shralok" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 132 complete: maps set on zone:highpass-hold");
