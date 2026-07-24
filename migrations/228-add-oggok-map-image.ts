/**
 * Migration 228: add `maps` to zone:oggok, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/oggok.jpg` (File:Oggok.jpg) is eqlwiki.com's own Oggok map --
 * a single image covering both the above-ground huts and the underground
 * cave complex the ogres actually live in, so one floor/legend, not a
 * separate sub-map. Legend transcribed verbatim from the page's own
 * numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:oggok");
if (!zone) throw new Error("zone:oggok not found");

zone.data.maps = [
  {
    label: null,
    image: "oggok.jpg",
    legend: [
      { key: "1", label: "Shaman Guild, Merchant selling Spell Components and Various Weapons" },
      { key: "2", label: "Ambassador K`Ryn" },
      { key: "3", label: "Merchant who sells Blunt Weapons, Ore, and Large Chainmail Patterns, Oggok Forge" },
      { key: "4", label: "Merchant selling Food and other Goods, Pottery Wheel and Kiln" },
      { key: "5", label: "Merchant selling Large Boots and Sewing Patterns, Loom" },
      { key: "6", label: "Merchant selling Large Shields" },
      { key: "7", label: "Merchant selling Various Weapons" },
      { key: "8", label: "Merchant who sells Boxes" },
      { key: "9", label: "Priest of Discord" },
      { key: "10", label: "Merchant selling Arrows and Fletching Supplies" },
      { key: "11", label: "Merchant who sells Food and other Goods" },
      { key: "12", label: "Merchants selling Food, Oven" },
      { key: "13", label: "Shadow Knight Guild, Merchant selling Various Weapons" },
      { key: "14", label: "Merchants selling Large Leather and Cloth Armor, Merchant outside selling Various Weapons" },
      { key: "15", label: "Merchants selling Large Chain and Plate Armor, Merchant outside sells Large Plate and Shield Molds, and Smithy Hammers, Forge Inside" },
      { key: "16", label: "Merchants selling Alchemy Items and Blunt Weapons" },
      { key: "17", label: "Merchants selling Food and Alcohol and Brewing Supplies, Brew Barrel" },
      { key: "18", label: "Warrior Guild, Merchant selling Various Weapons" },
      { key: "19", label: "Bank" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 228 complete: maps set on zone:oggok");
