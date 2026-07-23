/**
 * Migration 183: add `maps` to zone:lake-rathetear, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/lake-rathetear.jpg` downloaded from eqlwiki.com's own
 * /images/b/b4/Map_lakerathetear.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:lake-rathetear");
if (!zone) throw new Error("zone:lake-rathetear not found");

zone.data.maps = [
  {
    label: null,
    image: "lake-rathetear.jpg",
    legend: [
      { key: "1", label: "Guards and Abandoned Tower" },
      { key: "2", label: "Gnoll and Undead Camp (undead spawn at 8pm and despawn at 6am, replaced by low-level, generic gnolls)" },
      { key: "3", label: "Couple in Hut Turgan and Jorna, and Shmendrik Lavawalker, part of Cleric Epic" },
      { key: "4", label: "Orc Camp and Barbarian Gathering" },
      { key: "5", label: "Bandit Camp" },
      { key: "6", label: "Ogre Camp, Ogre Merchant who sells Food and Goods" },
      { key: "7", label: "Bandit Camp" },
      { key: "8", label: "Tower with Stone Skeletons and pets, Kazen Fecae" },
      { key: "9", label: "Gypsy Camp selling Alcohol, Containers, Food and Miscellaneous Items" },
      { key: "10", label: 'The "Friendly" Hermit' },
      { key: "11", label: "Aviak Lookout Tower" },
      { key: "12", label: "Barbarian Village with nearby Temple, also Shaman Armor Quests" },
      { key: "13", label: "Aviak Lookout Towers" },
      { key: "14", label: "The Aviak Ladder and spawn spot of Webclaw Murkwave, has underwater cavern with two entrances with Aqua Goblin tower in the center of it, connects to tunnel under #15, tower is where Deep and Lord Bergurgle are" },
      { key: "15", label: "Tower with silent spellcasters, has underwater cavern with two entrances with Aqua Goblin tower in the center of it, connects to tunnel under #14. Eldreth for the Rogue Epic can also be found here." },
      { key: "16", label: "Aviak Lookout Tower" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 183 complete: maps set on zone:lake-rathetear");
