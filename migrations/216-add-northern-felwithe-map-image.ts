/**
 * Migration 216: add `maps` to zone:northern-felwithe, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/northern-felwithe.jpg` downloaded from eqlwiki.com's own
 * combined Felwithe page's North Felwithe section (File:Nfelwithe.jpg).
 * Legend transcribed verbatim from that section's own numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:northern-felwithe");
if (!zone) throw new Error("zone:northern-felwithe not found");

zone.data.maps = [
  {
    label: null,
    image: "northern-felwithe.jpg",
    legend: [
      { key: "1", label: "Paladin Guild - Merchant selling Weapons, Priest of Discord, secret tunnels to Ramparts" },
      { key: "2", label: "Tovanik's Venom - Merchant selling Alcohol, Brew Barrel" },
      { key: "3", label: "Traveller's Home - Inn" },
      { key: "4", label: "Shop of All Holds - Merchants selling Food, Cloth Armor, Gems, Mithril Ore and Chainmail Patterns" },
      { key: "5", label: "Beyond Faydark - Merchant selling Food and other goods" },
      { key: "6", label: "Cleric Guild - Merchants selling Blunt Weapons, Backpack" },
      { key: "7", label: "Faydark's Bane - Merchants selling Swords, Fletching and Sewing Kits, Fletching Supplies, Leather Armor and Patterns, Pottery Wheel and Kiln outside" },
      { key: "8", label: "Emerald Armor - Merchants selling Chain/Plate Armor, Weapons, Shields, Smithing Molds, Koada'Dal Forge inside" },
      { key: "9", label: "Felwithe Keeper - Bank" },
      { key: "10", label: "Bait and Tackle - Merchant selling Fishing Supplies" },
      { key: "11", label: "Felwithe Fish House - Merchant sells Food and Drinks, outside Merchant sells Jewelry Supplies (Rare Gems), Oven outside" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 216 complete: maps set on zone:northern-felwithe");
