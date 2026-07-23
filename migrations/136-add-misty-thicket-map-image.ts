/**
 * Migration 136: add `maps` to zone:misty-thicket, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/misty-thicket.jpg` downloaded from eqlwiki.com's own
 * /images/7/7d/Map_mistythicket.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Misty Thicket page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:misty-thicket");
if (!zone) throw new Error("zone:misty-thicket not found");

zone.data.maps = [
  {
    label: null,
    image: "misty-thicket.jpg",
    legend: [
      { key: "1", label: "Orc Camp" },
      { key: "2", label: "Goblin Camps" },
      { key: "3", label: "Haunted Obelisk" },
      { key: "4", label: "Gate through the wall" },
      { key: "5", label: "Merchant with Baking Supplies" },
      { key: "6", label: "Empty Huts" },
      { key: "7", label: "Empty Hut; unofficially Blixkin Entopop's \"House\"" },
      { key: "8", label: "Merchant with Small Leather Armor and Patterns" },
      { key: "9", label: "Merchant with Sewing Supplies, including How To's, Large Kit, and Needle and Thimble Molds" },
      { key: "10", label: "Merchant with Pottery Supplies" },
      { key: "11", label: "Abandoned Tower" },
      { key: "12", label: "Merchant with Small Armor Molds" },
      { key: "13", label: "Druid Stone Ring" },
      { key: "14", label: "Lil Honeybugger's Hut" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 136 complete: maps set on zone:misty-thicket");
