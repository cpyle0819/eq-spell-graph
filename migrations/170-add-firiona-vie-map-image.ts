/**
 * Migration 170: add `maps` to zone:firiona-vie, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/firiona-vie.jpg` and `public/maps/firiona-vie-docks.jpg`
 * downloaded from eqlwiki.com's own /images/e/eb/Map_firionavie.jpg and
 * /images/9/9c/Map_firionaviedocks.jpg. Legends transcribed verbatim from
 * the numbered/lettered lists under each map.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:firiona-vie");
if (!zone) throw new Error("zone:firiona-vie not found");

zone.data.maps = [
  {
    label: null,
    image: "firiona-vie.jpg",
    legend: [
      { key: "1", label: "Empty Ruins" },
      { key: "2", label: "Empty Camp" },
      { key: "3", label: "Ruins" },
      { key: "4", label: '"Leech Field" - Ruins with leeches' },
      { key: "5", label: "Drolvarg Camp" },
      { key: "6", label: "Forest Giant Camp" },
      { key: "7", label: "Empty Ruins" },
      { key: "8", label: "Empty Ruins" },
      { key: "9", label: "Drolvarg Ruins and Camp" },
      { key: "10", label: "Underground Tunnel to Building 4 on Firiona Vie Docks" },
      { key: "11", label: "Firiona Vie Docks" },
      { key: "A", label: "To Drolvarg Underground" },
    ],
  },
  {
    label: "Firiona Vie - Docks",
    image: "firiona-vie-docks.jpg",
    legend: [
      { key: "1", label: "Merchant selling Food, Water, Cookbooks, and Mixing Bowl" },
      { key: "2", label: "Merchants selling Bags and Boxes" },
      { key: "3", label: "Merchants selling Weapons, Medium Plate and Chain Armor, Oven and Forge outside" },
      { key: "4", label: "Tunnel inside that leads to west side of the bay" },
      { key: "5", label: "Merchants selling Bard Songs, Alcohol, Brewing Supplies and Brew Barrel" },
      { key: "6", label: "Merchant selling Monk Weapons" },
      { key: "7", label: "Merchant selling Unfinished Bard Instruments and torches for pets" },
      { key: "8", label: "Ranger Trainer, Merchants selling All Bow and Arrow Fletching Supplies, High Level Ranger Spells" },
      { key: "9", label: "Bank" },
      { key: "10", label: "Merchant selling Medium Leather Armor" },
      { key: "11", label: "Underwater Tunnel that opens at area 19, also Warrior Trainer" },
      { key: "12", label: "Enchanter, Wizard, and Magician Trainers, Merchants selling Enchanter, Wizard, and Magician Spells" },
      { key: "13", label: "Merchants selling Most Jewelry Supplies" },
      { key: "14", label: "Rogue Trainer, Merchant selling Poison Supplies" },
      { key: "15", label: "Merchants selling Large and Small Sewing Kits and Patterns" },
      { key: "16", label: "Merchants selling Magic Stones, Potions, High Level Druid Spells" },
      { key: "17", label: "Paladin Trainer, Merchant selling Cleric and Paladin Spells" },
      { key: "18", label: "Merchants selling Fishing Supplies, Bows and Arrows, Alchemy Supplies, Bags, and High Level Shaman Spells" },
      { key: "19", label: "Underwater Tunnel that opens to area 11" },
      { key: "20", label: "Boat to Butcherblock Mountains" },
      { key: "21", label: "Empty Building with Tracker Azeal standing outside" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 170 complete: maps set on zone:firiona-vie");
