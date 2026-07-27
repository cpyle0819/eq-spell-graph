/**
 * Migration 297: add `maps` to zone:western-wastes -- see issue #36.
 *
 * `public/maps/western-wastes.jpg` downloaded from eqlwiki.com's own
 * `File:Westernwastes.jpg`. Legend transcribed verbatim from the numbered
 * list under the map (just two points -- most of this zone's content is
 * roaming dragons, not fixed camps).
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:western-wastes");
if (!zone) throw new Error("zone:western-wastes not found");

zone.maps = [
  {
    label: null,
    image: "western-wastes.jpg",
    legend: [
      { key: "1", label: "Sunken Gnomish Boat" },
      { key: "2", label: "Wyvern Caves" },
    ],
  },
];

save();
console.log("Migration 297 complete: maps set on zone:western-wastes");
