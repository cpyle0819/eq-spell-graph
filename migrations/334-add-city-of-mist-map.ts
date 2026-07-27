/**
 * Migration 334: add `maps` to zone:city-of-mist -- see issue #41 audit.
 *
 * Single map sourced from eqlwiki.com's own City of Mist page (action=raw),
 * `File:map_citymist.jpg` -- resolves to a live, non-broken upload. Legend
 * transcribed from the page's own numbered walkthrough.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:city-of-mist");
if (!zone) throw new Error("zone:city-of-mist not found");

zone.maps = [
  {
    label: null,
    image: "city-of-mist.jpg",
    legend: [
      { key: "1", label: "Castle surrounded by the \"Moat\" with black reavers and Lord Ghiosk who drops Mace of the Shadowed Soul; upstairs after the lift is Lord Rak`Ashiir who drops Atramentous Shield and Ornate Rune Blade (front door is locked, need a Rogue to open)" },
      { key: "2", label: "Office with Lhranc" },
      { key: "3", label: "\"Goo House\" -- arena with a PvP area" },
      { key: "4", label: "\"Temple\"" },
      { key: "5", label: "\"Bridge\"" },
      { key: "6", label: "\"Stables\" with spectral courier in the western half" },
      { key: "7", label: "First Platform" },
      { key: "8", label: "Second Platform with a locked door" },
      { key: "9", label: "Final Platform with Neh`Ashiir who drops Ornate Rune Shield, Torch of the Elements and Woodsman's Staff" },
    ],
  },
];

save();
console.log("Migration 334 complete: maps set on zone:city-of-mist");
