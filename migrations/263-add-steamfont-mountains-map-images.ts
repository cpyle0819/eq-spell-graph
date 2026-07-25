/**
 * Migration 263: add `maps` to zone:steamfont-mountains, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * Two map images, same as The Estate of Unrest's Grounds/Manor split:
 * `public/maps/steamfont-mountains.jpg` (eqlwiki's File:Steamfont.jpg --
 * the main outdoor zone) and
 * `public/maps/steamfont-mountains-minotaur-caves.jpg`
 * (File:Minocaves.jpg -- the minotaur slaver caves in the NW corner).
 * Legends transcribed verbatim from each map's own numbered list; the
 * page's loc-coordinate aside about a poison merchant and its
 * struck-through note about "a Minotaur slaver camp in the NW corner"
 * aren't legend entries, so both are omitted the same way Temple of
 * Solusek Ro's floor-linking notes were.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:steamfont-mountains");
if (!zone) throw new Error("zone:steamfont-mountains not found");

zone.data.maps = [
  {
    label: null,
    image: "steamfont-mountains.jpg",
    legend: [
      { key: "1", label: "Kobold Camp" },
      { key: "2", label: "The Observers" },
      { key: "3", label: "Haunted Ruins of Giant Clockwork Machine" },
      { key: "4", label: "The Windmills of Steamfont, several Observers as well as Merchants who sell Ore, Medium-Quality Ore, Dye Materials, Sharpening Stones, Clay, and Tinkering Equipment" },
      { key: "5", label: "Kobold Camp" },
      { key: "6", label: "Druid Stone Ring with Crisyn selling Spells" },
      { key: "7", label: "Merchant selling Sewing Supplies, including Large Sewing Kit, How To's, and Needle and Thimble Molds" },
      { key: "8", label: "Merchant selling Small Armor Molds" },
      { key: "9", label: "Merchant selling Cookie Molds" },
      { key: "10", label: "Merchant selling Food and other goods" },
      { key: "11", label: "Merchants selling Cooking Supplies and Gems for Jewelry" },
      { key: "12", label: "Dragon Bones with Skeletons" },
    ],
  },
  {
    label: "Minotaur Caves",
    image: "steamfont-mountains-minotaur-caves.jpg",
    legend: [
      { key: "1", label: "Meldrath The Malignant and Guards" },
      { key: "2", label: "Slaves" },
      { key: "3", label: "The Wheelbarrow (pulling spot)" },
    ],
  },
];

save();
console.log("Migration 263 complete: maps set on zone:steamfont-mountains");
