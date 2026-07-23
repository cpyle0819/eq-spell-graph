/**
 * Migration 140: add `maps` to zone:cobalt-scar, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/cobalt-scar.jpg` downloaded from eqlwiki.com's own
 * /images/a/a1/Map_cobalt_scar.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Cobalt Scar page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:cobalt-scar");
if (!zone) throw new Error("zone:cobalt-scar not found");

zone.data.maps = [
  {
    label: null,
    image: "cobalt-scar.jpg",
    legend: [
      { key: "1", label: "Siren's Cave" },
      { key: "2", label: "Sunken Ship" },
      { key: "3", label: "Othmir Camp with Merchants selling Othmir Baking and Brewing Supplies, Brew Barrel and Oven inside huts" },
      { key: "4", label: "Othmir Camp with Chief and Othmir Pups" },
      { key: "5", label: "Othmir Camp" },
      { key: "6", label: "Bulthar Camp" },
      { key: "7", label: "Dragon Portal (Druid & Wizard port-in)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 140 complete: maps set on zone:cobalt-scar");
