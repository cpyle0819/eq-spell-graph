/**
 * Migration 168: add `maps` to zone:field-of-bone, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/field-of-bone.jpg` and `public/maps/field-of-bone-sub-areas.jpg`
 * downloaded from eqlwiki.com's own /images/c/cd/Map_fieldofbone.jpg and
 * /images/9/9d/Map_fieldsubmap1.jpg. Legends transcribed verbatim from the
 * numbered/lettered lists under each map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:field-of-bone");
if (!zone) throw new Error("zone:field-of-bone not found");

zone.data.maps = [
  {
    label: null,
    image: "field-of-bone.jpg",
    legend: [
      { key: "1", label: "Island with The Tangrin" },
      { key: "2", label: "Pass through the Cliffs" },
      { key: "3", label: "Kurn's Tower" },
      { key: "4", label: '"The Pit"' },
      { key: "5", label: "Cabilis Outpost ruins - Merchants selling Patch Hide Armor, Newbie Weapons, Survival Gear, and Food Items" },
      { key: "6", label: "Kaesora ruins and bind point" },
      { key: "7", label: "Entrance to Kaesora" },
      { key: "B", label: "Entrance to undead tunnels, marked by pillar above water" },
      { key: "C", label: "Entrance to Abandoned Crypt" },
      { key: "D", label: "Entrance to Bonebinder Warrens" },
    ],
  },
  {
    label: "Sub Areas",
    image: "field-of-bone-sub-areas.jpg",
    legend: [
      { key: "A", label: "Entrance to Marauder's Hideout with Kerosh Blackhand" },
      { key: "B", label: "Entrance to Sythrax's Temple with Gharg Oberbord" },
      { key: "C", label: "Entrance to Abandoned Crypt" },
      { key: "D", label: "Entrance to Bonebinder Warrens" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 168 complete: maps set on zone:field-of-bone");
