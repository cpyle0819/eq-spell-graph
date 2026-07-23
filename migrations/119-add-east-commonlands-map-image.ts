/**
 * Migration 119: add `map_image` and `map_legend` to zone:east-commonlands,
 * per the pattern from migration 113 (Ak'Anon) -- see issue #36.
 *
 * `public/maps/east-commonlands.jpg` downloaded from eqlwiki.com's own
 * /images/2/2a/Map_eastcommons.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's East Commonlands page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:east-commonlands");
if (!zone) throw new Error("zone:east-commonlands not found");

zone.data.map_image = "east-commonlands.jpg";
zone.data.map_legend = [
  { key: "1", label: "Orc Camp (\"Orc 2\")" },
  { key: "2", label: "Inn with Alcohol, Cloth Armor, Magician Books, Spell Components, Tiny Daggers, and Gems (Inn 4)" },
  { key: "3", label: "Hut with Shields, Food, Herbs, and Compass" },
  { key: "4", label: "Inn with Arrows and Nocks, Alcohol, and Cloth Armor (Inn 3)" },
  { key: "5", label: "Obelisk with Rangers" },
  { key: "6", label: "Orc Camp (\"Orc 1\") with Lord Shin Ree" },
  { key: "7", label: "Juna's Inn with Food, Alcohol, and Cloth Armor (Inn 2)" },
  { key: "8", label: "Haunted Ruins" },
  { key: "9", label: "Empty Hut" },
  { key: "10", label: "Plagued Huts" },
  { key: "11", label: "Harold's Inn with Food, Alcohol, Cloth Armor, and Pottery Supplies (Inn 1)" },
  { key: "12", label: "Shop with Miscellaneous Weapons and Throwing Weapons" },
  { key: "13", label: "Shop with Spell Components" },
  { key: "14", label: "Shop with Cleric Trainer" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 119 complete: map_image and map_legend set on zone:east-commonlands");
