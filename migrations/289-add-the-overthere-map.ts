/**
 * Migration 289: add `maps` to zone:the-overthere -- see issue #36.
 *
 * `public/maps/the-overthere.jpg` downloaded from eqlwiki.com's own
 * `File:Map overthere.jpg`. Legend transcribed verbatim from the numbered
 * list under the map (numbers 1-10, then lettered temple entrances A-C).
 * The page's own second image ("Overthere fruito.jpeg", captioned "Regions
 * by level") is a supplementary level-heatmap graphic with no legend of
 * its own -- not a separate floor, so it wasn't added as a second map
 * entry, same call as Ocean of Tears' excluded mirrored "Alternate Map".
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:the-overthere");
if (!zone) throw new Error("zone:the-overthere not found");

zone.maps = [
  {
    label: null,
    image: "the-overthere.jpg",
    legend: [
      { key: "1", label: "Dock with boat to Timorous Deep and Oasis of Marr connection" },
      { key: "2", label: "Merchants selling Arrow Fletching Supplies, Food and other Goods, Bags and Boxes, Jewelry Supplies (all), Cooking Supplies (all), Tinkering Supplies (all), Pottery Supplies, Weapons, Tailoring Supplies (all)" },
      { key: "3", label: "Merchants selling Cleric, Enchanter, Magician, Necromancer, Shadow Knight, Shaman, and Wizard Spells, Pottery Wheel, Kiln, Oven, Brew Barrel inside, Building to Northeast has Dark Elf Wizard Trainer" },
      { key: "4", label: "The Bank" },
      { key: "5", label: "Sarnak-infested Ruins (indifferent Iksar Merchant southeast at the Watering Hole)" },
      { key: "6", label: "Chasm filled with Scorpiki" },
      { key: "7", label: "Entrance to Skyfire Mountains" },
      { key: "8", label: "Sarnak-infested Ruins" },
      { key: "9", label: "Statue" },
      { key: "10", label: "Sarnak-infested Ruins" },
      { key: "A", label: "Entrance to Temple with Sphere, zone-in to Charasis (-96, 796)" },
      { key: "B", label: "Entrance to Temple" },
      { key: "C", label: "Entrance to Temple" },
    ],
  },
];

save();
console.log("Migration 289 complete: maps set on zone:the-overthere");
