/**
 * Migration 271: add `maps` to zone:northern-desert-of-ro, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * `public/maps/northern-desert-of-ro.jpg` downloaded from eqlwiki.com's own
 * /images/2/2b/Map_northro.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:northern-desert-of-ro");
if (!zone) throw new Error("zone:northern-desert-of-ro not found");

zone.data.maps = [
  {
    label: null,
    image: "northern-desert-of-ro.jpg",
    legend: [
      { key: "1", label: "Inn with Thimble and Needle Molds, Large Sewing Kit, Food and Alcohol" },
      { key: "2", label: "Empty Huts" },
      { key: "3", label: "Fishing Village selling Alchemy Supplies" },
      { key: "4", label: "Buried Pyramid (the \"platform\"; is a wizard spire)" },
      { key: "5", label: "Dervish Camp with Dorn B`Dynn - \"Derv Camp One\"" },
      { key: "6", label: "Haunted Ruins" },
      { key: "7", label: "Dervish Camp - \"Derv Camp Two\"" },
      { key: "8", label: "Ruins" },
      { key: "9", label: "Temple" },
      { key: "10", label: "Dervish Camp - \"Derv Camp Three\"" },
      { key: "11", label: "Pillar" },
      { key: "12", label: "Pillar" },
      { key: "13", label: "Ruins" },
      { key: "14", label: "Dock - Raft to Velious zones to Iceclad Ocean" },
    ],
  },
];

save();
console.log("Migration 271 complete: maps set on zone:northern-desert-of-ro");
