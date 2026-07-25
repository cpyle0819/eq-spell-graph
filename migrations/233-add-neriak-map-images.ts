/**
 * Migration 233: add `maps` to zone:neriak-foreign-quarter, zone:neriak-
 * commons, and zone:neriak-3rd-gate, in the array shape from migration 125
 * (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's combined `Neriak` page embeds one map image per sub-zone,
 * each with its own numbered legend (`neriakforeign.jpg`, 17 items;
 * `Neriakcommons_true_north.png`, 11 items; `neriakthirdgate.jpg`, 12
 * items). `zone:neriak` itself (the duplicate umbrella node this page
 * would otherwise map to) was retired in migration 232 -- "Neriak" drops
 * off issue #36's checklist rather than getting its own map.
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

setMaps("zone:neriak-foreign-quarter", [
  {
    label: null,
    image: "neriak-foreign-quarter.jpg",
    legend: [
      { key: "1", label: "Guard Hall" },
      { key: "2", label: "The Smugglers Inn - Merchants selling Alcohol, Brewing Supplies, Food Items and other goods" },
      { key: "3", label: "Silk Underground - Merchants Small and Large Cloth Armor and Sewing Kits, loom" },
      { key: "4", label: "Dranas Bread and Butcher - Merchants selling Food Items and Baking Supplies, Oven outside" },
      { key: "5", label: "Slug's Tavern - Merchants selling Alcohol, Food and Other Goods, Brew Barrel outside" },
      { key: "6", label: "Market View with Gambel's Greens with Merchant selling Potions and Crystals" },
      { key: "7", label: "Merchants who sell Shoes and Bags, as well as Kiln and Pottery Wheel" },
      { key: "8", label: "Merchant outside who sells Various Weapons" },
      { key: "9", label: "Two Ogres who sell all Blacksmithing books, Large Chainmail Patterns, Weapon Part Molds, File Molds and other Molds" },
      { key: "10", label: "Armor Shop selling Large Chainmail Armor and sewing patterns, Forge outside" },
      { key: "11", label: "Pig Stickers - Merchants selling Various Weapons, Forge outside" },
      { key: "12", label: "Building with secret entrance to Underground and Troll NPC" },
      { key: "13", label: "Merchant selling Food and Alcohol" },
      { key: "14", label: "Merchants selling Shadow Knight Spells" },
      { key: "15", label: "PvP Area, Merchants who sell Food and other Goods, Various Weapons, and Alcohol" },
      { key: "16", label: "Bites n Pieces - Merchants selling Food Items, Fishing supplies and other Goods, Oven outside" },
      { key: "17", label: "Shinie Tings - Merchant selling Jewelry Metals and Rare Gems" },
    ],
  },
]);

setMaps("zone:neriak-commons", [
  {
    label: null,
    image: "neriak-commons.png",
    legend: [
      { key: "1", label: "Priest of Discord" },
      {
        key: "2",
        label:
          "Entrance to Neriak Down Under - the Neriak Bank -- The Burnished Coin, The Refined Palate, The Bounty of the Earth, and The Blind Fish; sells Sharpening Stones, Clay, Ore, Smithy Hammers, Weapon Blade Molds, Alcohol, Food Items, Books, Baking Supplies, Potions and Crystals; also has Brew Barrel and Oven",
      },
      { key: "3", label: "Smithy - Merchants selling Small Chain Armor and Various Weapons, also Medicine Bag" },
      { key: "4", label: "Adamant Armor - Merchant who sells Small Plate Armor, Forge outside" },
      { key: "5", label: "Forge House with jewelry merchants upstairs" },
      { key: "6", label: "Wizard, Magician, and Enchanter Guild Hall - Merchants selling all items for those classes" },
      { key: "7", label: "Toadstools - Merchants selling Alcohol and Small Armor Molds, Fishing Supplies outside; secret entrance to Underground and zone point" },
      { key: "8", label: "The Bleek Fletcher - Merchant selling Fletching supplies (arrows)" },
      { key: "9", label: "The House of D'abth - Merchant selling Food Items and other Goods" },
      { key: "10", label: "The Dashing Form - Merchant selling Small Cloth Armor, Sewing Kits and Patterns" },
      { key: "11", label: "Warrior Guild Hall with merchants who sell Weapons and Alcohol" },
    ],
  },
]);

setMaps("zone:neriak-3rd-gate", [
  {
    label: null,
    image: "neriak-3rd-gate.jpg",
    legend: [
      { key: "1", label: "Temple of Innoruuk - Cleric Guild Hall, Merchants selling Blunt Weapons, Merchant selling Fuligan Soulstone of Innoruuk (reagent for Alter Plane: Hate)" },
      { key: "2", label: "Necromancer and Shadow Knight Guild Hall - Merchants selling appropriate equipment for these classes" },
      { key: "3", label: "Library - Merchants selling Various Spells, including Wizard Portal spells, Enchanter Vision and Enchant Metal spells, and Magician Summon spells" },
      { key: "4", label: "Furrier Royale - Merchant selling Small Leather Armor, Patterns and Kit" },
      { key: "5", label: "Rogue Guild Hall with Merchants selling Rogue Weapons" },
      { key: "6", label: "The Maidens Fancy - Merchants selling Alcohol, Brew Barrel inside, also has Dark Elf Ambassador and Ironforge Prisoner" },
      { key: "7", label: "The Bauble - Merchant selling Gems for Jewelcraft" },
      { key: "8", label: "Cuisine Excelsior - Merchants selling Alcohol, Oven outside" },
      { key: "9", label: "The Rack - Merchant selling Wine" },
      { key: "10", label: "Merchant outside selling Small Plate and Shield Molds, Forge around the corner" },
      { key: "11", label: "X'Lottl Private Mansion" },
      { key: "12", label: "J'Narus Private Mansion with Merchant selling Adamantite and Chain Patterns" },
    ],
  },
]);

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 233 complete: maps set on Neriak's three sub-zones");
