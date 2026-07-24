/**
 * Migration 226: add `maps` to zone:west-freeport, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * eqlwiki.com's zone page for Freeport is one combined page covering North/
 * West/East Freeport (each a separate zone node here); `West Freeport`
 * itself redirects there, same as East Freeport (migration 213) and North
 * Freeport (migration 224). `public/maps/west-freeport.jpg` (File:
 * Wfreeport2.jpg) is that page's own West Freeport section map;
 * `west-freeport-tunnels.jpg` (File:Wfptunnels.jpg) is a second floor --
 * a flooded cistern beneath the city, same "tunnels sub-map" shape as East
 * Freeport's own tunnels floor. Legends transcribed verbatim from each
 * section's own numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:west-freeport");
if (!zone) throw new Error("zone:west-freeport not found");

zone.data.maps = [
  {
    label: "West Freeport",
    image: "west-freeport.jpg",
    legend: [
      { key: "1", label: "Merchant selling Brewing Supplies" },
      { key: "2", label: "Ogre selling Pickled Items" },
      { key: "3", label: "Freeport Militia with Warrior Guild, Forge out back" },
      { key: "4", label: "Merchant selling Cloth Armor" },
      { key: "5", label: "The Academy of Arcane Science - Magician, Enchanter, and Wizard Guild - sells Tomes, Gems, and Violet Robes" },
      { key: "6", label: "Warrior Guild with Merchants selling Various Weapons, Forge and Freeport Forge out back" },
      { key: "7", label: "Arena - PvP area, Warrior Trainers in balcony" },
      { key: "8", label: "Smithy - Merchants selling Pottery Supplies, Pottery Wheel inside and Kiln outside" },
      { key: "9", label: "Hogcaller's Inn - sells Alcohol, Lady Shae inside, Brew Barrel outside" },
      { key: "10", label: "The Stage" },
      { key: "11", label: "Brownloe Bakery - sells Food Items, Baking ingredients, and Bowls, Kiln and Pottery Wheel outside" },
      { key: "12", label: "\"Theater of the Tranquil\", Ashen Order - Monk Guild Hall, Merchants selling Throwing Weapons and Musical Instruments. Asnod Marnoc also sells bags/containers." },
      { key: "13", label: "Torlig's Herbs and Medicines - sells Potions, Crystals, Mistletoe" },
      { key: "14", label: "Empty Building - Oven inside" },
    ],
  },
  {
    label: "West Freeport Tunnels",
    image: "west-freeport-tunnels.jpg",
    legend: [
      { key: "1", label: "Flooded Room" },
      { key: "2", label: "Toxdil, a Rogue dealing in Poison" },
      { key: "3", label: "Flooded Water Cistern (with four A Drowned Citizens post-Velious only)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 226 complete: maps set on zone:west-freeport");
