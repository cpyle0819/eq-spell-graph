/**
 * Migration 332: add `maps` to zone:dreadlands -- see issue #41 audit.
 *
 * Two sections sourced from eqlwiki.com's own Dreadlands page (action=raw)
 * under "Map": `File:map_dreadlands.jpg` (the main zone) and
 * `File:map_dreadlandsvalley.jpg` (Lost Valley) -- both resolve to live,
 * non-broken uploads. Legend transcribed from the page's own numbered list
 * for each section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:dreadlands");
if (!zone) throw new Error("zone:dreadlands not found");

zone.maps = [
  {
    label: "The Dreadlands",
    image: "dreadlands.jpg",
    legend: [
      { key: "1", label: "Tundra Yeti Caves (2098, 5050)" },
      { key: "2", label: "Mountain Giant Hut" },
      { key: "3", label: "Mountain Giant Hut" },
      { key: "4", label: "Drachnid Widow Web" },
      { key: "5", label: "Haunted Ruins" },
      { key: "6", label: "Empty Ruins" },
      { key: "7", label: "Glacier Yeti Caves" },
      { key: "8", label: "Mountain Giant Outpost with a mountain giant patriarch who drops Giant Sized Monocle (Warrior Epic)" },
      { key: "9", label: "Tundra Yeti Caves (-2346, 3502)" },
      { key: "10", label: "Mountain Giant Hut" },
      { key: "11", label: "Drachnid Widow Web" },
      { key: "12", label: "Drachnid Widow Web" },
    ],
  },
  {
    label: "Lost Valley",
    image: "dreadlands-lost-valley.jpg",
    legend: [
      { key: "1", label: "Wizard Portal Spires" },
      { key: "2", label: "Druid Portal Ring" },
      { key: "3", label: "Ancient Combine Outpost" },
    ],
  },
];

save();
console.log("Migration 332 complete: maps set on zone:dreadlands");
