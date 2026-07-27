/**
 * Migration 305: add `maps` to zone:plane-of-fear -- see issue #36.
 *
 * `public/maps/plane-of-fear.jpg` downloaded from eqlwiki.com's own
 * `File:Fearmap.jpg` (the page's main infobox map). The page's "Additional
 * Maps" section links three more images (golem locations, a terrain
 * overlay, an "Updated Fear Map") but none carry a numbered legend --
 * they're alternate cartographer renderings of this same single outdoor
 * zone, not separate floors, so only the primary map was added, same call
 * as Ocean of Tears' excluded mirrored "Alternate Map". This zone has no
 * numbered POI legend at all (a raid/planar zone organized around mob
 * tables, not fixed points of interest), so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:plane-of-fear");
if (!zone) throw new Error("zone:plane-of-fear not found");

zone.maps = [
  {
    label: null,
    image: "plane-of-fear.jpg",
    legend: [],
  },
];

save();
console.log("Migration 305 complete: maps set on zone:plane-of-fear");
