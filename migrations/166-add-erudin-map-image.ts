/**
 * Migration 166: add `maps` to zone:erudin, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/erudin.jpg` and `public/maps/erudin-docks.jpg` downloaded
 * from eqlwiki.com's own /images/6/63/Erudin.jpg and /images/2/22/Erudindocks.jpg
 * (the Erudin page's own "Map" section embeds both the main city and its
 * docks as separate images/legends -- Erudin Palace is a distinct zone node
 * not covered by this issue's checklist, so its own map images are skipped).
 * Legends transcribed verbatim from the numbered lists under each map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:erudin");
if (!zone) throw new Error("zone:erudin not found");

zone.data.maps = [
  {
    label: "Erudin",
    image: "erudin.jpg",
    legend: [
      { key: "1", label: "Temple of Divine Light - Followers of Quellious the Tranquil -- Cleric and Paladin Guilds, Merchants selling Blunt and Sharp Weapons, Merchant outside selling Cloth Armor and Leather Armor and Patterns" },
      { key: "2", label: "Teleporter to Erudin Palace" },
      { key: "3", label: "Bard (Going Postal)" },
      { key: "4", label: "Teleporter to Erudin Docks" },
      { key: "5", label: "City Armory - Merchants selling Medium Chain and Plate Armor with Erudin Royal Forge outside" },
      { key: "6", label: "Arrival Platform from Teleporters" },
      { key: "7", label: "Erudin Surplus - Merchants selling Food and other Goods, Bags and Boxes, upstairs Brew Barrel, outside Merchant selling Small Cloth Armor, Oven, Pottery Wheel and Kiln, and Loom" },
      { key: "8", label: "Erudin City Library - Merchants selling Bard Songs, Cleric Spells, Enchanter Illusion Spells, Wizard Portal Spells, Mage Summon Item Spells, Wizard Vision and various Elemental Effect Spells, Cloudy Stone of Veeshan" },
      { key: "9", label: "Deepwater Knights, Followers of Prexus - Cleric and Paladin Guild, Merchants selling Blunt and Sharp Weapons, Forge out back" },
      { key: "10", label: "Vasty Deep Inn - Merchant selling Bags and Boxes, Enchanter Trainer" },
      { key: "11", label: "BlueHawk's Food - Merchant selling Food and other Goods, Alcohol, Cooking Books, Brew Barrel inside, Oven outside" },
    ],
  },
  {
    label: "Erudin Docks",
    image: "erudin-docks.jpg",
    legend: [
      { key: "1", label: "Merchant selling Bags and Boxes, Large Sewing Kit and Patterns" },
      { key: "2", label: "Erudin Port Authority - Merchants selling Bags and Boxes" },
      { key: "3", label: "Merchant selling Cooking Supplies and Food" },
      { key: "4", label: "Priest of Discord" },
      { key: "5", label: "Teleporter to Erudin" },
      { key: "6", label: "Platform for Teleporter arrivals" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 166 complete: maps set on zone:erudin");
