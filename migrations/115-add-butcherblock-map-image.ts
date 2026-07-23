/**
 * Migration 115: add `map_image` and `map_legend` to zone:butcherblock-mountains,
 * per the pattern from migration 113 (Ak'Anon) -- see issue #36.
 *
 * `public/maps/butcherblock-mountains.jpg` downloaded from eqlwiki.com's own
 * /images/c/c7/Butcherblock-v3.jpg. Legend transcribed verbatim from the
 * numbered list under the map on eqlwiki.com's Butcherblock Mountains page.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:butcherblock-mountains");
if (!zone) throw new Error("zone:butcherblock-mountains not found");

zone.data.map_image = "butcherblock-mountains.jpg";
zone.data.map_legend = [
  { key: "1", label: "Docks: Northern Pier leads to Freeport, Southern Pier leads to Firiona Vie in Kunark" },
  { key: "2", label: "Stone with Guard where Blyle Bundin spawns south" },
  { key: "3", label: "Ancient Stone Ring protected by Dwarves" },
  { key: "4", label: "Huts with Merchants selling Food, Cookie Molds, Smithing Molds, Brewing Supplies" },
  { key: "5", label: "Goblin Camp" },
  { key: "6", label: "Partially destroyed Ancient Stone Ring with small level goblin camp" },
  { key: "7", label: "The Chessboard" },
  { key: "8", label: "Dwarf Hut" },
  { key: "9", label: "Tower with Guards and High Elf Merchant" },
  { key: "10", label: "Bandit Camp with Peg Leg" },
  { key: "11", label: "Goblin Warrior Camp" },
  { key: "12", label: "Bandit Camp" },
  { key: "13", label: "Altar" },
  { key: "14", label: "Stone Pillar protected by Orcs" },
  { key: "15", label: "Goblin Camp" },
  { key: "16", label: "Dwarf Houses selling Leather Armor and Sewing Patterns" },
  { key: "17", label: "Abandoned Guard House with Signus Boran" },
  { key: "18", label: "The Crossroads - Guard House with Nyzil Bloodforge" },
  { key: "19", label: "Merchants selling Clay, Firing Sheets, Chain Armor" },
  { key: "20", label: "Druid Ring with Merchant selling Druid Spells" },
  { key: "21", label: "Haunted Tower" },
  { key: "22", label: "Goblin Camp, spawn point for Corflunk" },
  { key: "23", label: "Stone Tower" },
  { key: "24", label: "Enraged Goblins" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 115 complete: map_image and map_legend set on zone:butcherblock-mountains");
