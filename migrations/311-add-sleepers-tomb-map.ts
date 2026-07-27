/**
 * Migration 311: add `maps` to zone:sleeper-s-tomb -- see issue #36.
 *
 * `public/maps/sleepers-tomb.jpg` downloaded from eqlwiki.com's own
 * `File:Map sleepers tomb.jpg`. No numbered legend accompanies this image
 * on the source page (its own Dangers/Benefits sections are still marked
 * "Additional info needed"), so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:sleeper-s-tomb");
if (!zone) throw new Error("zone:sleeper-s-tomb not found");

zone.maps = [
  {
    label: null,
    image: "sleepers-tomb.jpg",
    legend: [],
  },
];

save();
console.log("Migration 311 complete: maps set on zone:sleeper-s-tomb");
