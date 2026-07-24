/**
 * Migration 222: add `maps` to zone:high-keep, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's High Keep page is a five-floor dungeon-castle, more floors
 * than any zone sourced so far (previous max was Blackburrow's 3):
 * Basement, Main Level, Second Floor, Third Floor, Fourth Floor, each its
 * own image (`highkeepbasement.png`, `highkeepfirstlevel.png`,
 * `highkeepseocondlevel.png` [sic, kept the wiki's own typo'd filename],
 * `highkeepthirdlevel.png`, `highkeepfourthlevel.png`). Basement and Main
 * Level share one numbered legend list on the wiki page (1-10 Basement,
 * 11-17 Main Level) -- split here into two per-floor legends. The "Upper
 * Levels" table groups all three remaining floors under one combined
 * heading with a single numbered list (1-7), but every item in that list
 * describes a room from the zone's own "second floor" leveling-guide prose
 * (Kitchen, Gambling Room, Tearon's Skeleton, Dulcyna Blackhand, Tyrana
 * Slil/Princess Lenya, Mistress Anna) -- so that legend belongs to Second
 * Floor alone. Third Floor and Fourth Floor get their own map image but no
 * numbered legend from eqlwiki.com at all (only unnumbered prose in the
 * "Guard Placement and Leveling Guide" section), so those two floors carry
 * an empty legend rather than a guessed one.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:high-keep");
if (!zone) throw new Error("zone:high-keep not found");

zone.data.maps = [
  {
    label: "Basement",
    image: "high-keep-basement.png",
    legend: [
      { key: "1", label: "Pickclaw Goblin Room (with Guards), room to north is Lookout Room" },
      { key: "2", label: "Torture Room" },
      { key: "3", label: "Princess Lenia" },
      { key: "4", label: "Prison Cells with Prisoners" },
      { key: "5", label: "Pickclaw Warrior Room" },
      { key: "6", label: "Pickclaw Raider and Seer Room" },
      { key: "7", label: "Bank" },
      { key: "8", label: "Merchant who sells anything" },
      { key: "9", label: "Merchant who sells anything" },
      { key: "10", label: "Prison with Prisoner" },
    ],
  },
  {
    label: "Main Level",
    image: "high-keep-main-level.png",
    legend: [
      { key: "11", label: "Bard for Mail Delivery" },
      { key: "12", label: "Captain Boshinko" },
      { key: "13", label: "Bard selling Bard songs and Enchanter selling Enchanter Summoning spells" },
      { key: "14", label: "Locked Room" },
      { key: "15", label: "Inn, Clerk sells Brewing Supplies" },
      { key: "16", label: "Merchant selling Gemstones" },
      { key: "17", label: "Wizard Trainer" },
    ],
  },
  {
    label: "Second Floor",
    image: "high-keep-second-floor.png",
    legend: [
      { key: "1", label: "Kitchen with Merchant (Baker Jena) selling Baking Supplies, Oven and Brew Barrel" },
      { key: "2", label: "Gambling Room, Merchant selling Brewing Supplies" },
      { key: "3", label: "Locked Room with Tearon's Skeleton, get key in quest" },
      { key: "4", label: "Room with Dulcyna Blackhand" },
      { key: "5", label: "Room with Tyrana Slil, and Princess Lenya" },
      { key: "6", label: "Room with Mistress Anna" },
      { key: "7", label: "Locked Room" },
    ],
  },
  {
    label: "Third Floor",
    image: "high-keep-third-floor.png",
    legend: [],
  },
  {
    label: "Fourth Floor",
    image: "high-keep-fourth-floor.png",
    legend: [],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 222 complete: maps set on zone:high-keep");
