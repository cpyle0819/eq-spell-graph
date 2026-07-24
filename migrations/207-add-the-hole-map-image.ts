/**
 * Migration 207: add `maps` to zone:the-hole, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * The Hole is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page with a direct title match.
 * `public/maps/the-hole.jpg` downloaded from eqlwiki's own
 * File:Map_thehole.jpg -- the page's single "== Map ==" image, with a
 * legend transcribed verbatim (wiki markup stripped) from its numbered
 * list. The page's own note ("all the lettered areas connect to the
 * corresponding lettered area on the breakout map") refers to a second,
 * external (non-eqlwiki) preservation map linked under "Additional Maps",
 * not a second eqlwiki image -- skipped, same as this decision's precedent
 * for not substituting outside sources for eqlwiki's own map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:the-hole");
if (!zone) throw new Error("zone:the-hole not found");

zone.data.maps = [
  {
    label: null,
    image: "the-hole.jpg",
    legend: [
      { key: "1", label: "West Tower" },
      { key: "2", label: "East Tower with Ghost of Kindle" },
      { key: "3", label: "Room with High Scale Kirn who drops Engraved Ring" },
      { key: "4", label: "West Graveyard with Keeper of the Tombs, entrance to crypt" },
      { key: "5", label: "East Graveyard" },
      { key: "6", label: "Courtyard" },
      { key: "7", label: "Master Yael (Raid Instance Only) who drops Brell's Girdle, Earthshaker, Loam Encrusted Robe, and Serpent's Tooth. Nortlav the Scalekeeper is also here who drops Red Dragon Scales" },
      { key: "8", label: "Pool with Jaeil the Wretched" },
      { key: "9", label: "Room with Kejar the Mighty and Schnozz the Flighty" },
      { key: "10", label: "Observation Room (not sure why it's on the map, nothing of significance)" },
      { key: "11", label: "Secret Vault with Mimics" },
      { key: "12", label: "Mushroom Cellar with Polzin Mrid" },
      { key: "13", label: "Jail Cell with Slizik the Mighty who drops Idol of the Underking" },
      { key: "14", label: "Jail Cell with Caradon" },
      { key: "15", label: "Entry Observation Tower with locked door on east end -- The Hole Key does NOT open it" },
      { key: "16", label: "Zone Out Room" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 207 complete: maps set on zone:the-hole");
