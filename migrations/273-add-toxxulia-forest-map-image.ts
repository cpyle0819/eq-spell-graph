/**
 * Migration 273: add `maps` to zone:toxxulia-forest, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/toxxulia-forest.jpg` downloaded from eqlwiki.com's own
 * /images/4/45/Toxxulia.jpg. Legend transcribed verbatim from the numbered
 * list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:toxxulia-forest");
if (!zone) throw new Error("zone:toxxulia-forest not found");

zone.data.maps = [
  {
    label: null,
    image: "toxxulia-forest.jpg",
    legend: [
      { key: "1", label: "Wizard Hut: Books including On Languages and Lexicon, also Throwing Daggers and Blacksmithing Books and Molds" },
      { key: "2", label: "Bags" },
      { key: "3", label: "Enchanter's Hut: Books, Tiny Daggers, Gems, Gold Robes, also Cooking supplies" },
      { key: "4", label: "Magician's Hut: Books, Gems/Components, Blue Robes" },
      { key: "5", label: "Druid Ring with NPC selling the Succor and Circle Of spells" },
      { key: "6", label: "Abandoned Necromancer's Hut" },
      { key: "7", label: "Western Dock" },
      { key: "8", label: "Kobold Camp" },
      { key: "9", label: "Wizard Spires" },
      { key: "10", label: "Kobold Camp" },
      { key: "11", label: "Rungupp" },
    ],
  },
];

save();
console.log("Migration 273 complete: maps set on zone:toxxulia-forest");
