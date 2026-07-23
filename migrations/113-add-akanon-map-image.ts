/**
 * Migration 113: add `map_image` and `map_legend` to zone:ak-anon, per the
 * pattern from migration 061 (Oasis of Marr) -- see issue #36.
 *
 * `public/maps/ak-anon.jpg` downloaded from eqlwiki.com's own
 * /images/0/07/Akanon.jpg (the coordinate-grid style map, not the
 * "_full" illustrated alternate). Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Ak'Anon page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:ak-anon");
if (!zone) throw new Error("zone:ak-anon not found");

zone.data.map_image = "ak-anon.jpg";
zone.data.map_legend = [
  { key: "1", label: "Trainers for Necromancers and Evil Clerics, also Merchants selling Dark Gold Robes and Spells" },
  { key: "2", label: "Evil Warrior Trainer" },
  { key: "3", label: "Evil Rogue Trainer" },
  { key: "4", label: "Merchant selling Tinkering Supplies" },
  { key: "5", label: "Abbey of Deep Musing - Cleric Trainers and Merchants selling Blunt Weapons, through secret door lies stairs down to Rogue Guild with Merchants selling Rogue Weapons" },
  { key: "6", label: "The Smithy - Merchants selling Weapons of all types" },
  { key: "7", label: "Merchant selling Blunt Weapons with Forge" },
  { key: "8", label: "Merchants selling Bags and Boxes, Food and other Goods, also Bard" },
  { key: "9", label: "Merchant selling Shoes" },
  { key: "10", label: "Library Mechanamagica - Enchanter, Magician, and Wizard Trainers, with Merchants selling Spells, Gold Robes, and equipment for all spellcasters" },
  { key: "11", label: "Merchant selling Small Cloth and Leather Armor, also Tailoring Patterns" },
  { key: "12", label: "Merchants selling Food, Fishing Supplies, Crystals, and Potions" },
  { key: "13", label: "Ak'Anon Palace - King Ak`Anon resides here, Oven, Pottery Wheel, and Kiln inside" },
  { key: "14", label: "Warrior Guild - Warrior Trainers and Merchant selling Various Weapons" },
  { key: "15", label: "Merchant selling Fishing Supplies, outside Merchant selling Small Cloth Armor and Small Sewing Kit, Loom outside" },
  { key: "16", label: "Priest of Discord and Merchant selling Food and other Goods" },
  { key: "17", label: "Bank of Ak'Anon, and Merchants selling Jewelry supplies (Gems)" },
  { key: "18", label: "Merchants selling Jewelry Supplies (Metals)" },
  { key: "19", label: "Ak'Anon Zoo" },
  { key: "20", label: "Merchants selling Small Cloth Armor, Food and other Goods, Weapons of Various Types, and Small Shields of all types" },
  { key: "21", label: "Merchant selling Fletching Supplies for making Arrows" },
  { key: "22", label: "Bar - Merchants selling Alcohol, Brew Barrel inside" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 113 complete: map_image and map_legend set on zone:ak-anon");
