/**
 * Migration 185: add `maps` to zone:najena, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 * Zone connectivity for this dungeon was sourced from wiki.project1999.com
 * (decisions/dungeon-zones-use-p1999-not-eqlwiki.md), but eqlwiki.com turns
 * out to have its own Najena page after all -- same as Befallen/Blackburrow
 * -- so the map/bestiary themselves are sourced from there.
 *
 * `public/maps/najena.jpg` downloaded from eqlwiki.com's own
 * /images/b/b1/Najenamap.jpg. Legend transcribed verbatim from the
 * numbered list under the map; the "Order to obtain keys" list underneath
 * is a walkthrough, not a distinct legend entry, so it's omitted.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:najena");
if (!zone) throw new Error("zone:najena not found");

zone.data.maps = [
  {
    label: null,
    image: "najena.jpg",
    legend: [
      { key: "1", label: "Entry Room with Tentacle Terrors" },
      { key: "1.5", label: "Left of #1 in the dead end room. Unbound Flame" },
      { key: "2", label: "Najena's Room with Najena, who drops Flowing Black Robe (Common), Clawed Knuckle-Ring (Rare), and Black Tome with Silver Runes (Rare)" },
      { key: "3", label: "Torture Rooms" },
      { key: "4", label: "Crystal Room" },
      { key: "5", label: "Drelzna's Room with Drelzna, who drops Stiletto of the Bloodclaw, Earring of Disease Reflection (Common), Ashenwood Short Spear (Rare), and Golden Crescent Key to #2" },
      { key: "6", label: "Pit Traps (marked with X) to room 10 below" },
      { key: "7", label: "Magician's Lair, Trazdon's Room with Trazdon, who drops Dark Circlet" },
      { key: "8", label: "Bonecracker's Room with BoneCracker, who drops Band of Flesh (Common), Barbed Leather Whip (Rare), Leering Mask (Rare), and Dull Bone Key to #11" },
      { key: "9", label: "Ogre Captain's Room with The Guard Captain, who drops Ogre War Maul and Shiny Metal Key, and nearby Officer Grush, who drops Dull Wooden Spear, and A Visiting Priestess" },
      { key: "10", label: "Prison with Linara Parlone and An Injured Halfling in cell; Moosh wanders here" },
      { key: "11", label: "Rathyl's Room with Rathyl, who drops Travelers Pouch (Common), Travelers Pack (Rare), and Bloodstained Key to #5, and Rathyl reincarnate, who drops Hollowed Bone Bracers; Ekeros, who drops Blackened Sapphire, appears outside" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 185 complete: maps set on zone:najena");
