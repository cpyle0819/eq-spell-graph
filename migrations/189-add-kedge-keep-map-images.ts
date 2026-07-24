/**
 * Migration 189: add `maps` (two views) to zone:kedge-keep, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * eqlwiki.com's Kedge Keep page gives two separate images for the same
 * space: a "2D View" (public/maps/kedge-keep-2d.jpg, from its own
 * /images/7/71/Kedgekeep.jpg) with a lettered/numbered legend, and a "3D
 * View" (public/maps/kedge-keep-3d.gif, from /images/9/98/Kedge_keep.gif)
 * with no legend of its own -- same "different views of one zone" shape as
 * Befallen's multi-floor maps, just by projection instead of by floor.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:kedge-keep");
if (!zone) throw new Error("zone:kedge-keep not found");

zone.data.maps = [
  {
    label: "2D View",
    image: "kedge-keep-2d.jpg",
    legend: [
      { key: "A", label: '"The Hole", a shaft down from First Floor to Second Floor, continuing down into the "Piranha Pit" where Stiletto Fang Piranha spawns' },
      { key: "B", label: "Shaft down from Second Floor" },
      { key: "C", label: "Shaft up from Second Floor to #4" },
      { key: "D", label: '"Bubble\'s Tube", a shaft down from Second Floor to an opening north, eventually reaching #3' },
      { key: "E", label: "Shaft up to #14" },
      { key: "1", label: '"First Floor" with Fierce Impaler, who drops Gloomwater Harpoon (Common) and Darksea Harpoon (Rare)' },
      { key: "2", label: '"Second Floor"' },
      { key: "3", label: '"Bubble\'s Den" with Cauldronbubble, who drops Sharkbone Warhammer (Common) and Hammerhead Helm (Rare)' },
      { key: "4", label: "Room with Golden Haired Mermaid, who drops Lock of Hair" },
      { key: "5", label: '"Fallen Gate Room" with a shaft east leading downwards' },
      { key: "6", label: '"Safe Den"' },
      { key: "7", label: '"The Balcony", a common pull spot for Estrella' },
      { key: "8", label: '"Estrella\'s Temple" with Estrella of Gloomwater, who drops Rod of Drones (Common), Lamentation Blade (Common), and Prayer Shawl (Rare), and Shellara Ebbhunter, who drops Gloomwater Arrow (Common) and Pearlescent Mask (Rare)' },
      { key: "9", label: '"Temple of Prexus" with Undertow, who drops Blazing Wand (Common) and Squallsurge Shawl (Rare)' },
      { key: "10", label: "Spawn spot of Coralyn Kelpmaiden, who drops Sharkbone Warhammer (Common) and Sharkskin Drum (Rare)" },
      { key: "11", label: '"Seahorse Caves" with Seahorse Matriarch, who drops Rod of Health (Common) and Shield of Prexus (Rare)' },
      { key: "12", label: '"The Crossroads" with a frenzied bull shark, who drops Abalone Gorget (Rare)' },
      { key: "13", label: '"Boil\'s Lair" with Cauldronboil, who drops Sharkjaw Cutlass (Common) and Kedgemail Gauntlets (Rare)' },
      { key: "14", label: '"Frenzied Room" with Frenzied Cauldron Shark, who drops Shark Tooth (Common) and Abalone Gorget (Rare)' },
      { key: "15", label: '"Patriarch\'s Room" with Seahorse Patriarch, who drops Wand of Ice (Common) and Seahorse Scale Cloak (Rare)' },
      { key: "16", label: '"Ferocious Room" with a ferocious hammerhead, who drops Wand of Shadow (Common) and Driftwood Treasure Chest (Rare)' },
      { key: "17", label: "Room with Phinigel Autropos, who drops Blue Crystal Staff (Wizard Epic), Kedge Backbone (Bard Epic), Robe of the Kedge (Rogue Epic), Rod of Malisement, Staff of Elemental Mastery: Water (Magician Epic), Trident of the Seven Seas, Wand of Mana Tapping, and Fusible Coral Ore" },
    ],
  },
  {
    label: "3D View",
    image: "kedge-keep-3d.gif",
    legend: [],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 189 complete: maps (2 views) set on zone:kedge-keep");
