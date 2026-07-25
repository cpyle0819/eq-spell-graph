/**
 * Migration 241: add `maps` to zone:qeynos-hills, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/qeynos-hills.jpg` downloaded from eqlwiki.com's own
 * /images/2/22/Qeynoshills.jpg (Qeynos Hills has its own dedicated page,
 * not part of the combined Qeynos page). Legend transcribed verbatim from
 * the numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:qeynos-hills");
if (!zone) throw new Error("zone:qeynos-hills not found");

zone.data.maps = [
  {
    label: null,
    image: "qeynos-hills.jpg",
    legend: [
      { key: "1", label: "The Millers' Fire" },
      { key: "2", label: "The Haunted Ruins" },
      { key: "3", label: "Hadden (6 hour Respawn) - chance to drop Fishbone Earring" },
      { key: "4", label: "Hut which sells Smithing Books, Medium Armor Molds, Sectional Molds, and other smithing Molds, Sheet Metal" },
      { key: "5", label: "Guard Tower" },
    ],
  },
];

save();
console.log("Migration 241 complete: maps set on zone:qeynos-hills");
