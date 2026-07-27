/**
 * Migration 316: add `maps` to zone:great-divide -- see issue #36.
 *
 * eqlwiki.com's own File:Map great divide.jpg upload is broken; same
 * user-approved P1999 exception as migration 315 (decisions/eqlwiki-
 * broken-map-images.md). `public/maps/great-divide.jpg` downloaded from
 * wiki.project1999.com's own File:Map_great_divide.jpg. Legend transcribed
 * verbatim (wiki markup stripped) from that page's own "Map" section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:great-divide");
if (!zone) throw new Error("zone:great-divide not found");

zone.maps = [
  {
    label: null,
    image: "great-divide.jpg",
    legend: [
      { key: "1", label: "Tizmak Caverns" },
      { key: "2", label: "Inactive Wizard Spires (NOT Wizard port-in; see Dragon Portal #4)" },
      { key: "3", label: "Frost Giant Fort with Gralk Dwarfkiller and Fergul Frostsky" },
      { key: "4", label: "Dragon Portal / Druid & Wizard port-in" },
      { key: "5", label: "Shardwurm Caverns, Guardian Shardwurms and Shardwurm Broodmother in one room, Crystalline Wurms and Shardwurm Matriarch in the largest cavern" },
      { key: "6", label: "Caverns with Coldain Smuggler" },
      { key: "7", label: "Kodiak Bear Caves with Bloodmaw" },
      { key: "8", label: "Kodiak Bear Caves with Icetooth" },
      { key: "9", label: "Captain's Camp" },
      { key: "10", label: "Coldain Velium Mines with Relik and Korf Brokenhammer" },
      { key: "11", label: "Camp of Vores the Hunter" },
    ],
  },
];

save();
console.log("Migration 316 complete: maps set on zone:great-divide");
