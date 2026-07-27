/**
 * Migration 333: add `maps` to zone:dragon-necropolis -- see issue #41 audit.
 *
 * Single map sourced from eqlwiki.com's own Dragon Necropolis page
 * (action=raw), `File:map_dragon_necropolis1.jpg` -- resolves to a live,
 * non-broken upload. No numbered legend accompanies this image on the
 * source page, so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:dragon-necropolis");
if (!zone) throw new Error("zone:dragon-necropolis not found");

zone.maps = [
  {
    label: null,
    image: "dragon-necropolis.jpg",
    legend: [],
  },
];

save();
console.log("Migration 333 complete: maps set on zone:dragon-necropolis");
