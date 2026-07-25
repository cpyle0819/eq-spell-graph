/**
 * Migration 237: add `maps` to zone:north-kaladim and zone:south-kaladim,
 * in the array shape from migration 125 (decisions/zone-multi-floor-maps.md)
 * -- see issue #36.
 *
 * eqlwiki.com's combined `Kaladim` page embeds one map image per sub-zone,
 * each with its own numbered legend (`Nkaladim.jpg`, 10 items;
 * `Skaladim.jpg`, 12 items). Unlike Neriak/Felwithe, `Kaladim` itself is a
 * real redirect (no leftover duplicate umbrella zone node to retire) --
 * North and South Kaladim are the only two zone nodes involved.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function setMaps(zoneId: string, maps: unknown) {
  const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === zoneId);
  if (!zone) throw new Error(`${zoneId} not found`);
  zone.data.maps = maps;
}

setMaps("zone:north-kaladim", [
  {
    label: null,
    image: "north-kaladim.jpg",
    legend: [
      { key: "1", label: "Merchant selling Gems" },
      { key: "2", label: "Merchant selling Brellium, Ore, Smithy Hammers, Sharpening Stones" },
      { key: "3", label: "Cleric Guild - Merchants selling Blunt Weapons, Food and Goods Merchant outside" },
      { key: "4", label: "Ratsbone Treasure and Assay Office - Bank, Merchants who sell Throwing Weapons, Mining Supplies & Boxes, and Rogue Guild Members outside" },
      { key: "5", label: "Pottery Wheel and Kiln" },
      { key: "6", label: "Empty Hut" },
      { key: "7", label: "Empty Hut" },
      { key: "8", label: "Everhot Forge - Merchants selling Blunt and Sharp Weapons, Small Chain and Plate Armor, Small Plate and Shield Molds, Weapon Molds, Jewelry Metal and Rare Gems, Forge Outside" },
      { key: "9", label: "Greybloom Farms - Merchants selling Grapes, Brew Barrel inside, Oven outside" },
      { key: "10", label: "Paladin Guild" },
    ],
  },
]);

setMaps("zone:south-kaladim", [
  {
    label: null,
    image: "south-kaladim.jpg",
    legend: [
      { key: "1", label: "Tanned Assets - Merchant selling Small Leather Armor" },
      { key: "2", label: "Irontoe's Eats - home of Tumpy Irontoe, Merchants selling Alcohol and Meat Pies" },
      { key: "3", label: "Staff and Spear - Merchants selling Swords and Fletching Supplies" },
      { key: "4", label: "Redfist's Metal - Merchants selling Small Shields and Weapons of all types, Forge and Stormguard Forge outside" },
      { key: "5", label: "The Arena (not PvP)" },
      { key: "6", label: "Pub Kal - Merchants selling Alcohol, Brew Barrel, Bard outside" },
      { key: "7", label: "Warrior's Guild with Merchants selling Various Weapons" },
      { key: "8", label: "Priest of Discord" },
      { key: "9", label: "Merchant selling Potions and Crystals" },
      { key: "10", label: "Merchant selling Bags, Pottery Wheel and Kiln outside" },
      { key: "11", label: "Gurtha's Ware with Merchants selling Small Boots, Small Cloth Armor, Pottery Supplies, Oven outside" },
      { key: "12", label: "Castle - home of the King" },
    ],
  },
]);

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 237 complete: maps set on North Kaladim and South Kaladim");
