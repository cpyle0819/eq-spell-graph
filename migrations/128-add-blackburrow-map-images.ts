/**
 * Migration 128: add `maps` (multi-floor) to zone:blackburrow -- see issue
 * #36 and decisions/zone-multi-floor-maps.md.
 *
 * eqlwiki.com's Blackburrow page has one map image per floor:
 * public/maps/blackburrow-1.png (/images/d/dc/Zone_blackburrow1.png),
 * public/maps/blackburrow-2.png (/images/6/68/Zone_blackburrow2.png),
 * public/maps/blackburrow-3.png (/images/e/e5/Zone_blackburrow3.png).
 * Legends transcribed verbatim from the numbered lists under each floor's
 * map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:blackburrow");
if (!zone) throw new Error("zone:blackburrow not found");

zone.data.maps = [
  {
    label: "Floor One",
    image: "blackburrow-1.png",
    legend: [
      { key: "1", label: "Plague Rat storeroom with a giant plague rat" },
      { key: "2", label: "Sentry Lookout with Splitpaw Sentry" },
      { key: "3", label: "Hollowed Tree with false floor that drops to level 2" },
      { key: "4", label: "Tranixx Darkpaw spawn room (patrols between spawn point, Qeynos Hills zoneline, and Everfrost Peaks zoneline)" },
    ],
  },
  {
    label: "Floor Two",
    image: "blackburrow-2.png",
    legend: [
      { key: "1", label: "Snake Ledge with ladder down to level 3" },
      { key: "2", label: "Floor Spike Room with Sabertooth Clan Necromancer" },
      { key: "3", label: "Elite Gnoll Room with Mannan of the Sabertooth" },
      { key: "4", label: "Refugee's Nook with Refugee Splitpaw (Shaman)" },
      { key: "5", label: "High Shaman Room with the gnoll high shaman" },
      { key: "6", label: "Commander Room with a gnoll commander" },
      { key: "7", label: "Commander Lookout with Splitpaw Commander" },
      { key: "8", label: "Socho's Hide with Socho Darkpaw" },
    ],
  },
  {
    label: "Floor Three",
    image: "blackburrow-3.png",
    legend: [
      { key: "1", label: "Bridge Room (classic pull spot)" },
      { key: "2", label: "Overseer's Post with Sabertooth Overseer" },
      { key: "3", label: "Refugee's Hide with Refugee Splitpaw (Monk)" },
      { key: "4", label: "Brewer's Barrel Supply with Master Brewer and a gnoll brewer" },
      { key: "5", label: "Sharpshooter Ledge with Splitpaw Sharpshooter" },
      { key: "6", label: "Banner Room with Splitpaw Commander" },
      { key: "7", label: "Explorer's Alcove with Splitpaw Explorer" },
      { key: "8", label: "Snake Ledge with ladder up to level 2" },
      { key: "9", label: "Lord's Room with Lord Elgnub" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 128 complete: maps (3 floors) set on zone:blackburrow");
