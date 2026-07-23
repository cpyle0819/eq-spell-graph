/**
 * Migration 179: add `maps` to zone:iceclad-ocean, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/iceclad-ocean.jpg` downloaded from eqlwiki.com's own
 * /images/5/58/Iceclad.jpg. Legend transcribed verbatim from the numbered
 * list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:iceclad-ocean");
if (!zone) throw new Error("zone:iceclad-ocean not found");

zone.data.maps = [
  {
    label: null,
    image: "iceclad-ocean.jpg",
    legend: [
      { key: "1", label: "Dock for the Icebreaker, which goes to Dock #6, Melee Bind Point" },
      { key: "2", label: "Gnome Pirate Outpost with Merchants who sell Food and Water (very expensive), Tinkering Supplies, Mana Batteries, and Velious Spells" },
      { key: "3", label: "Camp of Balix Misteyes" },
      { key: "4", label: "Camp of Icepaw Gnolls" },
      { key: "5", label: "Dragon Ring - Druid and Wizard Iceclad Portal" },
      { key: "6", label: "Dock for the Icebreaker, which goes to Dock #1" },
      { key: "7", label: "Spot for raft from Northern Desert of Ro" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 179 complete: maps set on zone:iceclad-ocean");
