/**
 * Migration 201: add `maps` to zone:permafrost, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * Permafrost is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page with a direct title match.
 * `public/maps/permafrost.jpg` downloaded from eqlwiki's own
 * File:Zone_permafrost.jpg -- the page's single "== Map ==" image, with a
 * legend transcribed verbatim (wiki markup stripped) from its numbered
 * list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:permafrost");
if (!zone) throw new Error("zone:permafrost not found");

zone.data.maps = [
  {
    label: null,
    image: "permafrost.jpg",
    legend: [
      { key: "1", label: "Lair of Lady Vox (see Raid Encounter page for drops)" },
      { key: "2", label: "Ice Giant Diplomat who drops Throwing Boulder, and Ice Goblin Champion who drops Crystalline Blade" },
      { key: "3", label: "King's Room -- King Thex'Ka IV (drops Symbol of Loyalty to Vox (Common), White Wolf-hide Cloak (Rare)), a goblin patriarch (drops Goblin Frost Totem), Elite Goblin Guards (drop Icy Greaves, Frost Goblin Skin), Elite Honor Guards (drop Silvery War Axe (Common), Silvery Two Handed Axe (Rare)), High Priest Zaharn (drops Zaharn's Coronet)" },
      { key: "4", label: "A Goblin Archeologist (Level 24-27) who drops Archeologist Pack (Common) and Dented Brass Mask (Rare)" },
      { key: "5", label: "Well that drops to sub-caverns shown at lower right" },
      { key: "6", label: "Goblin Preacher (Level 24) who drops Cold Iron Morning Star (Common) and Runed Circlet (Rare)" },
      { key: "7", label: '"Flag Room"' },
      { key: "8", label: "A goblin alchemist (Permafrost) (Level 27) who drops Mammoth Hide Leggings (Common) and Mammoth Hide Cloak (Rare)" },
      { key: "9", label: "Goblin Jail Master (Level 20) who drops Wooly Spider Silk Net (Common) and Etched Ivory Charm (Rare)" },
      { key: "10", label: "Goblin Scryer (Level 25) who drops Ice Crystal Staff (Common) and Wolf Fur Slippers (Rare)" },
      { key: "11", label: "An icy goblin (Level 24) who drops Book of Frost (Rare)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 201 complete: maps set on zone:permafrost");
