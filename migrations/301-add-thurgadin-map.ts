/**
 * Migration 301: add `maps` to zone:thurgadin -- see issue #36.
 *
 * Two floors, same shape as The Estate of Unrest/Steamfont Mountains
 * before it (decisions/zone-multi-floor-maps.md): the main city
 * (`public/maps/thurgadin.jpg`, from eqlwiki.com's own
 * `File:Map thurgadin.jpg`) and the old, no-longer-used mines beneath it
 * (`public/maps/thurgadin-mines.jpg`, from `File:Map thurgadin mines.jpg`).
 * Legends transcribed verbatim from each map's own numbered list.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:thurgadin");
if (!zone) throw new Error("zone:thurgadin not found");

zone.maps = [
  {
    label: "Thurgadin",
    image: "thurgadin.jpg",
    legend: [
      { key: "1", label: "Remembrance Park" },
      { key: "2", label: "Thurgadin Mining Company with Rogue Trainer, Merchants who sell Poison Supplies, Blacksmithing Supplies, Thieves Goods" },
      { key: "3", label: "Velium Ice House" },
      { key: "4", label: "The Velium Keg with Brew Barrel, Merchants who sell Alcohol, Brewing Supplies, Tailoring Supplies" },
      { key: "5", label: "Wolf Training Cave" },
      { key: "6", label: "Merchants selling Coldain Velium Weapons" },
      { key: "7", label: "Agar's Adventuring Supplies with Merchants selling Bags and Boxes" },
      { key: "8", label: "Doogle's Drinks with Merchants selling Alcohol" },
      { key: "9", label: "Argash's House of Carpentry with Merchants selling Bowyer and Fletching Supplies" },
      { key: "10", label: "Mordin's Meats with Merchant who sells Food and Water and other Goods, Oven" },
      { key: "11", label: "Underbelly Arms with Forge, Merchants selling Small Chain Armor, Small Velium Plate Armor, and Shields" },
      { key: "12", label: "Gem Merchants who sell Jewelry Supplies (all)" },
      { key: "13", label: "The Broken Glacier with Merchants who sell Brewing Supplies, Alcohol" },
      { key: "14", label: "Arena (PvP area)" },
      { key: "15", label: "Icebridge Gatehouse" },
      { key: "16", label: "The Scars Edge with Merchants who sell Coldain Velium Weapons and Armor Molds" },
      { key: "17", label: "Thurgadin Exchange with Bank, Pottery Wheel and Kiln, Merchants who sell Pottery Supplies, Tailoring Patterns, Tailoring Supplies, Baking Supplies, Cookie Cutter Molds, Alchemy Supplies" },
      { key: "18", label: "The Holy Harbinger with Merchants selling Alcohol" },
      { key: "19", label: "Merchant who sells Potions" },
      { key: "20", label: "Garish's Boots with Merchant who sells Boots" },
      { key: "21", label: "Temple of Brell with Cleric Trainer and Merchant who sells Velious Spells" },
      { key: "22", label: "Temple Library with Merchants who sell Cleric Spells" },
      { key: "23", label: "Paladin Training Hall with Trainer and Merchants selling Spells, Weapons, and other Goods" },
      { key: "24", label: "Coldheart Residence" },
      { key: "25", label: "Frostbeard's Furs & Leather with Merchants who sell Cloth and Leather Armor, some Sewing Supplies" },
      { key: "26", label: "Shadowfrost Residence" },
      { key: "27", label: "The Icy Mug with Merchants who sell Alcohol and Brewing Supplies" },
    ],
  },
  {
    label: "Thurgadin Mines",
    image: "thurgadin-mines.jpg",
    legend: [
      { key: "1", label: "Ungdin" },
      { key: "2", label: "Stonetooth" },
    ],
  },
];

save();
console.log("Migration 301 complete: maps set on zone:thurgadin");
