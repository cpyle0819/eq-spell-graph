/**
 * Migration 203: add `maps` to zone:splitpaw, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * Splitpaw is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page -- under the title "Splitpaw Lair"
 * ("Splitpaw" itself is a `#REDIRECT`). `public/maps/splitpaw.png`
 * downloaded from eqlwiki's own File:Splitpaw_Map.png -- the page's single
 * "== Map ==" image, with a legend transcribed verbatim (wiki markup
 * stripped) from its numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:splitpaw");
if (!zone) throw new Error("zone:splitpaw not found");

zone.data.maps = [
  {
    label: null,
    image: "splitpaw.png",
    legend: [
      { key: "1", label: "Tesch Val Deval'Nmak who drops Kicsh Der Pavz (Rare)" },
      { key: "2", label: "Rosch Val L'Vlor who drops Gnoll Hide Tome (Rare)" },
      { key: "3", label: "Gnoll Verishe Mal Judges and Verishe Mal Executioner; Kurrpok Splitpaw spawns here as well, executed quickly" },
      { key: "4", label: "Nisch Val Torash Mashk who drops Devlas Ilkvel (Rare) and Tesch Val Sinisch (Ultra Rare)" },
      { key: "5", label: "Underwater secret tunnel leads to 8" },
      { key: "6", label: "Prison with the Brother Hayle" },
      { key: "7", label: "Tesch Val Kadvem who drops Vacra Av Svim (Rare)" },
      { key: "8", label: "The Ishva Mal who drops Scroll: Summon Corpse (Common), Brain of the Ishva Mal (Common), and Robe of the Ishva (Rare)" },
      { key: "9", label: "(1150, -180) Small safe room located directly north of number four. Stay out of the doorway." },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 203 complete: maps set on zone:splitpaw");
