/**
 * Migration 253: add `maps` to zone:west-commonlands, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/west-commonlands.jpg` downloaded from eqlwiki.com's own
 * /images/1/1e/Zone_westcommons.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:west-commonlands");
if (!zone) throw new Error("zone:west-commonlands not found");

zone.data.maps = [
  {
    label: null,
    image: "west-commonlands.jpg",
    legend: [
      { key: "1", label: "Orc Camp" },
      { key: "2", label: "Shop with Fishing Supplies" },
      { key: "3", label: "Inn with Shields, Food, Alcohol, and Cloth Armor" },
      { key: "4", label: "Ancient Pyramid" },
      { key: "5", label: "Stone Rings with Druids" },
      { key: "6", label: "Empty Hut" },
      { key: "7", label: "Cutthroat Dervish Camp" },
      { key: "8", label: "Haunted Tower" },
      { key: "9", label: "\"Toll Booth\" - Guard House" },
      { key: "10", label: "Inn with Food, Alcohol, and Cloth Armor, Bags and Boxes nearby" },
      { key: "11", label: "Hut with Metals" },
    ],
  },
];

save();
console.log("Migration 253 complete: maps set on zone:west-commonlands");
