/**
 * Migration 307: add `maps` to zone:plane-of-growth -- see issue #36.
 *
 * `public/maps/plane-of-growth.jpg` downloaded from eqlwiki.com's own
 * `File:Map plane of growth.jpg`. No numbered legend exists on the source
 * page -- its own Map section literally reads "Someone enterprising can
 * add markers to the map and note them here," so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:plane-of-growth");
if (!zone) throw new Error("zone:plane-of-growth not found");

zone.maps = [
  {
    label: null,
    image: "plane-of-growth.jpg",
    legend: [],
  },
];

save();
console.log("Migration 307 complete: maps set on zone:plane-of-growth");
