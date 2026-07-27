/**
 * Migration 313: add `maps` to zone:temple-of-veeshan -- see issue #36.
 *
 * `public/maps/temple-of-veeshan.png` downloaded from eqlwiki.com's own
 * `File:Map tov.png`. The page's own "Map Location Key" section links
 * three more supplementary images (a Halls of Testing sub-map, a "3D"
 * map, an area-name reference), none with a numbered legend -- same
 * "alternate cartographer renderings, not separate floors" call as Plane
 * of Fear/Skyshrine, so only the primary map was added. No numbered POI
 * legend exists on the source page at all, so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:temple-of-veeshan");
if (!zone) throw new Error("zone:temple-of-veeshan not found");

zone.maps = [
  {
    label: null,
    image: "temple-of-veeshan.png",
    legend: [],
  },
];

save();
console.log("Migration 313 complete: maps set on zone:temple-of-veeshan");
