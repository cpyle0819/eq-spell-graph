/**
 * Migration 240: add `maps` to zone:south-qeynos, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/south-qeynos.jpg` downloaded from eqlwiki.com's own
 * /images/3/39/Zone_sqeynos.jpg -- the same combined "Qeynos" page as
 * migration 138's North Qeynos map, South Qeynos's own legend this time.
 * Legend transcribed verbatim from the numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:south-qeynos");
if (!zone) throw new Error("zone:south-qeynos not found");

zone.data.maps = [
  {
    label: null,
    image: "south-qeynos.jpg",
    legend: [
      { key: "1", label: "Tin Soldier - Forge outside, Merchants selling Medium Chain Armor and Full Plate Molds" },
      { key: "2", label: "The Wind Spirit's Song - Bard Guild Hall, Merchants selling Bard songs and various Weapons" },
      { key: "3", label: "Fharn's Leather & Thread - Merchant selling Medium Leather Armor and Small Sewing Kit and Patterns" },
      { key: "4", label: "Bag n Barrel - Merchants selling Bags, Pottery Wheel and Kiln out back" },
      { key: "5", label: "Nesiff's Wooden Weapons - Merchants selling Blunt Weapons, Bows, outside Merchant selling Fletching Supplies (Arrows), Royal Qeynos Forge nearby" },
      { key: "6", label: "Lion's Mane Inn - Merchants selling Alcohol, Brew Barrel, Message Board" },
      { key: "7", label: "Tax Hall" },
      { key: "8", label: "Qeynos Hold - Bank" },
      { key: "9", label: "Underwater tunnel to Qeynos Aqueducts" },
      { key: "10", label: "The Herb Jar - Merchants selling Spells, Potions, Books, Crystals, and Magician Equipment" },
      { key: "11", label: "Wizard, Enchanter, and Magician Guild Hall with Merchants selling Spells and Wizard Equipment, outside Wizard, Enchanter, and Magician Trainers" },
      { key: "12", label: "Tent Merchants selling Small Leather and Ringmail Armor and Medium Cloth Armor, Loom nearby" },
      { key: "13", label: "Fireprides - Merchants selling Medium Plate, Chain and Leather Armor and Shields, Shield Molds, Forge outside" },
      { key: "14", label: "Tent Merchant selling Large Leather and Ringmail Armor and Large Shields" },
      { key: "15", label: "Boat Dock - with travel to Erud's Crossing" },
      { key: "16", label: "Mermaid's Lure - Merchant selling Fishing Supplies" },
      { key: "17", label: "Tent Merchants selling Cloth Armor, Small Sewing Kits, Bags, Axes, and Sharp Weapons (including Claymore)" },
      { key: "18", label: "Warrior Training Hall inside the Grounds of Fate (PvP Area), Merchant selling Various Weapons, underground tunnel leads to a variety of evil trainers and merchants in the Qeynos Aqueducts (follow the bones)" },
      { key: "19", label: "Underwater tunnel to Qeynos Aqueducts" },
      { key: "20", label: "Port Authority" },
      { key: "21", label: "Merchant selling Instrument Parts, Spells, Compass, and Fish" },
      { key: "22", label: "Voleen's Fine Baked Goods - Merchants selling Food, Brewing Supplies, some Baking Supplies, Oven inside" },
      { key: "23", label: "Fish's Ale - Merchants selling Alcohol, Brew Barrel inside, Message Board" },
      { key: "24", label: "Temple of Thunder - Paladin and Cleric Trainers, Merchants selling Spells, Various Weapons, and Shields of all sizes" },
    ],
  },
];

save();
console.log("Migration 240 complete: maps set on zone:south-qeynos");
