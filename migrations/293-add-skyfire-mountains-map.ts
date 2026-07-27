/**
 * Migration 293: add `maps` to zone:skyfire-mountains -- see issue #36.
 *
 * `public/maps/skyfire-mountains.jpg` downloaded from eqlwiki.com's own
 * `File:Map skyfiremtns.jpg`. Legend transcribed verbatim from the
 * numbered list under the map (wrapped in a `{{VeliousGray}}` styling
 * template on the source page, unrelated to this zone's own Kunark era).
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:skyfire-mountains");
if (!zone) throw new Error("zone:skyfire-mountains not found");

zone.maps = [
  {
    label: null,
    image: "skyfire-mountains.jpg",
    legend: [
      { key: "1", label: "Dragon Fire Temple with Zordakilicus Ragefire" },
      { key: "2", label: "Dragon Globe Temple and Wind of the North (Druid) portal location" },
      { key: "3", label: "Dragon Graveyard and Tishan's Relocation (Wizard) portal location" },
      { key: "4", label: "Dragon Ice Temple" },
    ],
  },
];

save();
console.log("Migration 293 complete: maps set on zone:skyfire-mountains");
