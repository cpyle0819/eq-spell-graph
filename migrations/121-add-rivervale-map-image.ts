/**
 * Migration 121: add `map_image` and `map_legend` to zone:rivervale, per
 * the pattern from migration 113 (Ak'Anon) -- see issue #36.
 *
 * `public/maps/rivervale.jpg` downloaded from eqlwiki.com's own
 * /images/d/d4/Rivervale.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Rivervale page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:rivervale");
if (!zone) throw new Error("zone:rivervale not found");

zone.data.map_image = "rivervale.jpg";
zone.data.map_legend = [
  { key: "1", label: "Pottery Wheel and Kiln" },
  { key: "2", label: "Nyla Gubbin's House" },
  { key: "3", label: "Merchants selling Bags and Fishing Supplies" },
  { key: "4", label: "Weary Foot Rest - Inn" },
  { key: "5", label: "Vale Forge" },
  { key: "6", label: "Town Hall and Leatherfoot Hall - Bank, Warrior Guild" },
  { key: "7", label: "Merchants selling Food and other Goods, Fishing Supplies" },
  { key: "8", label: "Priest of Discord" },
  { key: "9", label: "Fool's Gold - Rogue Guild" },
  { key: "10", label: "Merchant selling Cloth Armor, Brew Barrel, and Loom" },
  { key: "11", label: "Merchants selling Potions and Crystals" },
  { key: "12", label: "Merchant selling Leather Armor and Patterns" },
  { key: "13", label: "Druid Guild with merchants and forges" },
  { key: "14", label: "Pottery Wheel and Oven, Fletching Equipment" },
  { key: "15", label: "Merchant selling Potions and Crystals" },
  { key: "16", label: "Cleric and Paladin Guilds" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 121 complete: map_image and map_legend set on zone:rivervale");
