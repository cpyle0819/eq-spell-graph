/**
 * Migration 162: add `maps` to zone:eastern-karana, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/eastern-karana.jpg` downloaded from eqlwiki.com's own
 * /images/7/7a/Map_ekarana.jpg (the "Eastern Karana" issue checklist entry
 * maps to the wiki's "Eastern Plains of Karana" page, per the zone's own
 * wiki_title). Legend transcribed verbatim from the numbered list under the
 * map on that page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:eastern-karana");
if (!zone) throw new Error("zone:eastern-karana not found");

zone.data.maps = [
  {
    label: null,
    image: "eastern-karana.jpg",
    legend: [
      { key: "1", label: "Druid Ring with Druid and Treant" },
      { key: "2", label: "Bandit Camp with Tallus Holton" },
      { key: "3", label: "Shops selling Weapons, Food, Goods, and Cloth Armor" },
      { key: "4", label: "Sir Morgan (wanders east down the road and back)" },
      { key: "5", label: "Shops selling Archery Items and Food. Guards stand and patrol near the shops." },
      { key: "6", label: "Gnolls" },
      { key: "7", label: "Haunted Obelisk surrounded by a gnoll reavers. At night, An undead reavers spawn." },
      { key: "8", label: "Farm with farmers" },
      { key: "9", label: "Farm with farmers" },
      { key: "10", label: "Barbarian Fishing Village, with merchant selling food and other items." },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 162 complete: maps set on zone:eastern-karana");
