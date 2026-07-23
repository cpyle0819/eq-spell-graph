/**
 * Migration 158: add `maps` to zone:east-cabilis, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/east-cabilis.jpg` downloaded from eqlwiki.com's own
 * /images/d/dc/Map_ecabilis.jpg (both East and West Cabilis maps live on the
 * single combined "Cabilis" wiki page, which East_Cabilis/West_Cabilis both
 * redirect to). Legend transcribed verbatim from the numbered list under the
 * East Cabilis map on that page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:east-cabilis");
if (!zone) throw new Error("zone:east-cabilis not found");

zone.data.maps = [
  {
    label: null,
    image: "east-cabilis.jpg",
    legend: [
      { key: "1", label: "Temple of Terror - Shaman and Shadow Knight Guild Hall" },
      { key: "2", label: "Tink n' Babble - Merchant selling Alcohol, Brew Barrel inside" },
      { key: "3", label: "Merchants selling Alcohol and Brewing Supplies, Brew Barrel nearby" },
      { key: "4", label: "The Block - Bank" },
      { key: "5", label: "Merchant selling Gems of all types, Metals and Jewelry Kit" },
      { key: "6", label: "Merchant selling Basic Smithing Molds" },
      { key: "7", label: "Merchant selling Cooking Supplies, Pastries and Cook Books, Oven inside" },
      { key: "8", label: "Court of Pain - Monk Guild, Merchants selling Monk Supplies, Iksar History Books and Bandages and Backpacks" },
      { key: "9", label: "The Haggle Baron - Merchant selling Bristle Silk Armor" },
      { key: "10", label: "The Haggle Baron" },
      { key: "11", label: "Merchant selling Food Items" },
      { key: "12", label: "Merchant selling Pottery Supplies, Kiln and Pottery Wheel outside" },
      { key: "13", label: "Merchants selling Blacksmithing Armor Molds and Sheet Metal, Pottery Molds, Sectional Molds, Forge nearby" },
      { key: "14", label: "Merchant selling Ore, Sharpening Stones, Smithy Hammers, and Clay" },
      { key: "15", label: "Merchant selling Sewing Patterns and Guides" },
      { key: "16", label: "Merchant selling Medium Cloth Armor, Large and Small Sewing Kits, Sewing Patterns" },
      { key: "17", label: "Merchant selling Food Items" },
      { key: "18", label: "Merchants selling Fishing Supplies and all Fletching Supplies for Bows" },
      { key: "19", label: "Merchant selling Bags and Boxes" },
      { key: "20", label: "Merchant selling Rhino Hide Armor, Loom outside" },
      { key: "21", label: "Merchant selling Wilderness Survival Gear" },
      { key: "22", label: "Merchant selling Blunt Weapons, Weapon Molds, Forge nearby" },
      { key: "23", label: "Merchants selling Combine Weapons, Weapon Blade Molds, and Weapon Part Molds" },
      { key: "24", label: "Merchants selling Weapons and Shields (all sizes), Ore, Skyfire Metal, and Shield Molds, Cabilis Forge" },
      { key: "25", label: "Merchant selling Lupine Scale Armor" },
      { key: "26", label: "Fortress Talishan - Warrior Guild with various Trainers scattered throughout the compound" },
      { key: "27", label: "Merchant selling Cooking and Lore Books" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 158 complete: maps set on zone:east-cabilis");
