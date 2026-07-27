/**
 * Migration 287: add `maps` to zone:stonebrunt-mountains -- see issue #36.
 *
 * `public/maps/stonebrunt-mountains.jpg` downloaded from eqlwiki.com's own
 * `File:Map stonebrunt mountains.jpg`. Legend transcribed verbatim from the
 * bulleted list under the map; the two un-numbered trailing notes (spirit
 * location, Warrens entrance) got keys 5/6 to keep them addressable, since
 * the source only numbers its first four points.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:stonebrunt-mountains");
if (!zone) throw new Error("zone:stonebrunt-mountains not found");

zone.maps = [
  {
    label: null,
    image: "stonebrunt-mountains.jpg",
    legend: [
      { key: "1", label: "Highland Kobold Camps" },
      { key: "2", label: "Town of Kejek, with Merchants selling Weapon Molds, Ore, Clay, Smithing Hammers, Pottery Equipment, and Baking Supplies, and Oven, Kiln, Pottery Wheel, and Forge (1350, 1025)" },
      { key: "3", label: "Kobold Camps (Southeastern camp is empty)" },
      { key: "4", label: "Dock with Kejekan Fishermen" },
      { key: "5", label: "A spirit is located at 470, -39" },
      { key: "6", label: "Entrance to the Warrens is located at -3880, 2967" },
    ],
  },
];

save();
console.log("Migration 287 complete: maps set on zone:stonebrunt-mountains");
