/**
 * Migration 255: add `maps` to zone:the-feerrott, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/the-feerrott.jpg` downloaded from eqlwiki.com's own
 * /images/8/8b/Map_feerrott.jpg. Legend transcribed verbatim from the
 * numbered list under the map (the unnumbered "Levant location" line
 * dropped, same as every other zone's non-numbered map notes).
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:the-feerrott");
if (!zone) throw new Error("zone:the-feerrott not found");

zone.data.maps = [
  {
    label: null,
    image: "the-feerrott.jpg",
    legend: [
      { key: "1", label: "Lizard Man Camp" },
      { key: "2", label: "Innkeep Gub selling Food and Miscellaneous Items" },
      { key: "3", label: "Merchants with Bowyers Guide and Materials and Blacksmithing Books and Molds" },
      { key: "4", label: "Half Moon shaped Altar" },
      { key: "5", label: "Merchant with Cooking Supplies" },
      { key: "6", label: "Merchant with Large Sewing Kit and Tailoring Supplies" },
      { key: "7", label: "Druid Ring surrounded by Spiders" },
      { key: "8", label: "Roror (Lizard Man Shaman, High Priest of Cazic-Thule), will speak to good races, appears around this area" },
      { key: "9", label: "Spectres and Hidden Lair of Cyndreela, entrance to the Plane of Fear (Hidden Wall entrance at -1475,2690)" },
    ],
  },
];

save();
console.log("Migration 255 complete: maps set on zone:the-feerrott");
