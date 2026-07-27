/**
 * Migration 303: add `maps` to zone:skyshrine -- see issue #36.
 *
 * `public/maps/skyshrine.jpg` downloaded from eqlwiki.com's own
 * `File:SkyshrineMapsCity.jpg` -- the zone's own page explicitly says
 * this covers "the city section only" and points to a "Skyshrine maps"
 * page for the rest of the zone, but that page doesn't exist on
 * eqlwiki.com (confirmed via the MediaWiki API). No numbered legend
 * accompanies this image on the source page, so the legend is empty.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:skyshrine");
if (!zone) throw new Error("zone:skyshrine not found");

zone.maps = [
  {
    label: "City",
    image: "skyshrine.jpg",
    legend: [],
  },
];

save();
console.log("Migration 303 complete: maps set on zone:skyshrine");
