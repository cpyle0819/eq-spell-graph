/**
 * Migration 193: add `maps` to zone:temple-of-cazic-thule, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * Cazic Thule is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like Najena/Solusek's Eye/Kedge Keep/Mistmoore
 * Castle before it, turned out to have a real eqlwiki.com page ("Cazic
 * Thule (Zone)", reached via a "Temple of Cazic Thule" redirect). Four
 * `public/maps/temple-of-cazic-thule-*.jpg` images downloaded from eqlwiki's
 * own File:Ct.jpg / Ctlower.jpg / Ctcydetail.jpg / Ctmaze.jpg, one per
 * labeled sub-area the page's "== Map ==" section breaks the zone into.
 * Legend entries transcribed verbatim from each sub-section's numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:temple-of-cazic-thule");
if (!zone) throw new Error("zone:temple-of-cazic-thule not found");

zone.data.maps = [
  {
    label: "Main Level",
    image: "temple-of-cazic-thule-main.jpg",
    legend: [
      { key: "1", label: 'Avatar of Fear Pyramid - top of pyramid spawns high level lizards, including Silvered Guards and A Lizard Crusader, middle level is water-filled, bottom level is the green "gumdrop" with the AoF. You can fall between the levels.' },
      { key: "2", label: "Archon Pyramid - any level spawns A Lizard Crusader which drops decayed armor for Darkforge Armor Quests, top room spawns Tae Ew Archon which drops Lizardscale Belt (common) and Ravenscale Armguards (rare)." },
      { key: "3", label: 'Throne Room or "TR"' },
      { key: "4", label: 'Courtyard or "CY"' },
    ],
  },
  {
    label: "Lower Levels",
    image: "temple-of-cazic-thule-lower.jpg",
    legend: [
      { key: "1", label: 'Avatar Room or "AoF" - lowest level of Avatar Pyramid, where Avatar of Fear spawns (drops Bladed Thulian Claws (common), Ravenscale Chestguard (rare)), guarded by 4 lizards, one a ph for Cazic Cenobite (drops Lizard Blood Potion (common), Ravenscale Boots (rare))' },
      { key: "2", label: '"Sewers" - various lizards and gators; also the route out from the Archon camp if you fall' },
      { key: "3", label: '"Gator Pit" - a steel golem spawns underwater here, drops Golem Metal Wand (common) and Ravenscale Gloves (rare); many gators, also known as Cazic Thule Alligator Alley/Pit' },
    ],
  },
  {
    label: "Courtyard",
    image: "temple-of-cazic-thule-courtyard.jpg",
    legend: [
      { key: "1", label: 'Throne Room or "TR" - Tae Ew Templar on the throne (drops Lizardscale Cloak (common), Ravenscale Leggings (rare)) and Tae Ew Diviner in a corner (drops Lizardscale Mantle (common), Ravenscale Bracer (rare))' },
      { key: "2", label: 'Stone Golem Room or "Stone" - spawns a stone golem (drops Shard of Golem Stone (common), Ravenscale Coif (rare)) and A Lizard Crusader' },
      { key: "3", label: "Tunnel goes to second (middle) level of Avatar Pyramid" },
      { key: "4", label: "Tunnel goes to first (top) level of Avatar Pyramid" },
      { key: "5", label: "Water tunnel drops down to the Sewers below - main route to the Avatar of Fear room" },
      { key: "6", label: 'Courtyard or "CY"' },
      { key: "7", label: "To the Maze" },
      { key: "8", label: "Water tunnel drops down to the Gator Pit below" },
    ],
  },
  {
    label: "Maze",
    image: "temple-of-cazic-thule-maze.jpg",
    legend: [
      { key: "1", label: "Wizard Pyramid - port here with Wizard spell or Lizard Blood Potion" },
      { key: "2", label: "a clay golem spawns here (drops Ball of Golem Clay (common), Lizardskin Tribal Mask (rare)) and wanders the maze; Radiant also spawns in the Maze, drops gloves for an Enchanter quest" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 193 complete: maps set on zone:temple-of-cazic-thule");
