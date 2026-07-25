/**
 * Migration 254: add `maps` to zone:nektulos-forest, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/nektulos-forest.jpg` downloaded from eqlwiki.com's own
 * /images/8/8e/Map_nektulos.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:nektulos-forest");
if (!zone) throw new Error("zone:nektulos-forest not found");

zone.data.maps = [
  {
    label: null,
    image: "nektulos-forest.jpg",
    legend: [
      { key: "1", label: "Newbie Area" },
      { key: "2", label: "Halfling Ruins" },
      { key: "3", label: "Wizard Teleport with Undead" },
      { key: "4", label: "Halfling Druid Temple" },
      { key: "5", label: "Ruined Obelisk with Shadow Men" },
      { key: "6", label: "Halfling Camp" },
      { key: "7", label: "Obelisk with Undead" },
    ],
  },
];

save();
console.log("Migration 254 complete: maps set on zone:nektulos-forest");
