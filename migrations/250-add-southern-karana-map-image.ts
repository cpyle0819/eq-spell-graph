/**
 * Migration 250: add `maps` to zone:southern-karana, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/southern-karana.jpg` downloaded from eqlwiki.com's own
 * /images/e/e0/Zone_southkarana.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:southern-karana");
if (!zone) throw new Error("zone:southern-karana not found");

zone.data.maps = [
  {
    label: null,
    image: "southern-karana.jpg",
    legend: [
      { key: "1", label: "Undead Ruins with Lord Grimrot" },
      { key: "2", label: "Treants" },
      { key: "3", label: "Vhalen Nostrolo's Well" },
      { key: "4", label: "Centaur Stables with Merchant selling Bowyer Supplies" },
      { key: "5", label: "Obelisk with Zombies and Skeletons" },
      { key: "6", label: "Entrance to Splitpaw Lair (-3280, +800)" },
      { key: "7", label: "Hermit House" },
      { key: "8", label: "Ruined Stone Ring" },
      { key: "9", label: "Aviak Town (AKA \"KFC\") with Merchant Krak Windchaser (Top of Bird House)" },
    ],
  },
];

save();
console.log("Migration 250 complete: maps set on zone:southern-karana");
