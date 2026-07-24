/**
 * Migration 230: add `maps` to zone:paineel, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's Paineel page embeds two map images side by side:
 * `public/maps/paineel-main-city.jpg` (File:Paineelin.jpg), the city
 * proper, with the page's own 17-item numbered legend; and
 * `public/maps/paineel-newbie-zone.jpg` (File:Paineelout.jpg), the newbie
 * area outside the main gates, which the page never gives its own legend --
 * left with an empty legend rather than guessing one, same "no legend
 * rather than a guessed one" call as High Keep's unlabeled floors
 * (migration 222).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:paineel");
if (!zone) throw new Error("zone:paineel not found");

zone.data.maps = [
  {
    label: "Main City",
    image: "paineel-main-city.jpg",
    legend: [
      { key: "1", label: "Darkglow Palace" },
      { key: "2", label: "Athenaeum Necromantia - Library" },
      { key: "3", label: "Fortunes' Fancy - Merchant selling Jewelry Metals and Rare Gems" },
      { key: "4", label: "Tabernacle of Terror - Cleric Guild" },
      { key: "5", label: "Merchants selling Chain Mail Armor and Blunt Weapons" },
      { key: "6", label: "Merchants selling Shields and Blunt Weapons" },
      { key: "7", label: "False Idols - Merchant with Pottery Supplies, Clay, and Ore, Kiln inside" },
      { key: "8", label: "The Final Reckoning - Bank" },
      { key: "9", label: "Shackled Spirits - Dancing Skeletons, Merchant selling Alcohol, Brew Barrel inside, Inn upstairs" },
      { key: "10", label: "Superior Supplies (Poison Petal on top floor) - Merchants selling Food and other Goods and Alchemy Supplies, Hole Key" },
      { key: "11", label: "Sinfully Handsome - Merchants selling Cloth and Leather Armor, Loom" },
      { key: "12", label: "Good Iva's Tasty Treats - Merchants selling Food and Cooking Supplies" },
      { key: "13", label: "The Abbatoir - Necromancer Guild" },
      { key: "14", label: "The Fell Blade - Shadow Knight Guild, Merchants selling Leather Armor and Two-Handed Slashing Weapons" },
      { key: "15", label: "Merchant selling Plate Armor, Forge and Erud Forge inside" },
      { key: "16", label: "PvP area" },
      { key: "17", label: "Observatory" },
    ],
  },
  {
    label: "Newbie Zone",
    image: "paineel-newbie-zone.jpg",
    legend: [],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 230 complete: maps set on zone:paineel");
