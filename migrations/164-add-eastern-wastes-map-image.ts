/**
 * Migration 164: add `maps` to zone:eastern-wastes, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/eastern-wastes.jpg` downloaded from eqlwiki.com's own
 * /images/2/24/Map_eastern_wastes.jpg. Legend transcribed verbatim from the
 * numbered list under the map on that page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:eastern-wastes");
if (!zone) throw new Error("zone:eastern-wastes not found");

zone.data.maps = [
  {
    label: null,
    image: "eastern-wastes.jpg",
    legend: [
      { key: "1", label: "Coldain Camp with Captain Berradin" },
      { key: "2", label: "Ruined Houses with Ry'Gorr and Giant Guards and Corbin Blackwell" },
      { key: "3", label: "Coldain Camp with Dobbin Crossaxe and Coldain Missionaries" },
      { key: "4", label: "Frost Giant Fortress with Fjloaren Icebane and Peffin Ambersnow, nearby Ekelng Thunderstone" },
      { key: "5", label: "Coldain Camp with Garadain Glacierbane" },
      { key: "6", label: "Ry'Gorr Keep with Chief Ry`Gorr, Oracle of Ry'Gorr, A blacksmith of Ry`Gorr, Firbrand the Black, and portal to Crystal Caverns, nearby is half-buried Tower with exit from Geonid part of Crystal Caverns with Rodrick Tardok and Ry'Gorr Emissary" },
      { key: "7", label: "Coldain Camp with Orcs" },
      { key: "8", label: "Great Span" },
      { key: "9", label: "Coldain Camp with IceFang and Korrigain" },
      { key: "10", label: "Kerafyrm's sleeping body with Portal to Sleeper's Tomb" },
      { key: "11", label: "Coldain Camp with Coldains and Loremaster Derrin" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 164 complete: maps set on zone:eastern-wastes");
