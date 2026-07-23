/**
 * Migration 138: add `maps` to zone:north-qeynos, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/north-qeynos.jpg` downloaded from eqlwiki.com's own
 * /images/4/43/Zone_nqeynos.jpg (North Qeynos and South Qeynos are
 * separate zone nodes in this graph, so only North Qeynos's own legend is
 * used here). Legend transcribed verbatim from the numbered list under
 * the map on eqlwiki.com's North Qeynos page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:north-qeynos");
if (!zone) throw new Error("zone:north-qeynos not found");

zone.data.maps = [
  {
    label: null,
    image: "north-qeynos.jpg",
    legend: [
      { key: "1", label: "Order of the Silent Fist - Monk Guild, Merchant selling Monk Weapons, Bags, Bandages" },
      { key: "2", label: "Kliknik Tunnel - leads to Qeynos Aqueducts" },
      { key: "3", label: "Reflecting Pond - tunnel leads to Qeynos Aqueducts" },
      { key: "4", label: "Crow's Pub & Casino - Merchant selling Alcohol, Brew Barrel, secret tunnel to Rogues' Guild" },
      { key: "5", label: "Galliway's Trading Post - Merchants selling Food and other Goods, Priest of Discord outside" },
      { key: "6", label: "Ironforge's - Merchants selling Sharp Weapons, Medicine Bags, Weapon Molds, Forge out back" },
      { key: "7", label: "Jewelbox - Merchants selling Jewelry supplies" },
      { key: "8", label: "Ironforges' Estate" },
      { key: "9", label: "Merchants selling Medium Cloth Armor and Medium Chainmail Molds" },
      { key: "10", label: "The Cobbler - Merchant selling Boots" },
      { key: "11", label: "Merchants selling Blunt Weapons and Cleric/Paladin spells" },
      { key: "12", label: "Teleport to Temple of Life, Cleric and Paladin Trainers" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 138 complete: maps set on zone:north-qeynos");
