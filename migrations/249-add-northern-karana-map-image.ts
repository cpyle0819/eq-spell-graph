/**
 * Migration 249: add `maps` to zone:northern-karana, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/northern-karana.jpg` downloaded from eqlwiki.com's own
 * /images/4/4d/Map_nkarana.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:northern-karana");
if (!zone) throw new Error("zone:northern-karana not found");

zone.data.maps = [
  {
    label: null,
    image: "northern-karana.jpg",
    legend: [
      { key: "1", label: "Hut with Alcohol" },
      { key: "2", label: "Area Patrolled by the Fangbreakers" },
      { key: "3", label: "Obelisk with named Treant nearby" },
      { key: "4", label: "Hut with Innkeepers selling Food and Goods" },
      { key: "5", label: "Empty farm" },
      { key: "6", label: "Gypsy Camp selling Combine Weapons, Alcohol, Food and Goods, Dreadlands Gate Spell, Bind Spot circa Mar 2001" },
      { key: "7", label: "Guard Tower" },
      { key: "8", label: "Farm with farmers" },
      { key: "9", label: "Farm with farmers" },
      { key: "10", label: "Druid Ring with Treants, Druid Trainer and merchant selling Druid Spells -2750,-1450" },
      { key: "11", label: "Wizard Teleportation Ring" },
      { key: "12", label: "Farm with farmers" },
      { key: "13", label: "Obelisk with Skeletons/Zombies/Ghouls" },
      { key: "14", label: "Raider Camp" },
    ],
  },
];

save();
console.log("Migration 249 complete: maps set on zone:northern-karana");
