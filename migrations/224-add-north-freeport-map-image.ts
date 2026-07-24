/**
 * Migration 224: add `maps` to zone:north-freeport, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's zone page for Freeport is one combined page covering North/
 * West/East Freeport (each a separate zone node here); `North Freeport`
 * itself redirects there, same as East Freeport (migration 213) and West
 * Freeport (migration 226) before/after it. `public/maps/north-freeport.jpg`
 * (File:Nfreeport_loc.jpg) is that page's own North Freeport section map --
 * a single floor, no tunnels sub-map (unlike East/West Freeport). Legend
 * transcribed verbatim from the section's own numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:north-freeport");
if (!zone) throw new Error("zone:north-freeport not found");

zone.data.maps = [
  {
    label: null,
    image: "north-freeport.jpg",
    legend: [
      { key: "1", label: "Office of Landholders with Merchants selling Food and other Goods, and Cooking Books" },
      { key: "2", label: "Hall of Truth - the Mithaniel Marr Paladin Guild" },
      { key: "3", label: "Temple of Erollisi Marr - Cleric and Paladin Guild" },
      { key: "4", label: "Groflah's Forger with Merchants selling Ore, Weapons, Clay, Sharpening Stones, Smithing Equipment, Forge outside door" },
      { key: "5", label: "Marsheart's Chords - Bard Guild Hall, Merchants selling Throwing Weapons, Backpacks, Lockpicks and Musical Instruments" },
      { key: "6", label: "Freeport City Hall" },
      { key: "7", label: "Coalition of Trade Folks with Merchants selling Food and other Goods" },
      { key: "8", label: "Guard House" },
      { key: "9", label: "Empty Building" },
      { key: "10", label: "\"The Blue Building\" with Merchant selling Jewelry Metals, Gems, and Books" },
      { key: "11", label: "Jade Tiger Den with Merchants selling Food and other Goods" },
      { key: "12", label: "Tassel's Tavern with Merchants selling Alcohol, Brew Barrel inside" },
      { key: "13", label: "Emporium with Merchants selling Medium Cloth items, Forge outside door" },
      { key: "14", label: "Empty Building" },
      { key: "15", label: "Bank of Freeport, Merchant selling Gems" },
      { key: "16", label: "Tavern with Merchant selling Food Items, Meat Pies, has Brew Barrel and Oven inside and Pottery Wheel and Kiln outside" },
      { key: "17", label: "Empty building, Oven outside. Merchants selling Fletching and Bowmaking Supplies were removed (not classic)" },
      { key: "18", label: "Merchants selling Food and other Goods" },
      { key: "19", label: "Clothier Shop with Merchants selling Pottery Sketches and Cloth armor" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 224 complete: maps set on zone:north-freeport");
