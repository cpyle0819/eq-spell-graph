/**
 * Migration 295: add `maps` to zone:swamp-of-no-hope -- see issue #36.
 *
 * `public/maps/swamp-of-no-hope.jpg` downloaded from eqlwiki.com's own
 * `File:Map swampofnohope.jpg`. Legend transcribed verbatim from the
 * numbered list under the map (items 1-8).
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:swamp-of-no-hope");
if (!zone) throw new Error("zone:swamp-of-no-hope not found");

zone.maps = [
  {
    label: null,
    image: "swamp-of-no-hope.jpg",
    legend: [
      { key: "1", label: "Ruined Tower -- contains Ssessthrass, for Necromancer epic" },
      { key: "2", label: "Cabilis Outpost Ruins -- Merchants selling Patch Hide Armor, Newbie Weapons, Survival Gear, and Food Items" },
      { key: "3", label: "Outcast Iksar Camp" },
      { key: "4", label: "Outcast Iksar Hideout" },
      { key: "5", label: "Froglok Temple (Dugroz spawns nearby)" },
      { key: "6", label: "\"Frogtown\" -- Froglok Village" },
      { key: "7", label: "\"The Ramp\" -- only entrance to Froglok Village" },
      { key: "8", label: "Haunted Ruins" },
    ],
  },
];

save();
console.log("Migration 295 complete: maps set on zone:swamp-of-no-hope");
