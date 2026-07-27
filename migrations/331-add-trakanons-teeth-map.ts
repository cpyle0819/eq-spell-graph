/**
 * Migration 331: add `maps` to zone:trakanon-s-teeth -- see issue #41 audit.
 *
 * Single map sourced from eqlwiki.com's own Trakanon's Teeth page
 * (action=raw), `File:map_trakanonsteeth.jpg` -- resolves to a live,
 * non-broken upload. Legend transcribed from the page's own numbered list.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:trakanon-s-teeth");
if (!zone) throw new Error("zone:trakanon-s-teeth not found");

zone.maps = [
  {
    label: null,
    image: "trakanons-teeth.jpg",
    legend: [
      { key: "1", label: "Ruins with Spectral Keepers" },
      { key: "2", label: "Ruin with Frogloks" },
      { key: "3", label: "Empty Ruins" },
      { key: "4", label: "Mausoleums with Spectral Keepers" },
      { key: "5", label: "Mausoleum with Emperor Ganak" },
      { key: "6", label: "Camps of Iksar Treasure Hunters" },
      { key: "7", label: "Ruins of Sebilis" },
      { key: "8", label: "Portal to the Ruins of Old Sebilis (-2055, -4450)" },
    ],
  },
];

save();
console.log("Migration 331 complete: maps set on zone:trakanon-s-teeth");
