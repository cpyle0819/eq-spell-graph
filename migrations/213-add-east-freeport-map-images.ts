/**
 * Migration 213: add `maps` to zone:east-freeport, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's zone page for Freeport is one combined page covering North/
 * West/East Freeport (each a separate zone node here); `East Freeport`
 * itself redirects there. `public/maps/east-freeport.jpg` (File:Efreeport.jpg)
 * is that page's own East Freeport section map; `east-freeport-tunnels.jpg`
 * (File:Efptunnels.jpg) is the underground guild-hall tunnels beneath it,
 * a second floor. Legends transcribed verbatim from each section's own
 * numbered/lettered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:east-freeport");
if (!zone) throw new Error("zone:east-freeport not found");

zone.data.maps = [
  {
    label: "East Freeport",
    image: "east-freeport.jpg",
    legend: [
      { key: "1", label: "Armor by Ikthar with Merchants selling Chain and Plate Armor, Armor Molds, Clay, Chain Sectionals, Shield Molds, Plate Molds, Forge outside" },
      { key: "2", label: "Trader's Holiday with Merchants selling Blacksmithing Molds and Books, Alcohol, Brew Barrel and Oven inside" },
      { key: "3", label: "Tavern with Merchant selling Racial Alcohol" },
      { key: "4", label: "Velithe & Bardo's Imported Goods with Merchants selling Racial Alcohol, Blacksmithing Books, File molds and other molds, Loom upstairs" },
      { key: "5", label: "Leather and Hide with Merchants selling Small and Medium Leather Armor and Patterns" },
      { key: "6", label: "Priest of Discord" },
      { key: "7", label: "Grub n Grog Tavern Merchants selling Alcohol and Food, has Brew Barrel and Oven inside" },
      { key: "8", label: "Freeport Inn with Merchants selling Food and other Goods, Soulbinder outside" },
      { key: "9", label: "Port Authority with Merchants selling Fishing Supplies" },
      { key: "10", label: "The Dock for boat to Ocean of Tears, Butcherblock Mountains, and the rest of Faydwer" },
      { key: "11", label: "Seafarer's Roost with Merchants selling Odd and Unusual Beers, Throwing Weapons and Lockpicks, Brew Barrel inside, entrance to Stairs B in East Freeport Tunnels (under the deck in the basement of the Tavern); just east, out in the harbor, is a glowing orb that teleports to Plane of Sky" },
      { key: "12", label: "Inn with a secret entrance to the underground tunnels: Necromancer, Shadow Knight, and Rogue guilds, plus Guildmasters for the other classes for evil races, guarded by Trap Wire" },
      { key: "13", label: "Empty Building with secret entrance to Stairs A in East Freeport Tunnels, Oven outside" },
      { key: "14", label: "Empty Building" },
      { key: "15", label: "Gord's Smithy with Merchants selling Various Weapons and Bags, Forge outside" },
      { key: "16", label: "Chops and Hops with Merchant selling Alcohol, has Oven inside" },
      { key: "17", label: "Hallard's Resales with Merchants selling Various Weapons, also KOS dog named Scraps" },
    ],
  },
  {
    label: "East Freeport Tunnels",
    image: "east-freeport-tunnels.jpg",
    legend: [
      { key: "1", label: "Cleric and Necromancer Trainers" },
      { key: "2", label: "Warrior, Shadow Knight, Enchanter, Magician, and Wizard Trainers" },
      { key: "3", label: "Cleric and Necromancer Trainers" },
      { key: "4", label: "Cleric and Shadow Knight Trainers" },
      { key: "5", label: "Shadow Knight Trainer, Merchants selling Weapons and Spells" },
      { key: "6", label: "Cleric and Necromancer Trainers, Merchants selling Spells" },
      { key: "7", label: "Necromancer Trainer, Merchants selling Necromancer Equipment and Spells" },
      { key: "8", label: "Shadow Knight Trainer, Merchant selling Weapons" },
      { key: "9", label: "Rogue Trainers" },
      { key: "10", label: "Dark Elf Rogue Trainer" },
      { key: "11", label: "Rogue Trainers" },
      { key: "12", label: "Rogue Guild Master and Trainers" },
      { key: "A", label: "Stairs up to hidden entrance to Building #13 in East Freeport" },
      { key: "B", label: "Door to Building #11 in East Freeport" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 213 complete: maps set on zone:east-freeport");
