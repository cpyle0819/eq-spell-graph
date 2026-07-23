/**
 * Migration 159: add `maps` to zone:west-cabilis, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/west-cabilis.jpg` downloaded from eqlwiki.com's own
 * /images/a/a8/Map_wcabilis.jpg (same combined "Cabilis" wiki page as
 * migration 158). Legend transcribed verbatim from the numbered list under
 * the West Cabilis map on that page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:west-cabilis");
if (!zone) throw new Error("zone:west-cabilis not found");

zone.data.maps = [
  {
    label: null,
    image: "west-cabilis.jpg",
    legend: [
      { key: "1", label: "Tower of Death - Necromancer Guild Hall, Merchant selling Necromancer Equipment, Books, and some Gems" },
      { key: "2", label: "Merchant selling Ivory Weapons" },
      { key: "3", label: "Merchants selling Rhinohide Armor and Fletching Supplies (Arrows)" },
      { key: "4", label: "Merchant selling Food Items, water flasks and other Goods" },
      { key: "5", label: "Merchant selling Medium Cloth Armor, Erudite Sewing Kit and Metal Thread" },
      { key: "6", label: "A mortician selling Embalming Supplies, Coffins and Rubbing Alcohol; Lithriss Frizen selling high-level Necromancer spells" },
      { key: "7", label: "Merchants selling Alchemy Supplies, Potions, Crystals, and Dufrenite" },
      { key: "8", label: "Merchants selling Necromancer spells - underneath is a tunnel leading to a section of catacombs and a maze area" },
      { key: "9", label: "The Gauntlet - PvP area" },
      { key: "10", label: "An Iksar Hermit" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 159 complete: maps set on zone:west-cabilis");
