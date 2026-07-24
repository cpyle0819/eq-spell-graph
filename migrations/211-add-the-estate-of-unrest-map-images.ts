/**
 * Migration 211: add `maps` to zone:the-estate-of-unrest, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * The Estate of Unrest is on the P1999-dungeon list (decisions/dungeon-
 * zones-use-p1999-not-eqlwiki.md) but, like the last several dungeon
 * batches, turned out to have a real eqlwiki.com page with a direct title
 * match. Two map images: `public/maps/the-estate-of-unrest-grounds.jpg`
 * (eqlwiki's File:Unrest.jpg -- the outdoor estate grounds/first floor) and
 * `public/maps/the-estate-of-unrest-manor.jpg` (File:Unrestmanor.jpg -- the
 * manorhouse interior, second floor through basement). Legends transcribed
 * verbatim (wiki markup stripped) from each map's own numbered/lettered
 * list; the page's note "the lettered stairs lead to each other" ties the
 * two maps' lettered keys together but isn't itself a legend entry, so it's
 * omitted the same way Temple of Solusek Ro's floor-linking notes were.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:the-estate-of-unrest");
if (!zone) throw new Error("zone:the-estate-of-unrest not found");

zone.data.maps = [
  {
    label: "Grounds",
    image: "the-estate-of-unrest-grounds.jpg",
    legend: [
      { key: "1", label: "Underground cave with a gnomish spelunker" },
      { key: "2", label: "The Gazebo" },
      { key: "A", label: "Back Room area with the nearby rare spawn lesser blade fiend who drops Gladius (Rare) and Pugius (Rare)" },
      { key: "B", label: "To Basement" },
      { key: "C", label: "Main Room (MR), and stairs to second floor" },
    ],
  },
  {
    label: "Unrest Manor",
    image: "the-estate-of-unrest-manor.jpg",
    legend: [
      { key: "1", label: "Room that spawns reclusive ghoul magus who drops Savant's Cap (Common) and Dusty Bloodstained Gloves (Rare)" },
      { key: "2", label: "Barroom where an undead barkeep spawns, who drops Opalline Earring (Common) and Thick Leather Apron (Rare), and Zombie of an Unrest Noble" },
      { key: "3", label: "Room with a reanimated hand, which drops Ivory Bracelet" },
      { key: "4", label: "Tower that spawns a priest of najena, who drops Tarnished Bronze Key" },
      { key: "5", label: "Tower Room" },
      { key: "6", label: '"Tower" with an undead knight of Unrest, who drops Bloodstained Mantle (Common) and Bloodstained Tunic (Rare)' },
      { key: "7", label: "Main Basement Room, filled with Werebats and Festering Hags" },
      { key: "8", label: "Blood Trap -- be sure to walk through the lava, going around it will make you fall in pits" },
      { key: "9", label: '"Dwarf Room" with Garanel Rucksif, who drops Jagged Band (Common) and Dwarven Work Boots (Rare); also has Tentacle Terrors, who drop Tentacle Whip, and Dark Terrors' },
      { key: "A", label: 'Fireplace ("FP"), and stairs to first and second floors' },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 211 complete: maps set on zone:the-estate-of-unrest");
