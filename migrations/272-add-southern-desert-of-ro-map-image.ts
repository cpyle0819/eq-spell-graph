/**
 * Migration 272: add `maps` to zone:southern-desert-of-ro, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * `public/maps/southern-desert-of-ro.jpg` downloaded from eqlwiki.com's own
 * /images/d/d6/Zone_southro.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:southern-desert-of-ro");
if (!zone) throw new Error("zone:southern-desert-of-ro not found");

zone.data.maps = [
  {
    label: null,
    image: "southern-desert-of-ro.jpg",
    legend: [
      { key: "1", label: "Home of Ortallius and Rathmana Allin" },
      { key: "2", label: "Evil Merchants selling Pottery Supplies (all), Combine Weapons" },
      { key: "3", label: "Dervish Camp" },
      { key: "4", label: "Ruined Temple" },
      { key: "5", label: "Dervish Camp" },
      { key: "6", label: "Orc Town" },
      { key: "7", label: "Orc Camp" },
      { key: "8", label: "Wizard Portal" },
      { key: "9", label: "Orc Camp" },
      { key: "10", label: "Orc Camp" },
      { key: "11", label: "Orc Camp" },
      { key: "12", label: "Orc Camp" },
      { key: "13", label: "Druid Circle" },
      { key: "14", label: "Orc Camp" },
    ],
  },
];

save();
console.log("Migration 272 complete: maps set on zone:southern-desert-of-ro");
